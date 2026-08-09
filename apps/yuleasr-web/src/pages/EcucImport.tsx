/**
 * ECUC 导入页（R8/E4 只读 + F3 可编辑）
 *
 * 链路：文件导入（web input / Electron 菜单 file-opened）→ parseSwcArxml
 *       → buildEcucProjectView → 模块树 / 参数表 双视图 + 统计摘要 + 告警面板。
 *
 * F3 编辑能力（点「编辑」进入）：
 *  - 树/表视图内联编辑：类型感知输入（boolean 开关 / integer 数字 / enum 下拉 /
 *    string 输入）、容器增删（按定义树选型，同名兄弟按索引定位）、模块启停；
 *  - 实时校验：E3 同规则（类型/枚举/容器上下限），行内提示 + 计数摘要；
 *  - 保存回写：导出 ARXML（复用 A4 generateArxml）或直接生成 Cfg.h
 *    （复用 F2a generateHeadersFromSchemas，编辑值覆盖 schema 默认值），
 *    均可打包 ZIP 下载。
 *
 * 边界（诚实声明）：
 *  - 编辑模型为页面内存工作副本（ecuc-editor.ts），不落盘；
 *  - 纯值层文件（无定义）无法校验/新增容器（无定义可依），参数仍可改值；
 *  - Electron 菜单「Open Configuration...」已含 .arxml filter（main.mjs），
 *    经 file:read IPC 读内容后与本页 web input 走同一解析链路。
 */

import JSZip from 'jszip';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileUp,
  FolderTree,
  Loader2,
  Pencil,
  RotateCcw,
  Table2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EcucModuleTree } from '@/components/ecuc/EcucModuleTree';
import type { EcucTreeEditHandlers } from '@/components/ecuc/EcucModuleTree';
import { EcucParameterTable } from '@/components/ecuc/EcucParameterTable';
import { cn } from '@/lib/utils';
import { parseSwcArxml } from '@/services/arxml-ecuc-import';
import { generateArxml } from '@/services/arxml-exporter';
import { generateHeadersFromSchemas } from '@/services/codegen';
import {
  addContainerInstance,
  createEditableProject,
  editableToConfigFile,
  editableToSchemas,
  flattenEditableParams,
  removeContainerInstance,
  toggleModuleEnabled,
  updateParamValue,
} from '@/services/ecuc-editor';
import { buildEcucProjectView } from '@/services/ecuc-view-adapter';
import type { EcucContainerPath , EcucEditableProject } from '@/types/ecuc-edit';
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

  // F3 编辑状态：view 的内存工作副本 + 编辑模式开关
  const [editMode, setEditMode] = useState(false);
  const [editable, setEditable] = useState<EcucEditableProject | null>(null);
  const [exporting, setExporting] = useState<'arxml' | 'cfgh' | null>(null);

  /** 解析入口：xml 内容 + 源文件名 → 视图（web input 与 Electron 共用） */
  const parseContent = (content: string, name: string): void => {
    try {
      setError(null);
      // parseSwcArxml 已内置 E3 值-定义一致性校验（结果在 report.errors/warnings）
      const nextView = buildEcucProjectView(parseSwcArxml(content, name));
      setView(nextView);
      setFileName(name);
      setSourceName(name);
      // 新文件 → 重置编辑状态（保留编辑模式开关；工作副本从新视图重建）
      setEditable(createEditableProject(nextView));
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

  // ── F3 编辑操作（不可变更新，每次重算校验计数） ──────────────────────
  const enterEditMode = useCallback((): void => {
    if (!editable) {
      setEditable(createEditableProject(view));
    }
    setEditMode(true);
  }, [editable, view]);

  const exitEditMode = useCallback((): void => {
    setEditMode(false);
  }, []);

  const resetEdits = useCallback((): void => {
    setEditable(createEditableProject(view));
  }, [view]);

  const editHandlers: EcucTreeEditHandlers = {
    onParamChange: (module, containerPath, paramName, value) => {
      setEditable(prev => (prev ? updateParamValue(prev, module, containerPath, paramName, value) : prev));
    },
    onToggleModule: (module, _enabled) => {
      setEditable(prev => (prev ? toggleModuleEnabled(prev, module) : prev));
    },
    onAddContainer: (module, parentPath, defName) => {
      setEditable(prev => (prev ? addContainerInstance(prev, module, parentPath, defName) : prev));
    },
    onRemoveContainer: (module, parentPath, childIndex) => {
      setEditable(prev => (prev ? removeContainerInstance(prev, module, parentPath, childIndex) : prev));
    },
  };

  /** 导出 ARXML（F3 回写：复用 A4 generateArxml） */
  const handleExportArxml = async (): Promise<void> => {
    if (!editable) return;
    setExporting('arxml');
    try {
      const config = editableToConfigFile(editable);
      const arxml = generateArxml(config, undefined, { schemaVersion: 51 });
      const blob = new Blob([arxml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecuc-edited-${sourceName.replace(/\.arxml$/i, '') || 'config'}-export.arxml`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  /** 生成 Cfg.h（F3 回写：复用 F2a schema 驱动生成，编辑值覆盖默认值） */
  const handleGenerateCfgH = async (): Promise<void> => {
    if (!editable) return;
    setExporting('cfgh');
    try {
      const files = await generateHeadersFromSchemas(editableToSchemas(editable));
      const zip = new JSZip();
      for (const f of files) {
        zip.file(f.filename, f.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecuc-edited-${sourceName.replace(/\.arxml$/i, '') || 'config'}-cfg.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const editableRows = editable ? flattenEditableParams(editable) : [];

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">ECUC 导入</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editMode
              ? '编辑模式：改值/增删容器/模块启停，实时校验，可回写导出 ARXML 或生成 Cfg.h（F3）。'
              : 'ARXML ECUC 值层/定义层展示（R8/E4）。点击「编辑」进入 F3 编辑模式。'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fileName && !error && !loading && !editMode && (
            <button
              onClick={enterEditMode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              编辑
            </button>
          )}
          {fileName && !error && !loading && editMode && editable && (
            <>
              <button
                onClick={exitEditMode}
                className="inline-flex items-center gap-2 px-4 py-2 text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg font-medium hover:bg-app-bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
                退出编辑
              </button>
              <button
                onClick={resetEdits}
                className="inline-flex items-center gap-2 px-4 py-2 text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg font-medium hover:bg-app-bg-secondary transition-colors"
                title="丢弃编辑，恢复为最近一次解析结果"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
              <button
                onClick={handleExportArxml}
                disabled={exporting !== null}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {exporting === 'arxml' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                导出 ARXML
              </button>
              <button
                onClick={handleGenerateCfgH}
                disabled={exporting !== null || editable.errors > 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                title={editable.errors > 0 ? `存在 ${editable.errors} 个校验错误，请先修复` : '按编辑值生成 Cfg.h（ZIP）'}
              >
                {exporting === 'cfgh' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                生成 Cfg.h
              </button>
            </>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-app-bg-primary text-app-text-primary border border-app-border-primary rounded-lg font-medium hover:bg-app-bg-secondary disabled:opacity-50 transition-colors"
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
            {editMode && editable && (
              <>
                {editable.dirty && (
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 rounded-full">
                    有未保存修改
                  </span>
                )}
                {editable.errors > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 rounded-full">
                    {editable.errors} 错误
                  </span>
                )}
                {editable.warnings > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 rounded-full">
                    {editable.warnings} 告警
                  </span>
                )}
              </>
            )}
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
              参数表（{editMode && editable ? editableRows.length : view.flatParams.length}）
            </button>
          </div>

          {tab === 'tree' ? (
            editMode && editable ? (
              <EcucModuleTree
                modules={editable.modules}
                editable
                handlers={editHandlers}
              />
            ) : (
              <EcucModuleTree modules={view.modules} />
            )
          ) : editMode && editable ? (
            <EcucParameterTable rows={editableRows} editable onParamChange={editHandlers.onParamChange} />
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
            导入后可编辑参数值、增删容器、启停模块，并回写导出 ARXML / 生成 Cfg.h（F3）
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
