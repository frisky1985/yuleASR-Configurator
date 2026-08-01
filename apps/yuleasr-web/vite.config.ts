import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// GitHub Pages native deployment (actions/configure-pages) sets PUBLIC_URL
// Fallback: '/configurator/' for gh-pages branch + peaceiris deployment
const base = process.env.PUBLIC_URL || '/configurator/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/v1': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 现代浏览器 target：避免 esbuild 将依赖 (i18next-browser-languagedetector 等)
    // 降级转换时报 "Transforming destructuring ... not supported yet"
    target: 'esnext',
  },
});
