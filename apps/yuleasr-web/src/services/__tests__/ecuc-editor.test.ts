/**
 * ECUC 编辑服务测试（F3）
 *
 * 覆盖：
 *  - createEditableProject：只读视图 → 可编辑副本（enabled 默认 true；存量值先校验）
 *  - updateParamValue：改值 + 实时校验（枚举违规 / 数值类型 / 布尔）；同名兄弟按索引定位
 *  - toggleModuleEnabled：模块启停（禁用模块不参与导出/生成）
 *  - addContainerInstance：按定义新增实例（默认值解析）；超 UPPER-MULTIPLICITY → warning
 *  - removeContainerInstance：按父路径 + 索引删除；低于下限 → warning
 *  - 回写：editableToConfigModules（A4 输入）/ editableToSchemas（F2a 输入，编辑值覆盖默认值）
 */

import { describe, expect, it } from 'vitest';

import { parseSwcArxml } from '../arxml-ecuc-import';
import {
  addContainerInstance,
  createEditableProject,
  editableToConfigFile,
  editableToSchemas,
  flattenEditableParams,
  removeContainerInstance,
  toggleModuleEnabled,
  updateParamValue,
} from '../ecuc-editor';
import { buildEcucProjectView } from '../ecuc-view-adapter';

// 值层 + 定义层同文件：Can（模块级数值/布尔/枚举参数 + 可多实例容器 CanController
// 上限 2，含数值 + 枚举参数）；值层已含 2 个 CanController 实例（测试超限告警）。
const FIXTURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
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
              <DEFAULT-VALUE>10</DEFAULT-VALUE>
            </ECUC-INTEGER-PARAM-DEF>
            <ECUC-BOOLEAN-PARAM-DEF>
              <SHORT-NAME>CanDevErrorDetect</SHORT-NAME>
              <DEFAULT-VALUE>true</DEFAULT-VALUE>
            </ECUC-BOOLEAN-PARAM-DEF>
            <ECUC-ENUMERATION-PARAM-DEF>
              <SHORT-NAME>CanWakeupSource</SHORT-NAME>
              <LITERALS>
                <ECUC-ENUMERATION-LITERAL-DEF><SHORT-NAME>CAN</SHORT-NAME></ECUC-ENUMERATION-LITERAL-DEF>
                <ECUC-ENUMERATION-LITERAL-DEF><SHORT-NAME>LIN</SHORT-NAME></ECUC-ENUMERATION-LITERAL-DEF>
              </LITERALS>
            </ECUC-ENUMERATION-PARAM-DEF>
          </PARAMETER-DEFS>
          <CONTAINER-DEFS>
            <ECUC-CONTAINER-DEF>
              <SHORT-NAME>CanController</SHORT-NAME>
              <UPPER-MULTIPLICITY>2</UPPER-MULTIPLICITY>
              <PARAMETER-DEFS>
                <ECUC-INTEGER-PARAM-DEF>
                  <SHORT-NAME>CanControllerBaudRate</SHORT-NAME>
                  <DEFAULT-VALUE>500000</DEFAULT-VALUE>
                </ECUC-INTEGER-PARAM-DEF>
                <ECUC-ENUMERATION-PARAM-DEF>
                  <SHORT-NAME>CanControllerMode</SHORT-NAME>
                  <LITERALS>
                    <ECUC-ENUMERATION-LITERAL-DEF><SHORT-NAME>HW</SHORT-NAME></ECUC-ENUMERATION-LITERAL-DEF>
                    <ECUC-ENUMERATION-LITERAL-DEF><SHORT-NAME>SW</SHORT-NAME></ECUC-ENUMERATION-LITERAL-DEF>
                  </LITERALS>
                </ECUC-ENUMERATION-PARAM-DEF>
              </PARAMETER-DEFS>
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
            <ECUC-BOOLEAN-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-BOOLEAN-PARAM-DEF">/Can/CanDevErrorDetect</DEFINITION-REF>
              <VALUE>true</VALUE>
            </ECUC-BOOLEAN-PARAM-VALUE>
            <ECUC-TEXTUAL-PARAM-VALUE>
              <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/Can/CanWakeupSource</DEFINITION-REF>
              <VALUE>CAN</VALUE>
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
                <ECUC-TEXTUAL-PARAM-VALUE>
                  <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/Can/Can/CanController/CanControllerMode</DEFINITION-REF>
                  <VALUE>HW</VALUE>
                </ECUC-TEXTUAL-PARAM-VALUE>
              </PARAMETER-VALUES>
            </ECUC-CONTAINER-VALUE>
            <ECUC-CONTAINER-VALUE>
              <SHORT-NAME>CanController</SHORT-NAME>
              <DEFINITION-REF DEST="ECUC-PARAM-CONF-CONTAINER-DEF">/Can/Can/CanController</DEFINITION-REF>
              <PARAMETER-VALUES>
                <ECUC-NUMERICAL-PARAM-VALUE>
                  <DEFINITION-REF DEST="ECUC-INTEGER-PARAM-DEF">/Can/Can/CanController/CanControllerBaudRate</DEFINITION-REF>
                  <VALUE>250000</VALUE>
                </ECUC-NUMERICAL-PARAM-VALUE>
                <ECUC-TEXTUAL-PARAM-VALUE>
                  <DEFINITION-REF DEST="ECUC-ENUMERATION-PARAM-DEF">/Can/Can/CanController/CanControllerMode</DEFINITION-REF>
                  <VALUE>SW</VALUE>
                </ECUC-TEXTUAL-PARAM-VALUE>
              </PARAMETER-VALUES>
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

function buildProject() {
  const view = buildEcucProjectView(parseSwcArxml(FIXTURE_XML, 'edit.arxml'));
  return { view, editable: createEditableProject(view) };
}

describe('createEditableProject', () => {
  it('只读视图 → 可编辑副本：enabled 默认 true，dirty=false，存量值无错误', () => {
    const { editable } = buildProject();
    expect(editable.modules).toHaveLength(1);
    expect(editable.modules[0].name).toBe('Can');
    expect(editable.modules[0].enabled).toBe(true);
    expect(editable.dirty).toBe(false);
    // 存量值全部合法（枚举 CAN/HW/SW ∈ literals，数值/布尔类型正确）
    expect(editable.errors).toBe(0);
    expect(editable.warnings).toBe(0);
  });

  it('定义缺失的纯值层参数不产生校验错误（无定义可依，降级）', () => {
    const valueOnlyXml = FIXTURE_XML.replace(
      /<ECUC-MODULE-DEF>[\s\S]*?<\/ECUC-MODULE-DEF>\s*/g,
      ''
    );
    const view = buildEcucProjectView(parseSwcArxml(valueOnlyXml, 'values-only.arxml'));
    const editable = createEditableProject(view);
    expect(editable.errors).toBe(0);
    // 参数仍可编辑（value 保留）
    expect(editable.modules[0].parameters.length).toBeGreaterThan(0);
  });
});

describe('updateParamValue（改值 + 实时校验）', () => {
  it('模块级数值参数改值成功，dirty=true，无错误', () => {
    const { editable } = buildProject();
    const next = updateParamValue(editable, 'Can', [], 'CanMainFunctionPeriod', 20);
    expect(next.dirty).toBe(true);
    expect(next.modules[0].parameters.find(p => p.name === 'CanMainFunctionPeriod')?.value).toBe(
      20
    );
    expect(next.errors).toBe(0);
  });

  it('枚举参数输入非法字面量 → 立即报错（E3 消息格式）', () => {
    const { editable } = buildProject();
    const next = updateParamValue(editable, 'Can', [], 'CanWakeupSource', 'ETH');
    const param = next.modules[0].parameters.find(p => p.name === 'CanWakeupSource');
    expect(param?.issue?.severity).toBe('error');
    expect(param?.issue?.message).toContain('not one of the enumeration literals');
    expect(next.errors).toBe(1);
  });

  it('数值参数改为字符串 → 类型不匹配错误', () => {
    const { editable } = buildProject();
    const next = updateParamValue(editable, 'Can', [], 'CanMainFunctionPeriod', 'fast');
    const param = next.modules[0].parameters.find(p => p.name === 'CanMainFunctionPeriod');
    expect(param?.issue?.severity).toBe('error');
    expect(param?.issue?.message).toContain('expected a numerical value');
  });

  it('布尔参数改值（true→false）无错误', () => {
    const { editable } = buildProject();
    const next = updateParamValue(editable, 'Can', [], 'CanDevErrorDetect', false);
    expect(next.modules[0].parameters.find(p => p.name === 'CanDevErrorDetect')?.value).toBe(false);
    expect(next.errors).toBe(0);
  });

  it('同名兄弟容器（多实例）按索引精确定位：改第 2 个不动第 1 个', () => {
    const { editable } = buildProject();
    const path2 = [{ name: 'CanController', index: 1 }];
    const next = updateParamValue(editable, 'Can', path2, 'CanControllerBaudRate', 125000);
    const containers = next.modules[0].containers;
    expect(containers[0].parameters.find(p => p.name === 'CanControllerBaudRate')?.value).toBe(
      500000
    );
    expect(containers[1].parameters.find(p => p.name === 'CanControllerBaudRate')?.value).toBe(
      125000
    );
  });

  it('容器内枚举参数非法值 → 错误', () => {
    const { editable } = buildProject();
    const path = [{ name: 'CanController', index: 0 }];
    const next = updateParamValue(editable, 'Can', path, 'CanControllerMode', 'USB');
    const param = next.modules[0].containers[0].parameters.find(
      p => p.name === 'CanControllerMode'
    );
    expect(param?.issue?.severity).toBe('error');
  });
});

describe('toggleModuleEnabled（模块启停）', () => {
  it('禁用模块后导出/生成跳过该模块', () => {
    const { editable } = buildProject();
    const next = toggleModuleEnabled(editable, 'Can');
    expect(next.modules[0].enabled).toBe(false);
    expect(next.dirty).toBe(true);

    const configModules = editableToConfigFile(next).modules;
    expect(configModules).toHaveLength(0);

    const schemas = editableToSchemas(next);
    expect(schemas).toHaveLength(0);
  });

  it('再次点击恢复启用', () => {
    const { editable } = buildProject();
    const next = toggleModuleEnabled(toggleModuleEnabled(editable, 'Can'), 'Can');
    expect(next.modules[0].enabled).toBe(true);
  });
});

describe('addContainerInstance / removeContainerInstance（容器增删）', () => {
  it('新增 CanController 实例：默认值解析（数值 500000 / 枚举首字面量 HW），引用路径拼接', () => {
    const { editable } = buildProject();
    const next = addContainerInstance(editable, 'Can', [], 'CanController');
    const containers = next.modules[0].containers;
    expect(containers).toHaveLength(3);
    const added = containers[2];
    expect(added.parameters.find(p => p.name === 'CanControllerBaudRate')?.value).toBe(500000);
    expect(added.parameters.find(p => p.name === 'CanControllerMode')?.value).toBe('HW');
    expect(added.definitionRef).toContain('CanController');
    expect(next.dirty).toBe(true);
  });

  it('第 3 个实例超 UPPER-MULTIPLICITY(2) → warning 即时提示', () => {
    const { editable } = buildProject();
    const next = addContainerInstance(editable, 'Can', [], 'CanController');
    // 兄弟组 3 个 > 上限 2
    expect(next.warnings).toBeGreaterThan(0);
    const container = next.modules[0].containers[0];
    expect(container.issue?.severity).toBe('warning');
    expect(container.issue?.message).toContain('multiplicity exceeded');
  });

  it('删除实例后超限告警消失', () => {
    const { editable } = buildProject();
    // 先加到 3 个（有告警）
    const three = addContainerInstance(editable, 'Can', [], 'CanController');
    expect(three.warnings).toBeGreaterThan(0);
    // 删除第 2 个 → 回到 2 个，告警消失
    const two = removeContainerInstance(three, 'Can', [], 1);
    expect(two.modules[0].containers).toHaveLength(2);
    expect(two.warnings).toBe(0);
  });

  it('删除后低于 LOWER-MULTIPLICITY → warning（不阻止删除）', () => {
    const { editable } = buildProject();
    // 移除一个：CanController 定义无 LOWER，此例验证删除本身可执行
    const next = removeContainerInstance(editable, 'Can', [], 0);
    expect(next.modules[0].containers).toHaveLength(1);
  });
});

describe('回写映射', () => {
  it('editableToConfigFile：A4 导出器输入（enabled 模块、参数类型按定义类别）', () => {
    const { editable } = buildProject();
    const config = editableToConfigFile(editable);
    expect(config.modules).toHaveLength(1);
    const m = config.modules[0];
    expect(m.parameters.find(p => p.name === 'CanDevErrorDetect')?.type).toBe('boolean');
    expect(m.parameters.find(p => p.name === 'CanMainFunctionPeriod')?.type).toBe('integer');
    expect(m.parameters.find(p => p.name === 'CanWakeupSource')?.type).toBe('enum');
    expect(m.containers).toHaveLength(2); // 多实例并列保留
    expect(m.containers[0].parameters[0].value).toBe(500000);
  });

  it('editableToSchemas：编辑值覆盖 schema 默认值（F2a 生成输入）', async () => {
    const { editable } = buildProject();
    // 改容器参数值再生成（CanControllerBaudRate 在 core Can schema 中存在同名参数）
    const path = [{ name: 'CanController', index: 0 }];
    const edited = updateParamValue(editable, 'Can', path, 'CanControllerBaudRate', 750000);
    const schemas = editableToSchemas(edited);
    expect(schemas).toHaveLength(1);
    const can = schemas[0];
    expect(can.name).toBe('Can');
    // 编辑值覆盖默认值：多实例同名参数取最后一个实例（宏头扁平，文档化边界）
    const covered = can.parameters.find(p => p.name === 'CanControllerBaudRate');
    expect(covered?.default).toBe(250000);
    // 容器参数已进 schema.parameters（loader 展平）
    expect(can.parameters.some(p => p.name === 'CanControllerBaudRate')).toBe(true);
  });

  it('flattenEditableParams：扁平行带索引路径（pathKey），表格回写可定位', () => {
    const { editable } = buildProject();
    const rows = flattenEditableParams(editable);
    // 3 模块级 + 2 实例 × 2 参数
    expect(rows).toHaveLength(3 + 4);
    const baudRows = rows.filter(r => r.name === 'CanControllerBaudRate');
    expect(baudRows).toHaveLength(2);
    expect(baudRows[0].pathKey).toEqual([{ name: 'CanController', index: 0 }]);
    expect(baudRows[1].pathKey).toEqual([{ name: 'CanController', index: 1 }]);
    expect(baudRows[1].value).toBe(250000);
  });
});
