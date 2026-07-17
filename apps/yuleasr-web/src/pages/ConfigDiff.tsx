/**
 * ConfigDiff Page
 * Full-page view comparing two configurations side by side.
 * Shows module-level diffs (added/removed/modified) and parameter-level diffs.
 */

import {
  GitBranch,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GitCompare,
  Loader2,
  FileJson,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import { cn, formatDate } from '@/lib/utils';
import { configComparer, type ComparisonResult, type ConfigDiff } from '@/services/compareEngine';
import { useConfigStore } from '@/stores/configStore';
import type { ConfigFile, ConfigListItem } from '@/types';

// ── Export helpers ──

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateHtmlReport(result: ComparisonResult): string {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Build hierarchical diff rows
  const rows: string[] = [];

  for (const md of result.moduleDiffs) {
    const moduleStatusLabel =
      md.status === 'same'
        ? 'Same'
        : md.status === 'different'
          ? 'Different'
          : md.status === 'only_a'
            ? 'Only in A'
            : 'Only in B';
    const moduleRowClass =
      md.status === 'same' ? 'same' : md.status === 'different' ? 'different' : 'only-one';

    rows.push(
      `<tr class="${moduleRowClass} module-row"><td class="name"><strong>${md.moduleName}</strong></td><td>—</td><td>—</td><td><span class="badge badge-${moduleRowClass}">${moduleStatusLabel}</span></td><td>Module</td></tr>`
    );

    if (md.status === 'different' && md.enabledA !== undefined && md.enabledB !== undefined) {
      rows.push(
        `<tr class="different"><td class="name param-name">  enabled</td><td>${md.enabledA}</td><td>${md.enabledB}</td><td><span class="badge badge-different">Different</span></td><td>Param</td></tr>`
      );
    }

    const moduleContainers = result.containerDiffs.filter(c => c.moduleName === md.moduleName);
    for (const cd of moduleContainers) {
      const containerStatusLabel =
        cd.status === 'same'
          ? 'Same'
          : cd.status === 'different'
            ? 'Different'
            : cd.status === 'only_a'
              ? 'Only in A'
              : 'Only in B';
      const containerRowClass =
        cd.status === 'same' ? 'same' : cd.status === 'different' ? 'different' : 'only-one';

      let valueA = '';
      let valueB = '';
      if (cd.instanceCountA !== undefined) valueA = `Instances: ${cd.instanceCountA}`;
      if (cd.instanceCountB !== undefined) valueB = `Instances: ${cd.instanceCountB}`;

      rows.push(
        `<tr class="${containerRowClass} container-row"><td class="name">  ${cd.containerName}</td><td>${valueA}</td><td>${valueB}</td><td><span class="badge badge-${containerRowClass}">${containerStatusLabel}</span></td><td>Container</td></tr>`
      );

      const containerPath = cd.containerName.includes('.')
        ? cd.containerName
        : `${md.moduleName}.${cd.containerName}`;
      const containerParams = result.paramDiffs.filter(
        p => p.moduleName === md.moduleName && p.containerPath === containerPath
      );
      for (const pd of containerParams) {
        const paramRowClass =
          pd.status === 'same' ? 'same' : pd.status === 'different' ? 'different' : 'only-one';
        const paramStatusLabel =
          pd.status === 'same'
            ? 'Same'
            : pd.status === 'different'
              ? 'Different'
              : pd.status === 'only_a'
                ? 'Only in A'
                : 'Only in B';
        const valA = pd.valueA !== undefined ? String(pd.valueA) : '—';
        const valB = pd.valueB !== undefined ? String(pd.valueB) : '—';
        rows.push(
          `<tr class="${paramRowClass}"><td class="name param-name">    ${pd.parameterName}</td><td>${valA}</td><td>${valB}</td><td><span class="badge badge-${paramRowClass}">${paramStatusLabel}</span></td><td>${pd.type || 'Param'}</td></tr>`
        );
      }
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Configuration Comparison Report</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; background: #f9fafb; padding: 2rem; line-height: 1.5; }
.container { max-width: 1200px; margin: 0 auto; }
h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
.timestamp { color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; }
.config-info { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
.config-card { background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; flex: 1; }
.config-card h3 { font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem; }
.config-card .name { font-size: 1rem; font-weight: 600; }
.config-card .id { font-size: 0.75rem; color: #9ca3af; }
.summary { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.summary-box { background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.75rem 1rem; flex: 1; text-align: center; }
.summary-box .count { font-size: 1.5rem; font-weight: 700; }
.summary-box .label { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }
.summary-box.modules { border-top: 3px solid #6366f1; }
.summary-box.containers { border-top: 3px solid #f59e0b; }
.summary-box.params { border-top: 3px solid #10b981; }
.summary-box .count.modules { color: #6366f1; }
.summary-box .count.containers { color: #f59e0b; }
.summary-box .count.params { color: #10b981; }
.summary-box .count.diff { color: #ef4444; }
.summary-box .count.only { color: #eab308; }
.summary-box .count.same { color: #22c55e; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; }
td { padding: 0.625rem 1rem; font-size: 0.875rem; border-bottom: 1px solid #f3f4f6; }
tr:last-child td { border-bottom: none; }
.name { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 0.8125rem; }
.param-name { color: #374151; }
.module-row td { font-weight: 600; background: #fafafa; }
.container-row td { background: #fcfcfc; }
.same td { background: #f0fdf4; }
.same .badge { background: #dcfce7; color: #16a34a; }
.different td { background: #fef2f2; }
.different .badge { background: #fecaca; color: #dc2626; }
.only-one td { background: #fefce8; }
.only-one .badge { background: #fef9c3; color: #ca8a04; }
.badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500; }
</style>
</head>
<body>
<div class="container">
<h1>Configuration Comparison Report</h1>
<p class="timestamp">Generated: ${now}</p>
<div class="config-info">
<div class="config-card">
<h3>Configuration A (Baseline)</h3>
<div class="name">${result.configA.name}</div>
<div class="id">ID: ${result.configA.id}</div>
</div>
<div class="config-card">
<h3>Configuration B (Comparison)</h3>
<div class="name">${result.configB.name}</div>
<div class="id">ID: ${result.configB.id}</div>
</div>
</div>
<h2 style="font-size:1.25rem;margin-bottom:0.75rem;">Summary</h2>
<div class="summary">
<div class="summary-box modules"><div class="count modules">${result.moduleDiffs.length}</div><div class="label">Modules</div><div style="font-size:0.7rem;color:#9ca3af;margin-top:0.25rem;">${result.summary.modulesSame} same / ${result.summary.modulesDifferent} diff / ${result.summary.modulesOnlyA + result.summary.modulesOnlyB} only</div></div>
<div class="summary-box containers"><div class="count containers">${result.containerDiffs.length}</div><div class="label">Containers</div><div style="font-size:0.7rem;color:#9ca3af;margin-top:0.25rem;">${result.summary.containersSame} same / ${result.summary.containersDifferent} diff / ${result.summary.containersOnlyA + result.summary.containersOnlyB} only</div></div>
<div class="summary-box params"><div class="count params">${result.paramDiffs.length}</div><div class="label">Parameters</div><div style="font-size:0.7rem;color:#9ca3af;margin-top:0.25rem;">${result.summary.paramsSame} same / ${result.summary.paramsDifferent} diff / ${result.summary.paramsOnlyA + result.summary.paramsOnlyB} only</div></div>
</div>
<h2 style="font-size:1.25rem;margin-bottom:0.75rem;">Detailed Differences</h2>
<table>
<thead><tr><th>Item</th><th>Value (A)</th><th>Value (B)</th><th>Status</th><th>Type</th></tr></thead>
<tbody>
${rows.join('\n')}
</tbody>
</table>
</div>
</body>
</html>`;
  return html;
}

// ── Color / Style helpers ──

function getStatusStyle(status: string) {
  switch (status) {
    case 'same':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        dot: 'bg-green-400',
      };
    case 'different':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        dot: 'bg-yellow-500',
      };
    case 'only_a':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' };
    case 'only_b':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        dot: 'bg-green-500',
      };
    default:
      return {
        bg: 'bg-app-bg-secondary',
        text: 'text-app-text-secondary',
        border: 'border-app-border-primary',
        dot: 'bg-app-bg-tertiary',
      };
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'same':
      return null;
    case 'different':
      return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
    case 'only_a':
      return <Minus className="w-3.5 h-3.5 text-red-500" />;
    case 'only_b':
      return <Plus className="w-3.5 h-3.5 text-green-500" />;
    default:
      return null;
  }
}

function getStatusLabel(status: string): { label: string; short: string } {
  switch (status) {
    case 'same':
      return { label: 'Unchanged', short: '=' };
    case 'different':
      return { label: 'Modified', short: '≠' };
    case 'only_a':
      return { label: 'Removed', short: '−' };
    case 'only_b':
      return { label: 'Added', short: '+' };
    default:
      return { label: status, short: '?' };
  }
}

function formatValue(val: unknown): string {
  if (val === undefined || val === null) return '—';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  return String(val);
}

// ── Component ──

export function ConfigDiff() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { configAId, configBId } = useParams<{ configAId?: string; configBId?: string }>();

  const { configList, loadConfigList } = useConfigStore();

  const [leftConfigId, setLeftConfigId] = useState<string>(configAId || '');
  const [rightConfigId, setRightConfigId] = useState<string>(configBId || '');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'diff_only'>('all');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loadedConfigA, setLoadedConfigA] = useState<ConfigFile | null>(null);
  const [loadedConfigB, setLoadedConfigB] = useState<ConfigFile | null>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConfigList();
  }, [loadConfigList]);

  // Sync from URL params
  useEffect(() => {
    if (configAId) setLeftConfigId(configAId);
    if (configBId) setRightConfigId(configBId);
  }, [configAId, configBId]);

  // Auto-compare when both IDs are set from URL
  useEffect(() => {
    if (configAId && configBId && leftConfigId && rightConfigId) {
      handleCompare();
    }
    // Only run on mount / URL change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configAId, configBId]);

  // Close export menu on click outside
  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExportMenu]);

  // Load config from localStorage
  const loadConfigFromStorage = (configId: string): ConfigFile | null => {
    try {
      const raw = localStorage.getItem(`yuleasr_config_${configId}`);
      return raw ? (JSON.parse(raw) as ConfigFile) : null;
    } catch {
      return null;
    }
  };

  const handleCompare = async () => {
    if (!leftConfigId || !rightConfigId) {
      setError(t('compare.selectBoth') || 'Please select both configurations');
      return;
    }
    if (leftConfigId === rightConfigId) {
      setError(t('compare.sameConfig') || 'Cannot compare a configuration with itself');
      return;
    }

    setIsComparing(true);
    setError(null);
    setResult(null);

    try {
      const configA = loadConfigFromStorage(leftConfigId);
      const configB = loadConfigFromStorage(rightConfigId);

      if (!configA || !configB) {
        throw new Error('Could not load configurations from storage');
      }

      setLoadedConfigA(configA);
      setLoadedConfigB(configB);

      const comparison = configComparer.compare(configA, configB);
      setResult(comparison);

      // Auto-expand all modules
      const paths = new Set<string>();
      for (const md of comparison.moduleDiffs) {
        paths.add(md.moduleName);
      }
      setExpandedPaths(paths);
    } catch (err) {
      setError((err as Error).message || 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  const diffTree = useMemo(() => {
    if (!result) return [];
    return configComparer.buildDiffTree(result, filter);
  }, [result, filter]);

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTreeNode = (node: ConfigDiff, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedPaths.has(node.path);
    const style = getStatusStyle(node.status);
    const sl = getStatusLabel(node.status);

    return (
      <div key={node.path}>
        <button
          onClick={() => {
            if (hasChildren) toggleExpand(node.path);
          }}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-accent/50 transition-colors border-l-3',
            style.border,
            style.bg,
            'border-l'
          )}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {/* Expand/collapse */}
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {/* Status dot */}
          <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', style.dot)} />

          {/* Name */}
          <span
            className={cn(
              'text-sm truncate',
              node.status !== 'same' && 'font-semibold',
              style.text
            )}
          >
            {node.name}
          </span>

          {/* Status badge */}
          <span
            className={cn(
              'ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0',
              node.status === 'same' && 'bg-green-100 text-green-700',
              node.status === 'different' && 'bg-yellow-100 text-yellow-700',
              node.status === 'only_a' && 'bg-red-100 text-red-700',
              node.status === 'only_b' && 'bg-green-100 text-green-700'
            )}
          >
            {sl.short}
          </span>
        </button>

        {hasChildren && isExpanded && (
          <div>{node.children!.map(child => renderTreeNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg-tertiary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-app-text-primary flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary-500" />
              {t('diff.title') || 'Configuration Diff'}
            </h1>
            <p className="text-sm text-app-text-secondary">
              {t('diff.subtitle') || 'Compare two configurations side by side'}
            </p>
          </div>
        </div>
      </div>

      {/* Config Selection */}
      <div className="bg-app-bg-primary border border-app-border-primary rounded-xl p-4 shadow-sm">
        <div className="flex items-end gap-4">
          {/* Left - Baseline */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-app-text-primary mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                {t('diff.baseline') || 'Baseline Configuration'}
              </span>
            </label>
            <select
              value={leftConfigId}
              onChange={e => {
                setLeftConfigId(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 bg-app-bg-primary border border-app-border-primary rounded-lg text-sm text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('diff.selectConfig') || 'Select configuration...'}</option>
              {configList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* VS */}
          <div className="flex items-center pb-2.5">
            <span className="text-app-text-secondary font-bold text-lg px-2">vs</span>
          </div>

          {/* Right - Comparison */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-app-text-primary mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                {t('diff.comparison') || 'Comparison Configuration'}
              </span>
            </label>
            <select
              value={rightConfigId}
              onChange={e => {
                setRightConfigId(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 bg-app-bg-primary border border-app-border-primary rounded-lg text-sm text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t('diff.selectConfig') || 'Select configuration...'}</option>
              {configList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Compare button */}
          <div className="pb-2.5">
            <button
              onClick={handleCompare}
              disabled={!leftConfigId || !rightConfigId || isComparing}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2',
                'bg-primary-600 text-white hover:bg-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('diff.comparing') || 'Comparing...'}
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" />
                  {t('diff.compare') || 'Compare'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result ? (
        <div className="bg-app-bg-primary border border-app-border-primary rounded-xl overflow-hidden shadow-sm">
          {/* Summary bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-app-bg-secondary border-b border-app-border-primary">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="font-semibold text-green-700">{result.summary.modulesOnlyB}</span>
                <span className="text-app-text-secondary">{t('diff.added') || 'added'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-semibold text-red-700">{result.summary.modulesOnlyA}</span>
                <span className="text-app-text-secondary">{t('diff.removed') || 'removed'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="font-semibold text-yellow-700">
                  {result.summary.modulesDifferent +
                    result.summary.containersDifferent +
                    result.summary.paramsDifferent}
                </span>
                <span className="text-app-text-secondary">{t('diff.modified') || 'modified'}</span>
              </span>
              <span className="text-app-text-secondary text-xs border-l border-app-border-primary pl-4 ml-1">
                {result.summary.modulesSame +
                  result.summary.modulesDifferent +
                  result.summary.modulesOnlyA +
                  result.summary.modulesOnlyB}{' '}
                modules ·{' '}
                {result.summary.paramsDifferent +
                  result.summary.paramsOnlyA +
                  result.summary.paramsOnlyB +
                  result.summary.paramsSame}{' '}
                parameters
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Report */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-app-border-primary hover:bg-app-bg-secondary transition-colors flex items-center gap-1"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  {t('diff.exportReport') || 'Export Report'}
                  <ChevronDown
                    className={cn('w-3 h-3 transition-transform', showExportMenu && 'rotate-180')}
                  />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-app-bg-primary border border-app-border-primary rounded-lg shadow-lg z-50 min-w-[160px] py-1">
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        const html = generateHtmlReport(result);
                        downloadBlob(html, `diff-report-${Date.now()}.html`, 'text/html');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                    >
                      <span className="text-blue-500">🌐</span>
                      HTML Report
                    </button>
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        const json = JSON.stringify(result, null, 2);
                        downloadBlob(json, `diff-report-${Date.now()}.json`, 'application/json');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                    >
                      <span className="text-gray-500">📋</span>
                      JSON
                    </button>
                  </div>
                )}
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as typeof filter)}
                className="px-2.5 py-1.5 bg-app-bg-primary border border-app-border-primary rounded-lg text-xs text-app-text-primary"
              >
                <option value="all">{t('diff.allItems') || 'All items'}</option>
                <option value="diff_only">{t('diff.differencesOnly') || 'Differences only'}</option>
              </select>
            </div>
          </div>

          {/* Two-column Diff Tree */}
          <div className="flex">
            {/* Left column - Config A */}
            <div className="flex-1 border-r border-app-border-primary max-h-[60vh] overflow-y-auto">
              <div className="px-3 py-2 bg-app-bg-secondary border-b border-app-border-primary sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {result.configA.name}
                </h3>
              </div>
              <div className="py-1">
                {diffTree.length === 0 ? (
                  <div className="p-6 text-center text-app-text-secondary text-sm">
                    {t('diff.noItems') || 'No items to display'}
                  </div>
                ) : (
                  diffTree.map(node => renderTreeNode(node))
                )}
              </div>
            </div>

            {/* Right column - Config B */}
            <div className="flex-1 max-h-[60vh] overflow-y-auto">
              <div className="px-3 py-2 bg-app-bg-secondary border-b border-app-border-primary sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {result.configB.name}
                </h3>
              </div>
              <div className="py-1">
                {diffTree.length === 0 ? (
                  <div className="p-6 text-center text-app-text-secondary text-sm">
                    {t('diff.noItems') || 'No items to display'}
                  </div>
                ) : (
                  diffTree.map(node => renderTreeNode(node))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-app-bg-primary border border-app-border-primary rounded-xl p-12 text-center shadow-sm">
          <GitBranch className="w-12 h-12 text-app-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-app-text-primary mb-2">
            {t('diff.noSelectionTitle') || 'Select Configurations to Compare'}
          </h3>
          <p className="text-app-text-secondary max-w-md mx-auto">
            {t('diff.noSelectionDesc') ||
              'Choose a baseline configuration on the left and a comparison configuration on the right, then click Compare.'}
          </p>
        </div>
      )}

      {/* Config Info Cards (when loaded) */}
      {loadedConfigA && loadedConfigB && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { config: loadedConfigA, label: 'Baseline', color: 'blue' },
            { config: loadedConfigB, label: 'Comparison', color: 'green' },
          ].map(({ config, label, color }) => (
            <div
              key={label}
              className="bg-app-bg-primary border border-app-border-primary rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                  )}
                />
                <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <h3 className="font-semibold text-app-text-primary">{config.name}</h3>
              <div className="mt-2 text-xs text-app-text-secondary space-y-0.5">
                <div>ID: {config.id}</div>
                <div>
                  Target: {config.targetPlatform || '—'} / {config.targetChip || '—'}
                </div>
                <div>
                  Modules: {config.modules.length} ({config.modules.filter(m => m.enabled).length}{' '}
                  enabled)
                </div>
                <div>Updated: {formatDate(config.updatedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
