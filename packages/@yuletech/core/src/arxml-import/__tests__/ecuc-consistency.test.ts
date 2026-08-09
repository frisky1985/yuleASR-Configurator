/**
 * arxml-import ECUC 值-定义一致性校验测试（R8/E3）
 *
 * 覆盖：
 *  - 匹配：值层与定义层一致 → 无错误无告警
 *  - 类型不匹配（数值定义 vs 文本值）→ Assignment type mismatch 错误
 *  - 枚举非法（值 ∉ LITERALS）→ Assignment type mismatch 错误
 *  - 定义缺失（参数/容器/模块 DEFINITION-REF 找不到）→ Invalid reference 错误
 *  - 容器超限（UPPER-MULTIPLICITY 实例数超限）→ warning 级
 *  - 纯值层文件（无 ECUC-MODULE-DEF）→ 跳过校验（存量零回归关键）
 *  - 模块定义缺失 → 单条错误 + 不级联
 *  - strict 入口按类重抛（AssignmentTypeError / InvalidReferenceError）
 *  - classifyImportError 新前缀映射
 */

import { describe, expect, it } from 'vitest';

import {
  AssignmentTypeError,
  InvalidReferenceError,
  classifyImportError,
} from '../../arxml-errors';
import { importSwcArxml, importSwcArxmlStrict } from '../index';
import { parseSwcArxml } from '../reader';

// ============================================================================
// 夹具：Can 定义层 + 值层（一致输入）
// ============================================================================

const consistentXml = `<?xml version="1.0" encoding="UTF-8"?>
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
              <UPPER-MULTIPLICITY>1</UPPER-MULTIPLICITY>
            </ECUC-INTEGER-PARAM-DEF>
            <ECUC-STRING-PARAM-DEF>
              <SHORT-NAME>CanControllerMode</SHORT-NAME>
            </ECUC-STRING-PARAM-DEF>
            <ECUC-BOOLEAN-PARAM-DEF>
              <SHORT-NAME>CanDevErrorDetect</SHORT-NAME>
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
            <ECUC-TEXTUAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/Can/CanBaudRateConfig</DEFINITION-REF>
              <VALUE>1M</VALUE>
            </ECUC-TEXTUAL-PARAM-VALUE>
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

// ============================================================================
// 匹配：值层与定义层一致
// ============================================================================

describe('ECUC 一致性校验 — 匹配', () => {
  it('类型/枚举/容器全部合规 → 无错误无告警', () => {
    const parsed = parseSwcArxml(consistentXml, 'consistent.arxml');
    expect(parsed.report.errors).toHaveLength(0);
    expect(parsed.report.warnings).toHaveLength(0);

    // 模块定义已关联（校验入口依赖 E2 回填）
    expect(parsed.ecucModules[0].moduleDef).toBeDefined();
  });
});

// ============================================================================
// 类型不匹配
// ============================================================================

describe('ECUC 一致性校验 — 类型不匹配', () => {
  it('文本定义（STRING-PARAM-DEF）配数值值 → Assignment type mismatch', () => {
    const xml = consistentXml.replace('<VALUE>HW</VALUE>', '<VALUE>10</VALUE>').replace(
      '<ECUC-TEXTUAL-PARAM-VALUE>',
      '<ECUC-NUMERICAL-PARAM-VALUE>'
    );
    const parsed = parseSwcArxml(xml, 'mismatch.arxml');

    expect(parsed.report.errors).toHaveLength(1);
    expect(parsed.report.errors[0]).toMatch(/^Assignment type mismatch: \/Can\/CanControllerMode/);
    expect(parsed.report.errors[0]).toContain('expected a textual value, got 10 (number)');
  });

  it('数值定义（INTEGER-PARAM-DEF）配布尔值 → Assignment type mismatch', () => {
    const xml = consistentXml.replace('<VALUE>10</VALUE>', '<VALUE>true</VALUE>').replace(
      '<ECUC-NUMERICAL-PARAM-VALUE>',
      '<ECUC-BOOLEAN-PARAM-VALUE>'
    );
    const parsed = parseSwcArxml(xml, 'mismatch2.arxml');

    expect(parsed.report.errors).toHaveLength(1);
    expect(parsed.report.errors[0]).toMatch(/^Assignment type mismatch: \/Can\/CanMainFunctionPeriod/);
    expect(parsed.report.errors[0]).toContain('expected a numerical value, got true (boolean)');
  });

  it('strict 入口对类型不匹配抛 AssignmentTypeError', () => {
    const xml = consistentXml.replace('<VALUE>HW</VALUE>', '<VALUE>10</VALUE>').replace(
      '<ECUC-TEXTUAL-PARAM-VALUE>',
      '<ECUC-NUMERICAL-PARAM-VALUE>'
    );
    expect(() => importSwcArxmlStrict(xml, 'strict-mismatch.arxml')).toThrow(AssignmentTypeError);
  });
});

// ============================================================================
// 枚举非法
// ============================================================================

describe('ECUC 一致性校验 — 枚举非法', () => {
  it('值不在 LITERALS → Assignment type mismatch（消息含合法取值列表）', () => {
    const xml = consistentXml.replace('<VALUE>1M</VALUE>', '<VALUE>2M</VALUE>');
    const parsed = parseSwcArxml(xml, 'enum-invalid.arxml');

    expect(parsed.report.errors).toHaveLength(1);
    expect(parsed.report.errors[0]).toMatch(/^Assignment type mismatch: \/Can\/CanBaudRateConfig/);
    expect(parsed.report.errors[0]).toContain("value '2M' is not one of the enumeration literals [500K, 1M]");
  });
});

// ============================================================================
// 定义缺失
// ============================================================================

describe('ECUC 一致性校验 — 定义缺失', () => {
  it('参数 DEFINITION-REF 找不到 → Invalid reference', () => {
    const xml = consistentXml.replace('/Can/CanControllerMode', '/Can/GhostParam');
    const parsed = parseSwcArxml(xml, 'missing-param.arxml');

    expect(parsed.report.errors).toHaveLength(1);
    expect(parsed.report.errors[0]).toMatch(
      /^Invalid reference: \/Can\/GhostParam \(ECUC module Can parameter GhostParam\): parameter definition not found/
    );
  });

  it('容器 DEFINITION-REF 找不到 → Invalid reference', () => {
    const xml = consistentXml.replace('/Can/Can/CanController</DEFINITION-REF>', '/Can/Can/GhostContainer</DEFINITION-REF>');
    const parsed = parseSwcArxml(xml, 'missing-container.arxml');

    expect(parsed.report.errors).toHaveLength(1);
    expect(parsed.report.errors[0]).toMatch(
      /^Invalid reference: \/Can\/Can\/GhostContainer \(ECUC module Can container CanController\): container definition not found/
    );
  });

  it('模块定义缺失 → 单条模块级错误 + 不级联参数错误', () => {
    const xml = consistentXml.replace(
      '</ECUC-MODULE-DEF>',
      '</ECUC-MODULE-DEF>\n        <ECUC-MODULE-CONFIGURATION-VALUES>\n          <SHORT-NAME>Mcu</SHORT-NAME>\n          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Mcu/Mcu</DEFINITION-REF>\n          <PARAMETER-VALUES>\n            <ECUC-NUMERICAL-PARAM-VALUE>\n              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Mcu/McuClock</DEFINITION-REF>\n              <VALUE>16</VALUE>\n            </ECUC-NUMERICAL-PARAM-VALUE>\n          </PARAMETER-VALUES>\n        </ECUC-MODULE-CONFIGURATION-VALUES>'
    );
    const parsed = parseSwcArxml(xml, 'missing-module.arxml');

    // 只有模块级 1 条（Mcu 的参数不级联）；Can 模块本身仍合规
    expect(parsed.report.errors).toHaveLength(1);
    expect(parsed.report.errors[0]).toMatch(
      /^Invalid reference: \/4\.4\.0\/Mcu\/Mcu \(ECUC module Mcu\): module definition not found/
    );
  });

  it('strict 入口对定义缺失抛 InvalidReferenceError', () => {
    const xml = consistentXml.replace('/Can/CanControllerMode', '/Can/GhostParam');
    expect(() => importSwcArxmlStrict(xml, 'strict-missing.arxml')).toThrow(InvalidReferenceError);
  });
});

// ============================================================================
// 容器超限（warning 级）
// ============================================================================

describe('ECUC 一致性校验 — 容器超限', () => {
  it('UPPER-MULTIPLICITY=1 出现 2 个实例 → warning 不报错', () => {
    const xml = consistentXml.replace(
      '</ECUC-CONTAINER-VALUE>',
      '</ECUC-CONTAINER-VALUE>\n            <ECUC-CONTAINER-VALUE>\n              <SHORT-NAME>CanController</SHORT-NAME>\n              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/Can/Can/CanController</DEFINITION-REF>\n            </ECUC-CONTAINER-VALUE>'
    );
    const parsed = parseSwcArxml(xml, 'over-limit.arxml');

    expect(parsed.report.errors).toHaveLength(0); // warning 不阻塞
    expect(parsed.report.warnings).toHaveLength(1);
    const warn = parsed.report.warnings[0];
    expect(warn.tag).toBe('ECUC-CONTAINER-VALUE');
    expect(warn.message).toContain(
      'Container multiplicity exceeded: CanController in Can: 2 instances exceed upper multiplicity 1'
    );
  });

  it('未显式声明 UPPER-MULTIPLICITY 的容器重复 → 不告警', () => {
    const xml = consistentXml.replace(
      '<SUB-CONTAINERS>',
      '<SUB-CONTAINERS>\n                <ECUC-CONTAINER-DEF>\n                  <SHORT-NAME>CanFilter</SHORT-NAME>\n                </ECUC-CONTAINER-DEF>'
    );
    const parsed = parseSwcArxml(xml, 'no-limit.arxml');
    expect(parsed.report.errors).toHaveLength(0);
    expect(parsed.report.warnings).toHaveLength(0);
  });
});

// ============================================================================
// 纯值层文件：跳过校验（存量零回归关键）
// ============================================================================

describe('ECUC 一致性校验 — 纯值层跳过', () => {
  it('无 ECUC-MODULE-DEF 的文件（如导出器产物）→ 不误报定义缺失', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>P</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Can/GhostParam</DEFINITION-REF>
              <VALUE>10</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
          </PARAMETER-VALUES>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const parsed = parseSwcArxml(xml, 'value-only.arxml');
    expect(parsed.ecucModules).toHaveLength(1);
    expect(parsed.report.errors).toHaveLength(0); // 定义层缺席 → 跳过，GhostParam 不误报
  });

  it('导出 → 导入闭环（E1 round-trip）不受一致性校验影响', () => {
    const { report } = importSwcArxml(
      `<?xml version="1.0"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>yuleASR</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`,
      'roundtrip.arxml'
    );
    expect(report.errors).toHaveLength(0);
    expect(report.warnings).toHaveLength(0);
  });
});

// ============================================================================
// classifyImportError 前缀映射
// ============================================================================

describe('classifyImportError — E3 新前缀', () => {
  it('Assignment type mismatch: → AssignmentTypeError', () => {
    expect(
      classifyImportError('Assignment type mismatch: /Can/X (ECUC module Can parameter X): expected a numerical value, got abc (string)')
    ).toBeInstanceOf(AssignmentTypeError);
  });

  it('Invalid reference: → InvalidReferenceError（E3 定义缺失沿用既有分类）', () => {
    expect(
      classifyImportError('Invalid reference: /Can/Ghost (ECUC module Can parameter Ghost): parameter definition not found')
    ).toBeInstanceOf(InvalidReferenceError);
  });
});
