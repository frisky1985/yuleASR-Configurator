/**
 * ARXML 版本化导出测试（A4-1）
 *
 * 覆盖：
 *  - 默认目标版本 51=R22-11 → AUTOSAR_00051.xsd
 *  - 显式指定 48/49/50/51 → 对应 schemaLocation（GATE-001）
 *  - 非法版本抛出带支持列表的错误
 *  - 反向探测：导出 → detectArxmlSchemaVersion 还原版本（导入导出对称）
 *  - selectedModules 过滤与版本参数可同时使用
 *  - 历史兼容版本 44（AUTOSAR 4.3.1）仍可用
 */

import { describe, expect, it } from 'vitest';

import type { AutosarSchemaVersion } from '@yuletech/core/arxml-export';
import type { ConfigFile, ConfigModule } from '../../types/config';
import { detectArxmlSchemaVersion, generateArxml } from '../arxml-exporter';

function makeModule(name: string, layer: 'MCAL' | 'Service' | 'ECUAL'): ConfigModule {
  return {
    id: name,
    name,
    layer,
    version: '4.4.0',
    enabled: true,
    dependencies: [],
    createdAt: '',
    updatedAt: '',
    configStatus: 'configured' as const,
    parameters: [] as any[],
    containers: [] as any[],
  };
}

function simpleConfig(): ConfigFile {
  const can = makeModule('Can', 'MCAL');
  can.parameters = [
    { id: 'p1', name: 'canBaudrate', type: 'integer', value: 500000, defaultValue: 500000 },
  ];
  const mcu = makeModule('Mcu', 'MCAL');
  mcu.parameters = [
    { id: 'p3', name: 'mcuClockSpeed', type: 'integer', value: 120000000, defaultValue: 80000000 },
  ];
  return {
    id: 'test-1',
    name: 'TestConfig',
    description: '',
    createdAt: '',
    updatedAt: '',
    targetPlatform: 'S32K144',
    targetChip: 'S32K144',
    compiler: 'GCC',
    modules: [can, mcu],
  };
}

describe('ARXML 版本化导出（A4-1）', () => {
  it('默认目标版本为 51=R22-11 → AUTOSAR_00051.xsd', () => {
    const xml = generateArxml(simpleConfig());
    expect(xml).toContain('AUTOSAR_00051.xsd');
    expect(xml).toContain('xsi:schemaLocation="http://autosar.org/schema/r4.0 AUTOSAR_00051.xsd"');
  });

  it('显式指定 48/49/50/51 → 对应 schemaLocation（GATE-001）', () => {
    const cases: Array<[AutosarSchemaVersion, string]> = [
      [48, 'AUTOSAR_00048.xsd'],
      [49, 'AUTOSAR_00049.xsd'],
      [50, 'AUTOSAR_00050.xsd'],
      [51, 'AUTOSAR_00051.xsd'],
    ];
    for (const [version, xsd] of cases) {
      const xml = generateArxml(simpleConfig(), undefined, { schemaVersion: version });
      expect(xml).toContain(xsd);
    }
  });

  it('历史兼容版本 44（AUTOSAR 4.3.1）仍可导出', () => {
    const xml = generateArxml(simpleConfig(), undefined, { schemaVersion: 44 });
    expect(xml).toContain('AUTOSAR_00044.xsd');
  });

  it('非法版本抛出带支持列表的错误', () => {
    expect(() => generateArxml(simpleConfig(), undefined, { schemaVersion: 52 as never })).toThrow(
      /Unsupported AUTOSAR schema version: 52/
    );
    expect(() => generateArxml(simpleConfig(), undefined, { schemaVersion: 47 as never })).toThrow(
      /Supported versions: 44, 48, 49, 50, 51/
    );
  });

  it('反向探测：导出 → detectArxmlSchemaVersion 还原版本（导入导出对称）', () => {
    for (const v of [44, 48, 49, 50, 51] as const) {
      const xml = generateArxml(simpleConfig(), undefined, { schemaVersion: v });
      expect(detectArxmlSchemaVersion(xml)).toBe(v);
    }
  });

  it('selectedModules 过滤与版本参数可同时使用', () => {
    const xml = generateArxml(simpleConfig(), ['Mcu'], { schemaVersion: 50 });
    expect(xml).toContain('AUTOSAR_00050.xsd');
    expect(xml).toContain('<SHORT-NAME>Mcu</SHORT-NAME>');
    expect(xml).not.toContain('<SHORT-NAME>Can</SHORT-NAME>');
  });

  it('不同版本仅 schemaLocation 不同，模块内容一致', () => {
    const strip = (xml: string) => xml.replace(/AUTOSAR_\d+\.xsd/g, 'AUTOSAR_XXXXX.xsd');
    const xml48 = generateArxml(simpleConfig(), undefined, { schemaVersion: 48 });
    const xml51 = generateArxml(simpleConfig(), undefined, { schemaVersion: 51 });
    expect(strip(xml48)).toBe(strip(xml51));
  });
});
