/* eslint-env node */
/* global console, process */
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';

import { isGccAvailable, verifyFiles, saveFilesToDir, getGccVersion, sanitizeFiles } from './desktop-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow = null;

// ── Auto Updater ─────────────────────────────────────────

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: `A new version (${info.version}) is available.`,
    detail: `Current version: ${app.getVersion()}\nNew version: ${info.version}\n\nWould you like to download and install the update now?`,
    buttons: ['Download & Install', 'Not Now'],
    defaultId: 0,
    cancelId: 1,
  }).then(({ response }) => {
    if (response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'No Update Available',
    message: 'You are running the latest version.',
    detail: `yuleASR Configurator ${app.getVersion()} is up to date.`,
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progressObj.percent);
  }
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Downloaded',
    message: 'Update has been downloaded and will be installed on quit.',
    detail: 'The application will restart to apply the update.',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    cancelId: 1,
  }).then(({ response }) => {
    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (error) => {
  if (isDev) {
    console.error('Auto-updater error:', error);
  }
});

function checkForUpdates() {
  if (isDev) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Development Mode',
      message: 'Auto-update checking is disabled in development mode.',
      detail: 'Updates can only be checked when running a packaged application.',
    });
    return;
  }
  autoUpdater.checkForUpdates();
}

// ── IPC Handlers ──────────────────────────────────────────

ipcMain.handle('gcc:check', () => {
  return { available: isGccAvailable(), version: getGccVersion() };
});

ipcMain.handle('gcc:verify', (_event, files) => {
  // Fix 5: IPC 入口校验载荷，非法载荷不进入编译路径
  const safeFiles = sanitizeFiles(files);
  if (!safeFiles) return { error: 'Invalid payload' };
  try {
    return verifyFiles(safeFiles);
  } catch (e) {
    return { error: String(e) };
  }
});

ipcMain.handle('files:save', async (_event, files) => {
  // Fix 5: IPC 入口校验载荷，非法载荷直接拒绝
  const safeFiles = sanitizeFiles(files);
  if (!safeFiles) return { success: false, error: 'Invalid payload' };
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select output directory for generated code',
  });
  if (result.canceled || !result.filePaths[0]) {
    return { success: false, cancelled: true };
  }
  return saveFilesToDir(result.filePaths[0], safeFiles);
});

// ── External links ─────────────────────────────────────────

ipcMain.handle('openExternal', async (_event, url) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Invalid URL' };
});

// ── Window ────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'yuleASR Configurator',
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // Fix 5: 渲染进程沙箱化（未打包的 preload 也可用）
      sandbox: true,
    },
  });

  // Fix 5: 阻止页面导航离开应用（防钓鱼/防加载远程恶意页面）
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());

  // Fix 5: 新窗口一律拒绝，外链交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Configuration...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [
                { name: 'yuleASR Config', extensions: ['json', 'yuleasr.json'] },
                { name: 'ARXML', extensions: ['arxml'] },
              ],
              properties: ['openFile'],
            });
            if (!result.canceled && result.filePaths[0]) {
              mainWindow.webContents.send('file-opened', result.filePaths[0]);
            }
          },
        },
        {
          label: 'Export Generated Code...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('export-code');
          },
        },
        { type: 'separator' },
        isDev ? { role: 'reload' } : { role: 'forceReload' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Build',
      submenu: [
        {
          label: 'Verify Generated Code with GCC',
          accelerator: 'CmdOrCtrl+Shift+V',
          click: () => {
            mainWindow.webContents.send('run-verify');
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' }, { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates...',
          click: checkForUpdates,
        },
        {
          label: 'About yuleASR Configurator',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About yuleASR Configurator',
              message: 'yuleASR Configurator v' + app.getVersion(),
              detail: 'AUTOSAR BSW Module Configuration Tool\nBuilt with Electron + React\n\nGCC: ' + getGccVersion(),
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();

  // Check for updates on startup (only in production builds)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });
