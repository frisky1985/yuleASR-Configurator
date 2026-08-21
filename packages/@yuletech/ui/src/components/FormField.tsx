import * as React from 'react';

import { cn } from '../lib/cn';
import { Input } from './Input';
import { Select } from './Select';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/** 表单字段容器: label + error/hint + 子控件 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-app-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-app-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export { Input, Select };
