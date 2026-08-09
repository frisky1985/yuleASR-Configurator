// 导出类型
export * from './types';

// 导出 Schema
export * from './schema';

// 导出验证器
export * from './validator';

// 导出生成器
export * from './generator';

// 导出 yuleASR 适配器
export * from './adapters/yuleasr-adapter';

// 导出 Schema 提取器
export * from './schema-extractor';

// 导出 SWC 模块
export * from './swc';

// 导出 yuleASR 验证器 (使用别名避免冲突)
export {
  YuleasrValidator,
  yuleasrValidator,
  type ModuleValidationRules,
} from './validators/yuleasr-validator';

// 导出 ARXML 解析器 (fast-xml-parser 版, Fix 18 统一出口)
export {
  parseArxml,
  parseArxmlContent,
  validateArxml,
  convertArxmlToYuleasr,
  type ArxmlParseResult,
  type ParsedModuleDef,
  type ParsedContainerValue,
  type ParsedParamValue,
} from './adapters/arxml-parser';

// 导出 ARXML SWC 层导入后端 (SWC/接口/数据类型/CompuMethod, 借鉴 cogu switcher+ChildElementMap 模式)
export {
  importSwcArxml,
  importSwcArxmlStrict,
  parseSwcArxml,
  ChildElementMap,
  LineIndex,
  refShortName,
  resolveEcucModuleDefs,
  type SwcImportResult,
  type SwcArxmlProject,
  type ImportReport,
  type UnprocessedElementWarning,
  // R8/E2：ECUC 定义层数据模型
  type EcucModuleDef,
  type EcucContainerDef,
  type EcucParameterDef,
  type EcucParameterDefKind,
} from './arxml-import';

// 导出 ARXML 异常体系 (R6, 对齐 cogu exception.py 5 类, 调用方可按类捕获)
export {
  ArxmlError,
  ParseError,
  DuplicateElementError,
  VersionError,
  AssignmentTypeError,
  InvalidReferenceError,
  isArxmlError,
  classifyImportError,
} from './arxml-errors';

// 导出 ARXML 模板机制 (R2, 对齐 cogu template.py/workspace.apply)
export * from './arxml-templates';

// 导出 C 代码生成共享工具 (escapeCString 等, Fix 18/22 单一实现)
export {
  escapeCString,
  C_IDENTIFIER_RE,
  assertCIdentifier,
} from './generator/autosar-format';

// 导出插件系统
export { pluginRegistry, pluginManager } from './plugins';
export type { RegisteredPlugin } from './plugins';
