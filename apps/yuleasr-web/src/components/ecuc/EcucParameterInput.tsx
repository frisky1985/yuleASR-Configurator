/**
 * ECUC 参数编辑器（F3）— 类型感知输入控件
 *
 * 按定义类别渲染输入形态：
 *  - BOOLEAN → 开关（checkbox 风格按钮）
 *  - NUMERICAL → 数字输入（type=number）
 *  - ENUMERATION → 下拉（定义 LITERALS；无字面量回落文本输入）
 *  - TEXTUAL / REFERENCE / 无定义 → 文本输入
 *
 * 实时校验结果（param.issue，E3 同规则）渲染在控件下方（error 红 / warning 黄）。
 */

import { AlertTriangle, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { EcucParameterDef, EcucParameterDefKind } from '@/services/arxml-ecuc-import';
import type { EcucEditParam } from '@/types/ecuc-edit';

/** 输入组件消费的参数形态（EcucEditParam 结构兼容子集；只读组件也可复用） */
export type EcucParamInputValue = {
  name: string;
  value: string | number | boolean;
  kind?: EcucParameterDefKind;
  def?: EcucParameterDef;
};

/** 控件高度常量（与树行对齐） */
const CONTROL_CLS =
  'h-7 rounded border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors';

export function EcucParameterInput({
  param,
  onChange,
  compact,
}: {
  param: EcucParamInputValue;
  onChange: (value: string | number | boolean) => void;
  /** 紧凑模式（树视图内联使用） */
  compact?: boolean;
}) {
  const kind = param.kind;

  // BOOLEAN：开关
  if (kind === 'BOOLEAN' || (kind === undefined && typeof param.value === 'boolean')) {
    const on = param.value === true;
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={cn(
          'inline-flex items-center gap-1.5 h-7 px-2 rounded-full border text-xs font-medium transition-colors',
          on
            ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-950/50 dark:border-green-800 dark:text-green-300'
            : 'bg-muted border-border text-muted-foreground'
        )}
      >
        <span
          className={cn('w-2 h-2 rounded-full', on ? 'bg-green-500' : 'bg-muted-foreground/50')}
        />
        {on ? 'STD_ON' : 'STD_OFF'}
      </button>
    );
  }

  // NUMERICAL：数字输入（输入串 → number；空串回退 0）
  if (kind === 'NUMERICAL' || (kind === undefined && typeof param.value === 'number')) {
    return (
      <input
        type="number"
        value={String(param.value)}
        onChange={e => {
          const raw = e.target.value;
          const n = raw === '' ? 0 : Number(raw);
          onChange(Number.isNaN(n) ? 0 : n);
        }}
        className={cn(CONTROL_CLS, compact ? 'w-32' : 'w-full')}
        data-testid={`ecuc-param-input-${param.name}`}
      />
    );
  }

  // ENUMERATION：下拉
  if (kind === 'ENUMERATION' || (kind === undefined && Array.isArray(param.def?.literals))) {
    const literals = param.def?.literals ?? [];
    if (literals.length > 0) {
      return (
        <select
          value={String(param.value)}
          onChange={e => onChange(e.target.value)}
          className={cn(CONTROL_CLS, compact ? 'w-40' : 'w-full')}
          data-testid={`ecuc-param-select-${param.name}`}
        >
          {literals.map(l => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      );
    }
  }

  // TEXTUAL / REFERENCE / 无定义：文本输入
  return (
    <input
      type="text"
      value={String(param.value)}
      onChange={e => onChange(e.target.value)}
      className={cn(CONTROL_CLS, compact ? 'w-44' : 'w-full')}
      data-testid={`ecuc-param-text-${param.name}`}
    />
  );
}

/** 编辑问题行内提示（error 红 / warning 黄） */
export function EcucParamIssue({ issue }: { issue: EcucEditParam['issue'] }) {
  if (!issue) return null;
  const isError = issue.severity === 'error';
  return (
    <p
      className={cn(
        'flex items-start gap-1 text-[11px] leading-tight mt-0.5',
        isError ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
      )}
      data-testid="ecuc-param-issue"
    >
      {isError ? (
        <XCircle className="w-3 h-3 mt-px shrink-0" />
      ) : (
        <AlertTriangle className="w-3 h-3 mt-px shrink-0" />
      )}
      <span className="break-all">{issue.message}</span>
    </p>
  );
}

export default EcucParameterInput;
