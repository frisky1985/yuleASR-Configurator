// @vitest-environment jsdom
/**
 * F3 编辑组件 + F2b 覆盖表渲染测试
 *
 * 覆盖：
 *  - EcucModuleTree 编辑模式：类型感知编辑器（数字/开关/枚举下拉/文本）、
 *    模块启停开关、容器增删按钮、行内 issue 提示；只读模式无编辑控件；
 *  - EcucParameterTable 编辑模式：值单元格编辑器 + pathKey 回写定位；
 *  - SchemaCoverageTable：摘要 + 有 schema 可配 / 无 schema 仅展示徽标 + 全量生成按钮。
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EcucModuleTree } from '@/components/ecuc/EcucModuleTree';
import type { EcucTreeEditHandlers } from '@/components/ecuc/EcucModuleTree';
import { EcucParameterTable } from '@/components/ecuc/EcucParameterTable';
import { SchemaCoverageTable } from '@/components/ecuc/SchemaCoverageTable';
import { parseSwcArxml } from '@/services/arxml-ecuc-import';
import { createEditableProject, flattenEditableParams } from '@/services/ecuc-editor';
import { buildEcucProjectView } from '@/services/ecuc-view-adapter';

// vitest 未开 globals，RTL 自动清理不注册；显式清理避免跨用例 DOM 累积
afterEach(cleanup);

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
              <PARAMETER-DEFS>
                <ECUC-INTEGER-PARAM-DEF>
                  <SHORT-NAME>CanControllerBaudRate</SHORT-NAME>
                  <DEFAULT-VALUE>500000</DEFAULT-VALUE>
                </ECUC-INTEGER-PARAM-DEF>
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
              </PARAMETER-VALUES>
            </ECUC-CONTAINER-VALUE>
          </CONTAINERS>
        </ECUC-MODULE-CONFIGURATION-VALUES>
      </ELEMENTS>
    </AR-PACKAGE>
  </AR-PACKAGES>
</AUTOSAR>`;

function buildEditable() {
  const view = buildEcucProjectView(parseSwcArxml(FIXTURE_XML, 'render-edit.arxml'));
  return createEditableProject(view);
}

function mockHandlers(): EcucTreeEditHandlers & {
  onParamChange: ReturnType<typeof vi.fn>;
  onToggleModule: ReturnType<typeof vi.fn>;
  onAddContainer: ReturnType<typeof vi.fn>;
  onRemoveContainer: ReturnType<typeof vi.fn>;
} {
  return {
    onParamChange: vi.fn(),
    onToggleModule: vi.fn(),
    onAddContainer: vi.fn(),
    onRemoveContainer: vi.fn(),
  };
}

describe('EcucModuleTree（F3 编辑模式）', () => {
  it('渲染类型感知编辑器：数字 / 开关 / 枚举下拉', () => {
    const editable = buildEditable();
    const handlers = mockHandlers();
    render(<EcucModuleTree modules={editable.modules} editable handlers={handlers} />);

    // 数值参数 → number 输入
    expect(screen.getByTestId('ecuc-param-input-CanMainFunctionPeriod')).toBeTruthy();
    // 布尔参数 → 开关（STD_ON 状态）
    const toggle = screen.getByRole('switch', { name: 'STD_ON' });
    expect(toggle).toBeTruthy();
    // 枚举参数 → 下拉
    const select = screen.getByTestId('ecuc-param-select-CanWakeupSource');
    expect(select).toBeTruthy();
  });

  it('编辑数字参数触发 onParamChange（模块级，空容器路径）', () => {
    const editable = buildEditable();
    const handlers = mockHandlers();
    render(<EcucModuleTree modules={editable.modules} editable handlers={handlers} />);

    fireEvent.change(screen.getByTestId('ecuc-param-input-CanMainFunctionPeriod'), {
      target: { value: '25' },
    });
    expect(handlers.onParamChange).toHaveBeenCalledWith('Can', [], 'CanMainFunctionPeriod', 25);
  });

  it('点击布尔开关触发 onParamChange（false）', () => {
    const editable = buildEditable();
    const handlers = mockHandlers();
    render(<EcucModuleTree modules={editable.modules} editable handlers={handlers} />);

    fireEvent.click(screen.getByRole('switch', { name: 'STD_ON' }));
    expect(handlers.onParamChange).toHaveBeenCalledWith('Can', [], 'CanDevErrorDetect', false);
  });

  it('枚举下拉切换触发 onParamChange', () => {
    const editable = buildEditable();
    const handlers = mockHandlers();
    render(<EcucModuleTree modules={editable.modules} editable handlers={handlers} />);

    fireEvent.change(screen.getByTestId('ecuc-param-select-CanWakeupSource'), {
      target: { value: 'LIN' },
    });
    expect(handlers.onParamChange).toHaveBeenCalledWith('Can', [], 'CanWakeupSource', 'LIN');
  });

  it('模块启停开关触发 onToggleModule', () => {
    const editable = buildEditable();
    const handlers = mockHandlers();
    render(<EcucModuleTree modules={editable.modules} editable handlers={handlers} />);

    fireEvent.click(screen.getByRole('switch', { name: '启用' }));
    expect(handlers.onToggleModule).toHaveBeenCalledWith('Can', false);
  });

  it('容器增删按钮触发回调（带索引路径）', () => {
    // jsdom 默认 confirm=false，mock 为 true 以放行删除
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const editable = buildEditable();
    const handlers = mockHandlers();
    render(<EcucModuleTree modules={editable.modules} editable handlers={handlers} />);

    // 新增：模块级添加按钮（title 含定义名）
    fireEvent.click(screen.getByTitle(/添加容器/));
    expect(handlers.onAddContainer).toHaveBeenCalledWith('Can', [], 'CanController');

    // 删除：容器实例删除按钮
    fireEvent.click(screen.getByTitle('删除容器实例'));
    expect(handlers.onRemoveContainer).toHaveBeenCalledWith('Can', [], 0);
  });

  it('行内 issue 提示渲染（错误/告警）', () => {
    const editable = buildEditable();
    const handlers = mockHandlers();
    // 手动注入一个校验错误（模拟编辑后非法值）
    const modules = editable.modules.map(m => ({
      ...m,
      parameters: m.parameters.map(p =>
        p.name === 'CanWakeupSource'
          ? {
              ...p,
              issue: {
                severity: 'error' as const,
                message: `Assignment type mismatch: ${p.definitionRef} (parameter CanWakeupSource): value 'ETH' is not one of the enumeration literals [CAN, LIN]`,
              },
            }
          : p
      ),
    }));
    render(<EcucModuleTree modules={modules} editable handlers={handlers} />);

    expect(screen.getByTestId('ecuc-param-issue')).toBeTruthy();
    expect(screen.getByText(/not one of the enumeration literals/)).toBeTruthy();
  });

  it('只读模式不渲染编辑控件（无开关/无输入框）', () => {
    const editable = buildEditable();
    render(<EcucModuleTree modules={editable.modules} />);

    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.queryByTestId(/^ecuc-param-/)).toBeNull();
    // 值仍正常渲染
    expect(screen.getByText('10')).toBeTruthy();
  });
});

describe('EcucParameterTable（F3 编辑模式）', () => {
  it('值单元格渲染编辑器，变更时携带 pathKey 回写定位', () => {
    const editable = buildEditable();
    const rows = flattenEditableParams(editable);
    const onParamChange = vi.fn();
    render(<EcucParameterTable rows={rows} editable onParamChange={onParamChange} />);

    // 容器内数值参数编辑器（2 个：模块级 3 + 容器内 1）
    const baudInputs = screen.getAllByTestId('ecuc-param-input-CanControllerBaudRate');
    expect(baudInputs).toHaveLength(1);

    fireEvent.change(baudInputs[0], { target: { value: '250000' } });
    expect(onParamChange).toHaveBeenCalledWith(
      'Can',
      [{ name: 'CanController', index: 0 }],
      'CanControllerBaudRate',
      250000
    );
  });

  it('编辑模式行内 issue 渲染', () => {
    const editable = buildEditable();
    const rows = flattenEditableParams(editable).map(r =>
      r.name === 'CanWakeupSource'
        ? {
            ...r,
            issue: {
              severity: 'error' as const,
              message: 'Assignment type mismatch: bad value',
            },
          }
        : r
    );
    const onParamChange = vi.fn();
    render(<EcucParameterTable rows={rows} editable onParamChange={onParamChange} />);

    expect(screen.getAllByTestId('ecuc-param-issue').length).toBeGreaterThan(0);
  });

  it('只读模式无编辑器', () => {
    const editable = buildEditable();
    const rows = flattenEditableParams(editable);
    render(<EcucParameterTable rows={rows} />);
    expect(screen.queryByTestId(/^ecuc-param-/)).toBeNull();
    expect(screen.getByText('500000')).toBeTruthy();
  });
});

describe('SchemaCoverageTable（F2b 覆盖展示）', () => {
  it('渲染摘要 + 全量生成按钮 + 有 schema 可配徽标', () => {
    render(<SchemaCoverageTable configModules={[{ name: 'flash', enabled: true }]} />);

    expect(screen.getByText('全量生成 ZIP')).toBeTruthy();
    // 摘要卡片
    expect(screen.getByText('模块总数')).toBeTruthy();
    expect(screen.getByText('有 schema（可配）')).toBeTruthy();
    // flash 行：已启用 + 有 schema 可配
    expect(screen.getAllByText('已启用').length).toBeGreaterThan(0);
    expect(screen.getAllByText('有 schema 可配').length).toBeGreaterThan(100);
  });

  it('配置独有模块 → 无 schema 仅展示徽标', () => {
    render(
      <SchemaCoverageTable
        configModules={[
          { name: 'CustomFoo', enabled: true, parameters: [{ name: 'A', value: 1 }] },
        ]}
      />
    );

    expect(screen.getByText('CustomFoo')).toBeTruthy();
    expect(screen.getAllByText('无 schema 仅展示').length).toBe(1);
  });
});
