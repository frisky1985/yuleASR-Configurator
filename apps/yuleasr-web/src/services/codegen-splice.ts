/**
 * V3.2 — 混合头拼接 Node 侧入口（仅 Node 环境，浏览器不可用：依赖 node:fs）。
 *
 * 职责：从手写头目录读取全部 `*_Cfg.h`，交给 codegen.ts 的拼接路径
 * （generateHeadersFromSchemas + handwrittenHeaders）。codegen.ts 本体保持
 * 纯函数（浏览器安全）；本文件是"Configurator 侧读取手写头备份"的落点。
 *
 * 护栏兜底：目录缺失/为空时 handwrittenHeaders 为空 Map → 已知混合头模块
 * （如 CanIf_Cfg.h）在 generateHeadersFromSchemas 内抛错，不产出残缺纯宏头。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { ModuleSchema } from '@yuletech/core';

import { generateHeadersFromSchemas, type GeneratedFile, type SpliceOptions } from './codegen';

/** 手写头目录下所有 *_Cfg.h 文件（不递归） */
export function collectHandwrittenHeaders(dir: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(dir)) return map;
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith('_Cfg.h')) {
      const p = join(dir, entry);
      if (existsSync(p)) map.set(entry, readFileSync(p, 'utf8'));
    }
  }
  return map;
}

/** 构造拼接模式选项（目录 → handwrittenHeaders Map） */
export function spliceOptionsFromDir(dir: string): SpliceOptions {
  return { handwrittenHeaders: collectHandwrittenHeaders(dir) };
}

/**
 * 拼接模式全量生成：宏段(生成) + 非宏段(手写) 拼接后的全部模块头。
 * 与 generateHeadersFromSchemas(schemas, spliceOptionsFromDir(dir)) 等价。
 */
export async function generateHeadersFromSchemasWithSplice(
  schemas: ModuleSchema[],
  dir: string
): Promise<GeneratedFile[]> {
  return generateHeadersFromSchemas(schemas, spliceOptionsFromDir(dir));
}
