// @vitest-environment jsdom
/**
 * Fix 17: core 条件引擎（@yuletech/core/conditions）接入 web 端后的行为验证。
 * 覆盖:
 *  1. toConditionModuleConfigs 组装（enabled 状态 + 容器参数递归收集）
 *  2. 容器 condition 显隐（ContainerParameterList）
 *  3. 参数 visibleWhen 显隐（ParameterEditor）
 * 核心断言: fails-closed（条件不满足/表达式解析失败 → 隐藏）。
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { ConditionEvaluator, parseCondition } from '@yuletech/core/conditions';
import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types';
import { toConditionModuleConfigs } from '@/stores/configStore';
import { ContainerParameterList } from '@/components/ContainerParameterList';
import { ParameterEditor } from '@/components/ParameterEditor';

// ─── helpers ──────────────────────────────────────────────────────────

function makeModule(overrides: Partial<ConfigModule>): ConfigModule {
  return {
    id: 'can',
    name: 'Can',
    version: '4.4.0',
    layer: 'MCAL',
    enabled: true,
    containers: [],
    parameters: [],
    dependencies: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    configStatus: 'configured',
    ...overrides,
  };
}

function makeContainer(overrides: Partial<ConfigContainer>): ConfigContainer {
  return {
    id: 'general',
    name: 'CanGeneral',
    parameters: [],
    ...overrides,
  };
}

function makeParam(overrides: Partial<ConfigParameter>): ConfigParameter {
  return {
    id: 'baudrate',
    name: 'baudrate',
    type: 'integer',
    value: 500,
    ...overrides,
  };
}

function makeConfigFile(modules: ConfigModule[]): ConfigFile {
  return {
    id: 'test',
    name: 'test',
    modules,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function evalExpr(expression: string, configs: ReturnType<typeof toConditionModuleConfigs>) {
  const evaluator = new ConditionEvaluator();
  return evaluator.evaluate(parseCondition(expression), configs);
}

// ─── 1. toConditionModuleConfigs 组装 ─────────────────────────────────

describe('toConditionModuleConfigs (Fix 17 组装)', () => {
  it('暴露模块 enabled 状态为 parameters.enabled（core 约定）', () => {
    const configs = toConditionModuleConfigs(
      makeConfigFile([
        makeModule({ enabled: true }),
        makeModule({ id: 'mcu', name: 'Mcu', enabled: false }),
      ])
    );
    expect(configs.find(c => c.module === 'Can')?.parameters.enabled).toBe(true);
    expect(configs.find(c => c.module === 'Mcu')?.parameters.enabled).toBe(false);
  });

  it('递归收集容器（含子容器）参数到 containers[容器名][0].parameters', () => {
    const configs = toConditionModuleConfigs(
      makeConfigFile([
        makeModule({
          containers: [
            makeContainer({
              id: 'general',
              name: 'CanGeneral',
              parameters: [makeParam({ id: 'p1', name: 'baudrate', value: 500 })],
              subContainers: [
                makeContainer({
                  id: 'sub',
                  name: 'CanSub',
                  parameters: [
                    makeParam({ id: 'p2', name: 'wakeup', value: true, type: 'boolean' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ])
    );
    const can = configs.find(c => c.module === 'Can');
    expect(can?.containers?.CanGeneral?.[0]?.parameters?.baudrate).toBe(500);
    expect(can?.containers?.CanSub?.[0]?.parameters?.wakeup).toBe(true);
  });

  it('disabled 模块也包含在 configs 中（供 !Module.enabled 类表达式求值）', () => {
    const configs = toConditionModuleConfigs(makeConfigFile([makeModule({ enabled: false })]));
    expect(configs).toHaveLength(1);
    expect(configs[0].module).toBe('Can');
  });
});

// ─── 2. core 引擎集成（组装结果直接可被条件引擎寻址） ─────────────────

describe('条件引擎与组装 configs 的寻址一致性', () => {
  const file = makeConfigFile([
    makeModule({
      enabled: true,
      parameters: [makeParam({ id: 'baudrate', name: 'baudrate', value: 500 })],
      containers: [
        makeContainer({
          parameters: [makeParam({ id: 'hw', name: 'hwUnit', value: 'ADC0' })],
        }),
      ],
    }),
  ]);
  const configs = toConditionModuleConfigs(file);

  it('"Can.enabled == true" 解析为 true', () => {
    expect(evalExpr('Can.enabled == true', configs)).toBe(true);
  });

  it('"Can.enabled == false" 解析为 false（模块已启用）', () => {
    expect(evalExpr('Can.enabled == false', configs)).toBe(false);
  });

  it('"Can.baudrate == 500" 模块级参数寻址', () => {
    expect(evalExpr('Can.baudrate == 500', configs)).toBe(true);
  });

  it('未知名路径 fails-closed → false', () => {
    expect(evalExpr('Unknown.enabled == true', configs)).toBe(false);
    expect(evalExpr('Can.notExist == 1', configs)).toBe(false);
  });
});

// ─── 3. 容器 condition 显隐（ContainerParameterList） ─────────────────

describe('ContainerParameterList 容器 condition', () => {
  const visibleConfigs = toConditionModuleConfigs(makeConfigFile([makeModule({ enabled: true })]));
  const hiddenConfigs = toConditionModuleConfigs(makeConfigFile([makeModule({ enabled: false })]));

  function renderContainer(condition: string | undefined, configs: typeof visibleConfigs) {
    return render(
      <ContainerParameterList
        container={makeContainer({
          condition,
          parameters: [makeParam({ id: 'baudrate', name: 'baudrate', value: 500 })],
        })}
        onParamChange={() => {}}
        moduleConfigs={configs}
      />
    );
  }

  it('condition 满足（Can.enabled == true）→ 参数可见', () => {
    const { container } = renderContainer('Can.enabled == true', visibleConfigs);
    expect(container.textContent).toContain('baudrate');
  });

  it('condition 不满足（Can.enabled == true 但模块禁用）→ 容器整体隐藏', () => {
    const { container } = renderContainer('Can.enabled == true', hiddenConfigs);
    expect(container.textContent).toBe('');
  });

  it('condition 缺失 → 保持向后兼容（始终可见）', () => {
    const { container } = renderContainer(undefined, hiddenConfigs);
    expect(container.textContent).toContain('baudrate');
  });

  it('非法表达式 fails-closed → 隐藏', () => {
    const { container } = renderContainer('Can.enabled ==', visibleConfigs);
    expect(container.textContent).toBe('');
  });
});

// ─── 4. 参数 visibleWhen 显隐（ParameterEditor） ──────────────────────

describe('ParameterEditor 参数 visibleWhen', () => {
  const visibleConfigs = toConditionModuleConfigs(makeConfigFile([makeModule({ enabled: true })]));
  const hiddenConfigs = toConditionModuleConfigs(makeConfigFile([makeModule({ enabled: false })]));

  function renderParam(visibleWhen: string | undefined, configs: typeof visibleConfigs) {
    return render(
      <ParameterEditor
        parameter={makeParam({ visibleWhen })}
        onChange={() => {}}
        moduleConfigs={configs}
      />
    );
  }

  it('visibleWhen 满足 → 参数可见', () => {
    const { container } = renderParam('Can.enabled == true', visibleConfigs);
    expect(container.textContent).toContain('baudrate');
  });

  it('visibleWhen 不满足 → 参数隐藏（返回 null）', () => {
    const { container } = renderParam('Can.enabled == true', hiddenConfigs);
    expect(container.textContent).toBe('');
  });

  it('visibleWhen 缺失 → 向后兼容（始终可见）', () => {
    const { container } = renderParam(undefined, hiddenConfigs);
    expect(container.textContent).toContain('baudrate');
  });
});
