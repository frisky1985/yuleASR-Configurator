import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Safe localStorage get — returns null on error */
export function safeGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

/** Safe localStorage set — silently ignores quota errors */
export function safeSet(key: string, val: string): void {
  try { localStorage.setItem(key, val) } catch { /* ignore */ }
}

/** Safe localStorage remove */
export function safeRemove(key: string): void {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

/** Safe sessionStorage get */
export function safeSessionGet(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}

/** Safe sessionStorage set */
export function safeSessionSet(key: string, val: string): void {
  try { sessionStorage.setItem(key, val) } catch { /* ignore */ }
}

/** Safe sessionStorage remove */
export function safeSessionRemove(key: string): void {
  try { sessionStorage.removeItem(key) } catch { /* ignore */ }
}
