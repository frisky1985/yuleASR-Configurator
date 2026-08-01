import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 className: clsx 处理条件类名, tailwind-merge 去重冲突类
 * 与 web 应用 @/lib/utils 保持一致
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
