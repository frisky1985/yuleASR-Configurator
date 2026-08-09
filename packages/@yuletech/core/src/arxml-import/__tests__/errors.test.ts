/**
 * R6 · 异常体系分类测试
 *
 * 覆盖：
 *  - 5 类异常继承关系与可捕获性（ParseError / DuplicateElementError / VersionError /
 *    AssignmentTypeError / InvalidReferenceError）
 *  - VersionError 兼容 RangeError（存量调用方按 RangeError 捕获零回归）
 *  - 导出路径接入：assertSupportedSchemaVersion 抛 VersionError
 *  - 导入路径接入：重复元素检测（Duplicate element 前缀）+ 严格入口按类重抛
 *  - classifyImportError 前缀 → 异常类映射
 */

import { describe, expect, it } from 'vitest';

import { importSwcArxml, importSwcArxmlStrict } from '../index';
import { serializeArxmlDocument } from '../../arxml-export/serializer';
import { assertSupportedSchemaVersion } from '../../arxml-export/versions';
import {
  ArxmlError,
  AssignmentTypeError,
  DuplicateElementError,
  InvalidReferenceError,
  ParseError,
  VersionError,
  classifyImportError,
  isArxmlError,
} from '../../arxml-errors';

// ============================================================================
// 异常类层次与可捕获性
// ============================================================================

describe('ARXML 异常体系 — 5 类异常', () => {
  it('5 类异常均可按类捕获（instanceof 分类）', () => {
    expect(new ParseError('x')).toBeInstanceOf(ParseError);
    expect(new DuplicateElementError('x')).toBeInstanceOf(DuplicateElementError);
    expect(new VersionError('x')).toBeInstanceOf(VersionError);
    expect(new AssignmentTypeError('x')).toBeInstanceOf(AssignmentTypeError);
    expect(new InvalidReferenceError('x')).toBeInstanceOf(InvalidReferenceError);
  });

  it('ArxmlError 是共同基类（VersionError 除外，兼容 RangeError）', () => {
    expect(new ParseError('x')).toBeInstanceOf(ArxmlError);
    expect(new DuplicateElementError('x')).toBeInstanceOf(ArxmlError);
    expect(new AssignmentTypeError('x')).toBeInstanceOf(ArxmlError);
    expect(new InvalidReferenceError('x')).toBeInstanceOf(ArxmlError);
    expect(new VersionError('x')).toBeInstanceOf(RangeError);
  });

  it('isArxmlError 覆盖全部 5 类', () => {
    expect(isArxmlError(new ParseError('x'))).toBe(true);
    expect(isArxmlError(new DuplicateElementError('x'))).toBe(true);
    expect(isArxmlError(new VersionError('x'))).toBe(true);
    expect(isArxmlError(new AssignmentTypeError('x'))).toBe(true);
    expect(isArxmlError(new InvalidReferenceError('x'))).toBe(true);
    expect(isArxmlError(new Error('plain'))).toBe(false);
  });

  it('异常 name 属性为类名（调试友好）', () => {
    expect(new ParseError('x').name).toBe('ParseError');
    expect(new VersionError('x').name).toBe('VersionError');
    expect(new InvalidReferenceError('x').name).toBe('InvalidReferenceError');
  });
});

// ============================================================================
// 导出路径接入：版本错误分类
// ============================================================================

describe('R6 导出接入 — 版本错误', () => {
  it('assertSupportedSchemaVersion 抛 VersionError（仍兼容 RangeError 捕获）', () => {
    try {
      assertSupportedSchemaVersion(52);
      expect.unreachable('should throw');
    } catch (err) {
      expect(err).toBeInstanceOf(VersionError);
      expect(err).toBeInstanceOf(RangeError); // 存量调用方零回归
      expect(err).toMatchObject({ message: expect.stringContaining('Unsupported AUTOSAR schema version: 52') });
    }
  });

  it('serializeArxmlDocument 非法版本经同一分类抛出', () => {
    expect(() => serializeArxmlDocument([], { schemaVersion: 52 as never })).toThrow(VersionError);
  });
});

// ============================================================================
// 导入路径接入：重复元素 + 严格入口按类重抛
// ============================================================================

describe('R6 导入接入 — 重复元素检测', () => {
  it('同一 SWC 内重复端口名 → Duplicate element 错误（第二个被跳过）', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>S</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>Swc</SHORT-NAME>
          <PORTS>
            <R-PORT-PROTOTYPE>
              <SHORT-NAME>Dup</SHORT-NAME>
              <REQUIRED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/I/IF</REQUIRED-INTERFACE-TREF>
            </R-PORT-PROTOTYPE>
            <P-PORT-PROTOTYPE>
              <SHORT-NAME>Dup</SHORT-NAME>
              <PROVIDED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/I/IF</PROVIDED-INTERFACE-TREF>
            </P-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project, report } = importSwcArxml(xml, 'dup.arxml');

    expect(report.errors).toEqual(['Duplicate element: Dup in SWC Swc ports']);
    // 第一个保留，重复的被跳过（不重复计数）
    expect(project.applicationComponents[0].ports).toHaveLength(1);
    expect(report.counts.ports).toBe(1);
  });

  it('同一接口内重复数据元素名 → Duplicate element 错误', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>I</SHORT-NAME>
      <ELEMENTS>
        <SENDER-RECEIVER-INTERFACE>
          <SHORT-NAME>IF</SHORT-NAME>
          <DATA-ELEMENTS>
            <DATA-ELEMENT-PROTOTYPE>
              <SHORT-NAME>E</SHORT-NAME>
            </DATA-ELEMENT-PROTOTYPE>
            <DATA-ELEMENT-PROTOTYPE>
              <SHORT-NAME>E</SHORT-NAME>
            </DATA-ELEMENT-PROTOTYPE>
          </DATA-ELEMENTS>
        </SENDER-RECEIVER-INTERFACE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'dup-de.arxml');

    expect(report.errors).toEqual(['Duplicate element: E in interface IF data elements']);
  });

  it('不同 SWC 内同名端口合法（不误报）', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>S</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>SwcA</SHORT-NAME>
          <PORTS>
            <R-PORT-PROTOTYPE><SHORT-NAME>Shared</SHORT-NAME></R-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>SwcB</SHORT-NAME>
          <PORTS>
            <R-PORT-PROTOTYPE><SHORT-NAME>Shared</SHORT-NAME></R-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'legal.arxml');

    expect(report.errors).toHaveLength(0);
  });
});

describe('R6 导入接入 — 严格入口按类重抛', () => {
  it('引用类型不符 → 抛 InvalidReferenceError', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-PRIMITIVE-DATA-TYPE>
          <SHORT-NAME>TypeX</SHORT-NAME>
          <CATEGORY>VALUE</CATEGORY>
        </APPLICATION-PRIMITIVE-DATA-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
    <AR-PACKAGE>
      <SHORT-NAME>S</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>Swc</SHORT-NAME>
          <PORTS>
            <R-PORT-PROTOTYPE>
              <SHORT-NAME>In</SHORT-NAME>
              <REQUIRED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/P/TypeX</REQUIRED-INTERFACE-TREF>
            </R-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    expect(() => importSwcArxmlStrict(xml, 'strict.arxml')).toThrow(InvalidReferenceError);
  });

  it('畸形 XML → 抛 ParseError', () => {
    expect(() => importSwcArxmlStrict('<AUTOSAR><AR-PACKAGES>', 'broken.arxml')).toThrow(ParseError);
  });

  it('重复元素 → 抛 DuplicateElementError', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>S</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>Swc</SHORT-NAME>
          <PORTS>
            <R-PORT-PROTOTYPE><SHORT-NAME>Dup</SHORT-NAME></R-PORT-PROTOTYPE>
            <P-PORT-PROTOTYPE><SHORT-NAME>Dup</SHORT-NAME></P-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    expect(() => importSwcArxmlStrict(xml, 'dup-strict.arxml')).toThrow(DuplicateElementError);
  });

  it('无硬错误时与容错版等价（不抛异常）', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>S</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>Swc</SHORT-NAME>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const result = importSwcArxmlStrict(xml, 'ok-strict.arxml');
    expect(result.project.applicationComponents).toHaveLength(1);
  });
});

// ============================================================================
// classifyImportError：report 化导入 → 按类映射
// ============================================================================

describe('classifyImportError — 错误前缀 → 异常类', () => {
  it('Invalid reference: → InvalidReferenceError', () => {
    expect(classifyImportError('Invalid reference: /P/X (port In): expected an interface')).toBeInstanceOf(
      InvalidReferenceError
    );
  });

  it('Parse error / Malformed XML / Missing AUTOSAR → ParseError', () => {
    expect(classifyImportError('Parse error: unexpected')).toBeInstanceOf(ParseError);
    expect(classifyImportError('Malformed XML: missing closing </AUTOSAR> tag')).toBeInstanceOf(ParseError);
    expect(classifyImportError('Missing AUTOSAR root element')).toBeInstanceOf(ParseError);
  });

  it('Duplicate element: → DuplicateElementError', () => {
    expect(classifyImportError('Duplicate element: X in SWC Y ports')).toBeInstanceOf(DuplicateElementError);
  });

  it('Unsupported schema version → VersionError', () => {
    expect(classifyImportError('Unsupported AUTOSAR schema version: 52')).toBeInstanceOf(VersionError);
  });

  it('未知前缀 → null（非分类错误）', () => {
    expect(classifyImportError('something else')).toBeNull();
  });
});
