/**
 * ECUC 导入页（R8/E4）— 只读展示
 *
 * 链路：文件导入（web input / Electron 菜单 file-opened）→ parseSwcArxml
 *       → buildEcucProjectView → 模块树 / 参数表 双视图 + 统计摘要 + 告警面板。
 *
 * 边界（诚实声明）：
 *  - **只读**：本页无任何编辑入口；ECUC 编辑（改值/增删容器）留遗留；
 *  - 展示模型独立于 EcucCodeGenerator 的 ModuleSchema/ModuleConfig
 *    （types/config.ts），避免污染生成器模型；
 *  - Electron 菜单「Open Configuration...」已含 .arxml filter（main.mjs），
 *    经 file:read IPC 读内容后与本页 web input 走同一解析链路。
 */

import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  FolderTree,
  Loader2,
  Table2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { EcucModuleTree } from '@/components/ecuc/EcucModuleTree';
import { EcucParameterTable } from '@/components/ecuc/EcucParameterTable';
import { cn } from '@/lib/utils';
import { parseSwcArxml } from '@/services/arxml-ecuc-import';
import { buildEcucProjectView } from '@/services/ecuc-view-adapter';
import type { EcucProjectView } from '@/types/ecuc-view';
import { createEmptyEcucProjectView } from '@/types/ecuc-view';

type ViewTab = 'tree' | 'table';

interface LoadError {
  message: string;
}

/** 统计摘要卡片（模块/容器/参数/定义覆盖率） */
function SummaryCards({ view }: { view: EcucProjectView }) {
  const cards = [
    { label: '值层模块', value: view.stats.moduleCount },
    { label: '容器', value: view.stats.containerCount },
    { label: '参数', value: view.stats.parameterCount },
    { label: '定义模块', value: view.stats.defModuleCount },
    { label: '定义覆盖率', value: `${view.stats.defCoveragePercent}%` },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(c => (
        <div key={c.label} className="border border-border rounded-lg px-4 py-3 bg-card">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className="text-xl font-semibold text-foreground mt-0.5">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

/** 告警/错误面板（未处理元素 + E3 一致性问题 + 硬错误） */
function ReportPanel({ view }: { view: EcucProjectView }) {
  const { report } = view;
  const issues = [
    ...report.errors.map(e => ({ severity: 'error' as const, text: e })),
    ...report.warnings.map(w => ({
      severity: 'warning' as const,
      text: `${w.line != null ? `${report.sourceName}(${w.line}): ` : ''}${w.message}`,
    })),
  ];
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800/60">
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        <span className="text-sm text-green-800 dark:text-green-300">解析干净：无错误、无告警</span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3',
        report.errors.length > 0
          ? 'border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800/60'
          : 'border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800/60'
      )}
    >
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <AlertCircle className="w-4 h-4 shrink-0" />
        解析报告（{issues.length} 条）
      </p>
      <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
        {issues.map((issue, i) => (
          <li
            key={i}
            className={cn(
              'text-xs font-mono break-all',
              issue.severity === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
            )}
          >
            {issue.severity === 'error' ? '[error] ' : '[warn] '}
            {issue.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 文件读取：web input（File.text）或 Electron（file:read IPC）共用解析路径 */
async function readTextFile(file: File): Promise<string> {
  return file.text();
}

export function EcucImport() {
  const [view, setView] = useState<EcucProjectView>(createEmptyEcucProjectView);
  const [fileName, setFileName] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('');
  const [error, setError] = useState<LoadError | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<ViewTab>('tree');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 解析入口：xml 内容 + 源文件名 → 视图（web input 与 Electron 共用） */
  const parseContent = (content: string, name: string): void => {
    try {
      setError(null);
      // parseSwcArxml 已内置 E3 值-定义一致性校验（结果在 report.errors/warnings）
      const nextView = buildEcucProjectView(parseSwcArxml(content, name));
      setView(nextView);
      setFileName(name);
      setSourceName(name);
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'ARXML 解析失败' });
    }
  };

  // Electron 菜单「Open Configuration...」（.arxml filter）→ file-opened → IPC 读内容
  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.isElectron) return undefined;
    const onOpened = (filePath: string): void => {
      setLoading(true);
      api
        .readFile(filePath)
        .then(result => {
          if (result.success && result.content !== undefined) {
            const base = filePath.split(/[\\/]/).pop() ?? 'input.arxml';
            parseContent(result.content, base);
          } else {
            setError({ message: result.error ?? '读取文件失败' });
          }
        })
        .catch(err => setError({ message: err instanceof Error ? err.message : '读取文件失败' }))
        .finally(() => setLoading(false));
    };
    api.onFileOpened(onOpened);
    return undefined;
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const content = await readTextFile(file);
      parseContent(content, file.name);
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : '读取文件失败' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">ECUC 导入</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ARXML ECUC 值层/定义层只读展示（R8/E4）。编辑能力未实现，留遗留。
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileUp className="w-4 h-4" />
          )}
          选择 ARXML 文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".arxml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 加载中 */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> 解析中…
        </div>
      )}

      {/* 错误 */}
      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800/60">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{error.message}</span>
        </div>
      )}

      {/* 已加载信息 + 统计 + 视图 */}
      {fileName && !error && !loading && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            已加载：<span className="font-medium text-foreground">{fileName}</span>
            {sourceName && <span className="text-xs">（{sourceName}）</span>}
          </div>

          <SummaryCards view={view} />

          <ReportPanel view={view} />

          {/* Tab 切换 */}
          <div className="flex items-center gap-1 border-b border-border">
            <button
              onClick={() => setTab('tree')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                tab === 'tree'
                  ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <FolderTree className="w-4 h-4" />
              模块树
            </button>
            <button
              onClick={() => setTab('table')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                tab === 'table'
                  ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Table2 className="w-4 h-4" />
              参数表（{view.flatParams.length}）
            </button>
          </div>

          {tab === 'tree' ? (
            <EcucModuleTree modules={view.modules} />
          ) : (
            <EcucParameterTable rows={view.flatParams} />
          )}
        </>
      )}

      {/* 未导入占位 */}
      {!fileName && !error && !loading && (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <FileUp className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="mt-3 text-sm font-medium text-foreground">
            选择 .arxml 文件（ECUC-MODULE-CONFIGURATION-VALUES / ECUC-MODULE-DEF）
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Electron 桌面端也可用 File &gt; Open Configuration...（已含 ARXML filter）
          </p>
        </div>
      )}
    </div>
  );
}

export default EcucImport;
