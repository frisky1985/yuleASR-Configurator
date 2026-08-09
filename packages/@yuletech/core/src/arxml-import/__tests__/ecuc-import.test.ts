/**
 * arxml-import ECUC 值层导入测试（R8/E1）
 *
 * 覆盖：
 *  - 单模块：数值 + 文本 + 布尔参数、容器（definitionRef / moduleDefRef）
 *  - 多模块（counts.ecucModules 递增）
 *  - 嵌套容器（SUB-CONTAINERS 递归）
 *  - 未处理元素告警（file(line): Unprocessed element <TAG>，不崩溃）
 *  - SWC + ECUC 共存（同一文件两者都解析）
 *  - 重复模块名检测（R6 惯例）
 *  - 导出 → 导入闭环（serializeArxmlDocument → parseSwcArxml 结构还原）
 *
 * 注意：parseSwcArxml 直接返回 SwcArxmlProject（无 {project, report} 包装，
 * 那是 importSwcArxml 的 SwcImportResult 形态），故直接用 parsed.* 取值。
 */

import { describe, expect, it } from 'vitest';

import { serializeArxmlDocument } from '../../arxml-export/serializer';
import { importSwcArxml } from '../index';
import { parseSwcArxml, type EcucModuleConfigValue } from '../reader';

// ============================================================================
// 单模块：数值 + 文本 + 布尔参数 + 容器
// ============================================================================

describe('ECUC 值层导入 — 单模块', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Can</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Can/CanMainFunctionPeriod</DEFINITION-REF>
              <VALUE>10</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
            <ECUC-TEXTUAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/Can/CanControllerMode</DEFINITION-REF>
              <VALUE>HW</VALUE>
            </ECUC-TEXTUAL-PARAM-VALUE>
            <ECUC-BOOLEAN-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/Can/CanDevErrorDetect</DEFINITION-REF>
              <VALUE>true</VALUE>
            </ECUC-BOOLEAN-PARAM-VALUE>
          </PARAMETER-VALUES>
          <CONTAINERS>
            <ECUC-CONTAINER-VALUE>
              <SHORT-NAME>CanController</SHORT-NAME>
              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/Can/Can/CanController</DEFINITION-REF>
              <PARAMETER-VALUES>
                <ECUC-NUMERICAL-PARAM-VALUE>
                  <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Can/Can/CanController/CanControllerBaudRate</DEFINITION-REF>
                  <VALUE>500000</VALUE>
                </ECUC-NUMERICAL-PARAM-VALUE>
              </PARAMETER-VALUES>
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  const parsed = parseSwcArxml(xml, 'can.arxml');

  it('导入 1 个模块，模块级字段正确', () => {
    expect(parsed.ecucModules).toHaveLength(1);
    const m = parsed.ecucModules[0];
    expect(m.name).toBe('Can');
    expect(m.definitionRef).toBe('/4.4.0/Can/Can');
    expect(m.moduleDefRef).toBe('Can');
  });

  it('数值/文本/布尔参数值类型正确（与导出侧对称）', () => {
    const m = parsed.ecucModules[0];
    expect(m.parameters).toHaveLength(3);
    const byName = Object.fromEntries(m.parameters.map(p => [p.name, p]));

    const numeric = byName['CanMainFunctionPeriod'];
    expect(numeric.value).toBe(10);
    expect(typeof numeric.value).toBe('number');
    expect(numeric.definitionRef).toBe('/Can/CanMainFunctionPeriod');

    const textual = byName['CanControllerMode'];
    expect(textual.value).toBe('HW');
    expect(typeof textual.value).toBe('string');

    const bool = byName['CanDevErrorDetect'];
    expect(bool.value).toBe(true);
    expect(typeof bool.value).toBe('boolean');
  });

  it('容器导入：名称 + 定义引用 + 容器内参数', () => {
    const m = parsed.ecucModules[0];
    expect(m.containers).toHaveLength(1);
    const c = m.containers[0];
    expect(c.name).toBe('CanController');
    expect(c.definitionRef).toBe('/Can/Can/CanController');
    expect(c.containers).toHaveLength(0);
    expect(c.parameters).toHaveLength(1);
    expect(c.parameters[0].name).toBe('CanControllerBaudRate');
    expect(c.parameters[0].value).toBe(500000);
  });

  it('干净输入：无错误、无告警、counts.ecucModules=1', () => {
    expect(parsed.report.errors).toHaveLength(0);
    expect(parsed.report.warnings).toHaveLength(0);
    expect(parsed.report.counts.ecucModules).toBe(1);
  });
});

// ============================================================================
// 多模块
// ============================================================================

describe('ECUC 值层导入 — 多模块', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
        </ECUC-MODULE-CONFIGURATION-VALUES>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Mcu</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Mcu/Mcu</DEFINITION-REF>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Mcu/McuClockReferencePoint</DEFINITION-REF>
              <VALUE>16000000</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
          </PARAMETER-VALUES>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('导入 2 个模块，counts 递增', () => {
    const parsed = parseSwcArxml(xml, 'multi.arxml');
    expect(parsed.ecucModules).toHaveLength(2);
    expect(parsed.ecucModules.map(m => m.name)).toEqual(['Can', 'Mcu']);
    expect(parsed.ecucModules[1].parameters[0].value).toBe(16000000);
    expect(parsed.report.counts.ecucModules).toBe(2);
    expect(parsed.report.errors).toHaveLength(0);
  });
});

// ============================================================================
// 嵌套容器（SUB-CONTAINERS 递归）
// ============================================================================

describe('ECUC 值层导入 — 嵌套容器', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Nvm</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>NvM</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/NvM/NvM</DEFINITION-REF>
          <CONTAINERS>
            <ECUC-CONTAINER-VALUE>
              <SHORT-NAME>NvMBlockDescriptor</SHORT-NAME>
              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/NvM/NvM/NvMBlockDescriptor</DEFINITION-REF>
              <PARAMETER-VALUES>
                <ECUC-TEXTUAL-PARAM-VALUE>
                  <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/NvM/NvM/NvMBlockDescriptor/NvMBlockUseCrc</DEFINITION-REF>
                  <VALUE>CRC-32</VALUE>
                </ECUC-TEXTUAL-PARAM-VALUE>
              </PARAMETER-VALUES>
              <SUB-CONTAINERS>
                <ECUC-CONTAINER-VALUE>
                  <SHORT-NAME>NvMBlockRom</SHORT-NAME>
                  <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/NvM/NvM/NvMBlockDescriptor/NvMBlockRom</DEFINITION-REF>
                  <PARAMETER-VALUES>
                    <ECUC-BOOLEAN-PARAM-VALUE>
                      <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/NvM/NvM/NvMBlockDescriptor/NvMBlockRom/NvMBlockRomChecksum</DEFINITION-REF>
                      <VALUE>false</VALUE>
                    </ECUC-BOOLEAN-PARAM-VALUE>
                  </PARAMETER-VALUES>
                </ECUC-CONTAINER-VALUE>
              </SUB-CONTAINERS>
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('递归解析两层容器', () => {
    const parsed = parseSwcArxml(xml, 'nvm.arxml');
    expect(parsed.ecucModules).toHaveLength(1);
    const m = parsed.ecucModules[0];

    expect(m.containers).toHaveLength(1);
    const parent = m.containers[0];
    expect(parent.name).toBe('NvMBlockDescriptor');
    expect(parent.parameters[0].value).toBe('CRC-32');

    expect(parent.containers).toHaveLength(1);
    const child = parent.containers[0];
    expect(child.name).toBe('NvMBlockRom');
    expect(child.definitionRef).toBe('/NvM/NvM/NvMBlockDescriptor/NvMBlockRom');
    expect(child.parameters[0].name).toBe('NvMBlockRomChecksum');
    expect(child.parameters[0].value).toBe(false);
    expect(child.containers).toHaveLength(0);

    expect(parsed.report.errors).toHaveLength(0);
    expect(parsed.report.warnings).toHaveLength(0);
  });
});

// ============================================================================
// 未处理元素告警（不崩溃）
// ============================================================================

describe('ECUC 值层导入 — 未处理元素告警', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
          <FUTURE-ECUC-ELEMENT>placeholder</FUTURE-ECUC-ELEMENT>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Can/CanBaudrate</DEFINITION-REF>
              <VALUE>500000</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
            <ECUC-TEXTUAL-PARAM-VALUE>
              <VALUE>no-definition-ref</VALUE>
            </ECUC-TEXTUAL-PARAM-VALUE>
          </PARAMETER-VALUES>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('未知元素与无 DEFINITION-REF 参数 → 告警但不崩溃，模块仍导入', () => {
    const parsed = parseSwcArxml(xml, 'warn.arxml');

    // 模块本身成功导入（告警不崩溃）
    expect(parsed.ecucModules).toHaveLength(1);
    expect(parsed.ecucModules[0].name).toBe('Can');
    expect(parsed.ecucModules[0].parameters).toHaveLength(1); // 无 DEFINITION-REF 的被跳过
    expect(parsed.report.errors).toHaveLength(0);

    // 未知元素按 file(line): Unprocessed element <TAG> 告警
    const future = parsed.report.warnings.find(w => w.tag === 'FUTURE-ECUC-ELEMENT');
    expect(future).toBeDefined();
    if (future) {
      expect(future.line).not.toBeNull();
      expect(future.message).toMatch(
        /^warn\.arxml\(\d+\): Unprocessed element <FUTURE-ECUC-ELEMENT>$/
      );
    }

    // 无 DEFINITION-REF 的参数：其实际子元素 VALUE 未被消费 → 告警（缺失的
    // DEFINITION-REF 不是子节点，不入 ChildElementMap；告警即暴露畸形参数）
    const valueWarn = parsed.report.warnings.some(w => w.tag === 'VALUE');
    expect(valueWarn).toBe(true);
  });
});

// ============================================================================
// SWC + ECUC 共存（同一文件两者都解析）
// ============================================================================

describe('ECUC 值层导入 — SWC + ECUC 共存', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <APPLICATION-SW-COMPONENT-TYPE>
          <SHORT-NAME>DoorControl</SHORT-NAME>
          <PORTS/>
        </APPLICATION-SW-COMPONENT-TYPE>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('parseSwcArxml 同时产出 SWC 与 ECUC 模块', () => {
    const parsed = parseSwcArxml(xml, 'mixed.arxml');
    expect(parsed.applicationComponents).toHaveLength(1);
    expect(parsed.applicationComponents[0].name).toBe('DoorControl');
    expect(parsed.ecucModules).toHaveLength(1);
    expect(parsed.ecucModules[0].name).toBe('Can');
    expect(parsed.report.counts.swComponents).toBe(1);
    expect(parsed.report.counts.ecucModules).toBe(1);
    expect(parsed.report.errors).toHaveLength(0);
  });

  it('importSwcArxml 领域模型不含 ECUC，但 counts 报告 ecucModules', () => {
    const { project, report } = importSwcArxml(xml, 'mixed.arxml');
    expect(project.applicationComponents).toHaveLength(1);
    // SwcProjectConfig（types/swc.ts 领域模型）不承载 ECUC；完整 ECUC 数据走 parseSwcArxml
    expect(report.counts.ecucModules).toBe(1);
    expect(report.errors).toHaveLength(0);
  });
});

// ============================================================================
// 重复模块名（R6 惯例）
// ============================================================================

describe('ECUC 值层导入 — 重复模块名', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
        </ECUC-MODULE-CONFIGURATION-VALUES>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('第二个同名模块被跳过并报 Duplicate element', () => {
    const parsed = parseSwcArxml(xml, 'dup.arxml');
    expect(parsed.ecucModules).toHaveLength(1);
    expect(parsed.report.counts.ecucModules).toBe(1);
    expect(parsed.report.errors).toEqual(['Duplicate element: Can in ECUC modules']);
  });
});

// ============================================================================
// 导出 → 导入闭环（serializeArxmlDocument → parseSwcArxml）
// ============================================================================

describe('ECUC 值层导入 — 导出导入闭环', () => {
  const modules = [
    {
      name: 'Can',
      version: '4.4.0',
      parameters: [
        { name: 'CanMainFunctionPeriod', value: 0.01 },
        { name: 'CanDevErrorDetect', value: true },
        { name: 'CanVersionInfoApi', value: false },
        { name: 'CanControllerMode', value: 'HW' },
      ],
      containers: [
        {
          name: 'CanController',
          parameters: [{ name: 'CanControllerBaudRate', value: 500000 }],
          subContainers: [
            {
              name: 'CanFilter',
              parameters: [{ name: 'CanFilterId', value: 0 }],
            },
          ],
        },
      ],
    },
  ];

  it('导出的文档可完整还原为同构 EcucModuleConfigValue', () => {
    const xml = serializeArxmlDocument(modules);
    const parsed = parseSwcArxml(xml, 'roundtrip.arxml');

    expect(parsed.report.errors).toHaveLength(0);
    expect(parsed.report.warnings).toHaveLength(0);
    expect(parsed.ecucModules).toHaveLength(1);

    const m: EcucModuleConfigValue = parsed.ecucModules[0];
    expect(m.name).toBe('Can');
    expect(m.moduleDefRef).toBe('Can');
    expect(m.definitionRef).toBe('/4.4.0/Can/Can');

    // 参数：name/value 与导出输入一致（definitionRef = 导出侧 /name）
    expect(m.parameters).toEqual([
      { name: 'CanMainFunctionPeriod', definitionRef: '/CanMainFunctionPeriod', value: 0.01 },
      { name: 'CanDevErrorDetect', definitionRef: '/CanDevErrorDetect', value: true },
      { name: 'CanVersionInfoApi', definitionRef: '/CanVersionInfoApi', value: false },
      { name: 'CanControllerMode', definitionRef: '/CanControllerMode', value: 'HW' },
    ]);

    // 容器：name/parameters 递归还原（定义引用与导出侧一致：容器无前导 /，参数为 /name）
    expect(m.containers).toHaveLength(1);
    expect(m.containers[0].name).toBe('CanController');
    expect(m.containers[0].definitionRef).toBe('Can/CanController');
    expect(m.containers[0].parameters).toEqual([
      { name: 'CanControllerBaudRate', definitionRef: '/CanControllerBaudRate', value: 500000 },
    ]);
    expect(m.containers[0].containers).toHaveLength(1);
    expect(m.containers[0].containers[0].name).toBe('CanFilter');
    expect(m.containers[0].containers[0].definitionRef).toBe('Can/CanController/CanFilter');
    expect(m.containers[0].containers[0].parameters).toEqual([
      { name: 'CanFilterId', definitionRef: '/CanFilterId', value: 0 },
    ]);
  });
});
