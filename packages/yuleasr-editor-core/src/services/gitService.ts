/**
 * Git Service - 版本控制和变更历史管理
 * 基于 isomorphic-git 实现
 */

import FS from '@isomorphic-git/lightning-fs';
import * as git from 'isomorphic-git';

export interface GitServiceConfig {
  /** 仓库目录 */
  dir: string;
  /** 默认分支 */
  defaultBranch?: string;
  /** 作者名称 */
  author?: {
    name: string;
    email: string;
  };
  /** CORS 代理 */
  corsProxy?: string;
}

export interface CommitInfo {
  oid: string;
  message: string;
  author: {
    name: string;
    email: string;
    timestamp: number;
  };
  parent: string[];
}

export interface BranchInfo {
  name: string;
  current: boolean;
  commit: string;
}

export interface DiffInfo {
  oldPath: string;
  newPath: string;
  status: 'added' | 'deleted' | 'modified' | 'renamed';
  oldContent?: string;
  newContent?: string;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: Array<{
    type: 'added' | 'removed' | 'context';
    content: string;
    lineNumber?: number;
  }>;
}

export interface FileStatus {
  path: string;
  status: 'unmodified' | 'modified' | 'added' | 'deleted' | 'renamed';
  staged: boolean;
}

/**
 * Git 服务类
 * 封装 isomorphic-git 提供版本控制功能
 */
export class GitService {
  private fs: FS;
  private config: Required<GitServiceConfig>;
  private isInitialized = false;

  constructor(config: GitServiceConfig) {
    this.fs = new FS(config.dir);
    this.config = {
      defaultBranch: 'main',
      author: { name: 'yuleASR User', email: 'user@yuleasr.local' },
      corsProxy: 'https://cors.isomorphic-git.org',
      ...config,
    };
  }

  /**
   * 初始化 Git 仓库
   */
  async init(): Promise<void> {
    try {
      await git.init({
        fs: this.fs,
        dir: this.config.dir,
        defaultBranch: this.config.defaultBranch,
      });
      this.isInitialized = true;
    } catch (error) {
      throw new GitError('Failed to initialize git repository', error);
    }
  }

  /**
   * 检查仓库是否已初始化
   */
  async isRepo(): Promise<boolean> {
    try {
      await git.resolveRef({ fs: this.fs, dir: this.config.dir, ref: 'HEAD' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 克隆远程仓库
   */
  async clone(url: string, ref?: string): Promise<void> {
    try {
      await git.clone({
        fs: this.fs,
        http: require('isomorphic-git/http/web'),
        dir: this.config.dir,
        url,
        ref: ref || this.config.defaultBranch,
        singleBranch: true,
        corsProxy: this.config.corsProxy,
      });
      this.isInitialized = true;
    } catch (error) {
      throw new GitError('Failed to clone repository', error);
    }
  }

  /**
   * 获取提交历史
   */
  async getHistory(limit = 50, ref = 'HEAD'): Promise<CommitInfo[]> {
    try {
      const log = await git.log({
        fs: this.fs,
        dir: this.config.dir,
        ref,
        depth: limit,
      });

      return log.map(commit => ({
        oid: commit.oid,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          timestamp: commit.commit.author.timestamp * 1000,
        },
        parent: commit.commit.parent,
      }));
    } catch (error) {
      throw new GitError('Failed to get commit history', error);
    }
  }

  /**
   * 获取单个提交详情
   */
  async getCommit(oid: string): Promise<CommitInfo | null> {
    try {
      const commit = await git.readCommit({
        fs: this.fs,
        dir: this.config.dir,
        oid,
      });

      return {
        oid: commit.oid,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          timestamp: commit.commit.author.timestamp * 1000,
        },
        parent: commit.commit.parent,
      };
    } catch {
      return null;
    }
  }

  /**
   * 获取分支列表
   */
  async getBranches(): Promise<BranchInfo[]> {
    try {
      const branches = await git.listBranches({
        fs: this.fs,
        dir: this.config.dir,
      });

      const currentBranch = await git.currentBranch({
        fs: this.fs,
        dir: this.config.dir,
      });

      const branchInfo: BranchInfo[] = [];

      for (const name of branches) {
        const commit = await git.resolveRef({
          fs: this.fs,
          dir: this.config.dir,
          ref: name,
        });

        branchInfo.push({
          name,
          current: name === currentBranch,
          commit,
        });
      }

      return branchInfo;
    } catch (error) {
      throw new GitError('Failed to list branches', error);
    }
  }

  /**
   * 创建新分支
   */
  async createBranch(name: string, checkout = false): Promise<void> {
    try {
      await git.branch({
        fs: this.fs,
        dir: this.config.dir,
        ref: name,
        checkout,
      });
    } catch (error) {
      throw new GitError(`Failed to create branch: ${name}`, error);
    }
  }

  /**
   * 切换分支
   */
  async checkoutBranch(name: string): Promise<void> {
    try {
      await git.checkout({
        fs: this.fs,
        dir: this.config.dir,
        ref: name,
      });
    } catch (error) {
      throw new GitError(`Failed to checkout branch: ${name}`, error);
    }
  }

  /**
   * 删除分支
   */
  async deleteBranch(name: string, _force = false): Promise<void> {
    try {
      await git.deleteBranch({
        fs: this.fs,
        dir: this.config.dir,
        ref: name,
      });
    } catch (error) {
      throw new GitError(`Failed to delete branch: ${name}`, error);
    }
  }

  /**
   * 获取文件状态
   */
  async getStatus(): Promise<FileStatus[]> {
    try {
      const matrix = await git.statusMatrix({
        fs: this.fs,
        dir: this.config.dir,
      });

      return matrix.map(([path, head, workdir, stage]) => {
        let status: FileStatus['status'] = 'unmodified';

        if (head === 0 && workdir === 1) {
          status = 'added';
        } else if (head === 1 && workdir === 0) {
          status = 'deleted';
        } else if (head === 1 && workdir === 2) {
          status = 'modified';
        }

        return {
          path,
          status,
          staged: stage !== head,
        };
      });
    } catch (error) {
      throw new GitError('Failed to get file status', error);
    }
  }

  /**
   * 暂存文件
   */
  async add(filepath: string | string[]): Promise<void> {
    try {
      const files = Array.isArray(filepath) ? filepath : [filepath];
      for (const file of files) {
        await git.add({
          fs: this.fs,
          dir: this.config.dir,
          filepath: file,
        });
      }
    } catch (error) {
      throw new GitError('Failed to stage files', error);
    }
  }

  /**
   * 取消暂存
   */
  async remove(filepath: string | string[]): Promise<void> {
    try {
      const files = Array.isArray(filepath) ? filepath : [filepath];
      for (const file of files) {
        await git.remove({
          fs: this.fs,
          dir: this.config.dir,
          filepath: file,
        });
      }
    } catch (error) {
      throw new GitError('Failed to unstage files', error);
    }
  }

  /**
   * 创建提交
   */
  async commit(message: string, author?: { name: string; email: string }): Promise<string> {
    try {
      const oid = await git.commit({
        fs: this.fs,
        dir: this.config.dir,
        message,
        author: author || this.config.author,
      });
      return oid;
    } catch (error) {
      throw new GitError('Failed to create commit', error);
    }
  }

  /**
   * 获取两个提交之间的差异
   */
  async getDiff(oldCommit: string, newCommit: string): Promise<DiffInfo[]> {
    try {
      const oldTree = await git.readTree({
        fs: this.fs,
        dir: this.config.dir,
        oid: oldCommit,
      });

      const newTree = await git.readTree({
        fs: this.fs,
        dir: this.config.dir,
        oid: newCommit,
      });

      // 简化版：返回文件列表差异
      const oldFiles = new Map(oldTree.tree.map(e => [e.path, e.oid]));
      const newFiles = new Map(newTree.tree.map(e => [e.path, e.oid]));

      const diffs: DiffInfo[] = [];

      // 检查新增和修改的文件
      for (const [path, oid] of newFiles) {
        if (!oldFiles.has(path)) {
          const content = await this.readFileContent(newCommit, path);
          diffs.push({
            oldPath: path,
            newPath: path,
            status: 'added',
            newContent: content,
            hunks: [],
          });
        } else if (oldFiles.get(path) !== oid) {
          const oldContent = await this.readFileContent(oldCommit, path);
          const newContent = await this.readFileContent(newCommit, path);
          diffs.push({
            oldPath: path,
            newPath: path,
            status: 'modified',
            oldContent,
            newContent,
            hunks: this.computeDiffHunks(oldContent, newContent),
          });
        }
      }

      // 检查删除的文件
      for (const [path, oid] of oldFiles) {
        if (!newFiles.has(path)) {
          const content = await this.readFileContent(oldCommit, path);
          diffs.push({
            oldPath: path,
            newPath: path,
            status: 'deleted',
            oldContent: content,
            hunks: [],
          });
        }
      }

      return diffs;
    } catch (error) {
      throw new GitError('Failed to get diff', error);
    }
  }

  /**
   * 获取工作区与暂存区的差异
   */
  async getWorkingDiff(): Promise<DiffInfo[]> {
    try {
      const status = await this.getStatus();
      const diffs: DiffInfo[] = [];

      for (const file of status) {
        if (file.status === 'modified') {
          const content = await this.readWorkingFile(file.path);
          const headContent = await this.readHeadFile(file.path);

          diffs.push({
            oldPath: file.path,
            newPath: file.path,
            status: 'modified',
            oldContent: headContent,
            newContent: content,
            hunks: this.computeDiffHunks(headContent, content),
          });
        } else if (file.status === 'added') {
          const content = await this.readWorkingFile(file.path);
          diffs.push({
            oldPath: file.path,
            newPath: file.path,
            status: 'added',
            newContent: content,
            hunks: [],
          });
        } else if (file.status === 'deleted') {
          const content = await this.readHeadFile(file.path);
          diffs.push({
            oldPath: file.path,
            newPath: file.path,
            status: 'deleted',
            oldContent: content,
            hunks: [],
          });
        }
      }

      return diffs;
    } catch (error) {
      throw new GitError('Failed to get working diff', error);
    }
  }

  /**
   * 回滚到指定提交
   */
  async rollback(oid: string, hard = false): Promise<void> {
    try {
      if (hard) {
        // 硬重置 - 强制 checkout 到目标提交
        await git.checkout({
          fs: this.fs,
          dir: this.config.dir,
          ref: oid,
          force: true,
        });
      } else {
        // 软重置 - 强制 checkout 到目标提交，然后创建回滚提交
        await git.checkout({
          fs: this.fs,
          dir: this.config.dir,
          ref: oid,
          force: true,
        });

        // 创建回滚提交
        await git.commit({
          fs: this.fs,
          dir: this.config.dir,
          message: `Rollback to ${oid.substring(0, 7)}`,
          author: this.config.author,
        });
      }
    } catch (error) {
      throw new GitError('Failed to rollback', error);
    }
  }

  /**
   * 检出特定版本的文件
   */
  async checkoutFile(oid: string, filepath: string): Promise<void> {
    try {
      const { blob } = await git.readBlob({
        fs: this.fs,
        dir: this.config.dir,
        oid,
        filepath,
      });

      const content = new TextDecoder().decode(blob);
      const fullPath = `${this.config.dir}/${filepath}`;

      await this.fs.promises.writeFile(fullPath, content, 'utf8');
    } catch (error) {
      throw new GitError(`Failed to checkout file: ${filepath}`, error);
    }
  }

  /**
   * 推送更改到远程
   */
  async push(remote = 'origin', ref?: string): Promise<void> {
    try {
      await git.push({
        fs: this.fs,
        http: require('isomorphic-git/http/web'),
        dir: this.config.dir,
        remote,
        ref: ref || (await git.currentBranch({ fs: this.fs, dir: this.config.dir })) || undefined,
        corsProxy: this.config.corsProxy,
      });
    } catch (error) {
      throw new GitError('Failed to push', error);
    }
  }

  /**
   * 从远程拉取
   */
  async pull(remote = 'origin', ref?: string): Promise<void> {
    try {
      await git.pull({
        fs: this.fs,
        http: require('isomorphic-git/http/web'),
        dir: this.config.dir,
        remote,
        ref: ref || (await git.currentBranch({ fs: this.fs, dir: this.config.dir })) || undefined,
        corsProxy: this.config.corsProxy,
        author: this.config.author,
      });
    } catch (error) {
      throw new GitError('Failed to pull', error);
    }
  }

  /**
   * 读取文件内容（从提交）
   */
  private async readFileContent(commitOid: string, filepath: string): Promise<string> {
    try {
      const { blob } = await git.readBlob({
        fs: this.fs,
        dir: this.config.dir,
        oid: commitOid,
        filepath,
      });
      return new TextDecoder().decode(blob);
    } catch {
      return '';
    }
  }

  /**
   * 读取工作区文件
   */
  private async readWorkingFile(filepath: string): Promise<string> {
    try {
      const fullPath = `${this.config.dir}/${filepath}`;
      return (await this.fs.promises.readFile(fullPath, 'utf8')) as string;
    } catch {
      return '';
    }
  }

  /**
   * 读取 HEAD 版本文件
   */
  private async readHeadFile(filepath: string): Promise<string> {
    try {
      const head = await git.resolveRef({
        fs: this.fs,
        dir: this.config.dir,
        ref: 'HEAD',
      });
      return this.readFileContent(head, filepath);
    } catch {
      return '';
    }
  }

  /**
   * 计算差异块
   */
  private computeDiffHunks(oldContent: string, newContent: string): DiffHunk[] {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    const hunks: DiffHunk[] = [];
    let currentHunk: DiffHunk | null = null;

    let oldLine = 1;
    let newLine = 1;

    // 简化的行差异算法
    const maxLen = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLen; i++) {
      const oldStr = oldLines[i] ?? '';
      const newStr = newLines[i] ?? '';

      if (oldStr !== newStr) {
        if (!currentHunk) {
          currentHunk = {
            oldStart: oldLine,
            oldLines: 0,
            newStart: newLine,
            newLines: 0,
            lines: [],
          };
          hunks.push(currentHunk);
        }

        if (oldStr) {
          currentHunk.lines.push({
            type: 'removed',
            content: oldStr,
            lineNumber: oldLine,
          });
          currentHunk.oldLines++;
        }

        if (newStr) {
          currentHunk.lines.push({
            type: 'added',
            content: newStr,
            lineNumber: newLine,
          });
          currentHunk.newLines++;
        }
      } else if (currentHunk) {
        // 添加上下文行
        currentHunk.lines.push({
          type: 'context',
          content: oldStr,
          lineNumber: oldLine,
        });

        // 每 3 行上下文结束一个 hunk
        if (currentHunk.lines.length > 6) {
          currentHunk = null;
        }
      }

      if (oldStr) oldLine++;
      if (newStr) newLine++;
    }

    return hunks;
  }
}

/**
 * Git 错误类
 */
export class GitError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'GitError';
  }
}

export default GitService;
