import * as React from 'react';

import { cn } from '../lib/cn';

export interface PropertyPanelProps {
  title?: string;
  items: Array<{
    key: string;
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
  }>;
  columns?: 1 | 2;
  className?: string;
}

/** 只读属性面板: key-value 网格展示 */
export function PropertyPanel({ title, items, columns = 2, className }: PropertyPanelProps) {
  return (
    <div className={cn('rounded-xl border border-app-border-primary bg-app-bg-primary overflow-hidden', className)}>
      {title && (
        <div className="px-4 py-2.5 border-b border-app-border-primary bg-app-bg-secondary">
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
        </div>
      )}
      <dl
        className={cn(
          'divide-y divide-app-border-primary',
          columns === 2 ? 'sm:grid sm:grid-cols-2 sm:divide-y-0 sm:divide-x' : ''
        )}
      >
        {items.map(item => (
          <div
            key={item.key}
            className={cn(
              'px-4 py-2.5 flex items-start justify-between gap-3',
              item.highlight && 'bg-blue-50/60 dark:bg-blue-950/20'
            )}
          >
            <dt className="text-sm text-app-text-secondary flex-shrink-0">{item.label}</dt>
            <dd
              className={cn(
                'text-sm font-medium text-primary text-right',
                item.highlight && 'text-blue-700 dark:text-blue-400'
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
