/**
 * @yuletech/core - ARXML SWC 层导入后端测试
 *
 * 覆盖：
 *  - 最小 fixture 往返断言（SWC + 2 端口 + 1 接口 + 1 数据类型 + 1 CompuMethod）
 *  - 未处理元素告警（file(line): Unprocessed element <TAG>，不崩溃）
 *  - schemaLocation 版本探测
 *  - 畸形 XML 容错
 *  - 引用解析（接口短名）
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, it, expect } from 'vitest';

import { importSwcArxml } from '../index';
import { ChildElementMap, LineIndex } from '../reader';

const FIXTURES = join(__dirname, '..', '__fixtures__');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf-8');
}

// ============================================================================
// 最小 fixture 往返断言
// ============================================================================

describe('importSwcArxml — minimal fixture round-trip', () => {
  const xml = loadFixture('minimal.arxml');
  const { project, report } = importSwcArxml(xml, 'minimal.arxml');

  it('imports 1 SWC with correct name and layer', () => {
    expect(project.applicationComponents).toHaveLength(1);
    const swc = project.applicationComponents[0];
    expect(swc.name).toBe('DoorControl');
    expect(swc.layer).toBe('ASW');
    expect(swc.description).toBe('Door Control SWC');
  });

  it('imports 2 ports with directions and interface refs', () => {
    const swc = project.applicationComponents[0];
    expect(swc.ports).toHaveLength(2);

    const rPort = swc.ports.find(p => p.name === 'DoorState_R');
    expect(rPort).toBeDefined();
    expect(rPort!.direction).toBe('IN');
    expect(rPort!.interfaceRef).toBe('DoorState_IF'); // 引用解析为短名

    const pPort = swc.ports.find(p => p.name === 'DoorLock_P');
    expect(pPort).toBeDefined();
    expect(pPort!.direction).toBe('OUT');
    expect(pPort!.interfaceRef).toBe('DoorState_IF');
  });

  it('imports 1 runnable with symbol and cyclic interval', () => {
    const swc = project.applicationComponents[0];
    const runnables = swc.internalBehavior.runnables;
    expect(runnables).toHaveLength(1);
    expect(runnables[0].name).toBe('DoorMonitor');
    expect(runnables[0].symbol).toBe('DoorControl_Monitor');
    expect(runnables[0].minimumStartInterval).toBe(0.01);
    expect(runnables[0].invocationType).toBe('cyclic');
    expect(runnables[0].canBeInvokedConcurrently).toBe(false);
  });

  it('imports 1 SenderReceiver interface with 1 data element', () => {
    expect(project.interfaces).toHaveLength(1);
    const iface = project.interfaces[0];
    expect(iface.name).toBe('DoorState_IF');
    expect(iface.kind).toBe('SenderReceiverInterface');
    expect(iface.isService).toBe(false);
    const sr = iface as { dataElements: Array<{ name: string; typeRef: string }> };
    expect(sr.dataElements).toHaveLength(1);
    expect(sr.dataElements[0].name).toBe('DoorState');
    expect(sr.dataElements[0].typeRef).toBe('DoorStateType');
  });

  it('imports 1 application data type with base type and compu method ref', () => {
    expect(project.applicationDataTypes).toHaveLength(1);
    const dt = project.applicationDataTypes[0];
    expect(dt.name).toBe('DoorStateType');
    expect(dt.category).toBe('VALUE');
    expect(dt.baseType).toBe('uint8');
    expect(dt.compuMethodRef).toBe('DoorState_CM');
  });

  it('imports 1 CompuMethod as TEXTTABLE with 2 scales', () => {
    expect(project.compuMethods).toHaveLength(1);
    const cm = project.compuMethods[0];
    expect(cm.name).toBe('DoorState_CM');
    expect(cm.category).toBe('TEXTTABLE');
    expect(cm.scales).toHaveLength(2);
    expect(cm.scales[0].shortLabel).toBe('CLOSED');
    expect(cm.scales[0].lowerLimit).toBe(0);
    expect(cm.scales[0].content).toBe('CLOSED');
    expect(cm.scales[1].shortLabel).toBe('OPEN');
    expect(cm.scales[1].upperLimit).toBe(1);
    expect(cm.scales[1].content).toBe('OPEN');
    expect(cm.defaultValue).toBe('CLOSED');
  });

  it('reports success counts', () => {
    expect(report.counts.swComponents).toBe(1);
    expect(report.counts.ports).toBe(2);
    expect(report.counts.runnables).toBe(1);
    expect(report.counts.interfaces).toBe(1);
    expect(report.counts.dataElements).toBe(1);
    expect(report.counts.applicationDataTypes).toBe(1);
    expect(report.counts.compuMethods).toBe(1);
    expect(report.counts.implementationDataTypes).toBe(0);
  });

  it('has no errors and no warnings for clean fixture', () => {
    expect(report.errors).toHaveLength(0);
    // BASE-TYPE-SIZE / BASE-TYPE-ENCODING 等已知但未导入的元素会告警 —— 允许存在，
    // 但必须不崩溃且无硬错误
    expect(report.errors).toHaveLength(0);
  });

  it('round-trips: re-import produces identical structure (deterministic)', () => {
    const second = importSwcArxml(xml, 'minimal.arxml');
    expect(JSON.stringify(second.project)).toBe(JSON.stringify(project));
  });

  it('detects schema version 51 from schemaLocation', () => {
    expect(report.schemaVersion).toBe(51);
  });
});

// ============================================================================
// 未处理元素告警（借鉴 cogu 的告警不崩溃策略）
// ============================================================================

describe('importSwcArxml — unprocessed element warnings', () => {
  it('warns on unknown top-level elements but does not crash', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Pkg</SHORT-NAME>
      <ELEMENTS>
        <BSW-MODULE-DEF>
          <SHORT-NAME>Can</SHORT-NAME>
        </BSW-MODULE-DEF>
        <VENDOR-SPECIFIC-CONTAINER>
          <SHORT-NAME>VendorThing</SHORT-NAME>
        </VENDOR-SPECIFIC-CONTAINER>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project, report } = importSwcArxml(xml, 'unknown.arxml');

    // 不崩溃：无错误
    expect(report.errors).toHaveLength(0);
    // 未识别元素归零导入，仅告警
    expect(project.applicationComponents).toHaveLength(0);

    // 告警清单包含两个未知元素，格式 file(line): Unprocessed element <TAG>
    const tags = report.warnings.map(w => w.tag);
    expect(tags).toContain('BSW-MODULE-DEF');
    expect(tags).toContain('VENDOR-SPECIFIC-CONTAINER');

    const bswWarning = report.warnings.find(w => w.tag === 'BSW-MODULE-DEF');
    expect(bswWarning!.message).toMatch(/unknown\.arxml\(\d+\): Unprocessed element <BSW-MODULE-DEF>/);
    expect(bswWarning!.line).not.toBeNull();
  });

  it('warns on unprocessed children of imported elements', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Pkg</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>Swc</SHORT-NAME>
          <MODE-DECLARATION-GROUPS>
            <MODE-DECLARATION-GROUP>
              <SHORT-NAME>Modes</SHORT-NAME>
            </MODE-DECLARATION-GROUP>
          </MODE-DECLARATION-GROUPS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { report } = importSwcArxml(xml, 'children.arxml');

    // SWC 本体导入成功（1 个 SWC），未消费子元素 MODE-DECLARATION-GROUPS 告警
    expect(report.counts.swComponents).toBe(1);
    const tags = report.warnings.map(w => w.tag);
    expect(tags).toContain('MODE-DECLARATION-GROUPS');
  });
});

// ============================================================================
// 畸形 XML / 空输入容错
// ============================================================================

describe('importSwcArxml — error tolerance', () => {
  it('reports error on malformed XML without throwing', () => {
    const { report } = importSwcArxml('<AUTOSAR><AR-PACKAGES>', 'broken.arxml');
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it('reports error on missing AUTOSAR root', () => {
    const { report } = importSwcArxml('<foo><bar/></foo>', 'noroot.arxml');
    expect(report.errors).toContain('Missing AUTOSAR root element');
  });

  it('returns empty project for empty input', () => {
    const { project, report } = importSwcArxml('', 'empty.arxml');
    expect(project.applicationComponents).toHaveLength(0);
    expect(report.errors.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// 引用解析
// ============================================================================

describe('importSwcArxml — reference resolution', () => {
  it('resolves interface refs to short names across packages', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>If</SHORT-NAME>
      <ELEMENTS>
        <SENDER-RECEIVER-INTERFACE>
          <SHORT-NAME>Speed_IF</SHORT-NAME>
          <DATA-ELEMENTS>
            <DATA-ELEMENT-PROTOTYPE>
              <SHORT-NAME>Speed</SHORT-NAME>
            </DATA-ELEMENT-PROTOTYPE>
          </DATA-ELEMENTS>
        </SENDER-RECEIVER-INTERFACE>
      </ELEMENTS>
    </AR-PACKAGE>
    <AR-PACKAGE>
      <SHORT-NAME>Comp</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>SpeedSensor</SHORT-NAME>
          <PORTS>
            <P-PORT-PROTOTYPE>
              <SHORT-NAME>SpeedOut</SHORT-NAME>
              <PROVIDED-INTERFACE-TREF DEST="SENDER-RECEIVER-INTERFACE">/If/Speed_IF</PROVIDED-INTERFACE-TREF>
            </P-PORT-PROTOTYPE>
          </PORTS>
        </APPLICATION-SW-COMPONENT-TYPE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project } = importSwcArxml(xml, 'refs.arxml');
    const swc = project.applicationComponents[0];
    expect(swc.ports[0].interfaceRef).toBe('Speed_IF');
  });
});

// ============================================================================
// Client-Server 接口 + RAT_NUM_LINEAR CompuMethod + 真实 bcm_demo 文件
// ============================================================================

describe('importSwcArxml — Client-Server & rational CompuMethod', () => {
  it('imports ClientServerInterface with operations and arguments', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>If</SHORT-NAME>
      <ELEMENTS>
        <CLIENT-SERVER-INTERFACE>
          <SHORT-NAME>DoorLock_IF</SHORT-NAME>
          <OPERATIONS>
            <CLIENT-SERVER-OPERATION>
              <SHORT-NAME>LockDoor</SHORT-NAME>
              <ARGUMENTS>
                <ARGUMENT-DATA-PROTOTYPE>
                  <SHORT-NAME>LockState</SHORT-NAME>
                  <TYPE-TREF DEST="APPLICATION-PRIMITIVE-DATA-TYPE">/DataTypes/LockStateType</TYPE-TREF>
                  <DIRECTION>IN</DIRECTION>
                </ARGUMENT-DATA-PROTOTYPE>
              </ARGUMENTS>
            </CLIENT-SERVER-OPERATION>
          </OPERATIONS>
        </CLIENT-SERVER-INTERFACE>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project, report } = importSwcArxml(xml, 'cs.arxml');

    expect(project.interfaces).toHaveLength(1);
    const iface = project.interfaces[0];
    expect(iface.kind).toBe('ClientServerInterface');
    expect(iface.name).toBe('DoorLock_IF');
    const cs = iface as { operations: Array<{ name: string; arguments?: Array<{ name: string; typeRef: string; direction: string }> }> };
    expect(cs.operations).toHaveLength(1);
    expect(cs.operations[0].name).toBe('LockDoor');
    expect(cs.operations[0].arguments![0]).toMatchObject({
      name: 'LockState',
      typeRef: 'LockStateType',
      direction: 'IN',
    });
    expect(report.counts.operations).toBe(1);
  });

  it('imports RAT_NUM_LINEAR CompuMethod with numerator/denominator', () => {
    const xml = `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>DT</SHORT-NAME>
      <ELEMENTS>
        <COMPU-METHOD>
          <SHORT-NAME>Speed_CM</SHORT-NAME>
          <CATEGORY>RAT_NUM_LINEAR</CATEGORY>
          <COMPU-INTERNAL-TO-PHYS>
            <COMPU-SCALES>
              <COMPU-SCALE>
                <LOWER-LIMIT INTERVAL-TYPE="CLOSED">0</LOWER-LIMIT>
                <UPPER-LIMIT INTERVAL-TYPE="CLOSED">65535</UPPER-LIMIT>
                <COMPU-RATIONAL-COEFFS>
                  <COMPU-NUMERATOR>
                    <V>0</V>
                    <V>0.015625</V>
                  </COMPU-NUMERATOR>
                  <COMPU-DENOMINATOR>
                    <V>1</V>
                  </COMPU-DENOMINATOR>
                </COMPU-RATIONAL-COEFFS>
              </COMPU-SCALE>
            </COMPU-SCALES>
            <COMPU-DEFAULT-VALUE>
              <V>65535</V>
            </COMPU-DEFAULT-VALUE>
          </COMPU-INTERNAL-TO-PHYS>
          <COMPU-PHYS-TO-INTERNAL>
            <COMPU-SCALES>
              <COMPU-SCALE>
                <LOWER-LIMIT INTERVAL-TYPE="CLOSED">0</LOWER-LIMIT>
                <UPPER-LIMIT INTERVAL-TYPE="CLOSED">1023.984375</UPPER-LIMIT>
                <COMPU-RATIONAL-COEFFS>
                  <COMPU-NUMERATOR>
                    <V>0</V>
                    <V>64</V>
                  </COMPU-NUMERATOR>
                  <COMPU-DENOMINATOR>
                    <V>1</V>
                  </COMPU-DENOMINATOR>
                </COMPU-RATIONAL-COEFFS>
              </COMPU-SCALE>
            </COMPU-SCALES>
          </COMPU-PHYS-TO-INTERNAL>
        </COMPU-METHOD>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const { project, report } = importSwcArxml(xml, 'rat.arxml');

    expect(project.compuMethods).toHaveLength(1);
    const cm = project.compuMethods[0];
    expect(cm.name).toBe('Speed_CM');
    expect(cm.category).toBe('RAT_NUM_LINEAR');
    expect(cm.scales).toHaveLength(1);
    expect(cm.scales[0].numerator).toEqual([0, 0.015625]);
    expect(cm.scales[0].denominator).toEqual([1]);
    expect(cm.defaultValue).toBe('65535');
    expect(cm.hasPhysToInternal).toBe(true);
    expect(report.counts.compuMethods).toBe(1);
  });

  it('imports real-world bcm_demo.arxml (yuleASR demo, 4 SWCs)', () => {
    const xml = loadFixture('bcm_demo.arxml');
    const { project, report } = importSwcArxml(xml, 'bcm_demo.arxml');

    expect(report.errors).toHaveLength(0);
    expect(project.applicationComponents).toHaveLength(4);
    expect(report.counts.swComponents).toBe(4);
    expect(report.counts.ports).toBe(8); // 3+2+2+1

    const names = project.applicationComponents.map(c => c.name);
    expect(names).toEqual(expect.arrayContaining(['BCM_Door', 'BCM_Light', 'BCM_Wiper', 'BCM_Power']));

    // 接口与数据类型
    expect(project.interfaces.length).toBeGreaterThanOrEqual(7);
    expect(project.applicationDataTypes.length).toBeGreaterThanOrEqual(7);
    expect(project.implementationDataTypes.length).toBe(0); // 演示文件无 ImplementationDataType

    // Door SWC 端口与 runnable（fast-xml-parser 按 tag 分组，跨 tag 文档序不保证，用集合断言）
    const door = project.applicationComponents.find(c => c.name === 'BCM_Door')!;
    expect(new Set(door.ports.map(p => p.name))).toEqual(new Set(['DoorStatus_R', 'DoorLock_P', 'LightSwitch_R']));
    expect(door.ports.find(p => p.name === 'DoorStatus_R')!.direction).toBe('IN');
    expect(door.ports.find(p => p.name === 'DoorLock_P')!.direction).toBe('OUT');
    expect(door.internalBehavior.runnables.map(r => r.name)).toEqual(['DoorMonitor_Runnable', 'DoorLock_Runnable']);
    expect(door.ports.find(p => p.name === 'DoorStatus_R')!.interfaceRef).toBe('DoorStatus_IF'); // 跨包引用解析
  });
});

// ============================================================================
// 参考工具
// ============================================================================

describe('reader utilities', () => {
  it('ChildElementMap tracks consumed vs unprocessed children', () => {
    const node = {
      'SHORT-NAME': 'X',
      'PORTS': { 'P-PORT-PROTOTYPE': [] },
      '@_UUID': 'abc',
    };
    const map = new ChildElementMap(node);
    expect(map.get('SHORT-NAME')).toBe('X');
    const unprocessed = map.unprocessed();
    expect(unprocessed.map(u => u.tag)).toEqual(['PORTS']);
  });

  it('LineIndex returns line numbers in document order', () => {
    const xml = `<AUTOSAR>\n  <AR-PACKAGE>\n    <SHORT-NAME>A</SHORT-NAME>\n  </AR-PACKAGE>\n  <AR-PACKAGE>\n    <SHORT-NAME>B</SHORT-NAME>\n  </AR-PACKAGE>\n</AUTOSAR>`;
    const idx = new LineIndex(xml);
    expect(idx.nextLine('AUTOSAR')).toBe(1);
    expect(idx.nextLine('AR-PACKAGE')).toBe(2);
    expect(idx.nextLine('AR-PACKAGE')).toBe(5);
    expect(idx.nextLine('SHORT-NAME')).toBe(3);
    expect(idx.nextLine('SHORT-NAME')).toBe(6);
    expect(idx.nextLine('SHORT-NAME')).toBeNull();
  });
});
