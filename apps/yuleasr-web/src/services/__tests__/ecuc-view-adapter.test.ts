/**
 * ECUC 展示视图适配器测试（R8/E4）
 *
 * 覆盖：
 *  - buildEcucProjectView：模块树（容器递归）+ 统计 + 扁平参数行
 *  - 定义元数据挂载：模块级/容器内参数匹配到定义（kind/def）；无定义层文件降级
 *  - 嵌套容器路径与 pathLabel
 *  - 空工程/纯值层工程（无 ECUC）边界
 */

import { describe, expect, it } from 'vitest';

import { parseSwcArxml } from '../arxml-ecuc-import';
import { buildEcucProjectView } from '../ecuc-view-adapter';

// 值层（Can + Mcu 双模块；Can 含嵌套容器）+ 定义层（仅 Can）
const FIXTURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Values</SHORT-NAME>
      <ELEMENTS>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Can</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/4.4.0/Can/Can</DEFINITION-REF>
          <PARAMETER-VALUES>
            <ECUC-NUMERICAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Can/CanMainFunctionPeriod</DEFINITION-REF>
              <VALUE>10</VALUE>
            </ECUC-NUMERICAL-PARAM-VALUE>
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
              <SUB-CONTAINERS>
                <ECUC-CONTAINER-VALUE>
                  <SHORT-NAME>CanControllerSub</SHORT-NAME>
                  <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/Can/Can/CanController/CanControllerSub</DEFINITION-REF>
                  <PARAMETER-VALUES>
                    <ECUC-TEXTUAL-PARAM-VALUE>
                      <DEFINITION-REF DEST="ECUC-STRING-PARAM-DEF">/Can/Can/CanController/CanControllerSub/Mode</DEFINITION-REF>
                      <VALUE>HW</VALUE>
                    </ECUC-TEXTUAL-PARAM-VALUE>
                  </PARAMETER-VALUES>
                </ECUC-CONTAINER-VALUE>
              </SUB-CONTAINERS>
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
        <ECUC-MODULE-CONFIGURATION-VALUES>
          <SHORT-NAME>Mcu</SHORT-NAME>
          <DEFINITION-REF DEST="ECUC-MODULE-DEF">/Mcu/Mcu</DEFINITION-REF>
          <PARAMETER-VALUES>
            <ECUC-BOOLEAN-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/Mcu/McuDevErrorDetect</DEFINITION-REF>
              <VALUE>true</VALUE>
            </ECUC-BOOLEAN-PARAM-VALUE>
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
            <ECUC-INTEGER-PARAM-DEF>
              <SHORT-NAME>CanMainFunctionPeriod</SHORT-NAME>
            </ECUC-INTEGER-PARAM-DEF>
          </PARAMETER-DEFS>
          <CONTAINER-DEFS>
            <ECUC-CONTAINER-DEF>
              <SHORT-NAME>CanController</SHORT-NAME>
              <PARAMETER-DEFS>
                <ECUC-INTEGER-PARAM-DEF>
                  <SHORT-NAME>CanControllerBaudRate</SHORT-NAME>
                </ECUC-INTEGER-PARAM-DEF>
              </PARAMETER-DEFS>
              <SUB-CONTAINERS>
                <ECUC-CONTAINER-DEF>
                  <SHORT-NAME>CanControllerSub</SHORT-NAME>
                  <PARAMETER-DEFS>
                    <ECUC-STRING-PARAM-DEF>
                      <SHORT-NAME>Mode</SHORT-NAME>
                    </ECUC-STRING-PARAM-DEF>
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

describe('ecuc-view-adapter', () => {
  const project = parseSwcArxml(FIXTURE_XML, 'view.arxml');
  const view = buildEcucProjectView(project);

  it('模块树：值层模块 + 容器递归 + 模块级参数', () => {
    expect(view.modules).toHaveLength(2);
    const [can, mcu] = view.modules;

    expect(can.name).toBe('Can');
    expect(can.parameters).toHaveLength(1);
    expect(can.parameters[0].name).toBe('CanMainFunctionPeriod');

    expect(can.containers).toHaveLength(1);
    const controller = can.containers[0];
    expect(controller.name).toBe('CanController');
    expect(controller.parameters[0].name).toBe('CanControllerBaudRate');
    expect(controller.containers).toHaveLength(1);
    expect(controller.containers[0].name).toBe('CanControllerSub');
    expect(controller.containers[0].parameters[0].name).toBe('Mode');

    expect(mcu.name).toBe('Mcu');
    expect(mcu.parameters[0].value).toBe(true);
  });

  it('定义元数据挂载：模块级/容器内参数按名匹配定义（kind + def）', () => {
    const can = view.modules[0];

    // 模块级参数 → NUMERICAL（ECUC-INTEGER-PARAM-DEF）
    expect(can.parameters[0].kind).toBe('NUMERICAL');
    expect(can.parameters[0].def?.name).toBe('CanMainFunctionPeriod');

    // 嵌套容器内参数 → 容器链下钻匹配
    const sub = can.containers[0].containers[0];
    expect(sub.parameters[0].kind).toBe('TEXTUAL');
    expect(sub.parameters[0].def?.name).toBe('Mode');

    // 定义层缺席的模块（Mcu 无 ECUC-MODULE-DEF）→ 无定义元数据，不报错
    const mcu = view.modules[1];
    expect(mcu.moduleDef).toBeUndefined();
    expect(mcu.parameters[0].kind).toBeUndefined();
    expect(mcu.parameters[0].def).toBeUndefined();
  });

  it('扁平参数行：模块/容器链/pathLabel/值', () => {
    expect(view.flatParams).toHaveLength(4);

    const byName = Object.fromEntries(view.flatParams.map(p => [p.name, p]));

    // 模块级参数：空容器链
    expect(byName['CanMainFunctionPeriod'].module).toBe('Can');
    expect(byName['CanMainFunctionPeriod'].containerPath).toEqual([]);
    expect(byName['CanMainFunctionPeriod'].pathLabel).toBe('');

    // 嵌套容器参数：容器链 + 人类可读路径
    expect(byName['Mode'].containerPath).toEqual(['CanController', 'CanControllerSub']);
    expect(byName['Mode'].pathLabel).toBe('CanController / CanControllerSub');
    expect(byName['Mode'].value).toBe('HW');

    // 布尔参数值保留原始类型
    expect(byName['McuDevErrorDetect'].value).toBe(true);
  });

  it('统计：模块/容器/参数/定义计数 + 覆盖率', () => {
    const { stats } = view;
    expect(stats.moduleCount).toBe(2);
    expect(stats.containerCount).toBe(2); // CanController + CanControllerSub
    expect(stats.parameterCount).toBe(4);
    expect(stats.defModuleCount).toBe(1);
    expect(stats.defContainerCount).toBe(2);
    expect(stats.defParameterCount).toBe(3);
    // 2 个值层模块中 1 个关联到定义 → 50%
    expect(stats.defCoveragePercent).toBe(50);
  });

  it('报告透传：sourceName + 计数', () => {
    expect(view.report.sourceName).toBe('view.arxml');
    expect(view.report.counts.ecucModules).toBe(2);
    expect(view.report.counts.ecucModuleDefs).toBe(1);
  });

  it('空输入（无 ECUC）：空模块树 + 全零统计', () => {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<AUTOSAR xmlns="http://autosar.org/schema/r4.0">
  <AR-PACKAGES>
    <AR-PACKAGE>
      <SHORT-NAME>Empty</SHORT-NAME>
      <ELEMENTS></ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;
    const emptyView = buildEcucProjectView(parseSwcArxml(emptyXml, 'empty.arxml'));

    expect(emptyView.modules).toHaveLength(0);
    expect(emptyView.flatParams).toHaveLength(0);
    expect(emptyView.stats.moduleCount).toBe(0);
    expect(emptyView.stats.parameterCount).toBe(0);
    expect(emptyView.stats.defCoveragePercent).toBe(0);
  });
});
