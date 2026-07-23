import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllModules, SPEC_VERSIONS } from '../../data/autosar/spec-index';

import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface VersionDiff {
  apiId: string;
  apiName: string;
  moduleId: string;
  statuses: ('added' | 'removed' | 'unchanged' | 'modified')[];
}

export function SpecVersionCompare() {
  const [versionA, setVersionA] = useState(SPEC_VERSIONS[0].id);
  const [versionB, setVersionB] = useState(SPEC_VERSIONS[1].id);

  const modules = getAllModules();

  // Simulate version differences based on the API data
  const diffs: VersionDiff[] = useMemo(() => {
    const all: VersionDiff[] = [];
    for (const mod of modules) {
      for (const api of mod.apis) {
        all.push({
          apiId: api.id,
          apiName: api.name,
          moduleId: api.moduleId,
          statuses: [
            api.status === 'optional' && versionA !== versionB ? 'modified' : 'unchanged',
            'unchanged',
            'unchanged',
          ],
        });
      }
    }
    return all;
  }, [versionA, versionB, modules]);

  const selectedA = SPEC_VERSIONS.find(v => v.id === versionA)!;
  const selectedB = SPEC_VERSIONS.find(v => v.id === versionB)!;

  const total = diffs.length;
  const added = diffs.filter(d => d.statuses.includes('added')).length;
  const removed = diffs.filter(d => d.statuses.includes('removed')).length;
  const modified = diffs.filter(d => d.statuses.includes('modified')).length;

  return (
    <div className="space-y-6">
      {/* Version Selectors */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">基准版本</label>
          <select
            value={versionA}
            onChange={e => setVersionA(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border"
          >
            {SPEC_VERSIONS.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">对比版本</label>
          <select
            value={versionB}
            onChange={e => setVersionB(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border"
          >
            {SPEC_VERSIONS.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <div className="text-lg font-bold">{total}</div>
          <div className="text-xs text-muted-foreground">总 API 数</div>
        </div>
        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
          <div className="text-lg font-bold text-green-500">{added}</div>
          <div className="text-xs text-muted-foreground">新增</div>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
          <div className="text-lg font-bold text-amber-500">{modified}</div>
          <div className="text-xs text-muted-foreground">修改</div>
        </div>
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
          <div className="text-lg font-bold text-red-500">{removed}</div>
          <div className="text-xs text-muted-foreground">移除</div>
        </div>
      </div>

      {/* Compare Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">API</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">模块</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">{selectedA.label}</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">{selectedB.label}</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">状态</th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((diff, i) => (
              <motion.tr
                key={diff.apiId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.005 }}
                className={`border-b border-border/50 hover:bg-muted/10 ${
                  diff.statuses[1] === 'modified' ? 'bg-amber-500/5' : ''
                }`}
              >
                <td className="px-4 py-2 font-mono text-xs">{diff.apiName}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{diff.moduleId}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    diff.statuses[0] === 'removed' ? 'text-red-500' :
                    diff.statuses[0] === 'added' ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    {diff.statuses[0] === 'unchanged' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                     diff.statuses[0] === 'added' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                     <XCircle className="w-3.5 h-3.5" />}
                    {diff.statuses[0] === 'unchanged' ? '✅' :
                     diff.statuses[0] === 'added' ? '🆕' : '❌'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    diff.statuses[1] === 'removed' ? 'text-red-500' :
                    diff.statuses[1] === 'added' ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    {diff.statuses[1] === 'unchanged' ? '✅' :
                     diff.statuses[1] === 'added' ? '🆕' : '❌'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    diff.statuses[1] === 'modified' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    diff.statuses[1] === 'unchanged' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {diff.statuses[1] === 'modified' ? '差异' :
                     diff.statuses[1] === 'unchanged' ? '一致' : '缺失'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
