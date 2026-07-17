import {
  GitCommit,
  GitBranch,
  Clock,
  User,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Search,
  GitCompare,
} from 'lucide-react';
import { useState, useCallback } from 'react';

import { cn, formatDate } from '@/lib/utils';
import type { CommitInfo, BranchInfo } from '@/services/gitService';

interface VersionHistoryProps {
  commits: CommitInfo[];
  branches: BranchInfo[];
  currentBranch: string;
  selectedCommit?: string;
  onSelectCommit: (commit: CommitInfo) => void;
  onSelectBranch: (branch: string) => void;
  onRollback: (commit: CommitInfo) => void;
  onCompare: (commit1: CommitInfo, commit2: CommitInfo) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function VersionHistory({
  commits,
  branches,
  currentBranch,
  selectedCommit,
  onSelectCommit,
  onSelectBranch,
  onRollback,
  onCompare,
  onRefresh,
  isLoading,
}: VersionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareCommits, setCompareCommits] = useState<CommitInfo[]>([]);

  const toggleExpanded = (oid: string) => {
    setExpandedCommits(prev => {
      const next = new Set(prev);
      if (next.has(oid)) {
        next.delete(oid);
      } else {
        next.add(oid);
      }
      return next;
    });
  };

  const handleCompareToggle = (commit: CommitInfo) => {
    setCompareCommits(prev => {
      const exists = prev.find(c => c.oid === commit.oid);
      if (exists) {
        return prev.filter(c => c.oid !== commit.oid);
      }
      if (prev.length >= 2) {
        return [prev[1], commit];
      }
      return [...prev, commit];
    });
  };

  const handleCompare = () => {
    if (compareCommits.length === 2) {
      onCompare(compareCommits[0], compareCommits[1]);
      setCompareMode(false);
      setCompareCommits([]);
    }
  };

  const filteredCommits = commits.filter(
    commit =>
      commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commit.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commit.oid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCommits = useCallback(() => {
    const groups: Record<string, CommitInfo[]> = {};

    for (const commit of filteredCommits) {
      const date = new Date(commit.author.timestamp);
      const key = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(commit);
    }

    return groups;
  }, [filteredCommits]);

  const commitsByDate = groupedCommits();

  return (
    <div className="bg-app-bg-primary rounded-lg border border-app-border-primary overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-app-border-primary bg-app-bg-secondary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
            <GitCommit className="w-4 h-4" />
            Version History
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={cn(
                'text-xs px-2 py-1 rounded transition-colors',
                compareMode
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-app-text-secondary hover:text-app-text-primary'
              )}
            >
              <GitCompare className="w-3 h-3 inline mr-1" />
              Compare
            </button>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-app-text-tertiary hover:text-app-text-secondary transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchSelector(!showBranchSelector)}
            className="flex items-center gap-2 text-xs text-app-text-secondary hover:text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded px-3 py-1.5 w-full"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">{currentBranch}</span>
            {showBranchSelector ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {showBranchSelector && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-app-bg-primary border border-app-border-primary rounded-lg shadow-lg z-10 max-h-40 overflow-auto">
              {branches.map(branch => (
                <button
                  key={branch.name}
                  onClick={() => {
                    onSelectBranch(branch.name);
                    setShowBranchSelector(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-app-bg-secondary',
                    branch.current &&
                      'bg-primary-50 dark:bg-slate-700 text-primary-700 dark:text-primary-300'
                  )}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  {branch.name}
                  {branch.current && (
                    <span className="ml-auto text-primary-600 font-medium">current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-text-tertiary" />
          <input
            type="text"
            placeholder="Search commits..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-app-border-primary rounded bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Compare Mode Indicator */}
        {compareMode && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs dark:bg-blue-950/40 dark:border-blue-800/60">
            <p className="text-blue-700 mb-2">
              Select 2 commits to compare ({compareCommits.length}/2 selected)
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCompare}
                disabled={compareCommits.length !== 2}
                className="px-2 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Compare
              </button>
              <button
                onClick={() => {
                  setCompareMode(false);
                  setCompareCommits([]);
                }}
                className="px-2 py-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Commit List */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-app-text-tertiary mx-auto" />
            <p className="text-app-text-secondary text-sm mt-2">Loading history...</p>
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className="p-8 text-center">
            <GitCommit className="w-8 h-8 text-app-text-tertiary mx-auto mb-2" />
            <p className="text-app-text-secondary text-sm">
              {searchQuery ? 'No commits match your search' : 'No commits yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-app-border-primary">
            {Object.entries(commitsByDate).map(([date, dateCommits]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-app-bg-secondary text-xs font-medium text-app-text-secondary sticky top-0">
                  {date}
                </div>
                {dateCommits.map(commit => {
                  const isSelected = selectedCommit === commit.oid;
                  const isExpanded = expandedCommits.has(commit.oid);
                  const isCompareSelected = compareCommits.find(c => c.oid === commit.oid);

                  return (
                    <div
                      key={commit.oid}
                      className={cn(
                        'relative px-4 py-3 transition-colors',
                        isSelected && !compareMode && 'bg-primary-50 dark:bg-slate-700',
                        isCompareSelected && compareMode && 'bg-blue-50 dark:bg-blue-950/40',
                        !isSelected && !compareMode && 'hover:bg-app-bg-secondary'
                      )}
                    >
                      {/* Timeline Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-px bg-app-bg-tertiary" />

                      {/* Commit Dot */}
                      <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-app-bg-primary border-2 border-app-border-primary-500 z-10" />

                      {compareMode ? (
                        <label className="flex items-start gap-3 cursor-pointer pl-8">
                          <input
                            type="checkbox"
                            checked={!!isCompareSelected}
                            onChange={() => handleCompareToggle(commit)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-app-text-primary truncate">
                              {commit.message}
                            </p>
                            <p className="text-xs text-app-text-secondary mt-0.5">
                              {commit.oid.substring(0, 7)}
                            </p>
                          </div>
                        </label>
                      ) : (
                        <div className="pl-8">
                          <button
                            onClick={() => onSelectCommit(commit)}
                            className="w-full text-left"
                          >
                            <p className="text-sm font-medium text-app-text-primary line-clamp-2">
                              {commit.message}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-app-text-secondary">
                              <span className="font-mono text-primary-600">
                                {commit.oid.substring(0, 7)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {commit.author.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(commit.author.timestamp)}
                              </span>
                            </div>
                          </button>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => onSelectCommit(commit)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => onRollback(commit)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50 rounded"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Rollback
                            </button>
                            <button
                              onClick={() => toggleExpanded(commit.oid)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-app-text-secondary hover:bg-app-bg-tertiary rounded"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              {isExpanded ? 'Less' : 'More'}
                            </button>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-3 p-3 bg-app-bg-secondary rounded text-xs space-y-2">
                              <div>
                                <span className="text-app-text-secondary">Full Hash:</span>
                                <code className="ml-2 text-app-text-primary">{commit.oid}</code>
                              </div>
                              <div>
                                <span className="text-app-text-secondary">Author:</span>
                                <span className="ml-2 text-app-text-primary">
                                  {commit.author.name} &lt;{commit.author.email}&gt;
                                </span>
                              </div>
                              <div>
                                <span className="text-app-text-secondary">Date:</span>
                                <span className="ml-2 text-app-text-primary">
                                  {new Date(commit.author.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {commit.parent.length > 0 && (
                                <div>
                                  <span className="text-app-text-secondary">Parent:</span>
                                  <code className="ml-2 text-app-text-primary">
                                    {commit.parent[0].substring(0, 7)}
                                  </code>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t border-app-border-primary bg-app-bg-secondary text-xs text-app-text-secondary">
        {filteredCommits.length} commit{filteredCommits.length !== 1 ? 's' : ''} on {currentBranch}
      </div>
    </div>
  );
}

export default VersionHistory;
