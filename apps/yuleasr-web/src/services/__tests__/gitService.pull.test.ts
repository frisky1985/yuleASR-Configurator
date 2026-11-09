// @vitest-environment node
/**
 * Pull 真实链路测试：本地 smart-HTTP Git 服务 + isomorphic-git + memfs。
 *
 * 覆盖：clone 初始仓库 → 远端新增提交 → GitService.pull() 快进更新工作区与历史。
 * 不依赖公网、不使用 CORS 代理。
 */

import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { Volume } from 'memfs';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { GitError, GitService, type GitServiceConfig } from '../gitService';

/** 用 git http-backend (CGI) 提供 smart-HTTP 服务 */
function startGitHttpServer(root: string): Promise<{ server: Server; url: string }> {
  return new Promise(resolve => {
    const server = createServer((req, res) => {
      const [rawPath, queryString = ''] = (req.url || '/').split('?');
      const cgi = spawn('git', ['http-backend'], {
        env: {
          ...process.env,
          GIT_PROJECT_ROOT: root,
          GIT_HTTP_EXPORT_ALL: '1',
          PATH_INFO: decodeURIComponent(rawPath),
          QUERY_STRING: queryString,
          REQUEST_METHOD: req.method || 'GET',
          CONTENT_TYPE: req.headers['content-type'] || '',
          CONTENT_LENGTH: req.headers['content-length'] || '',
          REMOTE_ADDR: '127.0.0.1',
        },
      });

      req.pipe(cgi.stdin);

      let pending = Buffer.alloc(0);
      let headersParsed = false;
      cgi.stdout.on('data', (chunk: Buffer) => {
        if (headersParsed) {
          res.write(chunk);
          return;
        }
        pending = Buffer.concat([pending, chunk]);
        const sep = pending.indexOf('\r\n\r\n');
        if (sep === -1) return;
        headersParsed = true;
        for (const line of pending.subarray(0, sep).toString('utf8').split('\r\n')) {
          const idx = line.indexOf(':');
          if (idx === -1) continue;
          const key = line.slice(0, idx).trim().toLowerCase();
          const value = line.slice(idx + 1).trim();
          if (key === 'status') res.statusCode = Number(value.split(' ')[0]) || 200;
          else res.setHeader(key, value);
        }
        res.write(pending.subarray(sep + 4));
      });
      cgi.on('close', () => {
        if (!res.writableEnded) res.end();
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolve({ server, url: `http://127.0.0.1:${port}/repo.git` });
    });
  });
}

describe('GitService.pull（本地 smart-HTTP 真实拉取）', () => {
  let workDir: string;
  let server: Server;
  let remoteUrl: string;
  let seedDir: string;
  let vol: Volume;

  const seedGit = (...args: string[]) =>
    execFileSync('git', args, {
      cwd: seedDir,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'Tester',
        GIT_AUTHOR_EMAIL: 'tester@example.com',
        GIT_COMMITTER_NAME: 'Tester',
        GIT_COMMITTER_EMAIL: 'tester@example.com',
        GIT_TERMINAL_PROMPT: '0',
      },
    });

  beforeAll(async () => {
    workDir = mkdtempSync(join(tmpdir(), 'yuleasr-git-pull-'));
    const bareDir = join(workDir, 'repo.git');
    seedDir = join(workDir, 'seed');

    execFileSync('git', ['init', '--bare', '-b', 'main', bareDir]);
    execFileSync('git', ['init', '-b', 'main', seedDir]);

    mkdirSync(join(seedDir, 'config'), { recursive: true });
    writeFileSync(
      join(seedDir, 'config', 'config.json'),
      `${JSON.stringify({ version: 'v1' }, null, 2)}\n`
    );
    seedGit('add', '.');
    seedGit('commit', '-m', 'v1');
    seedGit('remote', 'add', 'origin', bareDir);
    seedGit('push', '-u', 'origin', 'main');

    const started = await startGitHttpServer(workDir);
    server = started.server;
    remoteUrl = started.url;

    // 客户端仓库：clone 到 memfs（GitService 使用同一 fs 与 dir）
    vol = new Volume();
    vol.mkdirSync('/repo', { recursive: true });
    await git.clone({
      fs: vol as unknown as GitServiceConfig['fs'],
      http,
      dir: '/repo',
      url: remoteUrl,
      singleBranch: true,
    });
  });

  afterAll(() => {
    server?.close();
    rmSync(workDir, { recursive: true, force: true });
  });

  it('clone 后工作区包含远程配置', () => {
    expect(vol.readFileSync('/repo/config/config.json', 'utf8')).toContain('"v1"');
  });

  it('远端新增提交后 pull 快进更新工作区与历史', async () => {
    writeFileSync(
      join(seedDir, 'config', 'config.json'),
      `${JSON.stringify({ version: 'v2' }, null, 2)}\n`
    );
    seedGit('add', '.');
    seedGit('commit', '-m', 'v2');
    seedGit('push');

    const service = new GitService({
      fs: vol as unknown as GitServiceConfig['fs'],
      dir: '/repo',
      remoteUrl,
      author: { name: 'Tester', email: 'tester@example.com' },
    });

    await service.pull();

    expect(vol.readFileSync('/repo/config/config.json', 'utf8')).toContain('"v2"');
    const messages = (await service.getCommits()).map(c => c.message.trim());
    expect(messages).toEqual(['v2', 'v1']);
  });

  it('localhost 地址不使用 CORS 代理', async () => {
    // 若走 cors.isomorphic-git.org，本地地址必然失败；能成功即证明已绕过代理
    const service = new GitService({
      fs: vol as unknown as GitServiceConfig['fs'],
      dir: '/repo',
      remoteUrl,
    });
    await expect(service.pull()).resolves.toBeUndefined();
  });
});

describe('GitService.pull（分叉检测）', () => {
  let workDir: string;
  let server: Server;
  let remoteUrl: string;
  let seedDir: string;
  let vol: Volume;

  const seedGit = (...args: string[]) =>
    execFileSync('git', args, {
      cwd: seedDir,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'Tester',
        GIT_AUTHOR_EMAIL: 'tester@example.com',
        GIT_COMMITTER_NAME: 'Tester',
        GIT_COMMITTER_EMAIL: 'tester@example.com',
        GIT_TERMINAL_PROMPT: '0',
      },
    });

  /** 在远端（seed 仓库）写入文件、提交并推送 */
  const seedCommit = (message: string, files: Record<string, string>) => {
    for (const [rel, content] of Object.entries(files)) {
      const full = join(seedDir, rel);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, content);
    }
    seedGit('add', '.');
    seedGit('commit', '-m', message);
    seedGit('push');
  };

  const clientFs = () => vol as unknown as GitServiceConfig['fs'];

  async function commitLocal(message: string, content: string) {
    vol.writeFileSync('/repo/config/config.json', content);
    await git.add({ fs: clientFs(), dir: '/repo', filepath: 'config/config.json' });
    await git.commit({
      fs: clientFs(),
      dir: '/repo',
      message,
      author: { name: 'Tester', email: 'tester@example.com' },
    });
  }

  async function pullError(service: GitService): Promise<GitError | undefined> {
    try {
      await service.pull();
      return undefined;
    } catch (e) {
      return e as GitError;
    }
  }

  beforeEach(async () => {
    workDir = mkdtempSync(join(tmpdir(), 'yuleasr-git-diverge-'));
    const bareDir = join(workDir, 'repo.git');
    seedDir = join(workDir, 'seed');

    execFileSync('git', ['init', '--bare', '-b', 'main', bareDir]);
    execFileSync('git', ['init', '-b', 'main', seedDir]);
    mkdirSync(join(seedDir, 'config'), { recursive: true });
    writeFileSync(
      join(seedDir, 'config', 'config.json'),
      `${JSON.stringify({ version: 'v1' }, null, 2)}\n`
    );
    seedGit('add', '.');
    seedGit('commit', '-m', 'v1');
    seedGit('remote', 'add', 'origin', bareDir);
    seedGit('push', '-u', 'origin', 'main');

    const started = await startGitHttpServer(workDir);
    server = started.server;
    remoteUrl = started.url;

    vol = new Volume();
    vol.mkdirSync('/repo', { recursive: true });
    await git.clone({
      fs: clientFs(),
      http,
      dir: '/repo',
      url: remoteUrl,
      singleBranch: true,
    });
  });

  afterEach(() => {
    server?.close();
    rmSync(workDir, { recursive: true, force: true });
  });

  it('双方修改同一文件时抛 PULL_DIVERGED 并给出 ahead/behind 与冲突文件', async () => {
    await commitLocal('local v2', `${JSON.stringify({ version: 'local' }, null, 2)}\n`);
    seedCommit('remote v2', {
      'config/config.json': `${JSON.stringify({ version: 'remote' }, null, 2)}\n`,
    });

    const service = new GitService({
      fs: clientFs(),
      dir: '/repo',
      remoteUrl,
      author: { name: 'Tester', email: 'tester@example.com' },
    });

    const err = await pullError(service);

    expect(err).toBeInstanceOf(GitError);
    expect(err?.code).toBe('PULL_DIVERGED');
    expect(err?.details).toMatchObject({
      remote: 'origin',
      branch: 'main',
      ahead: 1,
      behind: 1,
      conflictingFiles: ['config/config.json'],
    });
    expect(err?.message).toContain('已分叉');
    expect(err?.message).toContain('冲突文件：config/config.json');
    // 失败后本地工作区保持原样，不被远程内容覆盖
    expect(vol.readFileSync('/repo/config/config.json', 'utf8')).toContain('"local"');
  });

  it('远端仅改其他文件时抛 PULL_DIVERGED 但无冲突文件', async () => {
    await commitLocal('local v2', `${JSON.stringify({ version: 'local' }, null, 2)}\n`);
    seedCommit('remote readme', { 'README.md': '# remote\n' });

    const service = new GitService({
      fs: clientFs(),
      dir: '/repo',
      remoteUrl,
      author: { name: 'Tester', email: 'tester@example.com' },
    });

    const err = await pullError(service);

    expect(err?.code).toBe('PULL_DIVERGED');
    expect(err?.details).toMatchObject({
      ahead: 1,
      behind: 1,
      conflictingFiles: [],
    });
    expect(err?.message).toContain('仅历史分叉');
  });
});
