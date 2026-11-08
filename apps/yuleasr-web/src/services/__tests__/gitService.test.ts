import { Volume } from 'memfs';
import { describe, expect, it } from 'vitest';

import { GitError, GitService, type GitServiceConfig } from '../gitService';

import type { ConfigFile } from '@/types/config';

function makeService(): GitService {
  const vol = new Volume();
  vol.mkdirSync('/repo', { recursive: true });
  return new GitService({
    // memfs 满足 isomorphic-git 的 fs 契约（stat/readFile/writeFile/mkdir/readdir/...）
    fs: vol as unknown as GitServiceConfig['fs'],
    author: { name: 'Tester', email: 'tester@example.com' },
  });
}

function makeConfig(version: string, paramValue: number): ConfigFile {
  return {
    id: 'cfg-1',
    name: 'Test Config',
    modules: [
      {
        id: 'can',
        name: 'Can',
        enabled: true,
        parameters: [{ name: 'CAN_NUM_HOH', value: paramValue }],
      } as never,
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: version,
    version,
  };
}

describe('GitService（真实 isomorphic-git + memory fs）', () => {
  it('初始化后无提交，历史为空', async () => {
    const svc = makeService();
    await svc.init();
    expect(await svc.hasCommits()).toBe(false);
    expect(await svc.getCommits()).toEqual([]);
    expect(await svc.getBranches()).toEqual([]);
  });

  it('提交配置快照后可读取历史与内容', async () => {
    const svc = makeService();
    await svc.init();
    const oid = await svc.commitConfig('first snapshot', makeConfig('v1', 8));
    expect(typeof oid === 'string' && oid).toMatch(/^[0-9a-f]{40}$/);

    const commits = await svc.getCommits();
    expect(commits).toHaveLength(1);
    expect(commits[0].message.trim()).toBe('first snapshot');

    const snapshot = await svc.readConfigAt(oid as string);
    expect(snapshot?.version).toBe('v1');
    expect(
      (snapshot?.modules[0] as { parameters: Array<{ value: number }> }).parameters[0].value
    ).toBe(8);
  });

  it('内容未变化时返回 false（不产生空提交）', async () => {
    const svc = makeService();
    await svc.init();
    await svc.commitConfig('first', makeConfig('v1', 8));
    expect(await svc.commitConfig('no change', makeConfig('v1', 8))).toBe(false);
  });

  it('两次提交之间产生真实 diff', async () => {
    const svc = makeService();
    await svc.init();
    const first = (await svc.commitConfig('first', makeConfig('v1', 8))) as string;
    const second = (await svc.commitConfig('second', makeConfig('v2', 16))) as string;

    const diffs = await svc.getDiff(first, second);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].status).toBe('modified');
    expect(diffs[0].hunks.length).toBeGreaterThan(0);
  });

  it('分支创建 / 切换 / 删除真实生效', async () => {
    const svc = makeService();
    await svc.init();
    await svc.commitConfig('first', makeConfig('v1', 8));

    await svc.createBranch('feature', true);
    let branches = await svc.getBranches();
    expect(branches.map(b => b.name).sort()).toEqual(['feature', 'main']);
    expect(branches.find(b => b.current)?.name).toBe('feature');

    await svc.checkoutBranch('main');
    branches = await svc.getBranches();
    expect(branches.find(b => b.current)?.name).toBe('main');

    await svc.deleteBranch('feature');
    branches = await svc.getBranches();
    expect(branches.map(b => b.name)).toEqual(['main']);
  });

  it('非法分支名被拒绝', async () => {
    const svc = makeService();
    await svc.init();
    await expect(svc.createBranch('bad branch')).rejects.toBeInstanceOf(GitError);
  });

  it('未配置远程时 pull/push 明确报错', async () => {
    const svc = makeService();
    await svc.init();
    await expect(svc.pull()).rejects.toMatchObject({ code: 'REMOTE_NOT_CONFIGURED' });
    await expect(svc.push()).rejects.toMatchObject({ code: 'REMOTE_NOT_CONFIGURED' });
  });
});
