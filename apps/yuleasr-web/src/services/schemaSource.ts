/**
 * Schema 源选择（V2.2）— 宏名版优先
 *
 * yuleASR 可用配置头的充要条件（V2 验证结论）：codegen 的 schema 源必须是宏名版
 * （verification/extracted-cfgh/*.json，参数名即宏名，F1 从 yuleASR *_Cfg.h 提取）。
 * generated/*.json（ARXML 标准名体系）对 canif/cantp/pdur/com 宏名零对应，不能直接
 * 产出 yuleASR 可用头。
 *
 * 本模块提供统一取数入口：宏名版优先，无宏名版的模块（非 yuleASR Cfg.h 来源，
 * 如 appswc/compswc/arti/ble/fr/mcl/sbc）回退现有 generated/（loadModuleSchemas）。
 *
 * 运行时形态：浏览器无法读文件系统，用 Vite import.meta.glob 在构建期把
 * verification/extracted-cfgh/*.json 打包进 bundle。该目录已常规入库
 * （.gitignore 调整为仅忽略 verification/* 而放行 extracted-cfgh/），
 * 是 codegen 的运行依赖，不是临时审计产物。
 */
import type { ModuleSchema } from '@yuletech/core';
import {
  generatedJsonToModuleSchema,
  loadModuleSchemas,
} from '@yuletech/core/schema/load-generated';

/** extracted-cfgh/*.json 构建期打包（宏名版 schema，参数名即宏名） */
const macroNameSchemasByPath = import.meta.glob('../../../../verification/extracted-cfgh/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Parameters<typeof generatedJsonToModuleSchema>[1]>;

let cached: ModuleSchema[] | null = null;

/**
 * 加载全量模块 schema（与 loadModuleSchemas 同集合、同排序），宏名版优先：
 * - extracted-cfgh 覆盖的模块（110 个 yuleASR 模块）→ 宏名版（参数名即宏名）；
 * - 未覆盖模块（7 个非 yuleASR 来源）→ 原 generated/ 版。
 *
 * 模块名与 loadModuleSchemas 完全一致（PascalCase），通过 lowercase 文件名匹配，
 * 保证 generateHeadersFromSchemas 的头文件名/宏前缀推导与既有行为一致。
 */
export function loadPreferredSchemas(): ModuleSchema[] {
  if (cached) return cached;

  const generatedSchemas = loadModuleSchemas();
  const byName = new Map(generatedSchemas.map(s => [s.name.toLowerCase(), s]));

  const preferred: ModuleSchema[] = [];
  const covered = new Set<string>();

  for (const [filePath, json] of Object.entries(macroNameSchemasByPath)) {
    const stem = filePath.slice(filePath.lastIndexOf('/') + 1).replace(/\.json$/, '');
    const base = byName.get(stem);
    if (!base) continue; // extracted ⊆ generated，防御性跳过（不应发生）
    covered.add(stem);
    preferred.push(generatedJsonToModuleSchema(base.name, json));
  }

  // 未覆盖模块（非 yuleASR Cfg.h 来源）走原 generated/ 路径
  for (const s of generatedSchemas) {
    if (!covered.has(s.name.toLowerCase())) preferred.push(s);
  }

  preferred.sort((a, b) => a.name.localeCompare(b.name));
  cached = preferred;
  return preferred;
}
