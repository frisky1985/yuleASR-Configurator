/**
 * ECUC 参数表（只读展示）
 *
 * 扁平展示导入的 ECUC 参数：模块 / 路径 / 名称 / 值 / 定义类别 / 定义引用。
 * 数据源为 ecuc-view-adapter 的 flatParams（值层参数已挂定义元数据）。
 *
 * 边界（诚实声明）：只读表格，无编辑入口；编辑留遗留。
 */

import { Table2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { EcucFlatParamRow } from '@/types/ecuc-view';

/** 定义类别徽标配色（与 EcucModuleTree 一致，独立维护避免耦合） */
const KIND_BADGE: Record<string, string> = {
  NUMERICAL: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  TEXTUAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  BOOLEAN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  ENUMERATION: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  REFERENCE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

/** 展示参数值（布尔渲染成 true/false 原文，便于核对） */
function formatValue(value: string | number | boolean): string {
  return String(value);
}

/** ECUC 参数表（只读）：模块/路径/名称/值/类别/定义引用 */
export function EcucParameterTable({ rows }: { rows: EcucFlatParamRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        暂无 ECUC 参数 — 请先导入含 ECUC 值层的 ARXML 文件
      </div>
    );
  }
  return (
    <div className="border border-border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">模块</th>
            <th className="px-3 py-2 font-medium">路径</th>
            <th className="px-3 py-2 font-medium">参数</th>
            <th className="px-3 py-2 font-medium">值</th>
            <th className="px-3 py-2 font-medium">定义类别</th>
            <th className="px-3 py-2 font-medium">定义引用</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.module}/${row.pathLabel}/${row.name}/${i}`}
              className={cn(
                'border-t border-border hover:bg-accent/40 transition-colors',
                i % 2 === 1 && 'bg-muted/20'
              )}
            >
              <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">
                {row.module}
              </td>
              <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                {row.pathLabel || '—'}
              </td>
              <td className="px-3 py-1.5 text-foreground whitespace-nowrap">{row.name}</td>
              <td className="px-3 py-1.5 font-mono text-primary-700 dark:text-primary-400 whitespace-nowrap">
                {formatValue(row.value)}
              </td>
              <td className="px-3 py-1.5 whitespace-nowrap">
                {row.kind ? (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      KIND_BADGE[row.kind] ?? 'bg-muted text-muted-foreground'
                    )}
                  >
                    {row.kind}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">—</span>
                )}
              </td>
              <td
                className="px-3 py-1.5 font-mono text-xs text-muted-foreground max-w-[320px] truncate"
                title={row.definitionRef}
              >
                {row.definitionRef}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 空态图标导出（页面标题区可复用） */
export function EcucTableEmptyIcon() {
  return <Table2 className="w-4 h-4" />;
}

export default EcucParameterTable;
