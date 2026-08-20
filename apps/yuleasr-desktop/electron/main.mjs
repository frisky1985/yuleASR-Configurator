/* eslint-env node */
/* global console, process */
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { readFile } from 'fs/promises';
import { spawn } from 'child_process';

import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron';
// GH #49 修复：electron-updater 是 CommonJS（out/main.js 用 exports.xxx 导出，autoUpdater
// 为 Object.defineProperty getter），ESM named import 无法静态识别 → 打包后 Electron
// main 进程启动即崩（SyntaxError: Named export 'autoUpdater' not found）。
// CJS default import 由 Node/Electron ESM 互操作提供 module.exports，运行期取值即可。
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;

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

// ── File read（R8/E4 ECUC 导入链路：菜单选 .arxml → 渲染进程解析）──────

/** 允许读取的配置扩展名（对齐 File > Open Configuration... 菜单 filter） */
const READABLE_CONFIG_EXT = /\\.(arxml|json)$/i;
/** 单文件读取上限（ARXML 工程文件一般 < 5MB，放宽到 20MB 防误伤） */
const MAX_READ_BYTES = 20 * 1024 * 1024;

ipcMain.handle('file:read', async (_event, filePath) => {
  // Fix 5 惯例：IPC 入口校验载荷；仅放行配置类扩展名，路径由用户对话框产生
  if (typeof filePath !== 'string' || !READABLE_CONFIG_EXT.test(filePath)) {
    return { success: false, error: 'Invalid file path' };
  }
  try {
    const buf = await readFile(filePath);
    if (buf.byteLength > MAX_READ_BYTES) {
      return { success: false, error: 'File too large (max 20MB)' };
    }
    return { success: true, content: buf.toString('utf8') };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Read failed' };
  }
});


// ── yuleASR 全量替换（cfgh:replace）─────────────────────
// 可追溯替换：dry-run（生成替换包）/ apply（替换工作树）/ rollback（回滚）
// 通过 vitest 执行 replace-cfgh-run.test.ts（codegen 依赖 Vite import.meta.glob，
// 无法在纯 Node 主进程直接 import），解析 stdout 的 REPLACE_CFGH_RESULT=JSON。
const CFGH_REPLACE_TEST = 'apps/yuleasr-web/src/services/__tests__/replace-cfgh-run.test.ts';
const CFGH_REPLACE_TIMEOUT_MS = 10 * 60 * 1000; // 10 分钟超时
let cfghReplaceRunning = false; // 进程内互斥锁（P2 加固）：防止双击/多窗口并发写 yuleASR 工作树

ipcMain.handle('cfgh:replace', async (_event, payload) => {
  // P2 加固（2026-08-10）：打包版未内置替换执行器（scripts/verification/vitest 不进包），
  // 明示拒绝而非静默失败
  if (app.isPackaged) {
    return { success: false, mode: 'packaged', error: 'yuleASR 全量替换仅开发模式可用（打包版未内置替换执行器）' };
  }
  if (cfghReplaceRunning) {
    return { success: false, mode: 'busy', error: '已有替换任务进行中，请等待完成' };
  }
  const mode = payload && typeof payload.mode === 'string'
    ? ['dry-run', 'apply', 'rollback'].includes(payload.mode) ? payload.mode : 'dry-run'
    : 'dry-run';
  const yuleasrDir = payload && typeof payload.yuleasrDir === 'string' ? payload.yuleasrDir : '';
  const outDir = payload && typeof payload.outDir === 'string' ? payload.outDir : '/tmp/replace-cfgh';
  // P0 修复（小马验收 2026-08-10）：cwd 必须指向仓库根——测试路径是仓库根相对路径，
  // join(__dirname,'..') 指向 apps/yuleasr-desktop 会导致 vitest exit 1 / No test files found
  const projectRoot = join(__dirname, '../../..');
  cfghReplaceRunning = true;
  return new Promise((resolve) => {
    const env = {
      ...process.env,
      YULEASR_DIR: yuleasrDir,
      REPLACE_OUT: outDir,
      REPLACE_MODE: mode,
    };
    const child = spawn('npx', ['vitest', 'run', CFGH_REPLACE_TEST], {
      cwd: projectRoot,
      env,
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      cfghReplaceRunning = false;
      clearTimeout(timer);
      resolve(result);
    };
    // 超时保护（P2 加固）：vitest 挂起时 kill 子进程，避免 UI 永久 spinner
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* 已退出 */ }
      done({ success: false, mode, error: `vitest 超时（>${CFGH_REPLACE_TIMEOUT_MS / 60000} 分钟）已终止` });
    }, CFGH_REPLACE_TIMEOUT_MS);
    child.stdout.on('data', (d) => { stdout = (stdout + d.toString()).slice(-200000); });
    child.stderr.on('data', (d) => { stderr = (stderr + d.toString()).slice(-200000); });
    child.on('error', (err) => done({ success: false, mode, error: String(err) }));
    child.on('close', (code) => {
      // P2 加固：解析**最后一行** REPLACE_CFGH_RESULT=...（错误消息可能含换行导致跨行 JSON 失配）
      const lines = stdout.split('\n').filter(l => l.startsWith('REPLACE_CFGH_RESULT='));
      const last = lines[lines.length - 1];
      if (last) {
        const m = last.match(/REPLACE_CFGH_RESULT=({.*})$/s);
        if (m) {
          try { done({ success: true, mode, result: JSON.parse(m[1]) }); return; }
          catch { /* fallthrough */ }
        }
      }
      done({ success: false, mode, error: `vitest exit ${code}`, stdout: stdout.slice(-2000), stderr: stderr.slice(-2000) });
    });
  });
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
