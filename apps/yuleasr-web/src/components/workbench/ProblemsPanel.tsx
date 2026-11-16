import { AlertCircle, AlertTriangle, Check, Info, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ProblemFilter } from '@/stores/settingsStore';
import type { ValidationIssue } from '@/types';

interface ProblemsPanelProps {
  issues: ValidationIssue[];
  filter: ProblemFilter;
  acknowledgedIds: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onFilterChange?: (filter: ProblemFilter) => void;
}

const FILTERS: Array<{ id: ProblemFilter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'error', label: '错误' },
  { id: 'warning', label: '警告' },
  { id: 'info', label: '提示' },
];

const severityIcon = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export function ProblemsPanel({
  issues,
  filter,
  acknowledgedIds,
  selectedId,
  onSelect,
  onAcknowledge,
  onFilterChange,
}: ProblemsPanelProps) {
  const visible = issues.filter(
    issue => !acknowledgedIds.includes(issue.id) && (filter === 'all' || issue.severity === filter)
  );

  const filterBar = (
    <div className="flex items-center gap-1 border-b border-app-border-primary px-2 py-1">
      {FILTERS.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onFilterChange?.(item.id)}
          className={cn(
            'rounded px-1.5 py-0.5 text-[11px]',
            filter === item.id
              ? 'bg-app-bg-tertiary font-medium text-app-text-primary'
              : 'text-app-text-secondary hover:bg-app-bg-secondary'
          )}
        >
          {item.label}
        </button>
      ))}
      <span className="ml-auto text-[11px] text-app-text-secondary">{visible.length} 条</span>
    </div>
  );

  if (visible.length === 0) {
    return (
      <div className="flex h-full flex-col">
        {filterBar}
        <div className="flex flex-1 items-center justify-center gap-2 text-xs text-app-text-secondary">
          <Check className="h-3.5 w-3.5 text-green-500" />
          当前没有待处理问题
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {filterBar}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <tbody>
            {visible.map(issue => {
              const Icon = severityIcon[issue.severity];
              return (
                <tr
                  key={issue.id}
                  onClick={() => onSelect(issue.id)}
                  className={cn(
                    'cursor-pointer border-b border-app-border-primary/60 hover:bg-app-bg-secondary',
                    selectedId === issue.id && 'bg-purple-50 dark:bg-purple-500/10'
                  )}
                >
                  <td className="w-6 px-2 py-1">
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        issue.severity === 'error' && 'text-red-500',
                        issue.severity === 'warning' && 'text-amber-500',
                        issue.severity === 'info' && 'text-blue-500'
                      )}
                    />
                  </td>
                  <td className="px-1 py-1 font-mono text-[11px] text-app-text-secondary">
                    {issue.path}
                  </td>
                  <td className="px-2 py-1 text-app-text-primary">{issue.message}</td>
                  <td className="w-8 px-1 py-1 text-right">
                    <button
                      type="button"
                      aria-label="确认此问题"
                      title="确认并隐藏"
                      onClick={event => {
                        event.stopPropagation();
                        onAcknowledge(issue.id);
                      }}
                      className="rounded p-0.5 text-app-text-secondary hover:bg-app-bg-tertiary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
