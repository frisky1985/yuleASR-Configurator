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

  // Platform info
  platform: process.platform,
  isElectron: true,
});
