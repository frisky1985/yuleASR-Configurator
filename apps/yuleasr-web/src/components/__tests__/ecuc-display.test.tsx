// @vitest-environment jsdom
/**
 * ECUC 展示组件渲染测试（R8/E4）
 *
 * 覆盖：
 *  - EcucModuleTree：模块名/参数名/值渲染（真实解析数据 → 组件）
 *  - EcucParameterTable：扁平行（模块/路径/值/定义引用单元格）
 *  - 空态（无模块/无参数）
 *
 * 说明：组件为纯展示（只读），数据源为 ecuc-view-adapter 构建的视图，
 * 用真实 XML 解析产物渲染，验证「解析 → 适配 → 展示」链路在组件层闭环。
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EcucModuleTree } from '@/components/ecuc/EcucModuleTree';
import { EcucParameterTable } from '@/components/ecuc/EcucParameterTable';
import { parseSwcArxml } from '@/services/arxml-ecuc-import';
import { buildEcucProjectView } from '@/services/ecuc-view-adapter';

// vitest 未开 globals，RTL 自动清理不注册；显式清理避免跨用例 DOM 累积
// （同一文本跨用例重复匹配报 multiple elements）
afterEach(cleanup);

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
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
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

function buildView() {
  return buildEcucProjectView(parseSwcArxml(SAMPLE_XML, 'render.arxml'));
}

describe('EcucModuleTree（只读树）', () => {
  it('渲染模块名 + 模块级参数名/值', () => {
    render(<EcucModuleTree modules={buildView().modules} />);

    // 模块名（name + moduleDefRef 均为 Can，两处文本）
    expect(screen.getAllByText('Can').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('CanMainFunctionPeriod')).toBeTruthy();
    // 值渲染在 code 元素中
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('渲染容器名 + 容器内参数', () => {
    render(<EcucModuleTree modules={buildView().modules} />);

    expect(screen.getByText('CanController')).toBeTruthy();
    expect(screen.getByText('CanControllerBaudRate')).toBeTruthy();
    expect(screen.getByText('500000')).toBeTruthy();
  });

  it('空模块列表 → 空态提示', () => {
    render(<EcucModuleTree modules={[]} />);

    expect(screen.getByText(/暂无 ECUC 模块/)).toBeTruthy();
  });
});

describe('EcucParameterTable（只读参数表）', () => {
  it('渲染扁平行：模块/路径/名称/值/定义引用', () => {
    const view = buildView();
    render(<EcucParameterTable rows={view.flatParams} />);

    // 模块列（两行同属 Can 模块）
    expect(screen.getAllByText('Can').length).toBeGreaterThanOrEqual(2);
    // 参数名列
    expect(screen.getByText('CanMainFunctionPeriod')).toBeTruthy();
    expect(screen.getByText('CanControllerBaudRate')).toBeTruthy();

    // 路径列（容器内参数）
    expect(screen.getByText('CanController')).toBeTruthy();

    // 定义引用列（DEFINITION-REF 原文，title 属性）
    const refCell = screen.getByText('/Can/Can/CanController/CanControllerBaudRate');
    expect(refCell).toBeTruthy();
    expect(refCell.title).toBe('/Can/Can/CanController/CanControllerBaudRate');
  });

  it('空行列表 → 空态提示', () => {
    render(<EcucParameterTable rows={[]} />);

    expect(screen.getByText(/暂无 ECUC 参数/)).toBeTruthy();
  });
});
