/**
 * arxml-export/version-gates 测试：VERSION_GATES 登记表（A4-1）
 *
 * 覆盖：GATE-002（runnable 互斥区引用）48/49 <50 旧形态 vs 50/51 ≥50 新形态
 * （cogu writer.py:4428-4456 同源差异）、activeGatesFor、gateById、
 * variantOf 未登记/不适用返回 undefined、登记表快照。
 */

import { describe, expect, it } from 'vitest';

import {
  VERSION_GATES,
  activeGatesFor,
  gateById,
  gateSummaryTable,
  variantOf,
} from '../version-gates';

describe('VERSION_GATES 版本差异登记表', () => {
  it('登记表非空且 id 唯一', () => {
    expect(VERSION_GATES.length).toBeGreaterThan(0);
    const ids = VERSION_GATES.map(g => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(['GATE-001', 'GATE-002']));
  });

  it('GATE-001：schemaLocation 文件名随版本变化', () => {
    expect(variantOf('GATE-001', 48)).toBe('AUTOSAR_00048.xsd');
    expect(variantOf('GATE-001', 51)).toBe('AUTOSAR_00051.xsd');
  });

  it('GATE-002：<50 用旧元素名，≥50 用新元素名（cogu writer.py:4428-4456）', () => {
    // R21-11 之前（48=R19-11、49=R20-11）：…-EXCLUSIVE-AREA-REFS
    expect(variantOf('GATE-002', 44)).toBe(
      'CAN-ENTER-EXCLUSIVE-AREA-REFS/RUNS-INSIDE-EXCLUSIVE-AREA-REFS'
    );
    expect(variantOf('GATE-002', 48)).toBe(
      'CAN-ENTER-EXCLUSIVE-AREA-REFS/RUNS-INSIDE-EXCLUSIVE-AREA-REFS'
    );
    expect(variantOf('GATE-002', 49)).toBe(
      'CAN-ENTER-EXCLUSIVE-AREA-REFS/RUNS-INSIDE-EXCLUSIVE-AREA-REFS'
    );
    // R21-11 起（50、51）：CAN-ENTERS / RUNS-INSIDES
    expect(variantOf('GATE-002', 50)).toBe('CAN-ENTERS/RUNS-INSIDES');
    expect(variantOf('GATE-002', 51)).toBe('CAN-ENTERS/RUNS-INSIDES');
  });

  it('activeGatesFor：51 下两条差异均有效，超出版本区间返回空', () => {
    const at51 = activeGatesFor(51).map(g => g.id);
    expect(at51).toEqual(['GATE-001', 'GATE-002']);
    expect(activeGatesFor(43)).toEqual([]);
    expect(activeGatesFor(99)).toEqual([]);
  });

  it('gateById：未知 id 返回 undefined', () => {
    expect(gateById('GATE-999')).toBeUndefined();
    expect(gateById('GATE-001')).toBeDefined();
  });

  it('variantOf：未登记 gate 返回 undefined', () => {
    expect(variantOf('GATE-999', 51)).toBeUndefined();
  });

  it('登记表快照包含 id/summary/适用区间（文档生成用）', () => {
    const table = gateSummaryTable();
    expect(table[0]).toMatchObject({ id: 'GATE-001', appliesFrom: 44, appliesUntil: 51 });
    expect(table[1]).toMatchObject({ id: 'GATE-002', appliesFrom: 44, appliesUntil: 51 });
  });
});
