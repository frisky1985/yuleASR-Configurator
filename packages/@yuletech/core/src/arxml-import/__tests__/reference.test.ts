/**
 * C1 · 引用类型安全（R1）测试
 *
 * 覆盖：
 *  - REF_CONSTRAINTS 约束表内容（引用点 → 期望目标类别）
 *  - 正向：类型匹配的引用正常解析（短名写回，零错误）
 *  - 反向：类型不符即报错（interfaceRef 指向数据类型 / typeRef 指向接口 /
 *    baseTypeRef 指向 CompuMethod / compuMethodRef 指向接口）
 *  - 缺失引用容忍：目标不存在不报错（OEM ARXML 可引用包外元素）
 *  - 同名不同类型：INTERFACE 与 DATA_TYPE 同名时各归其类
 */

import { describe, expect, it } from 'vitest';

import { importSwcArxml } from '../index';
import { REF_CONSTRAINTS, REF_TARGET_KIND_LABELS } from '../reference';

// ============================================================================
// 约束表
// ============================================================================

describe('REF_CONSTRAINTS — 引用类型约束表', () => {
  it('interfaceRef 必须指向接口类（INTERFACE）', () => {
    expect(REF_CONSTRAINTS.interfaceRef).toBe('INTERFACE');
  });

  it('typeRef（TYPE-TREF）必须指向数据类型（DATA_TYPE）', () => {
    expect(REF_CONSTRAINTS.typeRef).toBe('DATA_TYPE');
  });

  it('baseTypeRef 必须指向基础类型（BASE_TYPE）', () => {
    expect(REF_CONSTRAINTS.baseTypeRef).toBe('BASE_TYPE');
  });

  it('compuMethodRef 必须指向计算方法（COMPU_METHOD）', () => {
    expect(REF_CONSTRAINTS.compuMethodRef).toBe('COMPU_METHOD');
  });

  it('所有类别都有可读标签（错误信息用）', () => {
    for (const kind of ['INTERFACE', 'DATA_TYPE', 'BASE_TYPE', 'COMPU_METHOD'] as const) {
      expect(REF_TARGET_KIND_LABELS[kind]).toBeTruthy();
    }
  });
});

// ============================================================================
// 正向：类型匹配
// ============================================================================

describe('C1 引用类型安全 — 类型匹配通过', () => {
  it('interfaceRef 指向接口、typeRef 指向数据类型、baseTypeRef 指向基础类型均零错误', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Types</SHORT-NAME>
      <ELEMENTS>
        <SW-BASE-TYPE>
          <SHORT-NAME>uint8</SHORT-NAME>
          <NATIVE-DECLARATION>unsigned char</NATIVE-DECLARATION>
        </SW-BASE-TYPE>
        <APPLICATION-PRIMITIVE-DATA-TYPE>
          <SHORT-NAME>SpeedType</SHORT-NAME>
          <CATEGORY>VALUE</CATEGORY>
          <SW-DATA-DEF-PROPS>
            <SW-DATA-DEF-PROPS-VARIANTS>
              <SW-DATA-DEF-PROPS-CONDITIONAL>
                <BASE-TYPE-REF DEST="SW-BASE-TYPE">/Types/uint8</BASE-TYPE-REF>
              </SW-DATA-DEF-PROPS-CONDITIONAL>
            </SW-DATA-DEF-PROPS-VARIANTS>
          </SW-DATA-DEF-PROPS>
        </APPLICATION-PRIMITIVE-DATA-TYPE>
        <SENDER-RECEIVER-INTERFACE>
          <SHORT-NAME>Speed_IF</SHORT-NAME>
          <DATA-ELEMENTS>
            <DATA-ELEMENT-PROTOTYPE>
              <SHORT-NAME>Speed</SHORT-NAME>
              <TYPE-TREF DEST="APPLICATION-PRIMITIVE-DATA-TYPE">/Types/SpeedType</TYPE-TREF>
            </DATA-ELEMENT-PROTOTYPE>
          </DATA-ELEMENTS>
        </SENDER-RECEIVER-INTERFACE>
      </ELEMENTS>
    </AR-PACKAGE>
    <AR-PACKAGE>
      <SHORT-NAME>Swc</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>SpeedSensor</SHORT-NAME>
          <PORTS>
            <P-PORT-PROTOTYPE>
              <SHORT-NAME>SpeedOut</SHORT-NAME>
              <PROVIDED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/Types/Speed_IF</PROVIDED-INTERFACE-TREF>
            </P-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project, report } = importSwcArxml(xml, 'ok.arxml');

    expect(report.errors).toHaveLength(0);
    // 短名写回：interfaceRef / typeRef / baseType
    expect(project.applicationComponents[0].ports[0].interfaceRef).toBe('Speed_IF');
    const iface = project.interfaces[0] as { dataElements: Array<{ typeRef: string }> };
    expect(iface.dataElements[0].typeRef).toBe('SpeedType');
    expect(project.applicationDataTypes[0].baseType).toBe('uint8');
  });

  it('interfaceRef 与 typeRef 指向同名元素时各归其类（同名不同类不误报）', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-PRIMITIVE-DATA-TYPE>
          <SHORT-NAME>Shared</SHORT-NAME>
          <CATEGORY>VALUE</CATEGORY>
        </APPLICATION-PRIMITIVE-DATA-TYPE>
        <SENDER-RECEIVER-INTERFACE>
          <SHORT-NAME>Shared</SHORT-NAME>
          <DATA-ELEMENTS>
            <DATA-ELEMENT-PROTOTYPE>
              <SHORT-NAME>E</SHORT-NAME>
              <TYPE-TREF DEST="APPLICATION-PRIMITIVE-DATA-TYPE">/P/Shared</TYPE-TREF>
            </DATA-ELEMENT-PROTOTYPE>
          </DATA-ELEMENTS>
        </SENDER-RECEIVER-INTERFACE>
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
              <REQUIRED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/P/Shared</REQUIRED-INTERFACE-TREF>
            </R-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project, report } = importSwcArxml(xml, 'shared.arxml');

    expect(report.errors).toHaveLength(0);
    // 端口 interfaceRef 解析到接口（同名数据类型不影响）
    expect(project.applicationComponents[0].ports[0].interfaceRef).toBe('Shared');
    // 数据元素 typeRef 解析到数据类型
    const iface = project.interfaces[0] as { dataElements: Array<{ typeRef: string }> };
    expect(iface.dataElements[0].typeRef).toBe('Shared');
  });

  it('缺失引用容忍：目标不存在不报错、保留原始引用', () => {
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
              <SHORT-NAME>In</SHORT-NAME>
              <REQUIRED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/OtherPkg/Missing_IF</REQUIRED-INTERFACE-TREF>
            </R-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project, report } = importSwcArxml(xml, 'missing.arxml');

    expect(report.errors).toHaveLength(0); // 缺失 ≠ 类型不符：容忍
    expect(project.applicationComponents[0].ports[0].interfaceRef).toBe('/OtherPkg/Missing_IF');
  });
});

// ============================================================================
// 反向：类型不符即报错
// ============================================================================

describe('C1 引用类型安全 — 类型不符即报错', () => {
  it('interfaceRef 指向数据类型 → Invalid reference 错误', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-PRIMITIVE-DATA-TYPE>
          <SHORT-NAME>NotAnIface</SHORT-NAME>
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
              <REQUIRED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/P/NotAnIface</REQUIRED-INTERFACE-TREF>
            </R-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'bad-iface.arxml');

    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]).toMatch(
      /^Invalid reference: \/P\/NotAnIface \(port In\): expected an interface/
    );
    expect(report.errors[0]).toContain("'NotAnIface' is a data type");
  });

  it('typeRef（TYPE-TREF）指向接口 → Invalid reference 错误', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <SENDER-RECEIVER-INTERFACE>
          <SHORT-NAME>IfaceNotType</SHORT-NAME>
          <DATA-ELEMENTS>
            <DATA-ELEMENT-PROTOTYPE>
              <SHORT-NAME>E</SHORT-NAME>
              <TYPE-TREF DEST="APPLICATION-PRIMITIVE-DATA-TYPE">/P/IfaceNotType</TYPE-TREF>
            </DATA-ELEMENT-PROTOTYPE>
          </DATA-ELEMENTS>
        </SENDER-RECEIVER-INTERFACE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'bad-typeref.arxml');

    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]).toMatch(
      /^Invalid reference: \/P\/IfaceNotType \(data element E\): expected a data type/
    );
    expect(report.errors[0]).toContain("'IfaceNotType' is an interface");
  });

  it('baseTypeRef 指向 CompuMethod → Invalid reference 错误', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <COMPU-METHOD>
          <SHORT-NAME>NotABase</SHORT-NAME>
          <CATEGORY>IDENTICAL</CATEGORY>
        </COMPU-METHOD>
        <APPLICATION-PRIMITIVE-DATA-TYPE>
          <SHORT-NAME>SpeedType</SHORT-NAME>
          <CATEGORY>VALUE</CATEGORY>
          <SW-DATA-DEF-PROPS>
            <SW-DATA-DEF-PROPS-VARIANTS>
              <SW-DATA-DEF-PROPS-CONDITIONAL>
                <BASE-TYPE-REF DEST="SW-BASE-TYPE">/P/NotABase</BASE-TYPE-REF>
              </SW-DATA-DEF-PROPS-CONDITIONAL>
            </SW-DATA-DEF-PROPS-VARIANTS>
          </SW-DATA-DEF-PROPS>
        </APPLICATION-PRIMITIVE-DATA-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'bad-baseref.arxml');

    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]).toMatch(
      /^Invalid reference: \/P\/NotABase \(data type SpeedType\): expected a base type/
    );
  });

  it('compuMethodRef 指向接口 → Invalid reference 错误', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <SENDER-RECEIVER-INTERFACE>
          <SHORT-NAME>IfaceNotCM</SHORT-NAME>
          <DATA-ELEMENTS>
            <DATA-ELEMENT-PROTOTYPE>
              <SHORT-NAME>E</SHORT-NAME>
            </DATA-ELEMENT-PROTOTYPE>
          </DATA-ELEMENTS>
        </SENDER-RECEIVER-INTERFACE>
        <APPLICATION-PRIMITIVE-DATA-TYPE>
          <SHORT-NAME>SpeedType</SHORT-NAME>
          <CATEGORY>VALUE</CATEGORY>
          <SW-DATA-DEF-PROPS>
            <SW-DATA-DEF-PROPS-VARIANTS>
              <SW-DATA-DEF-PROPS-CONDITIONAL>
                <COMPU-METHOD-REF DEST="COMPU-METHOD">/P/IfaceNotCM</COMPU-METHOD-REF>
              </SW-DATA-DEF-PROPS-CONDITIONAL>
            </SW-DATA-DEF-PROPS-VARIANTS>
          </SW-DATA-DEF-PROPS>
        </APPLICATION-PRIMITIVE-DATA-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'bad-cmref.arxml');

    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]).toMatch(
      /^Invalid reference: \/P\/IfaceNotCM \(data type SpeedType\): expected a CompuMethod/
    );
  });

  it('同一文件多处类型不符 → 全部报出（不短路）', () => {
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
            <P-PORT-PROTOTYPE>
              <SHORT-NAME>Out</SHORT-NAME>
              <PROVIDED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/P/TypeX</PROVIDED-INTERFACE-TREF>
            </P-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'multi-bad.arxml');

    expect(report.errors).toHaveLength(2);
    for (const err of report.errors) {
      expect(err).toMatch(
        /^Invalid reference: \/P\/TypeX \(port (In|Out)\): expected an interface/
      );
    }
  });
});
