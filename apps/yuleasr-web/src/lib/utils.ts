import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: string | number | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 相对时间（刚刚 / N 分钟前 / N 小时前 / 日期）*/
export function formatRelativeTime(
  dateInput: string | number | Date,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('common.justNow');
  if (mins < 60) return t('common.minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('common.hoursAgo', { count: hours });
  return formatDate(date);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
