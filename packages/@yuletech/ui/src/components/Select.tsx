import * as React from 'react';

import { cn } from '../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, invalid, onChange, value, ...props }, ref) => (
    <select
      ref={ref}
      // 非受控模式 (value 未传) 时不设置 value，让 DOM 原生管理选中值
      {...(value !== undefined ? { value } : {})}
      onChange={e => onChange?.(e.target.value)}
      className={cn(
        'flex h-10 w-full appearance-none rounded-lg border bg-app-bg-primary px-3 py-2 pr-8 text-sm text-primary transition-colors',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27%3E%3Cpath d=%27m4 6 4 4 4-4%27/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.5rem_center]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid
          ? 'border-red-500 focus-visible:ring-red-500'
          : 'border-app-border-secondary hover:border-app-border-primary',
        className
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(opt => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  )
);
Select.displayName = 'Select';

export { Select };
