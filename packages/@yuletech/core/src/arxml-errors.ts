/**
 * ARXML 异常体系（R6 · 异常分类）
 *
 * 对齐 cogu/autosar src/autosar/xml/exception.py 的 5 类异常，
 * 导入/导出关键路径按类抛出，调用方可用 try/catch + instanceof 分类捕获：
 *  - ParseError          ：ARXML 解析/校验失败（XML 畸形、结构非法、导出产物不合 schema）
 *  - DuplicateElementError：同一父上下文内重复元素（cogu: DuplicateElement）
 *  - VersionError        ：无效/不支持的 AUTOSAR schema 版本（cogu: VersionError）
 *  - AssignmentTypeError ：赋值类型错误（cogu: AssignmentTypeError）
 *  - InvalidReferenceError：引用无效（目标缺失或类型不符，cogu: InvalidReferenceError）
 *
 * 兼容性约定：VersionError 继承 RangeError（原生版本校验错误本就是 RangeError，
 * 存量调用方按 RangeError 捕获的代码零回归）。
 */

/** ARXML 异常基类（全部 5 类异常的公共祖先） */
export class ArxmlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** ARXML 解析错误：XML 畸形 / 结构非法 / 导出产物不满足 schema */
export class ParseError extends ArxmlError {}

/** 同一父上下文内重复元素（cogu: DuplicateElement） */
export class DuplicateElementError extends ArxmlError {}

/** 无效/不支持的 AUTOSAR schema 版本（cogu: VersionError；继承 RangeError 保兼容） */
export class VersionError extends RangeError {
  constructor(message: string) {
    super(message);
    this.name = 'VersionError';
  }
}

/** 赋值类型错误（cogu: AssignmentTypeError） */
export class AssignmentTypeError extends ArxmlError {}

/** 引用无效：目标缺失或引用目标类型不符（cogu: InvalidReferenceError） */
export class InvalidReferenceError extends ArxmlError {}

/** 类型守卫：是否任一 ARXML 分类异常（含 VersionError） */
export function isArxmlError(err: unknown): err is ArxmlError | VersionError {
  return err instanceof ArxmlError || err instanceof VersionError;
}

// ============================================================================
// 导入错误分类（report 化导入的按类重抛）
//
// arxml-import 默认是 report 化容错设计（不抛异常，错误进 report.errors），
// 但错误消息带固定前缀；classifyImportError 把前缀映射回异常类，
// 供需要按类捕获的调用方（strict 入口 / UI 差异化提示）使用。
// ============================================================================

/** 导入错误分类：按消息前缀映射到对应异常类（无匹配前缀返回 null） */
export function classifyImportError(message: string): ArxmlError | VersionError | null {
  if (message.startsWith('Invalid reference:')) {
    return new InvalidReferenceError(message);
  }
  if (
    message.startsWith('Parse error:') ||
    message.startsWith('Malformed XML:') ||
    message.startsWith('Missing AUTOSAR')
  ) {
    return new ParseError(message);
  }
  if (message.startsWith('Duplicate element:')) {
    return new DuplicateElementError(message);
  }
  if (message.startsWith('Unsupported AUTOSAR schema version') || message.startsWith('Unsupported schema version')) {
    return new VersionError(message);
  }
  return null;
}
