/**
 * arxml-export/versions 测试：schema 版本注册表（A4-1）
 *
 * 覆盖：48-51 映射（R19-11~R22-11）、默认版本、schemaLocation 生成、
 * 非法版本拒绝、导出选项列表。
 */

import { describe, expect, it } from 'vitest';

import {
  ARXML_NAMESPACE,
  DEFAULT_SCHEMA_VERSION,
  SUPPORTED_TARGET_VERSIONS,
  assertSupportedSchemaVersion,
  isSupportedSchemaVersion,
  releaseLabelFor,
  schemaFileFor,
  schemaLocationFor,
  targetVersionOptions,
} from '../versions';

describe('AUTOSAR schema 版本注册表', () => {
  it('48–51 映射到 R19-11 ~ R22-11 发布标签', () => {
    expect(releaseLabelFor(48)).toBe('R19-11 (4.4.0)');
    expect(releaseLabelFor(49)).toBe('R20-11 (4.4.0)');
    expect(releaseLabelFor(50)).toBe('R21-11 (4.5.0)');
    expect(releaseLabelFor(51)).toBe('R22-11 (4.5.0)');
  });

  it('schema 文件名按版本生成（cogu writer.py:499-505 对应物）', () => {
    expect(schemaFileFor(48)).toBe('AUTOSAR_00048.xsd');
    expect(schemaFileFor(49)).toBe('AUTOSAR_00049.xsd');
    expect(schemaFileFor(50)).toBe('AUTOSAR_00050.xsd');
    expect(schemaFileFor(51)).toBe('AUTOSAR_00051.xsd');
  });

  it('schemaLocation 为 "namespace 文件名" 格式', () => {
    expect(schemaLocationFor(51)).toBe(`${ARXML_NAMESPACE} AUTOSAR_00051.xsd`);
    expect(schemaLocationFor(48)).toBe(`${ARXML_NAMESPACE} AUTOSAR_00048.xsd`);
  });

  it('默认目标版本为最新 51 (R22-11)', () => {
    expect(DEFAULT_SCHEMA_VERSION).toBe(51);
    expect(SUPPORTED_TARGET_VERSIONS).toEqual([48, 49, 50, 51]);
  });

  it('44 作为历史兼容版本受支持', () => {
    expect(isSupportedSchemaVersion(44)).toBe(true);
    expect(releaseLabelFor(44)).toBe('AUTOSAR 4.3.1');
  });

  it('非法版本：类型守卫 false + 断言抛出带支持列表的错误', () => {
    expect(isSupportedSchemaVersion(52)).toBe(false);
    expect(isSupportedSchemaVersion(47)).toBe(false);
    expect(() => assertSupportedSchemaVersion(52)).toThrow(
      /Unsupported AUTOSAR schema version: 52/
    );
    expect(() => assertSupportedSchemaVersion(47)).toThrow(
      /Supported versions: 44, 48, 49, 50, 51/
    );
  });

  it('导出选项列表：48-51 各带发布标签', () => {
    const options = targetVersionOptions();
    expect(options).toEqual([
      { version: 48, label: 'R19-11 (4.4.0)' },
      { version: 49, label: 'R20-11 (4.4.0)' },
      { version: 50, label: 'R21-11 (4.5.0)' },
      { version: 51, label: 'R22-11 (4.5.0)' },
    ]);
  });
});
