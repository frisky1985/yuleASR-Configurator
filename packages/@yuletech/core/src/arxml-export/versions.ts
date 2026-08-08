/**
 * AUTOSAR schema 版本注册表（A4-1 · 版本化 ARXML 导出）
 *
 * 借鉴 cogu/autosar：schema_version 是 Document 级属性（document.py:18），
 * 写入时按版本生成 `AUTOSAR_%05d.xsd` schemaLocation（writer.py:499-505）。
 *
 * 本注册表是导出侧"目标 AUTOSAR 版本"参数的唯一事实来源：
 *  - 导出对话框/插件/服务层只引用这里的常量与辅助函数；
 *  - 新增支持版本只需在此登记（schema 文件 + 发布标签），导出层自动生效。
 *
 * 版本号 = AUTOSAR schema 号（AUTOSAR_00048.xsd 中的 48），
 * 与 AUTOSAR 发布版本对应关系（权威，见 AUTOSAR 各 release 的 schema 文件命名）：
 *  - 44 → AUTOSAR 4.3.1
 *  - 48 → R19-11（AUTOSAR 4.4.0）
 *  - 49 → R20-11（AUTOSAR 4.4.0）
 *  - 50 → R21-11（AUTOSAR 4.5.0）
 *  - 51 → R22-11（AUTOSAR 4.5.0）
 */

/** ARXML 默认命名空间（Classic AUTOSAR 4.x 全系列同用 r4.0） */
export const ARXML_NAMESPACE = 'http://autosar.org/schema/r4.0';

/** XML Schema Instance 命名空间（xsi:schemaLocation 用） */
export const ARXML_XSI_NAMESPACE = 'http://www.w3.org/2001/XMLSchema-instance';

/** 单个 schema 版本的注册信息 */
export interface AutosarSchemaVersionInfo {
  /** AUTOSAR 发布标签，如 R22-11 */
  release: string;
  /** 该版本对应的 schema 文件名，如 AUTOSAR_00051.xsd */
  schemaFile: string;
}

/**
 * 支持的 AUTOSAR schema 版本注册表（唯一事实来源）。
 * 44 为历史兼容（原导出默认 4.3.1），48–51 为 A4 目标版本区间。
 */
export const ARXML_SCHEMA_VERSIONS = {
  44: { release: 'AUTOSAR 4.3.1', schemaFile: 'AUTOSAR_00044.xsd' },
  48: { release: 'R19-11 (4.4.0)', schemaFile: 'AUTOSAR_00048.xsd' },
  49: { release: 'R20-11 (4.4.0)', schemaFile: 'AUTOSAR_00049.xsd' },
  50: { release: 'R21-11 (4.5.0)', schemaFile: 'AUTOSAR_00050.xsd' },
  51: { release: 'R22-11 (4.5.0)', schemaFile: 'AUTOSAR_00051.xsd' },
} as const satisfies Record<number, AutosarSchemaVersionInfo>;

/** 受支持的 AUTOSAR schema 版本号 */
export type AutosarSchemaVersion = keyof typeof ARXML_SCHEMA_VERSIONS;

/** A4 目标版本区间（导出对话框可选项，对应 R19-11 ~ R22-11） */
export const SUPPORTED_TARGET_VERSIONS: readonly AutosarSchemaVersion[] = [48, 49, 50, 51];

/** 默认目标版本：R22-11（最新） */
export const DEFAULT_SCHEMA_VERSION: AutosarSchemaVersion = 51;

/** 是否为受支持的 schema 版本（类型守卫） */
export function isSupportedSchemaVersion(v: number): v is AutosarSchemaVersion {
  return v in ARXML_SCHEMA_VERSIONS;
}

/** 断言版本受支持，否则抛出带支持列表的明确错误 */
export function assertSupportedSchemaVersion(v: number): AutosarSchemaVersion {
  if (!isSupportedSchemaVersion(v)) {
    const supported = Object.keys(ARXML_SCHEMA_VERSIONS).join(', ');
    throw new RangeError(
      `Unsupported AUTOSAR schema version: ${v}. Supported versions: ${supported}.`
    );
  }
  return v;
}

/** 版本对应的发布标签（如 R22-11 (4.5.0)） */
export function releaseLabelFor(version: AutosarSchemaVersion): string {
  return ARXML_SCHEMA_VERSIONS[version].release;
}

/** 版本对应的 schema 文件名（如 AUTOSAR_00051.xsd） */
export function schemaFileFor(version: AutosarSchemaVersion): string {
  return ARXML_SCHEMA_VERSIONS[version].schemaFile;
}

/**
 * 生成文档级 xsi:schemaLocation 值（cogu writer.py:499-505 对应物）。
 * 例：`http://autosar.org/schema/r4.0 AUTOSAR_00051.xsd`
 */
export function schemaLocationFor(
  version: AutosarSchemaVersion,
  namespace = ARXML_NAMESPACE
): string {
  return `${namespace} ${schemaFileFor(version)}`;
}

/** 导出对话框用选项列表（版本号 + 发布标签） */
export function targetVersionOptions(): Array<{ version: AutosarSchemaVersion; label: string }> {
  return SUPPORTED_TARGET_VERSIONS.map(v => ({ version: v, label: releaseLabelFor(v) }));
}
