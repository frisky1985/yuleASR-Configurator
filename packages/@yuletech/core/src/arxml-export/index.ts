/**
 * @yuletech/core - ARXML 版本化导出后端（A4）
 *
 * 版本化 schema 导出（借鉴 cogu/autosar schema_version 机制）：
 *  - versions.ts      ：schema 版本注册表（44/48/49/50/51 → 发布标签 + XSD 文件名）
 *  - version-gates.ts ：VERSION_GATES 版本差异登记表（集中管理，替代散落 if）
 *  - serializer.ts    ：最小导出框架（模型→ARXML 骨架 + 版本参数 + 反向探测）
 *
 * 与 A1 arxml-import 互补：import 负责读入（含 schemaLocation 版本探测），
 * 本模块负责写出（版本参数化 + 差异门控）。
 */

export * from './versions';
export * from './version-gates';
export * from './serializer';
