/**
 * Type declarations for Electron preload API
 * Used by the renderer (web app) when running in Electron
 */

interface GCCResult {
  filename: string;
  status: 'pass' | 'fail' | 'skipped';
  errors?: string[];
}

interface GCCCheckResult {
  available: boolean;
  version: string;
}

interface SaveResult {
  success: boolean;
  count?: number;
  path?: string;
  cancelled?: boolean;
}

interface ReadFileResult {
  success: boolean;
  content?: string;
  error?: string;
}

interface ElectronAPI {
  onFileOpened(callback: (filePath: string) => void): void;
  onExportCode(callback: () => void): void;
  onRunVerify(callback: () => void): void;
  /** 读取本地文件内容（R8/E4 ECUC 导入链路：菜单选文件 → 渲染进程解析） */
  readFile(filePath: string): Promise<ReadFileResult>;
  gccCheck(): Promise<GCCCheckResult>;
  gccVerify(
    files: Array<{ filename: string; content: string; language: string }>
  ): Promise<GCCResult[]>;
  saveFiles(files: Array<{ filename: string; content: string }>): Promise<SaveResult>;
  platform: string;
  isElectron: boolean;
  openExternal(url: string): Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export type { ElectronAPI, GCCResult, GCCCheckResult, SaveResult, ReadFileResult };
