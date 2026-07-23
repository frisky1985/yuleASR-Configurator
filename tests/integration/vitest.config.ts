import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['node_modules/**'],
    testTimeout: 60000,
  },
  resolve: {
    alias: {
      '@yuletech/core': path.resolve(__dirname, 'packages/@yuletech/core/src'),
    },
  },
});
