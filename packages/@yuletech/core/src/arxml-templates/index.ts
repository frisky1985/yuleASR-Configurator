/**
 * @yuletech/core - ARXML 模板机制（R2）
 *
 * 轻量模板机制，对齐 cogu/autosar xml/template.py + workspace.apply：
 *  - element-template.ts：ElementTemplate（元素名/包角色/依赖声明）+ GenericTemplate
 *    + 包角色/包路径/包视图类型；
 *  - workspace.ts：TemplateWorkspace —— apply 自动"依赖先建 → 包自动创建 →
 *    查重防重复 → create 后 append"；
 *  - swc-templates.ts：实用模板（SenderReceiverInterfaceTemplate /
 *    ApplicationSwcTemplate）。
 */

export * from './element-template';
export * from './workspace';
export * from './swc-templates';
