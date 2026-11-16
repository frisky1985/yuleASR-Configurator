import { Wand2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { ConfigParameter, ValidationIssue } from '@/types';

interface InspectorPaneProps {
  issue: ValidationIssue | null;
  parameter: ConfigParameter | null;
  onApplyFix: () => void;
  onLocate: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-app-border-primary px-3 py-2 last:border-b-0">
      <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-secondary">
        {title}
      </h4>
      <div className="space-y-1 text-xs text-app-text-primary">{children}</div>
    </section>
  );
}

export function InspectorPane({ issue, parameter, onApplyFix, onLocate }: InspectorPaneProps) {
  if (!issue && !parameter) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-xs text-app-text-secondary">
        在左侧选择模块或参数
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <Section title="当前项">
        <div className="font-mono text-[11px] break-all text-app-text-secondary">
          {issue?.path ?? parameter?.name}
        </div>
        {issue && (
          <span
            className={cn(
              'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium',
              issue.severity === 'error' &&
                'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
              issue.severity === 'warning' &&
                'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
              issue.severity === 'info' &&
                'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
            )}
          >
            {issue.severity === 'error' ? '错误' : issue.severity === 'warning' ? '警告' : '提示'}
          </span>
        )}
        {issue && <p className="mt-1 leading-relaxed">{issue.message}</p>}
      </Section>

      {issue?.suggestion && (
        <Section title="修复建议">
          <p className="text-app-text-secondary">{issue.suggestion}</p>
          {issue.fix ? (
            <button
              type="button"
              onClick={onApplyFix}
              className="mt-1 inline-flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-purple-700"
            >
              <Wand2 className="h-3 w-3" />
              应用修复
            </button>
          ) : (
            <button
              type="button"
              onClick={onLocate}
              className="mt-1 rounded border border-app-border-primary px-2 py-1 text-[11px] hover:bg-app-bg-secondary"
            >
              定位到参数
            </button>
          )}
        </Section>
      )}

      {parameter && (
        <Section title="元信息">
          <dl className="grid grid-cols-[64px_1fr] gap-x-2 gap-y-0.5 text-[11px]">
            <dt className="text-app-text-secondary">类型</dt>
            <dd>{parameter.type}</dd>
            <dt className="text-app-text-secondary">当前值</dt>
            <dd className="font-mono">{String(parameter.value ?? '—')}</dd>
            <dt className="text-app-text-secondary">范围</dt>
            <dd className="font-mono">
              {parameter.min ?? '—'} – {parameter.max ?? '—'}
            </dd>
            <dt className="text-app-text-secondary">默认值</dt>
            <dd className="font-mono">{String(parameter.defaultValue ?? '—')}</dd>
          </dl>
          {parameter.description && (
            <p className="mt-1 text-[11px] leading-relaxed text-app-text-secondary">
              {parameter.description}
            </p>
          )}
        </Section>
      )}

      {issue && !parameter && (
        <Section title="引用">
          <p className="text-[11px] text-app-text-secondary">
            该问题未关联具体参数，可在左侧树中展开查看。
          </p>
        </Section>
      )}
    </div>
  );
}
