import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './i18n'  // Initialize i18n
import App from './App'
import './index.css'

// Desktop (Electron file://) → no basename; Web (HTTP/S) → /configurator
const basename = window.location.protocol === 'file:' ? '' : '/configurator'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
