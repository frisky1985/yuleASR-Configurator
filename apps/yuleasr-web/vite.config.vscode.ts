import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VS Code Webview build variant — uses relative asset paths (base: './')
// so the built HTML works when served from the extension's media/ directory.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-vscode',
    sourcemap: true,
  },
})
