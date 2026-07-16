import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './i18n'  // Initialize i18n
import App from './App'
import './index.css'

// Desktop (Electron file://) → no basename; VS Code Webview → no basename; Web (HTTP/S) → /configurator
const isVSCodeWebview = typeof acquireVsCodeApi !== 'undefined'
  || window.location.origin.includes('vscode-cdn')
  || window.location.origin.includes('vscode-webview')
  || window.location.protocol.startsWith('vscode-')
const basename = isVSCodeWebview || window.location.protocol === 'file:' ? '' : '/configurator'

// Expose VS Code API globally if in webview context
if (isVSCodeWebview && typeof acquireVsCodeApi === 'function') {
  ;(window as any).__vscodeApi = acquireVsCodeApi()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
