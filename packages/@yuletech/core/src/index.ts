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

// 导出 ARXML 解析器
export {
  parseArxml,
  validateArxml,
  convertArxmlToYuleasr,
  type ArxmlParseResult,
} from './adapters/arxml-parser';

// 导出插件系统
export { pluginRegistry, pluginManager } from './plugins';
export type { RegisteredPlugin } from './plugins';
