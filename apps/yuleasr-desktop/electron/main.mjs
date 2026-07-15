import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isGccAvailable, verifyFiles, saveFilesToDir, getGccVersion } from './desktop-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

let mainWindow = null;

// ── IPC Handlers ──────────────────────────────────────────

ipcMain.handle('gcc:check', () => {
  return { available: isGccAvailable(), version: getGccVersion() };
});

ipcMain.handle('gcc:verify', (_event, files) => {
  return verifyFiles(files);
});

ipcMain.handle('files:save', async (_event, files) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select output directory for generated code',
  });
  if (result.canceled || !result.filePaths[0]) {
    return { success: false, cancelled: true };
  }
  return saveFilesToDir(result.filePaths[0], files);
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
    },
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
          label: 'About yuleASR Configurator',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About yuleASR Configurator',
              message: 'yuleASR Configurator v0.1.0',
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

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });
