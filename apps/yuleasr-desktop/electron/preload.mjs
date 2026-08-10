/* global process */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  onFileOpened: (callback) => {
    ipcRenderer.on('file-opened', (_event, filePath) => callback(filePath));
  },
  onExportCode: (callback) => {
    ipcRenderer.on('export-code', () => callback());
  },
  onRunVerify: (callback) => {
    ipcRenderer.on('run-verify', () => callback());
  },

  // GCC verification
  gccCheck: () => ipcRenderer.invoke('gcc:check'),
  gccVerify: (files) => ipcRenderer.invoke('gcc:verify', files),

  // File save
  saveFiles: (files) => ipcRenderer.invoke('files:save', files),

  // File read（R8/E4：菜单打开配置 → 渲染进程读内容解析）
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),

  // yuleASR 全量替换（可追溯：dry-run/apply/rollback）
  replaceCfgh: (payload) => ipcRenderer.invoke('cfgh:replace', payload),

  // Platform info
  platform: process.platform,
  isElectron: true,

  // Open external links in default browser
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),
});
