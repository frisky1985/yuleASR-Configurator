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
import { Boxes, Download, FileCode2, Loader2 } from 'lucide-react';
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
