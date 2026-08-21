/**
 * GitService 状态检测测试（Fix 27 / E7）
 * statusMatrix 无法直接区分「重命名」与「删除+新增」，
 * 通过 HEAD 旧路径内容 vs 工作区新路径内容比对判定 rename。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@isomorphic-git/lightning-fs', () => ({
  default: class MockLightningFS {
    promises = {
      readFile: vi.fn().mockResolvedValue(''),
    };
  },
}));

vi.mock('isomorphic-git', () => ({
  statusMatrix: vi.fn(),
  resolveRef: vi.fn(),
  readBlob: vi.fn(),
  init: vi.fn(),
  log: vi.fn(),
  checkout: vi.fn(),
  deleteBranch: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  commit: vi.fn(),
  readTree: vi.fn(),
  clone: vi.fn(),
  currentBranch: vi.fn(),
  push: vi.fn(),
  pull: vi.fn(),
  listBranches: vi.fn(),
}));

import * as git from 'isomorphic-git';
import { GitService } from '../gitService';

function makeService(): GitService {
  return new GitService({ dir: '/tmp/repo' });
}

function mockHeadContent(path: string, content: string): void {
  (git.resolveRef as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('HEAD_OID');
  (git.readBlob as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    async ({ filepath }: { filepath: string }) => {
      if (filepath === path) {
        return { blob: new TextEncoder().encode(content) };
      }
      throw new Error(`unexpected readBlob path: ${filepath}`);
    }
  );
}

function setWorkdirContent(service: GitService, content: string): void {
  const fs = (service as unknown as { fs: { promises: { readFile: ReturnType<typeof vi.fn> } } })
    .fs;
  fs.promises.readFile.mockResolvedValue(content);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('E7: getStatus renamed 检测', () => {
  it('deleted + added 内容一致 → 标记为 renamed，旧路径条目被合并移除', async () => {
    const service = makeService();
    (git.statusMatrix as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      ['a.txt', 1, 0, 1],
      ['b.txt', 0, 2, 0],
    ]);
    mockHeadContent('a.txt', 'hello world\n');
    setWorkdirContent(service, 'hello world\n');

    const status = await service.getStatus();

    expect(status).toEqual([{ path: 'b.txt', status: 'renamed', staged: false }]);
  });

  it('deleted + added 内容不一致 → 保持 deleted / added（真正的删除+新增）', async () => {
    const service = makeService();
    (git.statusMatrix as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      ['a.txt', 1, 0, 1],
      ['b.txt', 0, 2, 0],
    ]);
    mockHeadContent('a.txt', 'hello world\n');
    setWorkdirContent(service, 'completely different\n');

    const status = await service.getStatus();

    expect(status).toEqual([
      { path: 'a.txt', status: 'deleted', staged: false },
      { path: 'b.txt', status: 'added', staged: false },
    ]);
  });

  it('普通 modified / unmodified 状态不受影响', async () => {
    const service = makeService();
    (git.statusMatrix as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      ['package.json', 1, 1, 1],
      ['src/main.ts', 1, 2, 1],
      ['src/new.ts', 0, 2, 0],
    ]);
    setWorkdirContent(service, 'unused');

    const status = await service.getStatus();

    expect(status).toEqual([
      { path: 'package.json', status: 'unmodified', staged: false },
      { path: 'src/main.ts', status: 'modified', staged: false },
      { path: 'src/new.ts', status: 'added', staged: false },
    ]);
    // 没有 deleted 条目，不应触发内容读取
    expect(git.resolveRef).not.toHaveBeenCalled();
  });
});
