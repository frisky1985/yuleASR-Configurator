/**
 * ECUC 模块树（只读展示）
 *
 * 递归展示导入的 ECUC 值层：模块 → 容器（可折叠）→ 参数（名称/值/定义类别）。
 * 定义缺失的模块/容器/参数正常展示（无定义元数据时隐藏类别徽标），不报错。
 *
 * 边界（诚实声明）：只读视图，无编辑入口；编辑留遗留。
 */

import { ChevronDown, ChevronRight, FolderTree, Package, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { EcucModuleView, EcucParamRow } from '@/types/ecuc-view';

/** 定义类别徽标配色（Tailwind 静态类，避免动态拼接被 purge） */
const KIND_BADGE: Record<string, string> = {
  NUMERICAL: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  TEXTUAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  BOOLEAN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  ENUMERATION: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  REFERENCE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

/** 参数行（含可选定义类别徽标 + 定义引用 tooltip） */
function ParamRow({ param, depth }: { param: EcucParamRow; depth: number }) {
  return (
    <div
      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/50 transition-colors"
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
      title={param.definitionRef}
    >
      <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-sm text-foreground">{param.name}</span>
      <span className="text-sm text-muted-foreground">=</span>
      <code className="text-sm font-mono text-primary-700 dark:text-primary-400">
        {String(param.value)}
      </code>
      {param.kind && (
        <span
          className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0',
            KIND_BADGE[param.kind] ?? 'bg-muted text-muted-foreground'
          )}
        >
          {param.kind}
        </span>
      )}
    </div>
  );
}

/** 递归容器块（可折叠） */
function ContainerBlock({
  container,
  depth,
}: {
  container: EcucModuleView['containers'][number];
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = container.containers.length > 0 || container.parameters.length > 0;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded w-full text-left hover:bg-accent/50 transition-colors',
          'text-sm font-medium text-foreground'
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        title={container.definitionRef}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <FolderTree className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>{container.name}</span>
        {container.containers.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {container.containers.length} 子容器
          </span>
        )}
      </button>
      {open && (
        <div>
          {container.parameters.map(p => (
            <ParamRow key={p.name + p.definitionRef} param={p} depth={depth + 1} />
          ))}
          {container.containers.map(c => (
            <ContainerBlock key={c.name + c.definitionRef} container={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/** 模块块（可折叠；顶部为模块名 + 定义引用） */
function ModuleBlock({ module }: { module: EcucModuleView }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2.5 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
        title={module.definitionRef}
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <Package className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
        <span className="font-semibold text-foreground">{module.name}</span>
        <span className="text-xs text-muted-foreground truncate">{module.moduleDefRef}</span>
        {module.moduleDef ? (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 shrink-0">
            已关联定义
          </span>
        ) : (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
            无定义
          </span>
        )}
      </button>
      {open && (
        <div className="py-1.5">
          {module.parameters.map(p => (
            <ParamRow key={p.name + p.definitionRef} param={p} depth={0} />
          ))}
          {module.containers.map(c => (
            <ContainerBlock key={c.name + c.definitionRef} container={c} depth={0} />
          ))}
          {module.parameters.length === 0 && module.containers.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">（无参数 / 容器）</p>
          )}
        </div>
      )}
    </div>
  );
}

/** ECUC 模块树（只读）：模块列表 → 每个模块递归容器/参数 */
export function EcucModuleTree({ modules }: { modules: EcucModuleView[] }) {
  if (modules.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        暂无 ECUC 模块 — 请先导入含 ECUC-MODULE-CONFIGURATION-VALUES 的 ARXML 文件
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {modules.map(m => (
        <ModuleBlock key={m.name} module={m} />
      ))}
    </div>
  );
}

export default EcucModuleTree;
