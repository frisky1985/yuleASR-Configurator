/**
 * ARXML ECUC 层导入服务（Web 薄重导出层）
 *
 * core 是 ARXML 解析的唯一领域出口（Fix 18 惯例），本文件仅做薄重导出，
 * 让 web 层可直接 `import { parseSwcArxml } from '../services/arxml-ecuc-import'`。
 *
 * 导入范围：ECUC 值层（ECUC-MODULE-CONFIGURATION-VALUES 递归，R8/E1）
 *          + ECUC 定义层（ECUC-MODULE-DEF 元模型，R8/E2）
 *          + 值-定义一致性校验（R8/E3，见 validateEcucConsistency）。
 * SWC/端口/接口层请使用 ./arxml-swc-import（APPLICATION-SW-COMPONENT-TYPE 等）。
 *
 * 展示边界（诚实声明）：
 *  - 本层只做**只读**展示数据供给；ECUC 编辑（改值/增删容器）未实现，留遗留；
 *  - 不映射到 types/config.ts 的 ModuleSchema/ModuleConfig（EcucCodeGenerator 模型）——
 *    导入侧 ECUC 值层是「名称/值/DEFINITION-REF 原文 + 定义关联」的读取模型，
 *    与生成器「{name: value} 扁平配置」语义不同，独立展示避免污染生成器。
 */

import type { ImportReport, SwcArxmlProject } from '@yuletech/core/arxml-import';
import { parseSwcArxml } from '@yuletech/core/arxml-import';

// 薄重导出：core 的 ECUC 解析/校验入口透传（validateEcucConsistency 已由
// parseSwcArxml 内置管线消费，单独 re-export 供高级调用方按需使用）
export {
  parseSwcArxml,
  validateEcucConsistency,
  type SwcArxmlProject,
  type ImportReport,
  type UnprocessedElementWarning,
  type EcucModuleConfigValue,
  type EcucContainerValue,
  type EcucParameterValue,
  type EcucModuleDef,
  type EcucContainerDef,
  type EcucParameterDef,
  type EcucParameterDefKind,
} from '@yuletech/core/arxml-import';

/** ECUC 侧导入结果（SwcArxmlProject 的 ECUC 聚焦切片） */
export interface EcucImportResult {
  /** ECUC 值层模块（ECUC-MODULE-CONFIGURATION-VALUES） */
  modules: SwcArxmlProject['ecucModules'];
  /** ECUC 定义层模块（ECUC-MODULE-DEF 元模型，可空数组） */
  moduleDefs: SwcArxmlProject['ecucModuleDefs'];
  /** 导入报告（计数 + 未处理元素告警 + E3 一致性问题） */
  report: ImportReport;
}

/**
 * 从 ARXML 内容导入 ECUC 层（值层 + 定义层）并返回 ECUC 聚焦切片。
 *
 * 薄封装：只做字段抽取（modules/moduleDefs/report），不转换数据。
 * SWC 层数据（applicationComponents 等）仍在 SwcArxmlProject 内，
 * 需要完整工程请直接用 parseSwcArxml。
 *
 * @param xmlContent ARXML 文件内容
 * @param sourceName 源文件名（告警 file(line) 前缀，默认 input.arxml）
 * @returns ECUC 聚焦导入结果
 *
 * @example
 * ```ts
 * const { modules, moduleDefs, report } = importEcucArxml(xml, 'Can.arxml');
 * console.log(modules.length);        // ECUC 值层模块数
 * console.log(moduleDefs.length);     // ECUC 定义层模块数（可能为 0）
 * console.log(report.warnings);       // file(line): Unprocessed element <TAG>
 * ```
 */
export function importEcucArxml(xmlContent: string, sourceName = 'input.arxml'): EcucImportResult {
  const parsed: SwcArxmlProject = parseSwcArxml(xmlContent, sourceName);
  return {
    modules: parsed.ecucModules,
    moduleDefs: parsed.ecucModuleDefs,
    report: parsed.report,
  };
}
