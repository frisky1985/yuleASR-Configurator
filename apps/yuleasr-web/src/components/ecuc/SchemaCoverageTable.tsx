/**
 * Schema 覆盖表（F2b/F2c）— 117 模块 schema 覆盖展示 + 全量生成入口
 *
 * 展示 Editor 配置对 117 个 ModuleSchema 的覆盖情况，区分：
 *  - 有 schema 可配（hasSchema=true；配置状态 enabled/disabled/absent）
 *  - 无 schema 仅展示（hasSchema=false；配置独有模块）
 *
 * 提供「全量生成 ZIP」：generateHeadersFromConfig（配置值覆盖 schema 默认值）
 * → JSZip 打包下载全部 `<Module>_Cfg.h`。
 */

import JSZip from 'jszip';
import { Boxes, Download, FileCode2, Loader2, RotateCcw, Save, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import type {
  ConfigModuleLike,
  GeneratedFile,
  SchemaCoverageRow,
} from '@/services/codegen';
import { buildSchemaCoverage, generateHeadersFromConfig } from '@/services/codegen';

/** 配置状态徽标配色 */
const STATUS_BADGE: Record<SchemaCoverageRow['configStatus'], string> = {
  enabled: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
  disabled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300',
  absent: 'bg-muted text-muted-foreground',
};

/** 摘要卡片 */
function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'default' | 'green' | 'amber' | 'muted';
}) {
  return (
    <div className="border border-border rounded-lg px-3 py-2">
      <p
        className={cn(
          'text-lg font-semibold',
          tone === 'green' && 'text-green-600 dark:text-green-400',
          tone === 'amber' && 'text-yellow-600 dark:text-yellow-400',
          tone === 'muted' && 'text-muted-foreground',
          tone === 'default' && 'text-foreground'
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

/** 覆盖表（纯展示 + 全量生成回调） */
export function SchemaCoverageTable({
  configModules,
  schemas,
  onGenerated,
}: {
  /** 当前配置模块（可空数组） */
  configModules: ConfigModuleLike[];
  /** 可选 schema 列表（默认 core loadModuleSchemas 117 个） */
  schemas?: Parameters<typeof buildSchemaCoverage>[1];
  /** 全量生成完成回调（拿到文件后由调用方预览/下载） */
  onGenerated?: (files: GeneratedFile[]) => void;
}) {
  const { rows, summary } = useMemo(
    () => buildSchemaCoverage(configModules, schemas),
    [configModules, schemas]
  );

  const [generating, setGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  // ── yuleASR 全量替换（可追溯：dry-run 预览 / apply 替换 / rollback 回滚）──
  const [replaceBusy, setReplaceBusy] = useState(false);
  const [replaceResult, setReplaceResult] = useState<string | null>(null);
  const [yuleasrDir, setYuleasrDir] = useState('');

  const hasElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const runReplace = async (mode: 'dry-run' | 'apply' | 'rollback'): Promise<void> => {
    if (!window.electronAPI) return;
    setReplaceBusy(true);
    setReplaceResult(null);
    try {
      const res = await window.electronAPI.replaceCfgh({ mode, yuleasrDir });
      if (!res.success) {
        setReplaceResult(`❌ ${mode} 失败: ${res.error || '未知错误'}`);
        return;
      }
      const r = res.result;
      if (!r) {
        setReplaceResult(`❌ ${mode} 完成但无结果数据`);
        return;
      }
      const lines = [
        `✅ ${mode} 完成`,
        `  模块: ${r.total ?? 0}（成功 ${r.ok ?? 0} / 失败 ${r.failed ?? 0}）`,
      ];
      if ((r.applied ?? 0) > 0) lines.push(`  已替换: ${r.applied} 个 Cfg.h → yuleASR 工作树`);
      if ((r.rolledBack ?? 0) > 0) lines.push(`  已回滚: ${r.rolledBack} 个（md5 校验通过）`);
      if ((r.skipped ?? 0) > 0) lines.push(`  跳过（用户已改动）: ${r.skipped} 个`);
      lines.push(`  替换包: ${r.pkgDir ?? '-'}`);
      lines.push(`  manifest: ${r.manifest ?? '-'}`);
      lines.push(`  backup-md5: ${r.backupMd5 ?? '-'}`);
      setReplaceResult(lines.join('\n'));
    } catch (e: any) {
      setReplaceResult(`❌ ${mode} 异常: ${String(e)}`);
    } finally {
      setReplaceBusy(false);
    }
  };

  const handleGenerateAll = async (): Promise<void> => {
    setGenerating(true);
    try {
      const files = await generateHeadersFromConfig(configModules, schemas);
      const zip = new JSZip();
      for (const f of files) {
        zip.file(f.filename, f.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yuleasr-all-modules-cfg.zip';
      a.click();
      URL.revokeObjectURL(url);
      setGeneratedCount(files.length);
      onGenerated?.(files);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 摘要 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <SummaryCard label="模块总数" value={summary.total} tone="default" />
        <SummaryCard label="有 schema（可配）" value={summary.withSchema} tone="green" />
        <SummaryCard label="无 schema（仅展示）" value={summary.withoutSchema} tone="amber" />
        <SummaryCard label="配置中模块" value={summary.configured} tone="default" />
        <SummaryCard label="已启用" value={summary.enabled} tone="green" />
      </div>

      {/* 全量生成 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleGenerateAll}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {generating ? '生成中…' : '全量生成 ZIP'}
        </button>
        {generatedCount !== null && (
          <span className="text-xs text-green-600 dark:text-green-400">
            已生成 {generatedCount} 个 Cfg.h 并打包下载
          </span>
        )}
      </div>

      {/* yuleASR 全量替换（桌面端，可追溯） */}
      {hasElectron && (
        <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-foreground">
              yuleASR 全量替换（110 模块，可追溯）
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-medium">
              桌面端
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={yuleasrDir}
              onChange={e => setYuleasrDir(e.target.value)}
              placeholder="yuleASR 仓库绝对路径，如 ~/workspace/yuleASR"
              className="flex-1 min-w-[240px] px-3 py-1.5 text-xs bg-app-bg-primary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              onClick={() => runReplace('dry-run')}
              disabled={replaceBusy || !yuleasrDir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent/40 disabled:opacity-50 transition-colors"
              title="仅生成替换包（manifest+备份+产物），不落 yuleASR"
            >
              <Search className="w-3.5 h-3.5" />
              Dry-run 预览
            </button>
            <button
              onClick={() => runReplace('apply')}
              disabled={replaceBusy || !yuleasrDir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              title="备份手写头 → 替换 110 个 Cfg.h 到 yuleASR 工作树（可 rollback）"
            >
              <Save className="w-3.5 h-3.5" />
              替换到 yuleASR
            </button>
            <button
              onClick={() => runReplace('rollback')}
              disabled={replaceBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent/40 disabled:opacity-50 transition-colors"
              title="从最近替换包恢复手写头（仅当当前文件=生成产物才恢复，不覆盖用户改动）"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              回滚
            </button>
            {replaceBusy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          {replaceResult && (
            <pre className="text-[11px] font-mono bg-black/5 dark:bg-white/5 rounded-md p-2 whitespace-pre-wrap text-foreground max-h-48 overflow-y-auto">
              {replaceResult}
            </pre>
          )}
        </div>
      )}

      {/* 覆盖表 */}
      <div className="border border-border rounded-lg overflow-x-auto max-h-[55vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">模块</th>
              <th className="px-3 py-2 font-medium">层级</th>
              <th className="px-3 py-2 font-medium text-right">参数</th>
              <th className="px-3 py-2 font-medium text-right">容器</th>
              <th className="px-3 py-2 font-medium">配置状态</th>
              <th className="px-3 py-2 font-medium">Schema</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={row.name}
                className={cn(
                  'border-t border-border hover:bg-accent/40 transition-colors',
                  row.configStatus === 'enabled' && 'bg-green-50/40 dark:bg-green-950/20'
                )}
              >
                <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    {row.name}
                  </span>
                  {row.label && row.label !== row.name && (
                    <span className="ml-1 text-[11px] text-muted-foreground">{row.label}</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                  {row.layer ?? '—'}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-xs text-foreground">
                  {row.paramCount}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-xs text-foreground">
                  {row.containerCount}
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap">
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      STATUS_BADGE[row.configStatus]
                    )}
                  >
                    {row.configStatus === 'enabled'
                      ? '已启用'
                      : row.configStatus === 'disabled'
                        ? '已禁用'
                        : '未配置'}
                  </span>
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap">
                  {row.hasSchema ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                      <Boxes className="w-3 h-3" />
                      有 schema 可配
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      无 schema 仅展示
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchemaCoverageTable;
