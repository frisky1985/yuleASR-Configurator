import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // YAC-CI-004: dts:false —— tsup 内置 rollup-plugin-dts 与 TS7 不兼容（同 plugin-sdk），
  // dts 改由 build 脚本 `tsc --emitDeclarationOnly` 生成
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
});
