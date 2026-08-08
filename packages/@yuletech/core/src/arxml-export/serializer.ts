/**
 * ARXML 最小导出框架（A4-1）
 *
 * 模型无关的模型→ARXML 序列化骨架：
 *  - 文档级参数化：目标 schema 版本 → schemaLocation（GATE-001）、
 *    元素形态（GATE-002 经 exclusiveAreaRefsForVersion 输出）；
 *  - 覆盖 ECUC 值层（ECUC-MODULE-CONFIGURATION-VALUES / PARAMETER-VALUES /
 *    ECUC-CONTAINER-VALUE 递归）——与 apps/yuleasr-web 完整导出器同构，
 *    供导出层复用或逐步接管；
 *  - 反向探测 detectSchemaVersion：与 arxml-import/reader.ts:563-567
 *    同一正则，导入导出对称（cogu reader.py:589-600）。
 */

import {
  ARXML_NAMESPACE,
  ARXML_XSI_NAMESPACE,
  assertSupportedSchemaVersion,
  schemaLocationFor,
  type AutosarSchemaVersion,
} from './versions';
import { variantOf } from './version-gates';

/** 导出参数值（数值/布尔按 ECUC-NUMERICAL-PARAM-VALUE，其余按文本值） */
export interface ArxmlExportParameter {
  name: string;
  value: string | number | boolean;
}

/** 导出容器（可递归嵌套） */
export interface ArxmlExportContainer {
  name: string;
  parameters?: ArxmlExportParameter[];
  subContainers?: ArxmlExportContainer[];
  multiple?: boolean;
}

/** 导出模块（ECUC 层） */
export interface ArxmlExportModule {
  name: string;
  /** 模块定义版本（写入 DEFINITION-REF 前缀，缺省 4.4.0） */
  version?: string;
  parameters?: ArxmlExportParameter[];
  containers?: ArxmlExportContainer[];
}

/** 导出选项 */
export interface ArxmlExportOptions {
  /** 目标 AUTOSAR schema 版本（48/49/50/51，默认 51=R22-11） */
  schemaVersion?: AutosarSchemaVersion;
  /** AR-PACKAGE 短名（默认 yuleASR） */
  packageName?: string;
  /** 是否输出 IMPLEMENTATION-CONFIG-VARIANT（默认 true） */
  includeImplementationConfigVariant?: boolean;
}

/** 参数 DEST 属性（按值类型选择） */
function paramDest(p: ArxmlExportParameter): string {
  switch (typeof p.value) {
    case 'boolean':
      return 'ECUC-BOOLEAN-PARAM-DEF';
    case 'number':
      return Number.isInteger(p.value) ? 'ECUC-INTEGER-PARAM-DEF' : 'ECUC-FLOAT-PARAM-DEF';
    default:
      return 'ECUC-STRING-PARAM-DEF';
  }
}

/** 参数值元素名（数值/布尔 → ECUC-NUMERICAL-PARAM-VALUE，其余 → 文本值） */
function paramValueTag(p: ArxmlExportParameter): string {
  return typeof p.value === 'string' ? 'ECUC-TEXTUAL-PARAM-VALUE' : 'ECUC-NUMERICAL-PARAM-VALUE';
}

function xmlEncode(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatValue(p: ArxmlExportParameter): string {
  if (typeof p.value === 'boolean') return p.value ? 'true' : 'false';
  return xmlEncode(String(p.value));
}

/** 单个参数值元素 */
function serializeParam(p: ArxmlExportParameter, indent: string): string {
  const dest = paramDest(p);
  const tag = paramValueTag(p);
  return [
    `${indent}<${tag}>`,
    `${indent}  <DEFINITION-REF DEST="${dest}">/${xmlEncode(p.name)}</DEFINITION-REF>`,
    `${indent}  <VALUE>${formatValue(p)}</VALUE>`,
    `${indent}</${tag}>`,
  ].join('\n');
}

/** 容器递归序列化（SUB-CONTAINERS / PARAMETER-VALUES） */
function serializeContainer(c: ArxmlExportContainer, baseRef: string, indent: string): string {
  const ref = `${baseRef}/${c.name}`;
  const lines = [
    `${indent}<ECUC-CONTAINER-VALUE>`,
    `${indent}  <SHORT-NAME>${xmlEncode(c.name)}</SHORT-NAME>`,
    `${indent}  <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">${xmlEncode(ref)}</DEFINITION-REF>`,
  ];
  if (c.parameters && c.parameters.length > 0) {
    lines.push(`${indent}  <PARAMETER-VALUES>`);
    for (const p of c.parameters) lines.push(serializeParam(p, `${indent}    `));
    lines.push(`${indent}  </PARAMETER-VALUES>`);
  }
  if (c.subContainers && c.subContainers.length > 0) {
    lines.push(`${indent}  <SUB-CONTAINERS>`);
    for (const sub of c.subContainers) lines.push(serializeContainer(sub, ref, `${indent}    `));
    lines.push(`${indent}  </SUB-CONTAINERS>`);
  }
  lines.push(`${indent}</ECUC-CONTAINER-VALUE>`);
  return lines.join('\n');
}

/** 模块序列化（ECUC-MODULE-CONFIGURATION-VALUES） */
function serializeModule(m: ArxmlExportModule, indent: string): string {
  const modRef = `/${m.version ?? '4.4.0'}/${m.name}/${m.name}`;
  const lines = [
    `${indent}<AR-PACKAGE>`,
    `${indent}  <SHORT-NAME>${xmlEncode(m.name)}</SHORT-NAME>`,
    `${indent}  <ELEMENTS>`,
    `${indent}    <ECUC-MODULE-CONFIGURATION-VALUES>`,
    `${indent}      <SHORT-NAME>${xmlEncode(m.name)}</SHORT-NAME>`,
    `${indent}      <DEFINITION-REF DEST="ECUC-MODULE-DEF">${xmlEncode(modRef)}</DEFINITION-REF>`,
  ];
  if (m.parameters && m.parameters.length > 0) {
    lines.push(`${indent}      <PARAMETER-VALUES>`);
    for (const p of m.parameters) lines.push(serializeParam(p, `${indent}        `));
    lines.push(`${indent}      </PARAMETER-VALUES>`);
  }
  if (m.containers && m.containers.length > 0) {
    lines.push(`${indent}      <CONTAINERS>`);
    for (const c of m.containers) lines.push(serializeContainer(c, m.name, `${indent}        `));
    lines.push(`${indent}      </CONTAINERS>`);
  }
  lines.push(
    `${indent}    </ECUC-MODULE-CONFIGURATION-VALUES>`,
    `${indent}  </ELEMENTS>`,
    `${indent}</AR-PACKAGE>`
  );
  return lines.join('\n');
}

/**
 * 序列化完整 ARXML 文档（ECUC 值层最小骨架）。
 * schemaVersion 决定文档级 schemaLocation（GATE-001）。
 */
export function serializeArxmlDocument(
  modules: ArxmlExportModule[],
  options: ArxmlExportOptions = {}
): string {
  const version = assertSupportedSchemaVersion(options.schemaVersion ?? 51);
  const packageName = options.packageName ?? 'yuleASR';
  const lines = [
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
    `<AUTOSAR xmlns="${ARXML_NAMESPACE}" xmlns:xsi="${ARXML_XSI_NAMESPACE}" xsi:schemaLocation="${schemaLocationFor(version)}">`,
    '  <AR-PACKAGES>',
    `    <AR-PACKAGE>`,
    `      <SHORT-NAME>${xmlEncode(packageName)}</SHORT-NAME>`,
    `      <ELEMENTS>`,
  ];
  for (const m of modules) {
    lines.push(serializeModule(m, '        '));
  }
  lines.push('      </ELEMENTS>', '    </AR-PACKAGE>', '  </AR-PACKAGES>', '</AUTOSAR>', '');
  return lines.join('\n');
}

/** SWC runnable 互斥区引用的输出形态（GATE-002） */
export interface ExclusiveAreaRefsShape {
  /** 进入互斥区元素名 */
  canEnter: string;
  /** 互斥区内运行元素名 */
  runsInside: string;
}

/**
 * 按目标版本返回 runnable 互斥区引用元素名（GATE-002）。
 * schema < 50 → CAN-ENTER-EXCLUSIVE-AREA-REFS / RUNS-INSIDE-EXCLUSIVE-AREA-REFS
 * schema ≥ 50 → CAN-ENTERS / RUNS-INSIDES
 */
export function exclusiveAreaRefsForVersion(version: number): ExclusiveAreaRefsShape {
  const variant = variantOf('GATE-002', version);
  if (variant === 'CAN-ENTERS/RUNS-INSIDES')
    return { canEnter: 'CAN-ENTERS', runsInside: 'RUNS-INSIDES' };
  return {
    canEnter: 'CAN-ENTER-EXCLUSIVE-AREA-REFS',
    runsInside: 'RUNS-INSIDE-EXCLUSIVE-AREA-REFS',
  };
}

/** SWC runnable 互斥区引用序列化（SWC 层骨架片段） */
export function serializeRunnableExclusiveAreaRefs(
  runnableName: string,
  exclusiveAreaRefs: string[],
  version: number
): string {
  const shape = exclusiveAreaRefsForVersion(version);
  const indent = '    ';
  const lines = [
    `${indent}<RUNNABLE-ENTITY>`,
    `${indent}  <SHORT-NAME>${xmlEncode(runnableName)}</SHORT-NAME>`,
    `${indent}  <${shape.canEnter}>`,
  ];
  for (const ref of exclusiveAreaRefs) {
    lines.push(
      `${indent}    <EXCLUSIVE-AREA-REF DEST="EXCLUSIVE-AREA">/${xmlEncode(ref)}</EXCLUSIVE-AREA-REF>`
    );
  }
  lines.push(`${indent}  </${shape.canEnter}>`, `${indent}</RUNNABLE-ENTITY>`);
  return lines.join('\n');
}

/** 反向探测：从文档 schemaLocation 提取 schema 版本号（导入导出对称，cogu reader.py:589-600） */
const SCHEMA_VERSION_RE = /AUTOSAR_(\d+)\.xsd/;

export function detectSchemaVersion(xml: string): number | null {
  const match = SCHEMA_VERSION_RE.exec(xml);
  return match ? Number(match[1]) : null;
}
