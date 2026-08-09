/**
 * ARXML 导出结构契约校验器（R7 · 导出即验证）
 *
 * 背景：AUTOSAR 完整 XSD（AUTOSAR_0004x-51.xsd）体积数十 MB，Electron/web
 * 环境内置不现实；cogu/autosar 也无 XSD 校验（"声称兼容 48-51"但无验证）。
 * 本校验器做**结构契约校验**——覆盖导出产物最关键的可机械校验面：
 *  1. 文档头（XML 声明）
 *  2. 根元素 + 命名空间（AUTOSAR / r4.0 / xsi）
 *  3. schemaLocation 格式 + 版本与请求目标一致（GATE-001 反向验证）
 *  4. ECUC 值层结构合法性（AR-PACKAGES → AR-PACKAGE → ELEMENTS →
 *     ECUC-MODULE-CONFIGURATION-VALUES → PARAMETER-VALUES/CONTAINERS 层级）
 *  5. XML well-formed（标签配对闭合）粗检
 *
 * 这既是超越 cogu 的差异化点（导出即验证），也补首轮报告"无 XSD 校验"遗留。
 * 完整 XSD 校验（含值域/引用 DEST 枚举全量）留作远期增强，接口预留。
 */

import { ParseError } from '../arxml-errors';
import { ARXML_NAMESPACE, ARXML_XSI_NAMESPACE } from './versions';
import { detectSchemaVersion } from './serializer';

/** 校验结果 */
export interface ArxmlValidationResult {
  ok: boolean;
  /** 校验错误清单（ok=false 时非空） */
  errors: string[];
}

/** 校验选项 */
export interface ArxmlValidateOptions {
  /** 期望的 schema 版本号；提供时校验 schemaLocation 一致性 */
  expectedSchemaVersion?: number;
}

/** 标签配对粗检：统计开/闭标签数（自闭合除外），不配对即 well-formed 可疑 */
function checkTagBalance(xml: string, errors: string[]): void {
  const openTags = xml.match(/<[A-Z][A-Z0-9-]*(?=[\s>])/g) ?? [];
  const closeTags = xml.match(/<\/([A-Z][A-Z0-9-]*)>/g) ?? [];
  const selfClosing = xml.match(/<[A-Z][A-Z0-9-]*\s*\/>/g) ?? [];
  if (openTags.length - selfClosing.length !== closeTags.length) {
    errors.push(
      `XML 标签配对不平衡：开标签 ${openTags.length}（自闭合 ${selfClosing.length}）vs 闭标签 ${closeTags.length}`
    );
  }
}

/** 检查 ECUC 值层关键结构链（宽松模式：只验证关键骨架存在与层级） */
function checkEcucStructure(xml: string, errors: string[]): void {
  const required = [
    '<AUTOSAR',
    '<AR-PACKAGES>',
    '<AR-PACKAGE>',
    '<ELEMENTS>',
    '<ECUC-MODULE-CONFIGURATION-VALUES>',
    '<SHORT-NAME>',
  ];
  for (const token of required) {
    if (!xml.includes(token)) {
      errors.push(`缺少必需结构元素：${token}`);
      return;
    }
  }
  // 层级顺序粗检：AR-PACKAGES 必须在 AR-PACKAGE 之前，ELEMENTS 在模块之前
  const idxPackages = xml.indexOf('<AR-PACKAGES>');
  const idxPackage = xml.indexOf('<AR-PACKAGE>');
  const idxElements = xml.indexOf('<ELEMENTS>');
  const idxModule = xml.indexOf('<ECUC-MODULE-CONFIGURATION-VALUES>');
  if (idxPackages === -1 || idxPackage === -1 || idxElements === -1 || idxModule === -1) return;
  if (!(idxPackages < idxPackage && idxPackage < idxElements && idxElements < idxModule)) {
    errors.push('ECUC 结构层级顺序异常（AR-PACKAGES → AR-PACKAGE → ELEMENTS → 模块）');
  }
}

/**
 * 校验序列化后的 ARXML 文档（结构契约）。
 * 返回 ok + errors；不抛异常（调用方决定如何处理）。
 */
export function validateArxmlDocument(
  xml: string,
  options: ArxmlValidateOptions = {}
): ArxmlValidationResult {
  const errors: string[] = [];

  // 1. 文档头
  if (!xml.startsWith('<?xml')) {
    errors.push('缺少 XML 声明（<?xml ... ?>）');
  }

  // 2. 根元素 + 命名空间
  if (!xml.includes('<AUTOSAR')) {
    errors.push('缺少根元素 <AUTOSAR>');
  }
  if (!xml.includes(`xmlns="${ARXML_NAMESPACE}"`)) {
    errors.push(`缺少 AUTOSAR 命名空间声明（${ARXML_NAMESPACE}）`);
  }
  if (!xml.includes(`xmlns:xsi="${ARXML_XSI_NAMESPACE}"`)) {
    errors.push('缺少 xsi 命名空间声明');
  }

  // 3. schemaLocation 格式 + 版本一致性
  if (!xml.includes('xsi:schemaLocation="')) {
    errors.push('缺少 xsi:schemaLocation 属性');
  }
  const detected = detectSchemaVersion(xml);
  if (detected === null) {
    errors.push('schemaLocation 中未找到 AUTOSAR_%05d.xsd 版本标记');
  } else if (options.expectedSchemaVersion !== undefined && detected !== options.expectedSchemaVersion) {
    errors.push(
      `schemaLocation 版本不匹配：文档 ${detected} vs 期望 ${options.expectedSchemaVersion}`
    );
  }

  // 4. ECUC 值层结构
  checkEcucStructure(xml, errors);

  // 5. well-formed 粗检
  checkTagBalance(xml, errors);

  return { ok: errors.length === 0, errors };
}

/**
 * 组合导出：序列化 + 校验一步到位（导出即验证）。
 * 校验失败抛 ParseError（R6 分类异常），错误清单并入消息。
 */
export function assertValidArxmlExport(
  xml: string,
  options: ArxmlValidateOptions = {}
): ArxmlValidationResult {
  const result = validateArxmlDocument(xml, options);
  if (!result.ok) {
    throw new ParseError(`ARXML 导出校验失败：\n  - ${result.errors.join('\n  - ')}`);
  }
  return result;
}
