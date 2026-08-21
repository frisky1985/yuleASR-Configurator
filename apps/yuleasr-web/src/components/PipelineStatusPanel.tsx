/**
 * PipelineStatusPanel — Real-time pipeline job status display
 *
 * Polls yuleOSH API every 3 seconds and shows:
 *   - Overall status indicator (green/yellow/red)
 *   - Progress bar
 *   - Stage-by-stage status
 *   - Live log stream
 *   - Click to expand logs
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Terminal,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPipelineStatus } from '@/services/yuleoshPipeline';
import type { PipelineJob, PipelineStage } from '@/services/yuleoshPipeline';

interface PipelineStatusPanelProps {
  /** Job ID to poll */
  jobId: string | null;
  /** Auto-start polling on mount */
  autoPoll?: boolean;
  /** Polling interval in ms (default: 3000) */
  pollInterval?: number;
  /** Callback when job completes */
  onComplete?: (job: PipelineJob) => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

/** Stage status icon */
function StageIcon({ status }: { status: string }) {
  switch (status) {
    case 'passed':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'running':
      return <Loader2 size={16} className="text-blue-500 animate-spin" />;
    case 'failed':
      return <XCircle size={16} className="text-red-500" />;
    case 'pending':
    default:
      return <Clock size={16} className="text-gray-400" />;
  }
}

/** Pipeline run duration formatter */
function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt) return '--';
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

/** Overall status badge */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    queued: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Queued',
      icon: <Clock size={12} />,
    },
    running: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Running',
      icon: <Loader2 size={12} className="animate-spin" />,
    },
    passed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Passed',
      icon: <CheckCircle size={12} />,
    },
    failed: {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Failed',
      icon: <XCircle size={12} />,
    },
  };

  const c = config[status] ?? {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: status,
    icon: <AlertTriangle size={12} />,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        c.color
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

export function PipelineStatusPanel({
  jobId,
  autoPoll = true,
  pollInterval = 3000,
  onComplete,
  onError,
  defaultCollapsed = false,
}: PipelineStatusPanelProps) {
  const [job, setJob] = useState<PipelineJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedLogs, setExpandedLogs] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobIdRef = useRef(jobId);

  // Keep ref in sync
  useEffect(() => {
    jobIdRef.current = jobId;
  }, [jobId]);

  // Auto-scroll logs
  useEffect(() => {
    if (expandedLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job?.logs, expandedLogs]);

  const poll = useCallback(async () => {
    const currentJobId = jobIdRef.current;
    if (!currentJobId) return;

    try {
      setLoading(true);
      const resp = await getPipelineStatus(currentJobId);

      if (resp.ok) {
        setJob(resp.job);
        setError(null);

        // Check for completion
        if (resp.job.status === 'passed' || resp.job.status === 'failed') {
          onComplete?.(resp.job);
          // Stop polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } else {
        setError(resp.error ?? 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling failed');
      onError?.(err instanceof Error ? err.message : 'Polling failed');
    } finally {
      setLoading(false);
    }
  }, [onComplete, onError]);

  // Start/stop polling based on jobId
  useEffect(() => {
    if (!autoPoll || !jobId) {
      setJob(null);
      setError(null);
      return;
    }

    // Initial fetch
    poll();

    // Start interval
    pollingRef.current = setInterval(poll, pollInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [jobId, autoPoll, pollInterval, poll]);

  // No job — show nothing
  if (!jobId) {
    return null;
  }

  const isActive = job?.status === 'running' || job?.status === 'queued';

  return (
    <div className="border border-app-border-primary rounded-xl overflow-hidden bg-app-bg-primary shadow-sm">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-app-bg-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          {collapsed ? (
            <ChevronRight size={18} className="text-app-text-tertiary" />
          ) : (
            <ChevronDown size={18} className="text-app-text-tertiary" />
          )}
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-purple-600" />
            <span className="font-semibold text-sm text-primary">Pipeline Status</span>
          </div>
          {job && <StatusBadge status={job.status} />}
        </div>
        <div className="flex items-center gap-3 text-xs text-app-text-tertiary">
          {job && (
            <>
              <span>{job.progress}%</span>
              <span>{formatDuration(job.started_at, job.completed_at)}</span>
            </>
          )}
          {loading && !job && <Loader2 size={14} className="animate-spin" />}
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg text-xs text-red-700 dark:text-red-400">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Progress bar */}
          {job && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-app-text-secondary">
                  {job.current_stage
                    ? `Stage: ${job.stages.find(s => s.key === job.current_stage)?.name ?? job.current_stage}`
                    : 'Waiting...'}
                </span>
                <span className="text-xs font-medium text-app-text-secondary">{job.progress}%</span>
              </div>
              <div className="h-2 bg-app-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    job.status === 'failed'
                      ? 'bg-red-500'
                      : job.status === 'passed'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                  )}
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stage list */}
          {job && job.stages.length > 0 && (
            <div className="space-y-1">
              {job.stages.map(stage => (
                <div
                  key={stage.key}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs',
                    stage.status === 'running' && 'bg-blue-50 dark:bg-blue-950/30',
                    stage.status === 'failed' && 'bg-red-50 dark:bg-red-950/30',
                    stage.status === 'passed' && 'bg-green-50/50 dark:bg-green-950/20'
                  )}
                >
                  <StageIcon status={stage.status} />
                  <span
                    className={cn(
                      'flex-1',
                      stage.status === 'running' && 'text-blue-700 dark:text-blue-300 font-medium',
                      stage.status === 'failed' && 'text-red-700 dark:text-red-400',
                      stage.status === 'passed' && 'text-green-700 dark:text-green-400',
                      stage.status === 'pending' && 'text-gray-500'
                    )}
                  >
                    {stage.name}
                  </span>
                  {stage.status === 'running' && (
                    <span className="text-blue-500 text-[10px] animate-pulse">●</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Logs toggle */}
          {job && job.logs && job.logs.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedLogs(!expandedLogs)}
                className="flex items-center gap-1 text-xs text-app-text-tertiary hover:text-app-text-secondary transition-colors"
              >
                {expandedLogs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>Logs ({job.logs.length})</span>
                {isActive && (
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse ml-1" />
                )}
              </button>

              {expandedLogs && (
                <div className="mt-1 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono max-h-48 overflow-y-auto">
                  {job.logs.map((log, i) => (
                    <div key={i} className="leading-relaxed whitespace-pre-wrap">
                      {log.startsWith('❌') && <span className="text-red-400">{log}</span>}
                      {log.includes('FAILED') && <span className="text-red-400">{log}</span>}
                      {log.startsWith('===') && (
                        <span className="text-cyan-400 font-semibold">{log}</span>
                      )}
                      {!log.startsWith('❌') &&
                        !log.includes('FAILED') &&
                        !log.startsWith('===') &&
                        log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          )}

          {/* Completed info */}
          {job && job.status === 'passed' && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg text-xs text-green-700 dark:text-green-400">
              <CheckCircle size={14} />
              <span>
                Pipeline completed successfully in{' '}
                {formatDuration(job.started_at, job.completed_at)}
              </span>
            </div>
          )}

          {job && job.status === 'failed' && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg text-xs text-red-700 dark:text-red-400">
              <XCircle size={14} />
              <span>Pipeline failed at stage "{job.current_stage}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PipelineStatusPanel;
