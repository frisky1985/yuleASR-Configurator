import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    models: 'src/models/index.ts',
    engine: 'src/engine/index.ts',
    services: 'src/services/index.ts',
    sync: 'src/sync/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@yuletech/core', '@yuletech/utils'],
})