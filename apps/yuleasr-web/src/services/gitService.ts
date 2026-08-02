/**
 * Git Service Types and Interface
 * Local definitions to avoid import issues
 */

export interface GitServiceConfig {
  fs?: unknown;
  dir?: string;
  defaultAuthor?: {
    name: string;
    email: string;
  };
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

/** Git 功能尚未接入的错误码 */
export const GIT_NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';

/**
 * GitService 占位实现（未接入真实 Git 后端）。
 *
 * 所有方法一律抛出 GitError('Git 功能尚未接入', 'NOT_IMPLEMENTED')，
 * 绝不返回假数据或假成功，避免对用户谎报。
 * 类与类型签名保持不变，保证现有消费者代码可编译通过。
 */
export class GitService {
  constructor(_config: GitServiceConfig = {}) {}

  private static notImplemented(method: string): never {
    throw new GitError(`Git 功能尚未接入（${method}）`, GIT_NOT_IMPLEMENTED);
  }

  async init(): Promise<void> {
    GitService.notImplemented('init');
  }

  async getCommits(_ref?: string): Promise<CommitInfo[]> {
    GitService.notImplemented('getCommits');
  }

  async getBranches(): Promise<BranchInfo[]> {
    GitService.notImplemented('getBranches');
  }

  async getDiff(_oldOid: string, _newOid: string): Promise<DiffInfo[]> {
    GitService.notImplemented('getDiff');
  }

  async commit(_message: string, _files: string[]): Promise<string> {
    GitService.notImplemented('commit');
  }

  async createBranch(_name: string): Promise<void> {
    GitService.notImplemented('createBranch');
  }

  async checkoutBranch(_name: string): Promise<void> {
    GitService.notImplemented('checkoutBranch');
  }

  async deleteBranch(_name: string): Promise<void> {
    GitService.notImplemented('deleteBranch');
  }
}
