import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './i18n'; // Initialize i18n
import App from './App';
import './index.css';

// Register built-in AUTOSAR plugins on startup
import { registerBuiltinPlugins } from '@yuletech/core/plugins';
registerBuiltinPlugins();

// Desktop (Electron file://) → no basename; VS Code Webview → no basename
// Web (HTTP/S) → import.meta.env.BASE_URL（与 vite base 一致，随部署方式自动适配）：
//   - GitHub Pages 原生部署 (deploy-web.yml): base=/yuleASR-Configurator/
//   - gh-pages 分支 /configurator/ 子目录 (deploy-gh-pages.yml): base=/configurator/
//   - 本地 dev: base=/configurator/
// 修复：原先硬编码 `${repoPrefix}/configurator` 与 GitHub Pages 原生部署
// （站点根部署，pathname=/yuleASR-Configurator/）不匹配 → BrowserRouter 匹配不到路由 → 白屏。
const isVSCodeWebview =
  typeof acquireVsCodeApi !== 'undefined' ||
  window.location.origin.includes('vscode-cdn') ||
  window.location.origin.includes('vscode-webview') ||
  window.location.protocol.startsWith('vscode-');
const basename =
  isVSCodeWebview || window.location.protocol === 'file:'
    ? ''
    : (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

// Expose VS Code API globally if in webview context
if (isVSCodeWebview && typeof acquireVsCodeApi === 'function') {
  (window as any).__vscodeApi = acquireVsCodeApi();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
