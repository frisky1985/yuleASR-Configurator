/**
 * arxml-export/serializer 测试：最小导出框架（A4-1）
 *
 * 覆盖：默认版本文档骨架、按版本 schemaLocation（GATE-001）、
 * 互斥区引用元素名（GATE-002）、反向版本探测（导入导出对称）、
 * 非法版本拒绝、参数/容器序列化结构。
 */

import { describe, expect, it } from 'vitest';

import {
  detectSchemaVersion,
  exclusiveAreaRefsForVersion,
  serializeArxmlDocument,
  serializeRunnableExclusiveAreaRefs,
  type ArxmlExportModule,
} from '../serializer';
import { DEFAULT_SCHEMA_VERSION } from '../versions';

const sampleModules: ArxmlExportModule[] = [
  {
    name: 'Can',
    version: '4.4.0',
    parameters: [
      { name: 'CanDevErrorDetect', value: true },
      { name: 'CanBaudrate', value: 500000 },
      { name: 'CanVersionInfoApi', value: 'ENABLED' },
    ],
    containers: [
      {
        name: 'CanController',
        multiple: true,
        parameters: [{ name: 'CanControllerBaudRate', value: 500000 }],
        subContainers: [{ name: 'CanFilter', parameters: [{ name: 'CanFilterId', value: 0 }] }],
      },
    ],
  },
  { name: 'Mcu', parameters: [{ name: 'McuClockReferencePoint', value: 120000000 }] },
];

describe('serializeArxmlDocument 最小导出框架', () => {
  it('默认目标版本为 51：schemaLocation 指向 AUTOSAR_00051.xsd', () => {
    const xml = serializeArxmlDocument(sampleModules);
    expect(xml).toContain('AUTOSAR_00051.xsd');
    expect(xml).toContain(`xsi:schemaLocation="http://autosar.org/schema/r4.0 AUTOSAR_00051.xsd"`);
  });

  it('按版本输出 schemaLocation（GATE-001）', () => {
    expect(serializeArxmlDocument(sampleModules, { schemaVersion: 48 })).toContain(
      'AUTOSAR_00048.xsd'
    );
    expect(serializeArxmlDocument(sampleModules, { schemaVersion: 49 })).toContain(
      'AUTOSAR_00049.xsd'
    );
    expect(serializeArxmlDocument(sampleModules, { schemaVersion: 50 })).toContain(
      'AUTOSAR_00050.xsd'
    );
    expect(serializeArxmlDocument(sampleModules, { schemaVersion: 51 })).toContain(
      'AUTOSAR_00051.xsd'
    );
  });

  it('非法版本抛出 RangeError', () => {
    expect(() => serializeArxmlDocument(sampleModules, { schemaVersion: 52 as never })).toThrow(
      RangeError
    );
  });

  it('文档骨架：根元素/AR-PACKAGES/模块/参数/容器递归', () => {
    const xml = serializeArxmlDocument(sampleModules);
    expect(xml.startsWith('<?xml version="1.0"')).toBe(true);
    expect(xml).toContain('<AUTOSAR');
    expect(xml).toContain('<AR-PACKAGES>');
    expect(xml).toContain('<SHORT-NAME>Can</SHORT-NAME>');
    expect(xml).toContain('ECUC-MODULE-CONFIGURATION-VALUES');
    expect(xml).toContain('ECUC-NUMERICAL-PARAM-VALUE');
    expect(xml).toContain('ECUC-TEXTUAL-PARAM-VALUE');
    expect(xml).toContain('<ECUC-CONTAINER-VALUE>');
    expect(xml).toContain('<SUB-CONTAINERS>');
    expect(xml).toContain('<SHORT-NAME>CanFilter</SHORT-NAME>');
    expect(xml).toContain('</AUTOSAR>');
  });

  it('布尔参数输出 true/false 文本', () => {
    const xml = serializeArxmlDocument([
      {
        name: 'M',
        parameters: [
          { name: 'Flag', value: true },
          { name: 'Flag2', value: false },
        ],
      },
    ]);
    expect(xml).toContain('<VALUE>true</VALUE>');
    expect(xml).toContain('<VALUE>false</VALUE>');
  });

  it('反向探测：导出文档可探测回原版本（导入导出对称）', () => {
    for (const v of [44, 48, 49, 50, 51] as const) {
      const xml = serializeArxmlDocument(sampleModules, { schemaVersion: v });
      expect(detectSchemaVersion(xml)).toBe(v);
    }
  });

  it('无 schemaLocation 的文档探测返回 null', () => {
    expect(detectSchemaVersion('<AUTOSAR></AUTOSAR>')).toBeNull();
  });
});

describe('exclusiveAreaRefsForVersion / serializeRunnableExclusiveAreaRefs（GATE-002）', () => {
  it('<50 输出旧元素名，≥50 输出新元素名', () => {
    expect(exclusiveAreaRefsForVersion(44).canEnter).toBe('CAN-ENTER-EXCLUSIVE-AREA-REFS');
    expect(exclusiveAreaRefsForVersion(48).runsInside).toBe('RUNS-INSIDE-EXCLUSIVE-AREA-REFS');
    expect(exclusiveAreaRefsForVersion(49).canEnter).toBe('CAN-ENTER-EXCLUSIVE-AREA-REFS');
    expect(exclusiveAreaRefsForVersion(50).canEnter).toBe('CAN-ENTERS');
    expect(exclusiveAreaRefsForVersion(51).runsInside).toBe('RUNS-INSIDES');
  });

  it('默认版本下使用新元素名（≥50）', () => {
    const shape = exclusiveAreaRefsForVersion(DEFAULT_SCHEMA_VERSION);
    expect(shape.canEnter).toBe('CAN-ENTERS');
  });

  it('runnable 序列化片段按版本选择元素名', () => {
    const refs = ['ModeMgr/ExclusiveAreaA'];
    const old48 = serializeRunnableExclusiveAreaRefs('Runnable_A', refs, 48);
    expect(old48).toContain('<CAN-ENTER-EXCLUSIVE-AREA-REFS>');
    expect(old48).not.toContain('<CAN-ENTERS>');

    const new51 = serializeRunnableExclusiveAreaRefs('Runnable_A', refs, 51);
    expect(new51).toContain('<CAN-ENTERS>');
    expect(new51).not.toContain('CAN-ENTER-EXCLUSIVE-AREA-REFS');
    expect(new51).toContain('EXCLUSIVE-AREA-REF');
  });
});
