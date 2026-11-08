/**
 * 构建期把仓库 verification/extracted-cfgh（宏名版 schema）拷入扩展 schemas/，
 * 供 generateCode / syncConfig 在运行时读取（与 Web codegen 同一 schema 源）。
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const src = join(root, '..', '..', 'verification', 'extracted-cfgh');
const dest = join(root, 'schemas', 'extracted-cfgh');

if (!existsSync(src)) {
  console.error(`[copy-schemas] 缺少 schema 源目录: ${src}`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[copy-schemas] ${src} → ${dest}`);
