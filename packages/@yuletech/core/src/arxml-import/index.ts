/**
 * @yuletech/core - ARXML SWC 层导入后端
 *
 * 导入 .arxml 工程文件（SWC/端口/接口/数据类型/CompuMethod 层）到
 * Configurator 现有数据模型（types/swc.ts：SwcProjectConfig）。
 *
 * 设计：
 *  - 轻量自研解析器（fast-xml-parser 已有依赖，零新增依赖），
 *    借鉴 cogu/autosar 的 switcher 字典分发 + ChildElementMap 未处理元素告警模式；
 *  - 未处理元素仅告警不崩溃（OEM ARXML 必然含未知元素）；
 *  - BSW 模块配置（CanIf/NvM 等 ECUC 层）不属于本模块范围，
 *    请使用 @yuletech/core/adapters/arxml-parser（ECUC 层）。
 */

import type { SwcProjectConfig } from '../types/swc';

import { parseSwcArxml, type ImportReport, type SwcArxmlProject } from './reader';

export {
  parseSwcArxml,
  ChildElementMap,
  LineIndex,
  refShortName,
  resolveReferences,
  type SwcArxmlProject,
  type ImportReport,
  type UnprocessedElementWarning,
  type PendingReference,
} from './reader';

// 引用类型约束表（C1 · R1）：REF_CONSTRAINTS + RefTargetKind
// 对齐 cogu reference.py 47 个 Ref 类的 accepted_sub_types() 白名单
// （这里只覆盖本导入器涉及的 4 类引用点）。
export {
  REF_CONSTRAINTS,
  REF_TARGET_KIND_LABELS,
  type RefTargetKind,
  type RefConstraintKey,
} from './reference';

/** 导入结果：现有数据模型 + 导入报告 */
export interface SwcImportResult {
  /** Configurator 现有 SWC 数据模型 */
  project: SwcProjectConfig;
  /** 导入报告（成功元素计数 + 未处理元素告警清单） */
  report: ImportReport;
}

/**
 * 从 ARXML 内容导入 SWC 层元素。
 *
 * @param xmlContent ARXML 文件内容
 * @param sourceName 源文件名（用于告警 file(line) 前缀，默认 input.arxml）
 * @returns 导入结果：SwcProjectConfig（现有数据模型）+ 导入报告
 *
 * @example
 * ```ts
 * const { project, report } = importSwcArxml(xml, 'BCM.arxml');
 * console.log(report.counts.swComponents);      // 成功导入的 SWC 数
 * console.log(report.warnings);                 // file(line): Unprocessed element <TAG>
 * ```
 */
export function importSwcArxml(xmlContent: string, sourceName = 'input.arxml'): SwcImportResult {
  const parsed: SwcArxmlProject = parseSwcArxml(xmlContent, sourceName);

  const project: SwcProjectConfig = {
    applicationComponents: parsed.applicationComponents,
    compositionComponents: parsed.compositionComponents,
    applicationDataTypes: parsed.applicationDataTypes,
    implementationDataTypes: parsed.implementationDataTypes,
    interfaces: parsed.interfaces,
    compuMethods: parsed.compuMethods,
  };

  return { project, report: parsed.report };
}

export default importSwcArxml;
