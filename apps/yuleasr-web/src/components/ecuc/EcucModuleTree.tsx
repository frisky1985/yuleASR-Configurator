/**
 * ECUC 模块树（R8/E4 只读展示 + F3 可编辑）
 *
 * 递归展示导入的 ECUC 值层：模块 → 容器（可折叠）→ 参数（名称/值/定义类别）。
 * 定义缺失的模块/容器/参数正常展示（无定义元数据时隐藏类别徽标），不报错。
 *
 * 编辑模式（F3，editable=true 时启用）：
 *  - 参数行渲染类型感知编辑器（boolean 开关 / integer 数字 / enum 下拉 / string 输入），
 *    实时校验（issue）行内提示（E3 同规则）；
 *  - 模块级「启停」开关（禁用模块不参与导出/生成）；
 *  - 容器「添加子容器」（按定义树选型）与「删除实例」（同名兄弟按索引定位）。
 *
 * 只读模式（默认）渲染与 R8/E4 完全一致，无编辑入口。
 */

import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  Package,
  Plus,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { EcucParamIssue, EcucParameterInput } from './EcucParameterInput';

import { cn } from '@/lib/utils';
import type { EcucEditIssue , EcucContainerPath } from '@/types/ecuc-edit';
import type { EcucContainerView, EcucModuleView, EcucParamRow } from '@/types/ecuc-view';

/** 树组件可消费的参数/容器/模块形态（只读视图与编辑视图结构兼容） */
export interface EcucTreeParam extends EcucParamRow {
  issue?: EcucEditIssue | null;
}
export interface EcucTreeContainer extends Omit<EcucContainerView, 'parameters' | 'containers'> {
  parameters: EcucTreeParam[];
  containers: EcucTreeContainer[];
  issue?: EcucEditIssue | null;
}
export interface EcucTreeModule extends Omit<EcucModuleView, 'parameters' | 'containers'> {
  parameters: EcucTreeParam[];
  containers: EcucTreeContainer[];
  enabled?: boolean;
}

/** 编辑回调集合（editable=true 时必传） */
export interface EcucTreeEditHandlers {
  onParamChange: (
    module: string,
    containerPath: EcucContainerPath,
    paramName: string,
    value: string | number | boolean
  ) => void;
  onToggleModule: (module: string, enabled: boolean) => void;
  onAddContainer: (
    module: string,
    parentPath: EcucContainerPath,
    defName: string
  ) => void;
  onRemoveContainer: (module: string, parentPath: EcucContainerPath, childIndex: number) => void;
}

/** 定义类别徽标配色（Tailwind 静态类，避免动态拼接被 purge） */
const KIND_BADGE: Record<string, string> = {
  NUMERICAL: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  TEXTUAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  BOOLEAN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  ENUMERATION: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  REFERENCE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

/** 参数行（只读：名称/值/类别；编辑：类型感知输入 + 实时校验） */
function ParamRow({
  param,
  depth,
  module,
  path,
  editable,
  handlers,
}: {
  param: EcucTreeParam;
  depth: number;
  module: string;
  path: EcucContainerPath;
  editable?: boolean;
  handlers?: EcucTreeEditHandlers;
}) {
  return (
    <div
      className="flex flex-col py-0.5 px-2 rounded hover:bg-accent/50 transition-colors"
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
      title={param.definitionRef}
    >
      <div className="flex items-center gap-2 min-h-[28px]">
        <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground">{param.name}</span>
        <span className="text-sm text-muted-foreground">=</span>
        {editable && handlers ? (
          <EcucParameterInput
            param={param}
            compact
            onChange={value => handlers.onParamChange(module, path, param.name, value)}
          />
        ) : (
          <code className="text-sm font-mono text-primary-700 dark:text-primary-400">
            {String(param.value)}
          </code>
        )}
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
      {editable && <EcucParamIssue issue={param.issue} />}
    </div>
  );
}

/** 递归容器块（可折叠；编辑模式含添加子容器/删除实例） */
function ContainerBlock({
  container,
  depth,
  module,
  path,
  editable,
  handlers,
}: {
  container: EcucTreeContainer;
  depth: number;
  module: string;
  path: EcucContainerPath;
  editable?: boolean;
  handlers?: EcucTreeEditHandlers;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = container.containers.length > 0 || container.parameters.length > 0;
  const subDefs = editable ? container.def?.subContainerDefs ?? [] : [];

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 px-2 rounded hover:bg-accent/50 transition-colors group"
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-left w-full text-sm font-medium text-foreground"
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
          {container.issue && (
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                container.issue.severity === 'error'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              )}
              title={container.issue.message}
            >
              {container.issue.severity === 'error' ? '错误' : '告警'}
            </span>
          )}
        </button>
        {editable && handlers && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {subDefs.length > 0 && (
              <button
                onClick={() => {
                  const defName = subDefs[0].name;
                  handlers.onAddContainer(module, path, defName);
                }}
                className="p-1 text-muted-foreground hover:text-primary-600 rounded transition-colors"
                title={`添加子容器（${subDefs.map(d => d.name).join(' / ')}）`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm(`删除容器实例 ${container.name}？（不可撤销）`)) {
                  const parentPath = path.slice(0, -1);
                  const childIndex = path.length > 0 ? path[path.length - 1].index : 0;
                  handlers.onRemoveContainer(module, parentPath, childIndex);
                }
              }}
              className="p-1 text-muted-foreground hover:text-red-600 rounded transition-colors"
              title="删除容器实例"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {open && (
        <div>
          {container.parameters.map(p => (
            <ParamRow
              key={p.name + p.definitionRef}
              param={p}
              depth={depth + 1}
              module={module}
              path={path}
              editable={editable}
              handlers={handlers}
            />
          ))}
          {container.containers.map((c, index) => (
            <ContainerBlock
              key={c.name + c.definitionRef + index}
              container={c}
              depth={depth + 1}
              module={module}
              path={[...path, { name: c.name, index }]}
              editable={editable}
              handlers={handlers}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 模块块（可折叠；顶部为模块名 + 定义引用；编辑模式含启停开关） */
function ModuleBlock({
  module,
  editable,
  handlers,
}: {
  module: EcucTreeModule;
  editable?: boolean;
  handlers?: EcucTreeEditHandlers;
}) {
  const [open, setOpen] = useState(true);
  const subDefs = editable ? module.moduleDef?.containerDefs ?? [] : [];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 w-full px-3 py-2.5 bg-muted/40 hover:bg-muted/70 transition-colors">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
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
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 shrink-0">
              已关联定义
            </span>
          ) : (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
              无定义
            </span>
          )}
        </button>
        {editable && handlers && (
          <div className="flex items-center gap-1 shrink-0">
            {subDefs.length > 0 && (
              <button
                onClick={() => handlers.onAddContainer(module.name, [], subDefs[0].name)}
                className="p-1 text-muted-foreground hover:text-primary-600 rounded transition-colors"
                title={`添加容器（${subDefs.map(d => d.name).join(' / ')}）`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              role="switch"
              aria-checked={module.enabled !== false}
              onClick={() => handlers.onToggleModule(module.name, module.enabled === false)}
              className={cn(
                'inline-flex items-center gap-1 h-6 px-2 rounded-full border text-[10px] font-medium transition-colors',
                module.enabled !== false
                  ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-950/50 dark:border-green-800 dark:text-green-300'
                  : 'bg-muted border-border text-muted-foreground'
              )}
              title={module.enabled !== false ? '模块已启用（点击禁用）' : '模块已禁用（点击启用）'}
            >
              {module.enabled !== false ? '启用' : '禁用'}
            </button>
          </div>
        )}
      </div>
      {open && (
        <div className="py-1.5">
          {module.parameters.map(p => (
            <ParamRow
              key={p.name + p.definitionRef}
              param={p}
              depth={0}
              module={module.name}
              path={[]}
              editable={editable}
              handlers={handlers}
            />
          ))}
          {module.containers.map((c, index) => (
            <ContainerBlock
              key={c.name + c.definitionRef + index}
              container={c}
              depth={0}
              module={module.name}
              path={[{ name: c.name, index }]}
              editable={editable}
              handlers={handlers}
            />
          ))}
          {module.parameters.length === 0 && module.containers.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">（无参数 / 容器）</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ECUC 模块树：模块列表 → 每个模块递归容器/参数。
 * 只读模式默认；editable=true 时传入 handlers 启用编辑能力。
 */
export function EcucModuleTree({
  modules,
  editable,
  handlers,
}: {
  modules: EcucTreeModule[];
  editable?: boolean;
  handlers?: EcucTreeEditHandlers;
}) {
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
        <ModuleBlock
          key={m.name}
          module={m}
          editable={editable}
          handlers={handlers}
        />
      ))}
    </div>
  );
}

export default EcucModuleTree;
