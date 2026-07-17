import {
  ArrowLeft,
  GitBranch,
  GitCommit,
  GitCompare,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  User,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { BranchManager } from '@/components/BranchManager';
import { DiffViewer } from '@/components/DiffViewer';
import { VersionHistory } from '@/components/VersionHistory';
import { cn, formatDate } from '@/lib/utils';
import { GitService, type CommitInfo, type BranchInfo, type DiffInfo } from '@/services/gitService';

export function GitSync() {
  const navigate = useNavigate();
  const [gitService] = useState(() => new GitService());

  // Data state
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [selectedCommit, setSelectedCommit] = useState<CommitInfo | null>(null);
  const [diffs, setDiffs] = useState<DiffInfo[]>([]);
  const [showDiffViewer, setShowDiffViewer] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'history' | 'branches' | 'diff'>('history');

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [branchList, commitList] = await Promise.all([
        gitService.getBranches(),
        gitService.getCommits(),
      ]);
      setBranches(branchList);
      setCommits(commitList);
      const current = branchList.find(b => b.current);
      if (current) {
        setCurrentBranch(current.name);
      }
    } catch (err) {
      console.error('Failed to load git data:', err);
      setSyncStatus('error');
      setSyncMessage('Failed to load git data');
    } finally {
      setIsLoading(false);
    }
  }, [gitService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Branch operations
  const handleCreateBranch = async (name: string, checkout: boolean) => {
    await gitService.createBranch(name);
    if (checkout) {
      await gitService.checkoutBranch(name);
      setCurrentBranch(name);
    }
    await loadData();
  };

  const handleDeleteBranch = async (name: string) => {
    await gitService.deleteBranch(name);
    await loadData();
  };

  const handleSwitchBranch = async (name: string) => {
    await gitService.checkoutBranch(name);
    setCurrentBranch(name);
    await loadData();
  };

  // Commit operations
  const handleSelectCommit = async (commit: CommitInfo) => {
    setSelectedCommit(commit);
    setActiveTab('diff');

    // Get diff for this commit
    try {
      const parentOid = commit.parent[0] || 'HEAD~1';
      const diffList = await gitService.getDiff(parentOid, commit.oid);
      setDiffs(diffList);
      setShowDiffViewer(true);
    } catch (err) {
      console.error('Failed to get diff:', err);
      setDiffs([]);
    }
  };

  const handleSelectBranch = async (branchName: string) => {
    await handleSwitchBranch(branchName);
  };

  const handleRollback = async (commit: CommitInfo) => {
    if (
      !confirm(
        `Are you sure you want to rollback to commit "${commit.message.substring(0, 50)}..."?`
      )
    ) {
      return;
    }
    // TODO: Implement rollback
    console.log('Rollback to:', commit.oid);
  };

  const handleCompare = async (commit1: CommitInfo, commit2: CommitInfo) => {
    try {
      const diffList = await gitService.getDiff(commit1.oid, commit2.oid);
      setDiffs(diffList);
      setShowDiffViewer(true);
      setActiveTab('diff');
    } catch (err) {
      console.error('Failed to compare commits:', err);
    }
  };

  // Sync operations
  const handlePull = async () => {
    setIsPulling(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      // Simulate pull operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadData();
      setSyncStatus('success');
      setSyncMessage('Successfully pulled latest changes');
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage(err instanceof Error ? err.message : 'Pull failed');
    } finally {
      setIsPulling(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      // Simulate push operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSyncStatus('success');
      setSyncMessage('Successfully pushed changes');
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage(err instanceof Error ? err.message : 'Push failed');
    } finally {
      setIsPushing(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleViewCurrentDiff = async () => {
    // Show diff between HEAD and working directory (uncommitted changes)
    try {
      const diffList = await gitService.getDiff('HEAD', 'WORKDIR');
      setDiffs(diffList);
      setShowDiffViewer(true);
      setActiveTab('diff');
    } catch (err) {
      console.error('Failed to get current diff:', err);
      setDiffs([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg-tertiary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-app-text-primary">Git Sync</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
                <GitBranch className="w-3 h-3" />
                {currentBranch}
              </span>
            </div>
            <p className="text-sm text-app-text-secondary">
              Manage branches, view history, and sync changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          {syncStatus !== 'idle' && (
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                syncStatus === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              )}
            >
              {syncStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{syncMessage}</span>
              <button onClick={() => setSyncStatus('idle')} className="ml-1 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* View Current Changes Button */}
          <button
            onClick={handleViewCurrentDiff}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            Changes
          </button>

          {/* Pull Button */}
          <button
            onClick={handlePull}
            disabled={isPulling || isPushing}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
              isPulling
                ? 'bg-app-bg-tertiary text-app-text-tertiary'
                : 'bg-app-bg-primary text-app-text-primary border border-app-border-primary hover:bg-app-bg-secondary'
            )}
          >
            {isPulling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Pull
          </button>

          {/* Push Button */}
          <button
            onClick={handlePush}
            disabled={isPulling || isPushing}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
              isPushing
                ? 'bg-app-bg-tertiary text-app-text-tertiary'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            {isPushing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Push
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Sidebar - Branch Manager */}
        <div className="col-span-3">
          <BranchManager
            branches={branches}
            currentBranch={currentBranch}
            onCreateBranch={handleCreateBranch}
            onDeleteBranch={handleDeleteBranch}
            onSwitchBranch={handleSwitchBranch}
            onRefresh={loadData}
            isLoading={isLoading}
          />
        </div>

        {/* Center - Version History / Diff Viewer */}
        <div className="col-span-9">
          {/* Tabs */}
          <div className="bg-app-bg-primary rounded-lg border border-app-border-primary mb-4">
            <div className="flex items-center border-b border-app-border-primary">
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'history'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-app-text-secondary hover:text-app-text-primary'
                )}
              >
                <GitCommit className="w-4 h-4" />
                History
              </button>
              <button
                onClick={() => setActiveTab('diff')}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'diff'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-app-text-secondary hover:text-app-text-primary'
                )}
              >
                <GitCompare className="w-4 h-4" />
                Diff
                {showDiffViewer && diffs.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded">
                    {diffs.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'history' && (
            <VersionHistory
              commits={commits}
              branches={branches}
              currentBranch={currentBranch}
              selectedCommit={selectedCommit?.oid}
              onSelectCommit={handleSelectCommit}
              onSelectBranch={handleSelectBranch}
              onRollback={handleRollback}
              onCompare={handleCompare}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'diff' && (
            <div className="space-y-4">
              {selectedCommit ? (
                <div className="bg-app-bg-primary rounded-lg border border-app-border-primary p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 dark:bg-primary-900/30">
                      <GitCommit className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-app-text-primary line-clamp-2">
                        {selectedCommit.message}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-app-text-secondary">
                        <span className="font-mono text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-300 px-1.5 py-0.5 rounded">
                          {selectedCommit.oid.substring(0, 7)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {selectedCommit.author.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(selectedCommit.author.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-app-bg-primary rounded-lg border border-app-border-primary p-8 text-center">
                  <GitCompare className="w-12 h-12 text-app-text-tertiary mx-auto mb-3" />
                  <h3 className="text-app-text-primary font-medium">No commit selected</h3>
                  <p className="text-app-text-secondary mt-1">
                    Select a commit from the history to view its changes
                  </p>
                </div>
              )}

              {showDiffViewer && (
                <DiffViewer
                  diffs={diffs}
                  oldCommit={
                    selectedCommit?.parent[0]
                      ? { oid: selectedCommit.parent[0], message: 'Parent' }
                      : undefined
                  }
                  newCommit={
                    selectedCommit
                      ? { oid: selectedCommit.oid, message: selectedCommit.message }
                      : undefined
                  }
                  title={selectedCommit ? 'Commit Changes' : 'Current Changes'}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GitSync;
