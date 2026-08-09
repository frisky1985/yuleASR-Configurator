/**
 * arxml-export/validator 测试：结构契约校验（R7 · 导出即验证）
 *
 * 覆盖：合法导出通过 / 文档头缺失 / 命名空间缺失 / schemaLocation 缺失 /
 * 版本不一致 / ECUC 结构缺失 / 标签不平衡 / assertValidArxmlExport 抛 ParseError。
 */

import { describe, expect, it } from 'vitest';

import { serializeArxmlDocument, type ArxmlExportModule } from '../serializer';
import { assertValidArxmlExport, validateArxmlDocument } from '../validator';
import { ParseError } from '../../arxml-errors';

const sampleModules: ArxmlExportModule[] = [
  {
    name: 'Can',
    version: '4.4.0',
    parameters: [
      { name: 'CanDevErrorDetect', value: true },
      { name: 'CanBaudrate', value: 500000 },
    ],
    containers: [
      {
        name: 'CanController',
        multiple: true,
        parameters: [{ name: 'CanControllerBaudRate', value: 500000 }],
      },
    ],
  },
];

describe('validateArxmlDocument 结构契约校验', () => {
  it('合法导出通过校验（默认版本 51）', () => {
    const xml = serializeArxmlDocument(sampleModules);
    const result = validateArxmlDocument(xml);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('版本一致性校验：文档 51 期望 51 通过', () => {
    const xml = serializeArxmlDocument(sampleModules, { schemaVersion: 51 });
    expect(validateArxmlDocument(xml, { expectedSchemaVersion: 51 }).ok).toBe(true);
  });

  it('版本一致性校验：期望 48 与实际 51 不匹配报错', () => {
    const xml = serializeArxmlDocument(sampleModules, { schemaVersion: 51 });
    const result = validateArxmlDocument(xml, { expectedSchemaVersion: 48 });
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('版本不匹配'))).toBe(true);
  });

  it('48 版本导出通过校验（GATE-001 各版本 schemaLocation 合法）', () => {
    for (const v of [48, 49, 50, 51] as const) {
      const xml = serializeArxmlDocument(sampleModules, { schemaVersion: v });
      const result = validateArxmlDocument(xml, { expectedSchemaVersion: v });
      expect(result.ok, `version ${v}: ${result.errors.join('; ')}`).toBe(true);
    }
  });

  it('缺少 XML 声明报错', () => {
    const xml = serializeArxmlDocument(sampleModules).replace(/^<\?xml[^>]*\?>\n?/, '');
    const result = validateArxmlDocument(xml);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('XML 声明'))).toBe(true);
  });

  it('缺少命名空间报错', () => {
    const xml = serializeArxmlDocument(sampleModules).replace(
      'xmlns="http://autosar.org/schema/r4.0"',
      ''
    );
    const result = validateArxmlDocument(xml);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('命名空间'))).toBe(true);
  });

  it('缺少 schemaLocation 报错', () => {
    const xml = serializeArxmlDocument(sampleModules).replace(/ xsi:schemaLocation="[^"]*"/, '');
    const result = validateArxmlDocument(xml);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('schemaLocation'))).toBe(true);
  });

  it('缺少 ECUC 结构报错', () => {
    const xml = serializeArxmlDocument(sampleModules).replace(
      '<ECUC-MODULE-CONFIGURATION-VALUES>',
      '<UNKNOWN-ELEMENT>'
    );
    const result = validateArxmlDocument(xml);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('必需结构元素'))).toBe(true);
  });

  it('标签不平衡报错（截断尾部）', () => {
    const xml = serializeArxmlDocument(sampleModules).slice(0, -30);
    const result = validateArxmlDocument(xml);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes('标签配对不平衡'))).toBe(true);
  });

  it('assertValidArxmlExport：合法导出返回 ok', () => {
    const xml = serializeArxmlDocument(sampleModules);
    expect(assertValidArxmlExport(xml).ok).toBe(true);
  });

  it('assertValidArxmlExport：非法导出抛 ParseError（R6 分类）', () => {
    const xml = serializeArxmlDocument(sampleModules).replace(/^<\?xml[^>]*\?>\n?/, '');
    expect(() => assertValidArxmlExport(xml)).toThrow(ParseError);
  });
});
