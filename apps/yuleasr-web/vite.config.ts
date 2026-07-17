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
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
