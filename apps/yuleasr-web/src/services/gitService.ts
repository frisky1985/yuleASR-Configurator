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

// Simple stub implementation for now
export class GitService {
  constructor(_config: GitServiceConfig = {}) {}

  async init(): Promise<void> {
    console.log('GitService init (stub)');
  }

  async getCommits(_ref?: string): Promise<CommitInfo[]> {
    return [];
  }

  async getBranches(): Promise<BranchInfo[]> {
    return [];
  }

  async getDiff(_oldOid: string, _newOid: string): Promise<DiffInfo[]> {
    return [];
  }

  async commit(_message: string, _files: string[]): Promise<string> {
    return 'stub-commit-oid';
  }

  async createBranch(name: string): Promise<void> {
    console.log('Create branch (stub):', name);
  }

  async checkoutBranch(name: string): Promise<void> {
    console.log('Checkout branch (stub):', name);
  }

  async deleteBranch(name: string): Promise<void> {
    console.log('Delete branch (stub):', name);
  }
}
