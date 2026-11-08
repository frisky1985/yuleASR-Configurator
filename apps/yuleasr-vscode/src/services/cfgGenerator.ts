/**
 * VS Code 侧代码生成服务（真实实现）
 *
 * 复用 @yuletech/core 的 generateHeadersFromSchemas（与 Web 编辑器同一实现），
 * 不依赖 Vite import.meta.glob：
 * - schema 源：扩展内置 schemas/extracted-cfgh（构建时从仓库 verification/ 拷贝）；
 * - 手写头源：yuleasr.yuleASRPath 指向的 yuleASR 仓库（按 x-source-file 读取，
 *   用于混合头拼接；缺失时已知混合头模块报错而非产出残缺头）。
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  generateHeadersFromSchemas,
  type CfgHeaderFile,
  type ModuleParameter,
  type ModuleSchema,
} from '@yuletech/core';
import { generatedJsonToModuleSchema } from '@yuletech/core/schema/load-generated';

/** 配置文件中不属于参数的元字段 */
const CONFIG_META_KEYS = new Set(['moduleName', 'module', 'version', 'metadata', 'layer']);

/** 扩展内置宏名版 schema 目录（out/extension.js → ../schemas/extracted-cfgh） */
export function resolveSchemaDir(extensionRoot: string): string {
  return join(extensionRoot, 'schemas', 'extracted-cfgh');
}

/** 加载宏名版 schema（参数名即宏名，与 yuleASR 手写头一致） */
export function loadExtractedSchemas(schemaDir: string): ModuleSchema[] {
  if (!existsSync(schemaDir)) return [];
  const schemas: ModuleSchema[] = [];
  for (const file of readdirSync(schemaDir)
    .filter(f => f.endsWith('.json'))
    .sort()) {
    const json = JSON.parse(readFileSync(join(schemaDir, file), 'utf8'));
    schemas.push(generatedJsonToModuleSchema(file.replace(/\.json$/, ''), json));
  }
  return schemas;
}

/** 按模块名（大小写不敏感）查找 schema */
export function findSchema(schemas: ModuleSchema[], moduleName: string): ModuleSchema | undefined {
  const key = moduleName.toLowerCase();
  return schemas.find(s => s.name.toLowerCase() === key);
}

/**
 * 从 yuleASR 仓库读取手写头（按 schema 的 x-source-file）。
 * 返回 filename/sourcePath → 内容 的 Map，供混合头拼接。
 */
export function collectHandwrittenHeaders(
  yuleASRPath: string,
  schemas: ModuleSchema[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const schema of schemas) {
    const sourceFile = (schema as unknown as Record<string, unknown>)['sourceFile'] as
      string | undefined;
    if (!sourceFile) continue;
    const full = join(yuleASRPath, sourceFile);
    if (!existsSync(full)) continue;
    const content = readFileSync(full, 'utf8');
    map.set(sourceFile, content);
    const base = sourceFile.split('/').pop();
    if (base && !map.has(base)) map.set(base, content);
  }
  return map;
}

/**
 * 把配置文件的参数值覆盖到 schema 默认值上。
 * 支持两种配置形态：
 * - 扁平：{ moduleName, version, CAN_NUM_HOH: 8, ... }
 * - 嵌套：{ moduleName, version, parameters: { CAN_NUM_HOH: 8, ... } }
 */
export function applyConfigToSchema(
  schema: ModuleSchema,
  config: Record<string, unknown>
): ModuleSchema {
  const nested = config.parameters;
  const params: Record<string, unknown> =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : config;

  const overrides = new Map(Object.entries(params).filter(([key]) => !CONFIG_META_KEYS.has(key)));

  return {
    ...schema,
    parameters: (schema.parameters ?? []).map((p: ModuleParameter) =>
      overrides.has(p.name) ? { ...p, default: overrides.get(p.name) } : p
    ),
  } as ModuleSchema;
}

/** 生成结果：成功文件 + 每模块错误（不吞错） */
export interface ModuleGenerationResult {
  file?: CfgHeaderFile;
  sourcePath?: string;
  error?: string;
}

/**
 * 为单个 .yule.json 配置生成 <Module>_Cfg.h。
 * 失败返回 error（不返回假成功）。
 */
export async function generateForConfig(
  configPath: string,
  moduleName: string,
  schemas: ModuleSchema[],
  handwritten: Map<string, string>
): Promise<ModuleGenerationResult> {
  const schema = findSchema(schemas, moduleName);
  if (!schema) {
    return { error: `无 ${moduleName} 的 schema（扩展内置 schemas 缺失该模块）` };
  }

  let config: Record<string, unknown>;
  try {
    const parsed = JSON.parse(readFileSync(configPath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { error: `配置不是 JSON 对象: ${configPath}` };
    }
    config = parsed as Record<string, unknown>;
  } catch (e) {
    return { error: `读取配置失败: ${e instanceof Error ? e.message : String(e)}` };
  }

  const overridden = applyConfigToSchema(schema, config);
  try {
    const files = await generateHeadersFromSchemas([overridden], {
      handwrittenHeaders: handwritten,
    });
    const file = files[0];
    if (!file) return { error: `${moduleName} 生成无输出（可能为仅配置不生成模块）` };
    return {
      file,
      sourcePath: (schema as unknown as Record<string, unknown>)['sourceFile'] as
        string | undefined,
    };
  } catch (e) {
    return { error: `${moduleName} 生成失败: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** 同步写入结果 */
export interface SyncResult {
  written: Array<{ sourcePath: string; backupPath?: string }>;
  skipped: Array<{ module: string; reason: string }>;
}

/**
 * 将生成头写回 yuleASR 仓库（按 x-source-file 路径）。
 * 护栏：
 * - yuleASRPath 必须是 git 仓库（防写错目录）；
 * - 写前备份原文件为 <file>.bak-yuleasr（仅首次，避免覆盖用户备份）。
 */
export function syncGeneratedFiles(
  yuleASRPath: string,
  results: Array<{ module: string; file: CfgHeaderFile; sourcePath?: string }>
): SyncResult {
  if (!existsSync(join(yuleASRPath, '.git'))) {
    throw new Error(`yuleASR 路径无效（非 git 仓库，拒绝写入）: ${yuleASRPath}`);
  }

  const written: SyncResult['written'] = [];
  const skipped: SyncResult['skipped'] = [];

  for (const item of results) {
    if (!item.sourcePath) {
      skipped.push({ module: item.module, reason: 'schema 无 x-source-file，无法定位写入路径' });
      continue;
    }
    const target = join(yuleASRPath, item.sourcePath);
    try {
      mkdirSync(join(target, '..'), { recursive: true });
      let backupPath: string | undefined;
      if (existsSync(target)) {
        backupPath = `${target}.bak-yuleasr`;
        if (!existsSync(backupPath)) {
          writeFileSync(backupPath, readFileSync(target, 'utf8'), 'utf8');
        }
      }
      writeFileSync(target, item.file.content, 'utf8');
      written.push({ sourcePath: item.sourcePath, backupPath });
    } catch (e) {
      skipped.push({
        module: item.module,
        reason: `写入失败: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }

  return { written, skipped };
}
