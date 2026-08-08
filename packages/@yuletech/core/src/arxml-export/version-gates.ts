/**
 * VERSION_GATES — ARXML 版本差异点登记表（A4-1）
 *
 * 借鉴 cogu/autosar：版本差异用 `if self.schema_version < 50:` 门控元素名
 * （writer.py:4428-4456）。yuleASR 落地为**集中登记表**而非散落 if：
 * 每个版本差异点是一条 VersionGate，导出层通过 gate id 查询当前版本的
 * 输出形态，新增差异只需在此表追加一条记录。
 *
 * 约定：
 *  - id 前缀语义：GATE-xxx（顺序编号），便于日志/报告引用；
 *  - variantFor(version) 返回该版本应输出的形态标识（字符串），
 *    未覆盖的版本返回 undefined（此时由调用方按 appliesFrom/Until 判断是否适用）；
 *  - appliesFrom/appliesUntil 为闭区间（schema 版本号）。
 */

import { schemaFileFor, type AutosarSchemaVersion } from './versions';

/** 一条版本差异登记 */
export interface VersionGate {
  /** 差异点唯一 id（GATE-xxx） */
  id: string;
  /** 一句话摘要（CHANGELOG 对照表用） */
  summary: string;
  /** 详细描述（差异内容 + 出处） */
  description: string;
  /** 差异适用的最小 schema 版本（含） */
  appliesFrom: number;
  /** 差异适用的最大 schema 版本（含） */
  appliesUntil: number;
  /** 按版本返回输出形态；版本不在差异范围内返回 undefined */
  variantFor(version: number): string | undefined;
}

/**
 * 版本差异登记表（唯一事实来源）。
 *
 * GATE-001 schema-location-file
 *   文档级 schemaLocation 按目标版本指向不同 XSD 文件
 *   （cogu writer.py:499-505；导出侧"版本化"的根基）。
 *
 * GATE-002 swc-exclusive-area-refs-naming
 *   SWC runnable 的互斥区引用元素名随版本变化：
 *   schema < 50（R21-11 之前）：CAN-ENTER-EXCLUSIVE-AREA-REFS / RUNS-INSIDE-EXCLUSIVE-AREA-REFS
 *   schema ≥ 50（R21-11 起）  ：CAN-ENTERS / RUNS-INSIDES（条件引用）
 *   （cogu writer.py:4428-4456 同源差异，SWS_RTE 互斥区章节）。
 *
 * 已知稳定面（登记备忘，避免后人重复排查）：
 *   ECUC-MODULE-CONFIGURATION-VALUES / ECUC-CONTAINER-VALUE / PARAMETER-VALUES
 *   结构在 48–51 间无元素名差异（本导出器仅涉及 ECUC 值层 + SWC 层骨架）。
 */
export const VERSION_GATES: readonly VersionGate[] = [
  {
    id: 'GATE-001',
    summary: 'schemaLocation 指向 AUTOSAR_00048.xsd ~ AUTOSAR_00051.xsd',
    description:
      '文档级 xsi:schemaLocation 按目标 schema 版本生成对应 XSD 文件名（cogu writer.py:499-505）。',
    appliesFrom: 44,
    appliesUntil: 51,
    variantFor: version =>
      version >= 44 && version <= 51 ? schemaFileFor(version as AutosarSchemaVersion) : undefined,
  },
  {
    id: 'GATE-002',
    summary:
      'runnable 互斥区引用元素名：<50 用 …-EXCLUSIVE-AREA-REFS，≥50 用 CAN-ENTERS/RUNS-INSIDES',
    description:
      'SWC runnable 的互斥区引用：R21-11（schema 50）起 AUTOSAR 将 ' +
      'CAN-ENTER-EXCLUSIVE-AREA-REFS/RUNS-INSIDE-EXCLUSIVE-AREA-REFS 改名为 ' +
      'CAN-ENTERS/RUNS-INSIDES（cogu writer.py:4428-4456）。',
    appliesFrom: 44,
    appliesUntil: 51,
    variantFor: version =>
      version >= 44 && version <= 51
        ? version < 50
          ? 'CAN-ENTER-EXCLUSIVE-AREA-REFS/RUNS-INSIDE-EXCLUSIVE-AREA-REFS'
          : 'CAN-ENTERS/RUNS-INSIDES'
        : undefined,
  },
];

/** 按 id 查差异登记（未登记返回 undefined） */
export function gateById(id: string): VersionGate | undefined {
  return VERSION_GATES.find(g => g.id === id);
}

/** 指定版本下"有效"（落在适用区间内）的差异点列表 */
export function activeGatesFor(version: number): VersionGate[] {
  return VERSION_GATES.filter(g => version >= g.appliesFrom && version <= g.appliesUntil);
}

/** 查询某差异点在指定版本的输出形态（未登记/不适用返回 undefined） */
export function variantOf(gateId: string, version: number): string | undefined {
  const gate = gateById(gateId);
  return gate ? gate.variantFor(version) : undefined;
}

/** 登记表快照（文档/报告生成用）：id | summary | 适用区间 */
export function gateSummaryTable(): Array<{
  id: string;
  summary: string;
  appliesFrom: number;
  appliesUntil: number;
}> {
  return VERSION_GATES.map(g => ({
    id: g.id,
    summary: g.summary,
    appliesFrom: g.appliesFrom,
    appliesUntil: g.appliesUntil,
  }));
}
