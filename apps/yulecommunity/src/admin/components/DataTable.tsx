import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Column<T> {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (record: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
  };
  rowSelection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
    rowKey: (record: T) => string;
  };
  onRowClick?: (record: T) => void;
  emptyText?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  rowSelection,
  onRowClick,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!rowSelection) return;
    if (e.target.checked) {
      const allKeys = data.map((record) => rowSelection.rowKey(record));
      rowSelection.onChange(allKeys);
    } else {
      rowSelection.onChange([]);
    }
  };

  const handleSelectRow = (key: string) => {
    if (!rowSelection) return;
    const newSelectedKeys = rowSelection.selectedRowKeys.includes(key)
      ? rowSelection.selectedRowKeys.filter((k) => k !== key)
      : [...rowSelection.selectedRowKeys, key];
    rowSelection.onChange(newSelectedKeys);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="animate-pulse space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-10 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              {rowSelection && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={data.length > 0 && rowSelection.selectedRowKeys.length === data.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const rowKey = rowSelection?.rowKey(record) || String(index);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(record)}
                    className={cn(
                      'border-b border-slate-100 dark:border-slate-800/50 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      rowSelection?.selectedRowKeys.includes(rowKey) && 'bg-blue-50 dark:bg-blue-900/10'
                    )}
                  >
                    {rowSelection && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={rowSelection.selectedRowKeys.includes(rowKey)}
                          onChange={() => handleSelectRow(rowKey)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-sm text-slate-700 dark:text-slate-300',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {col.render ? col.render(record, index) : record[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>共 {pagination.total} 条</span>
            {pagination.showSizeChanger && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onChange(1, Number(e.target.value))}
                className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
              >
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size} 条/页
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onChange(1, pagination.pageSize)}
              disabled={pagination.current === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="px-2 text-sm text-slate-600 dark:text-slate-400">
              {pagination.current} / {totalPages}
            </span>
            
            <button
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => pagination.onChange(totalPages, pagination.pageSize)}
              disabled={pagination.current >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
