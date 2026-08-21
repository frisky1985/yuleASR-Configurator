import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // YAC-CI-004: dts:false —— tsup 内置 rollup-plugin-dts 6.1.1 与 TS7 不兼容崩溃
  // (Cannot read properties of undefined 'useCaseSensitiveFileNames')；
  // dts 改由 build 脚本里 `tsc --emitDeclarationOnly` 生成（与 @yuletech/core 同模式，TS7 CLI 实测可用）
  dts: false,
  clean: true,
  sourcemap: true,
  target: 'es2022',
});
