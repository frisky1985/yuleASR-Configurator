/**
 * @yuletech/core - ARXML SWC 层 + ECUC 值层导入后端
 *
 * 导入 .arxml 工程文件（SWC/端口/接口/数据类型/CompuMethod + ECUC 值层模块，R8/E1）
 * 到 Configurator 现有数据模型（types/swc.ts：SwcProjectConfig）。
 *
 * 设计：
 *  - 轻量自研解析器（fast-xml-parser 已有依赖，零新增依赖），
 *    借鉴 cogu/autosar 的 switcher 字典分发 + ChildElementMap 未处理元素告警模式；
 *  - 未处理元素仅告警不崩溃（OEM ARXML 必然含未知元素）；
 *  - ECUC 值层（R8/E1）：ECUC-MODULE-CONFIGURATION-VALUES / PARAMETER-VALUES /
 *    ECUC-CONTAINER-VALUE 递归，与 arxml-export/serializer.ts 对称构成导入导出闭环；
 *  - ECUC 定义层（R8/E2）：ECUC-MODULE-DEF 元模型（参数族/容器递归/REFERENCE-DEF），
 *    定义↔值关联按 DEFINITION-REF 短名回填 moduleDef；
 *  - ECUC 一致性校验（R8/E3）：值-定义匹配/枚举合法/容器超限，见 ecuc-consistency.ts。
 *  - BSW 模块配置的旧入口 @yuletech/core/adapters/arxml-parser（ECUC 层）仍可用，
 *    与本导入器互为补充（adapter 产出 ParsedModuleConfig 领域模型）。
 */

import type { SwcProjectConfig } from '../types/swc';

import {
  classifyImportError,
  isArxmlError,
  ParseError,
  type ArxmlError,
} from '../arxml-errors';
import { parseSwcArxml, type ImportReport, type SwcArxmlProject } from './reader';

export {
  parseSwcArxml,
  ChildElementMap,
  LineIndex,
  refShortName,
  resolveReferences,
  resolveEcucModuleDefs,
  reportDuplicate,
  type SwcArxmlProject,
  type ImportReport,
  type UnprocessedElementWarning,
  type PendingReference,
  // R8/E1：ECUC 值层数据模型（与导出侧 ArxmlExport* 对称）
  type EcucModuleConfigValue,
  type EcucContainerValue,
  type EcucParameterValue,
  // R8/E2：ECUC 定义层数据模型（ECUC-MODULE-DEF 元模型）
  type EcucModuleDef,
  type EcucContainerDef,
  type EcucParameterDef,
  type EcucParameterDefKind,
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

// R6 异常分类工具（report 化导入 → 按类重抛/差异化提示）
export { classifyImportError, isArxmlError, type ArxmlError };

/** 导入结果：现有数据模型 + 导入报告 */
export interface SwcImportResult {
  /** Configurator 现有 SWC 数据模型 */
  project: SwcProjectConfig;
  /** 导入报告（成功元素计数 + 未处理元素告警清单） */
  report: ImportReport;
}

/**
 * 从 ARXML 内容导入 SWC 层元素（ECUC 值层计数见 report.counts.ecucModules；
 * 完整 ECUC 模块数据请用 parseSwcArxml 的 ecucModules 字段，R8/E1）。
 *
 * @param xmlContent ARXML 文件内容
 * @param sourceName 源文件名（用于告警 file(line) 前缀，默认 input.arxml）
 * @returns 导入结果：SwcProjectConfig（现有数据模型）+ 导入报告
 *
 * @example
 * ```ts
 * const { project, report } = importSwcArxml(xml, 'BCM.arxml');
 * console.log(report.counts.swComponents);      // 成功导入的 SWC 数
 * console.log(report.counts.ecucModules);       // 成功导入的 ECUC 模块数（R8/E1）
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

/**
 * 严格导入（R6：异常分类入口）：与 importSwcArxml 同语义，但存在硬错误时
 * **按类抛异常**（ParseError / InvalidReferenceError / DuplicateElementError / …），
 * 调用方可 try/catch + instanceof 分类捕获；无硬错误时行为与容错版一致。
 *
 * 适用场景：需要强校验的导入（CI 管道 / 批量处理），或需要差异化提示的 UI。
 *
 * @example
 * ```ts
 * try {
 *   const { project } = importSwcArxmlStrict(xml, 'BCM.arxml');
 * } catch (err) {
 *   if (err instanceof InvalidReferenceError) { handleRefIssue(); }
 *   else if (err instanceof ParseError) { handleXmlIssue(); }
 * }
 * ```
 */
export function importSwcArxmlStrict(xmlContent: string, sourceName = 'input.arxml'): SwcImportResult {
  const result = importSwcArxml(xmlContent, sourceName);
  if (result.report.errors.length > 0) {
    const first = result.report.errors[0];
    throw classifyImportError(first) ?? new ParseError(first);
  }
  return result;
}

export default importSwcArxml;
