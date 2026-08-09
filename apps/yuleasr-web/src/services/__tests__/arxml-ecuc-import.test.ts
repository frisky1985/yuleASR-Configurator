/**
 * ARXML ECUC 层导入服务测试（Web 薄重导出层，R8/E4）
 *
 * 验证：core 的 arxml-import ECUC 后端经 web 服务层可正常调用——
 *  1. parseSwcArxml re-export（值层 + 定义层 + report 计数）
 *  2. importEcucArxml ECUC 聚焦切片（modules/moduleDefs/report）
 *  3. 定义↔值关联（E2 回填 moduleDef）在 web 层可见
 *  4. validateEcucConsistency re-export（E3）
 */

import { describe, expect, it } from 'vitest';

import {
  importEcucArxml,
  parseSwcArxml,
  validateEcucConsistency,
} from '../arxml-ecuc-import';
// 值层 + 定义层同文件夹具（E2 关联：DEFINITION-REF 短名匹配模块定义）
const BOTH_LAYERS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>EcucValues</SHORT-NAME>
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
    <AR-PACKAGE>
      <SHORT-NAME>EcucDefs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF>
          <SHORT-NAME>Can</SHORT-NAME>
          <PARAMETER-DEFS>
            <ECUC-INTEGER-PARAM-DEF>
              <SHORT-NAME>CanMainFunctionPeriod</SHORT-NAME>
            </ECUC-INTEGER-PARAM-DEF>
            <ECUC-STRING-PARAM-DEF>
              <SHORT-NAME>CanControllerMode</SHORT-NAME>
            </ECUC-STRING-PARAM-DEF>
          </PARAMETER-DEFS>
          <CONTAINER-DEFS>
            <ECUC-CONTAINER-DEF>
              <SHORT-NAME>CanController</SHORT-NAME>
              <PARAMETER-DEFS>
                <ECUC-INTEGER-PARAM-DEF>
                  <SHORT-NAME>CanControllerBaudRate</SHORT-NAME>
                </ECUC-INTEGER-PARAM-DEF>
              </PARAMETER-DEFS>
            </ECUC-CONTAINER-DEF>
          </CONTAINER-DEFS>
        </ECUC-MODULE-DEF>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

describe('arxml-ecuc-import web service', () => {
  it('re-exports parseSwcArxml：值层 + 定义层 + 计数', () => {
    const parsed = parseSwcArxml(BOTH_LAYERS_XML, 'web-ecuc.arxml');

    expect(parsed.ecucModules).toHaveLength(1);
    expect(parsed.ecucModules[0].name).toBe('Can');
    expect(parsed.ecucModules[0].parameters).toHaveLength(2);
    expect(parsed.ecucModules[0].containers[0].name).toBe('CanController');
    expect(parsed.ecucModules[0].containers[0].parameters[0].value).toBe(500000);

    expect(parsed.ecucModuleDefs).toHaveLength(1);
    expect(parsed.ecucModuleDefs[0].name).toBe('Can');

    expect(parsed.report.counts.ecucModules).toBe(1);
    expect(parsed.report.counts.ecucModuleDefs).toBe(1);
    expect(parsed.report.errors).toHaveLength(0);
  });

  it('importEcucArxml 返回 ECUC 聚焦切片（modules/moduleDefs/report）', () => {
    const { modules, moduleDefs, report } = importEcucArxml(BOTH_LAYERS_XML, 'web-ecuc.arxml');

    expect(modules).toHaveLength(1);
    expect(modules[0].moduleDefRef).toBe('Can');
    expect(moduleDefs).toHaveLength(1);
    expect(report.sourceName).toBe('web-ecuc.arxml');
    expect(report.counts.ecucModules).toBe(1);
  });

  it('定义↔值关联（E2 回填）经 web 层可见：moduleDef 挂到值层模块', () => {
    const { modules } = importEcucArxml(BOTH_LAYERS_XML, 'web-ecuc.arxml');

    expect(modules[0].moduleDef?.name).toBe('Can');
    expect(modules[0].moduleDef?.parameterDefs.map(p => p.name)).toEqual([
      'CanMainFunctionPeriod',
      'CanControllerMode',
    ]);
  });

  it('E3 一致性问题经 web 层可见：parseSwcArxml 已集成校验，类型不匹配进 report.errors', () => {
    // 值层数值参数 → 定义层为 BOOLEAN（类型不匹配）
    const mismatchedXml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Values</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/Can/Can</DEFINITION-REF>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/Can/CanDevErrorDetect</DEFINITION-REF>
              <VALUE>10</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
          </PARAMETER-VALUES>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
    <AR-PACKAGE>
      <SHORT-NAME>Defs</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-DEF>
          <SHORT-NAME>Can</SHORT-NAME>
          <PARAMETER-DEFS>
            <ECUC-BOOLEAN-PARAM-DEF>
              <SHORT-NAME>CanDevErrorDetect</SHORT-NAME>
            </ECUC-BOOLEAN-PARAM-DEF>
          </PARAMETER-DEFS>
        </ECUC-MODULE-DEF>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const parsed = parseSwcArxml(mismatchedXml, 'mismatch.arxml');

    // 类型不匹配 → Assignment type mismatch 错误（R8/E3 经 parse 管线生效）
    expect(parsed.report.errors.some(e => e.includes('Assignment type mismatch'))).toBe(true);
  });

  it('纯值层文件（无定义层）：parse 不误报定义缺失（导出器产物兼容边界）', () => {
    const valueOnlyXml = BOTH_LAYERS_XML.replace(
      /<AR-PACKAGE>\n {6}<SHORT-NAME>EcucDefs<\/SHORT-NAME>[\s\S]*?<\/AR-PACKAGE>/,
      ''
    );
    const parsed = parseSwcArxml(valueOnlyXml, 'values-only.arxml');

    expect(parsed.ecucModuleDefs).toHaveLength(0);
    // 无定义可依 → 跳过一致性校验，不误报 Invalid reference
    expect(parsed.report.errors).toHaveLength(0);
  });

  it('validateEcucConsistency re-export 存在（core 导出面透传，需 ReadContext 调用）', () => {
    // 透传验证：函数面存在（web 层一般经 parseSwcArxml 内置管线消费，不直接调用）
    expect(typeof validateEcucConsistency).toBe('function');
  });
});
