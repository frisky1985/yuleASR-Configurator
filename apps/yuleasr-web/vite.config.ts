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
  // dev 模式依赖预构建 (optimizeDeps) 走 esbuild，默认 target 是老浏览器集
  // (chrome87/edge88/es2020...)，遇到现代语法依赖报
  // "Transforming destructuring ... not supported yet" —— 与 build.target 同样处理
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
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
