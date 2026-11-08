/**
 * Git Service — 浏览器本地版本控制（真实实现）
 *
 * 基于 isomorphic-git + lightning-fs（IndexedDB），在浏览器内维护真实的
 * Git 仓库：提交快照、分支、历史、差异与回滚。快照内容为当前配置的完整
 * JSON（config/config.json），回滚即恢复该提交的配置内容。
 *
 * 远程 pull/push 需要配置远程地址（localStorage: yuleasr.gitRemote），
 * 未配置时明确报错，不做假成功。
 */

import { Buffer } from 'buffer';

import FS from '@isomorphic-git/lightning-fs';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

import type { ConfigFile } from '@/types/config';

// isomorphic-git 在浏览器中依赖全局 Buffer
if (!(globalThis as unknown as { Buffer?: unknown }).Buffer) {
  (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

export interface GitServiceConfig {
  /** IndexedDB 仓库名（默认 yuleasr-configurator） */
  name?: string;
  /** 默认分支 */
  defaultBranch?: string;
  /** 远程仓库地址 */
  remoteUrl?: string;
  /** CORS 代理（浏览器访问 Git 托管需代理） */
  corsProxy?: string;
  /** 提交作者 */
  author?: { name: string; email: string };
  /** 自定义文件系统（测试用 MemoryBackend；默认 IndexedDB） */
  fs?: FS;
  /** 仓库目录（默认浏览器 IndexedDB 根 /；测试可指定子目录） */
  dir?: string;
}

export interface CommitInfo {
  oid: string;
  message: string;
  author: {
    name: string;
    email: string;
    timestamp: number;
  };
  committer: {
    name: string;
    email: string;
    timestamp: number;
  };
  parent: string[];
}

export interface BranchInfo {
  name: string;
  commit: string;
  current: boolean;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: Array<{
    type: 'added' | 'removed' | 'unchanged';
    content: string;
  }>;
}

export interface DiffInfo {
  oldPath: string;
  newPath: string;
  status: 'added' | 'deleted' | 'modified' | 'renamed';
  oldContent?: string;
  newContent?: string;
  hunks: DiffHunk[];
}

export type FileStatus = 'added' | 'deleted' | 'modified' | 'renamed';

export class GitError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'GitError';
  }
}

/** 配置快照在仓库中的固定路径 */
const CONFIG_PATH = 'config/config.json';

/** 校验分支名（避免非法 ref 让 isomorphic-git 抛底层错误） */
const BRANCH_RE = /^(?!-)[A-Za-z0-9._/-]+$/;

export class GitService {
  private fs: FS;
  private readonly dir: string;
  private readonly defaultBranch: string;
  private readonly author: { name: string; email: string };
  private readonly corsProxy: string;
  private remoteUrl?: string;

  constructor(config: GitServiceConfig = {}) {
    this.fs = config.fs || new FS(config.name || 'yuleasr-configurator');
    this.dir = config.dir || '/';
    this.defaultBranch = config.defaultBranch || 'main';
    this.author = config.author || { name: 'yuleASR User', email: 'user@yuleasr.local' };
    this.corsProxy = config.corsProxy || 'https://cors.isomorphic-git.org';
    this.remoteUrl = config.remoteUrl || this.readStoredRemote();
  }

  private readStoredRemote(): string | undefined {
    try {
      return localStorage.getItem('yuleasr.gitRemote') || undefined;
    } catch {
      return undefined;
    }
  }

  /** 设置/清除远程地址（持久化到 localStorage） */
  setRemote(url: string | undefined): void {
    this.remoteUrl = url || undefined;
    try {
      if (url) localStorage.setItem('yuleasr.gitRemote', url);
      else localStorage.removeItem('yuleasr.gitRemote');
    } catch {
      // localStorage 不可用（隐私模式）：仅内存生效
    }
  }

  getRemote(): string | undefined {
    return this.remoteUrl;
  }

  /** 初始化仓库（幂等；已存在则直接返回） */
  async init(): Promise<void> {
    try {
      await git.init({ fs: this.fs, dir: this.dir, defaultBranch: this.defaultBranch });
    } catch (e) {
      // 已初始化：isomorphic-git 的 init 是幂等的，异常仅底层 fs 问题时上报
      const msg = e instanceof Error ? e.message : String(e);
      if (!/exists|initialized/i.test(msg)) {
        throw new GitError('初始化 Git 仓库失败', 'INIT_FAILED', asError(e));
      }
    }
  }

  /** 仓库是否已有提交（HEAD 可解析） */
  async hasCommits(): Promise<boolean> {
    try {
      await git.resolveRef({ fs: this.fs, dir: this.dir, ref: 'HEAD' });
      return true;
    } catch {
      return false;
    }
  }

  /** 提交历史（新→旧） */
  async getCommits(limit = 50, ref = 'HEAD'): Promise<CommitInfo[]> {
    try {
      const log = await git.log({ fs: this.fs, dir: this.dir, ref, depth: limit });
      return log.map(c => ({
        oid: c.oid,
        message: c.commit.message,
        author: {
          name: c.commit.author.name,
          email: c.commit.author.email,
          timestamp: c.commit.author.timestamp * 1000,
        },
        committer: {
          name: c.commit.committer.name,
          email: c.commit.committer.email,
          timestamp: c.commit.committer.timestamp * 1000,
        },
        parent: c.commit.parent,
      }));
    } catch {
      // 空仓库 / 新分支无提交：返回空历史（真实状态，不是假数据）
      return [];
    }
  }

  async getBranches(): Promise<BranchInfo[]> {
    try {
      const names = await git.listBranches({ fs: this.fs, dir: this.dir });
      if (names.length === 0) return [];
      const current = await git.currentBranch({ fs: this.fs, dir: this.dir, fullname: false });
      const branches: BranchInfo[] = [];
      for (const name of names) {
        try {
          const commit = await git.resolveRef({ fs: this.fs, dir: this.dir, ref: name });
          branches.push({ name, commit, current: name === current });
        } catch {
          // 分支指向不存在（极少见）：跳过而非伪造 commit
        }
      }
      return branches;
    } catch {
      return [];
    }
  }

  /**
   * 提交当前配置快照。
   * 写入 config/config.json → add → commit；无可提交变更时返回 false。
   */
  async commitConfig(message: string, config: ConfigFile): Promise<string | false> {
    try {
      await this.init();
      const content = `${JSON.stringify(config, null, 2)}\n`;
      const full = `${this.dir}${CONFIG_PATH}`.replace(/\/+/g, '/');
      // 父目录：lightning-fs 不递归且已存在会抛 EEXIST，忽略即可
      try {
        await this.fs.promises.mkdir(`${this.dir}config`.replace(/\/+/g, '/'), {
          recursive: true,
        } as never);
      } catch {
        // 已存在
      }
      await this.fs.promises.writeFile(full, content, 'utf8');
      await git.add({ fs: this.fs, dir: this.dir, filepath: CONFIG_PATH });

      const status = await git.status({
        fs: this.fs,
        dir: this.dir,
        filepath: CONFIG_PATH,
      });
      if (status === 'unmodified') return false;

      return await git.commit({
        fs: this.fs,
        dir: this.dir,
        message: message || 'Update configuration',
        author: this.author,
      });
    } catch (e) {
      throw new GitError(
        `提交失败: ${e instanceof Error ? e.message : String(e)}`,
        'COMMIT_FAILED',
        asError(e)
      );
    }
  }

  /** 读取指定提交的配置内容（用于回滚/对比） */
  async readConfigAt(oid: string): Promise<ConfigFile | null> {
    try {
      const { blob } = await git.readBlob({
        fs: this.fs,
        dir: this.dir,
        oid,
        filepath: CONFIG_PATH,
      });
      return JSON.parse(new TextDecoder().decode(blob)) as ConfigFile;
    } catch {
      return null;
    }
  }

  /** 读取工作区当前配置内容 */
  async readWorkingConfig(): Promise<string | null> {
    try {
      const full = `${this.dir}${CONFIG_PATH}`.replace(/\/+/g, '/');
      return (await this.fs.promises.readFile(full, 'utf8')) as string;
    } catch {
      return null;
    }
  }

  /**
   * 两个版本之间的差异。
   * 支持特殊 ref：
   * - 'HEAD'：解析为当前提交；
   * - 'WORKDIR'：工作区当前内容（用于「查看未提交变更」）。
   */
  async getDiff(oldRef: string, newRef: string): Promise<DiffInfo[]> {
    try {
      if (!(await this.hasCommits())) return [];

      const oldOid = oldRef === 'HEAD' ? await this.resolveHead() : oldRef;
      const oldContent = oldOid ? await this.readConfigAt(oldOid) : null;

      let newContent: string | null;
      if (newRef === 'WORKDIR') {
        newContent = await this.readWorkingConfig();
      } else {
        const newOid = newRef === 'HEAD' ? await this.resolveHead() : newRef;
        const parsed = newOid ? await this.readConfigAt(newOid) : null;
        newContent = parsed ? `${JSON.stringify(parsed, null, 2)}\n` : null;
      }

      const oldText = oldContent ? `${JSON.stringify(oldContent, null, 2)}\n` : undefined;
      if (oldText === (newContent ?? undefined)) return [];

      return [
        {
          oldPath: CONFIG_PATH,
          newPath: CONFIG_PATH,
          status: oldText === undefined ? 'added' : newContent === null ? 'deleted' : 'modified',
          oldContent: oldText,
          newContent: newContent ?? undefined,
          hunks: computeDiffHunks(oldText ?? '', newContent ?? ''),
        },
      ];
    } catch (e) {
      throw new GitError(
        `读取差异失败: ${e instanceof Error ? e.message : String(e)}`,
        'DIFF_FAILED',
        asError(e)
      );
    }
  }

  private async resolveHead(): Promise<string | null> {
    try {
      return await git.resolveRef({ fs: this.fs, dir: this.dir, ref: 'HEAD' });
    } catch {
      return null;
    }
  }

  async createBranch(name: string, checkout = false): Promise<void> {
    assertBranchName(name);
    try {
      await git.branch({ fs: this.fs, dir: this.dir, ref: name, checkout });
    } catch (e) {
      throw new GitError(`创建分支失败: ${name}`, 'BRANCH_CREATE_FAILED', asError(e));
    }
  }

  async checkoutBranch(name: string): Promise<void> {
    assertBranchName(name);
    try {
      await git.checkout({ fs: this.fs, dir: this.dir, ref: name });
    } catch (e) {
      throw new GitError(`切换分支失败: ${name}`, 'CHECKOUT_FAILED', asError(e));
    }
  }

  async deleteBranch(name: string): Promise<void> {
    assertBranchName(name);
    try {
      await git.deleteBranch({ fs: this.fs, dir: this.dir, ref: name });
    } catch (e) {
      throw new GitError(`删除分支失败: ${name}`, 'BRANCH_DELETE_FAILED', asError(e));
    }
  }

  /** 从远程拉取（需先配置远程地址） */
  async pull(remote = 'origin'): Promise<void> {
    this.assertRemote();
    await this.ensureRemote(remote);
    try {
      await git.pull({
        fs: this.fs,
        http,
        dir: this.dir,
        remote,
        ref:
          (await git.currentBranch({ fs: this.fs, dir: this.dir, fullname: false })) || undefined,
        corsProxy: this.effectiveCorsProxy(),
        author: this.author,
      });
    } catch (e) {
      throw new GitError(
        `Pull 失败: ${e instanceof Error ? e.message : String(e)}`,
        'PULL_FAILED',
        asError(e)
      );
    }
  }

  /** 推送到远程（需先配置远程地址） */
  async push(remote = 'origin'): Promise<void> {
    this.assertRemote();
    await this.ensureRemote(remote);
    try {
      await git.push({
        fs: this.fs,
        http,
        dir: this.dir,
        remote,
        ref:
          (await git.currentBranch({ fs: this.fs, dir: this.dir, fullname: false })) || undefined,
        corsProxy: this.effectiveCorsProxy(),
      });
    } catch (e) {
      throw new GitError(
        `Push 失败: ${e instanceof Error ? e.message : String(e)}`,
        'PUSH_FAILED',
        asError(e)
      );
    }
  }

  private assertRemote(): void {
    if (!this.remoteUrl) {
      throw new GitError(
        '未配置远程仓库地址（设置键：yuleasr.gitRemote）',
        'REMOTE_NOT_CONFIGURED'
      );
    }
  }

  /**
   * 本机/内网地址不经过 CORS 代理：代理仅用于浏览器跨域访问公网 Git 托管，
   * 对 localhost / 127.0.0.1 走代理反而会把请求转发到外部、导致失败。
   */
  private effectiveCorsProxy(): string | undefined {
    if (!this.remoteUrl) return undefined;
    try {
      const host = new URL(this.remoteUrl).hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return undefined;
    } catch {
      // 非标准 URL（如 git@host:repo）交给 isomorphic-git 自行报错
    }
    return this.corsProxy;
  }

  private async ensureRemote(remote: string): Promise<void> {
    try {
      const remotes = await git.listRemotes({ fs: this.fs, dir: this.dir });
      if (!remotes.some(r => r.remote === remote)) {
        await git.addRemote({ fs: this.fs, dir: this.dir, remote, url: this.remoteUrl! });
      }
    } catch (e) {
      throw new GitError(
        `配置远程仓库失败: ${e instanceof Error ? e.message : String(e)}`,
        'REMOTE_FAILED',
        asError(e)
      );
    }
  }
}

function asError(e: unknown): Error | undefined {
  return e instanceof Error ? e : undefined;
}

function assertBranchName(name: string): void {
  if (!BRANCH_RE.test(name) || name.includes('..')) {
    throw new GitError(`非法分支名: ${name}`, 'INVALID_BRANCH');
  }
}

/** 逐行差异（简化算法：同名行对齐，其余标记新增/删除） */
function computeDiffHunks(oldContent: string, newContent: string): DiffHunk[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const hunks: DiffHunk[] = [];
  let current: DiffHunk | null = null;

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const o = oldLines[i];
    const n = newLines[i];
    if (o === n) {
      if (current && current.lines.length > 0) {
        current.lines.push({ type: 'unchanged', content: n ?? '' });
        if (current.lines.length > 8) {
          current = null;
        }
      }
      continue;
    }
    if (!current) {
      current = {
        oldStart: i + 1,
        oldLines: 0,
        newStart: i + 1,
        newLines: 0,
        lines: [],
      };
      hunks.push(current);
    }
    if (o !== undefined) {
      current.lines.push({ type: 'removed', content: o });
      current.oldLines++;
    }
    if (n !== undefined) {
      current.lines.push({ type: 'added', content: n });
      current.newLines++;
    }
  }
  return hunks;
}

/**
 * 兼容旧调用方：Git 后端已接入，不再有 NOT_IMPLEMENTED。
 * 常量保留仅供外部判断历史错误码。
 */
export const GIT_NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';
