import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: [
      'packages/*/vitest.config.ts',
      'packages/@yuletech/*/vitest.config.ts',
      // Fix 32: 接入 apps 单测（yuleasr-web / yulecommunity）到全仓 vitest。
      // 注意：tests/integration 需要外部环境（yuleOSH server / yuleASR 仓库 / gcc），
      // 由 CI 专门的 integration-test job 负责，不纳入全仓单测工作区。
      'apps/*/vitest.config.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
});
