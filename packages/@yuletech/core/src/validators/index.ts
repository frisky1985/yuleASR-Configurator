/**
 * @yuletech/core - Validators barrel
 * 配置验证管道的规范入口（`validator` 单数入口已 deprecated，re-export 本目录）。
 */
export { YuleasrValidator, yuleasrValidator } from './yuleasr-validator';
export { CrossModuleValidator, createCrossModuleValidator } from './cross-module-validator';
export { ValidationPipeline, validateAll } from './validation-pipeline';
export type { ValidationPipelineResult } from './validation-pipeline';
// 兼容入口：ConfigValidator 由 yuleasr-editor-core 等存量调用方使用（Fix 31 保留）
export { ConfigValidator, createValidator } from './config-validator';
