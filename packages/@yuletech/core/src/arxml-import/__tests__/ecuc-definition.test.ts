/**
 * arxml-import ECUC 定义层导入测试（R8/E2）
 *
 * 覆盖：
 *  - 模块定义（ECUC-MODULE-DEF：SHORT-NAME / PARAMETER-DEFS / CONTAINER-DEFS / counts）
 *  - 参数定义族（NUMERICAL/TEXTUAL/BOOLEAN/ENUMERATION/REFERENCE + INTEGER/FLOAT/STRING 子类归一）
 *  - 枚举 LITERALS（ECUC-ENUMERATION-LITERAL-DEF 短名列表）
 *  - 容器定义递归（SUB-CONTAINERS + multiplicity）
 *  - 定义↔值关联（resolveEcucModuleDefs 按 DEFINITION-REF 短名回填 moduleDef）
 *  - 未处理元素告警（定义内未知子元素 → file(line): Unprocessed element <TAG>，不崩溃）
 *  - 重复模块定义（R6 惯例：reportDuplicate + 跳过）
 *
 * 注意：parseSwcArxml 直接返回 SwcArxmlProject（无 {project, report} 包装），
 * 故直接用 parsed.* 取值。E3 一致性校验不在本文件范围（见 ecuc-consistency.test.ts）。
 */

import { describe, expect, it } from 'vitest';

import { parseSwcArxml } from '../reader';

// ============================================================================
// 定义层 + 值层同文件夹具（E2 关联用；E3 夹具复用同一结构）
// ============================================================================

const definitionXml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>EcucDefs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF>
          <SHORT-NAME>Can</SHORT-NAME>
          <PARAMETER-DEFS>
            <ECUC-INTEGER-PARAM-DEF>
              <SHORT-NAME>CanMainFunctionPeriod</SHORT-NAME>
              <LOWER-MULTIPLICITY>0</LOWER-MULTIPLICITY>
              <UPPER-MULTIPLICITY>1</UPPER-MULTIPLICITY>
              <DEFAULT-VALUE>0.01</DEFAULT-VALUE>
            </ECUC-INTEGER-PARAM-DEF>
            <ECUC-FLOAT-PARAM-DEF>
              <SHORT-NAME>CanWakeupTimeout</SHORT-NAME>
            </ECUC-FLOAT-PARAM-DEF>
            <ECUC-STRING-PARAM-DEF>
              <SHORT-NAME>CanControllerMode</SHORT-NAME>
              <DEFAULT-VALUE>HW</DEFAULT-VALUE>
            </ECUC-STRING-PARAM-DEF>
            <ECUC-BOOLEAN-PARAM-DEF>
              <SHORT-NAME>CanDevErrorDetect</SHORT-NAME>
              <DEFAULT-VALUE>true</DEFAULT-VALUE>
            </ECUC-BOOLEAN-PARAM-DEF>
            <ECUC-ENUMERATION-PARAM-DEF>
              <SHORT-NAME>CanBaudRateConfig</SHORT-NAME>
              <LITERALS>
                <ECUC-ENUMERATION-LITERAL-DEF><SHORT-NAME>500K</SHORT-NAME></ECUC-ENUMERATION-LITERAL-DEF>
                <ECUC-ENUMERATION-LITERAL-DEF><SHORT-NAME>1M</SHORT-NAME></ECUC-ENUMERATION-LITERAL-DEF>
              </LITERALS>
            </ECUC-ENUMERATION-PARAM-DEF>
          </PARAMETER-DEFS>
          <CONTAINER-DEFS>
            <ECUC-CONTAINER-DEF>
              <SHORT-NAME>Can</SHORT-NAME>
              <PARAMETER-DEFS>
                <ECUC-INTEGER-PARAM-DEF>
                  <SHORT-NAME>CanBaudRate</SHORT-NAME>
                </ECUC-INTEGER-PARAM-DEF>
              </PARAMETER-DEFS>
              <SUB-CONTAINERS>
                <ECUC-CONTAINER-DEF>
                  <SHORT-NAME>CanController</SHORT-NAME>
                  <UPPER-MULTIPLICITY>1</UPPER-MULTIPLICITY>
                  <PARAMETER-DEFS>
                    <ECUC-INTEGER-PARAM-DEF>
                      <SHORT-NAME>CanControllerBaudRate</SHORT-NAME>
                    </ECUC-INTEGER-PARAM-DEF>
                  </PARAMETER-DEFS>
                </ECUC-CONTAINER-DEF>
              </SUB-CONTAINERS>
            </ECUC-CONTAINER-DEF>
          </CONTAINER-DEFS>
        </ECUC-MODULE-DEF>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

// ============================================================================
// 模块定义
// ============================================================================

describe('ECUC 定义层导入 — 模块定义', () => {
  it('解析 ECUC-MODULE-DEF：name + counts.ecucModuleDefs 递增，干净输入无告警', () => {
    const parsed = parseSwcArxml(definitionXml, 'defs.arxml');
    expect(parsed.ecucModuleDefs).toHaveLength(1);
    expect(parsed.ecucModuleDefs[0].name).toBe('Can');
    expect(parsed.report.counts.ecucModuleDefs).toBe(1);
    expect(parsed.report.errors).toHaveLength(0);
    expect(parsed.report.warnings).toHaveLength(0);
  });

  it('多模块定义依次收集', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>EcucDefs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF><SHORT-NAME>Can</SHORT-NAME></ECUC-MODULE-DEF>
        <ECUC-MODULE-DEF><SHORT-NAME>Mcu</SHORT-NAME></ECUC-MODULE-DEF>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const parsed = parseSwcArxml(xml, 'defs2.arxml');
    expect(parsed.ecucModuleDefs.map(d => d.name)).toEqual(['Can', 'Mcu']);
    expect(parsed.report.counts.ecucModuleDefs).toBe(2);
    expect(parsed.report.errors).toHaveLength(0);
  });
});

// ============================================================================
// 参数定义族
// ============================================================================

describe('ECUC 定义层导入 — 参数定义族', () => {
  const parsed = parseSwcArxml(definitionXml, 'defs.arxml');
  const def = parsed.ecucModuleDefs[0];
  const byName = Object.fromEntries(def.parameterDefs.map(p => [p.name, p]));

  it('NUMERICAL：ECUC-INTEGER-PARAM-DEF / ECUC-FLOAT-PARAM-DEF 归一 kind=NUMERICAL', () => {
    const period = byName['CanMainFunctionPeriod'];
    expect(period.kind).toBe('NUMERICAL');
    expect(period.lowerMultiplicity).toBe(0);
    expect(period.upperMultiplicity).toBe(1);
    expect(period.defaultValue).toBe('0.01');

    const timeout = byName['CanWakeupTimeout'];
    expect(timeout.kind).toBe('NUMERICAL');
    expect(timeout.upperMultiplicity).toBeUndefined(); // 未显式声明不隐式补值
  });

  it('TEXTUAL：ECUC-STRING-PARAM-DEF 归一 kind=TEXTUAL + DEFAULT-VALUE', () => {
    const mode = byName['CanControllerMode'];
    expect(mode.kind).toBe('TEXTUAL');
    expect(mode.defaultValue).toBe('HW');
  });

  it('BOOLEAN：kind=BOOLEAN + DEFAULT-VALUE', () => {
    const devErr = byName['CanDevErrorDetect'];
    expect(devErr.kind).toBe('BOOLEAN');
    expect(devErr.defaultValue).toBe('true');
  });

  it('ENUMERATION：kind=ENUMERATION + LITERALS 短名列表', () => {
    const baud = byName['CanBaudRateConfig'];
    expect(baud.kind).toBe('ENUMERATION');
    expect(baud.literals).toEqual(['500K', '1M']);
  });

  it('ECUC-REFERENCE-DEF → kind=REFERENCE', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>EcucDefs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF>
          <SHORT-NAME>Can</SHORT-NAME>
          <PARAMETER-DEFS>
            <ECUC-REFERENCE-DEF>
              <SHORT-NAME>CanHwFilterRef</SHORT-NAME>
            </ECUC-REFERENCE-DEF>
          </PARAMETER-DEFS>
        </ECUC-MODULE-DEF>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const p = parseSwcArxml(xml, 'refdef.arxml');
    expect(p.ecucModuleDefs[0].parameterDefs[0].kind).toBe('REFERENCE');
    expect(p.ecucModuleDefs[0].parameterDefs[0].name).toBe('CanHwFilterRef');
    expect(p.report.errors).toHaveLength(0);
  });
});

// ============================================================================
// 容器定义递归
// ============================================================================

describe('ECUC 定义层导入 — 容器定义递归', () => {
  const parsed = parseSwcArxml(definitionXml, 'defs.arxml');
  const def = parsed.ecucModuleDefs[0];

  it('CONTAINER-DEFS → ECUC-CONTAINER-DEF（含 multiplicity + 参数）', () => {
    expect(def.containerDefs).toHaveLength(1);
    const root = def.containerDefs[0];
    expect(root.name).toBe('Can');
    expect(root.parameterDefs).toHaveLength(1);
    expect(root.parameterDefs[0].name).toBe('CanBaudRate');
    expect(root.parameterDefs[0].kind).toBe('NUMERICAL');
    expect(root.subContainerDefs).toHaveLength(1);
  });

  it('SUB-CONTAINERS 递归：子容器定义 + 嵌套参数', () => {
    const sub = def.containerDefs[0].subContainerDefs[0];
    expect(sub.name).toBe('CanController');
    expect(sub.upperMultiplicity).toBe(1);
    expect(sub.parameterDefs).toHaveLength(1);
    expect(sub.parameterDefs[0].name).toBe('CanControllerBaudRate');
    expect(sub.subContainerDefs).toHaveLength(0);
  });
});

// ============================================================================
// 定义↔值关联
// ============================================================================

describe('ECUC 定义层导入 — 定义↔值关联', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>EcucDefs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF>
          <SHORT-NAME>Can</SHORT-NAME>
          <PARAMETER-DEFS>
            <ECUC-INTEGER-PARAM-DEF>
              <SHORT-NAME>CanMainFunctionPeriod</SHORT-NAME>
            </ECUC-INTEGER-PARAM-DEF>
          </PARAMETER-DEFS>
        </ECUC-MODULE-DEF>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Can/CanMainFunctionPeriod</DEFINITION-REF>
              <VALUE>10</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
          </PARAMETER-VALUES>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('按 moduleDefRef 短名回填 moduleDef（与定义层同对象）', () => {
    const parsed = parseSwcArxml(xml, 'linked.arxml');
    expect(parsed.ecucModuleDefs).toHaveLength(1);
    expect(parsed.ecucModules).toHaveLength(1);

    const module = parsed.ecucModules[0];
    expect(module.moduleDefRef).toBe('Can');
    expect(module.moduleDef).toBeDefined();
    expect(module.moduleDef).toBe(parsed.ecucModuleDefs[0]);
    expect(module.moduleDef!.name).toBe('Can');
    expect(module.moduleDef!.parameterDefs[0].name).toBe('CanMainFunctionPeriod');
  });

  it('定义缺失（无匹配 ECUC-MODULE-DEF）→ moduleDef 为 undefined，不报错（E3 才校验）', () => {
    const valueOnly = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Mcu</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Mcu/Mcu</DEFINITION-REF>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const parsed = parseSwcArxml(valueOnly, 'value-only.arxml');
    expect(parsed.ecucModules[0].moduleDef).toBeUndefined();
    expect(parsed.report.errors).toHaveLength(0);
  });
});

// ============================================================================
// 未处理元素告警（不崩溃）
// ============================================================================

describe('ECUC 定义层导入 — 未处理元素告警', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>EcucDefs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF>
          <SHORT-NAME>Can</SHORT-NAME>
          <PARAMETER-DEFS>
            <ECUC-INTEGER-PARAM-DEF>
              <SHORT-NAME>CanMainFunctionPeriod</SHORT-NAME>
              <MIN>0</MIN>
              <MAX>1000</MAX>
              <FUTURE-PARAM-DEF-PROP>placeholder</FUTURE-PARAM-DEF-PROP>
            </ECUC-INTEGER-PARAM-DEF>
          </PARAMETER-DEFS>
        </ECUC-MODULE-DEF>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('定义内未建模子元素（MIN/MAX/FUTURE）→ 告警不崩溃，定义仍导入', () => {
    const parsed = parseSwcArxml(xml, 'defwarn.arxml');

    expect(parsed.ecucModuleDefs).toHaveLength(1);
    expect(parsed.ecucModuleDefs[0].name).toBe('Can');
    expect(parsed.ecucModuleDefs[0].parameterDefs).toHaveLength(1);
    expect(parsed.report.errors).toHaveLength(0);

    const tags = parsed.report.warnings.map(w => w.tag);
    expect(tags).toContain('MIN');
    expect(tags).toContain('MAX');
    expect(tags).toContain('FUTURE-PARAM-DEF-PROP');

    const minWarn = parsed.report.warnings.find(w => w.tag === 'MIN');
    expect(minWarn).toBeDefined();
    if (minWarn) {
      expect(minWarn.line).not.toBeNull();
      expect(minWarn.message).toMatch(/^defwarn\.arxml\(\d+\): Unprocessed element <MIN>$/);
    }
  });
});

// ============================================================================
// 重复模块定义（R6 惯例）
// ============================================================================

describe('ECUC 定义层导入 — 重复模块定义', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>EcucDefs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF><SHORT-NAME>Can</SHORT-NAME></ECUC-MODULE-DEF>
        <ECUC-MODULE-DEF><SHORT-NAME>Can</SHORT-NAME></ECUC-MODULE-DEF>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

  it('第二个同名定义被跳过并报 Duplicate element', () => {
    const parsed = parseSwcArxml(xml, 'defdup.arxml');
    expect(parsed.ecucModuleDefs).toHaveLength(1);
    expect(parsed.report.counts.ecucModuleDefs).toBe(1);
    expect(parsed.report.errors).toEqual(['Duplicate element: Can in ECUC module defs']);
  });
});
