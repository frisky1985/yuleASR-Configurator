import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// yuleASR Desktop — wraps the yuleasr-web app
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, '../yuleasr-web'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
