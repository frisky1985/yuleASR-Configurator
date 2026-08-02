/**
 * ConfigEngine 引擎缺陷修复测试（Fix 27）
 * 覆盖：
 * - E1 setValues 对不存在参数返回 false 且不写历史（不再假成功）
 * - E2 undo 批量使用副本逆序，undo→redo 批次对称性（不破坏历史顺序）
 * - E3 delete→undo→redo 后参数真正从 Map 中删除（遍历不可见）
 * - E5 validate 无 schema 校验能力时返回 degraded，不谎报 valid=true
 * - E6 import 传错误 configId 不产生悬空 currentConfigId
 */
import { describe, it, expect } from 'vitest';

import type { ModuleConfigModel, ParameterValueModel, ParameterValue } from '../../models';
import { ConfigProject } from '../../models';
import { ConfigEngine, type BatchHistoryEntry } from '../index';

function makeParam(name: string, value: unknown): ParameterValueModel {
  return {
    name,
    path: `Mcu.${name}`,
    value: value as ParameterValue,
    defaultValue: value as ParameterValue,
    isDefault: true,
    type: typeof value,
    modified: false,
  };
}

function makeModule(name: string, params: Record<string, unknown>): ModuleConfigModel {
  return {
    name,
    schema: {
      name,
      label: name,
      layer: 'MCAL',
      version: '4.4.0',
      parameters: [],
    },
    config: {
      module: name,
      version: '4.4.0',
      parameters: params,
    },
    parameters: new Map(Object.entries(params).map(([k, v]) => [k, makeParam(k, v)])),
    modified: false,
    errors: [],
    warnings: [],
    enabled: true,
  };
}

function setup(): { project: ConfigProject; engine: ConfigEngine; configId: string } {
  const project = new ConfigProject();
  project.createConfig('cfg-1', 'Test Config');
  project.addModule('cfg-1', makeModule('Mcu', { ClockFrequency: 100, Mode: 'RUN' }));
  const engine = new ConfigEngine(project);
  engine.setCurrentConfig('cfg-1');
  return { project, engine, configId: 'cfg-1' };
}

function getValue(engine: ConfigEngine, path: string): unknown {
  return engine.getValue(path);
}

function getParamMap(engine: ConfigEngine, moduleName: string): Map<string, ParameterValueModel> {
  const module = engine.getProject().getConfig('cfg-1')?.modules.get(moduleName);
  if (!module) throw new Error(`module ${moduleName} not found`);
  return module.parameters;
}

describe('E1: setValues 不假成功', () => {
  it('对不存在的参数返回 false，且不写历史、不改动任何值', () => {
    const { engine } = setup();
    const before = engine.getHistory().getHistorySize();

    const results = engine.setValues([{ path: 'Mcu.DoesNotExist', value: 999 }]);

    expect(results).toEqual([false]);
    expect(engine.getHistory().getHistorySize()).toBe(before);
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(100);
    expect(getParamMap(engine, 'Mcu').has('DoesNotExist')).toBe(false);
  });

  it('对不存在的模块返回 false', () => {
    const { engine } = setup();
    const before = engine.getHistory().getHistorySize();

    const results = engine.setValues([{ path: 'Ghost.Param', value: 1 }]);

    expect(results).toEqual([false]);
    expect(engine.getHistory().getHistorySize()).toBe(before);
  });

  it('混合批量：仅成功的项写历史并触发变更，失败的项不影响成功项', () => {
    const { engine } = setup();
    const changes = [
      { path: 'Mcu.ClockFrequency', value: 200 },
      { path: 'Mcu.Missing', value: 5 },
      { path: 'Mcu.Mode', value: 'STOP' },
    ];

    const results = engine.setValues(changes);

    expect(results).toEqual([true, false, true]);
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(200);
    expect(getValue(engine, 'Mcu.Mode')).toBe('STOP');
    expect(getParamMap(engine, 'Mcu').has('Missing')).toBe(false);

    // 历史只包含 2 条成功记录（作为 1 个 batch）
    const history = engine.getHistory().getAllHistory();
    expect(history).toHaveLength(1);
    const batch = history[0] as BatchHistoryEntry;
    expect(batch.type).toBe('batch');
    expect(batch.entries).toHaveLength(2);
    expect(batch.entries.map(e => e.parameter)).toEqual(['ClockFrequency', 'Mode']);

    // 撤销后仅回滚成功的两项
    engine.undo();
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(100);
    expect(getValue(engine, 'Mcu.Mode')).toBe('RUN');
  });
});

describe('E2: undo 批量逆序使用副本（undo→redo 对称性）', () => {
  it('同一参数连续两次 setValues 后 undo→redo 状态与操作前一致', () => {
    const { engine } = setup();
    // 初始值 100
    const results = engine.setValues([
      { path: 'Mcu.ClockFrequency', value: 200 },
      { path: 'Mcu.ClockFrequency', value: 300 },
    ]);
    expect(results).toEqual([true, true]);
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(300);

    // undo：逆序恢复 oldValue，最终回到操作前状态 100
    expect(engine.undo()).toBe(true);
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(100);

    // redo：按原始顺序重放 newValue，最终 300；
    // 若 undo 就地 reverse 破坏 batch 顺序，redo 结果将是 200
    expect(engine.redo()).toBe(true);
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(300);

    // 再 undo 一次仍然回到 100（batch 顺序未被破坏）
    engine.undo();
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(100);
  });

  it('批量 undo→redo 后多个参数状态与操作前一致', () => {
    const { engine } = setup();
    engine.setValues([
      { path: 'Mcu.ClockFrequency', value: 200 },
      { path: 'Mcu.Mode', value: 'STOP' },
    ]);
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(200);
    expect(getValue(engine, 'Mcu.Mode')).toBe('STOP');

    engine.undo();
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(100);
    expect(getValue(engine, 'Mcu.Mode')).toBe('RUN');

    engine.redo();
    expect(getValue(engine, 'Mcu.ClockFrequency')).toBe(200);
    expect(getValue(engine, 'Mcu.Mode')).toBe('STOP');
  });
});

describe('E3: delete→undo→redo 后参数真正从 Map 中删除', () => {
  it('redo 后参数不在 Map 中（遍历不可见）', () => {
    const { engine } = setup();

    expect(engine.deleteValue('Mcu.Mode')).toBe(true);
    expect(getParamMap(engine, 'Mcu').has('Mode')).toBe(false);

    // undo 恢复参数
    expect(engine.undo()).toBe(true);
    expect(getParamMap(engine, 'Mcu').has('Mode')).toBe(true);
    expect(getValue(engine, 'Mcu.Mode')).toBe('RUN');

    // redo 必须真正删除（而不是 setParameterValue(undefined) 强转残留）
    expect(engine.redo()).toBe(true);
    expect(getParamMap(engine, 'Mcu').has('Mode')).toBe(false);
    expect([...getParamMap(engine, 'Mcu').keys()]).not.toContain('Mode');
    expect(getValue(engine, 'Mcu.Mode')).toBeUndefined();
  });

  it('redo 删除后再次 undo 仍可恢复', () => {
    const { engine } = setup();

    engine.deleteValue('Mcu.Mode');
    engine.undo();
    engine.redo();
    expect(getParamMap(engine, 'Mcu').has('Mode')).toBe(false);

    engine.undo();
    expect(getParamMap(engine, 'Mcu').has('Mode')).toBe(true);
    expect(getValue(engine, 'Mcu.Mode')).toBe('RUN');
  });
});

describe('E5: validate 不谎报', () => {
  it('无外部 errors 且无 schema 校验能力时返回 valid=false + degraded=true', () => {
    const { engine } = setup();

    const result = engine.validate();

    expect(result.valid).toBe(false);
    expect(result.degraded).toBe(true);
    expect(result.errors.some(e => e.code === 'VALIDATION_NOT_RUN')).toBe(true);
  });

  it('有外部 errors 时返回 valid=false + degraded=false（结果可信）', () => {
    const { engine } = setup();
    const param = getParamMap(engine, 'Mcu').get('ClockFrequency');
    expect(param).toBeDefined();
    param!.errors = ['频率超出范围'];

    const result = engine.validate();

    expect(result.valid).toBe(false);
    expect(result.degraded).toBe(false);
    expect(result.errors.some(e => e.code === 'PARAMETER_ERROR')).toBe(true);
    expect(result.errors.some(e => e.code === 'VALIDATION_NOT_RUN')).toBe(false);
  });

  it('无配置时返回 valid=false 且不标记 degraded', () => {
    const project = new ConfigProject();
    const engine = new ConfigEngine(project);

    const result = engine.validate();

    expect(result.valid).toBe(false);
    expect(result.degraded).toBeUndefined();
    expect(result.errors.some(e => e.code === 'NO_CONFIG')).toBe(true);
  });
});

describe('E6: import 不产生悬空 currentConfigId', () => {
  it('configId 不存在时回退到导入返回的 id', () => {
    const { engine } = setup();

    const ok = engine.import({ id: 'imported-1', name: 'Imported', modules: {} }, 'nonexistent-id');

    expect(ok).toBe(true);
    expect(engine.getCurrentConfigId()).toBe('imported-1');
    // 不悬空：当前配置可正常解析
    expect(engine.getCurrentConfig()?.id).toBe('imported-1');
  });

  it('configId 存在时使用传入的 configId', () => {
    const { engine } = setup();

    const ok = engine.import({ id: 'imported-2', name: 'Imported', modules: {} }, 'cfg-1');

    expect(ok).toBe(true);
    expect(engine.getCurrentConfigId()).toBe('cfg-1');
    expect(engine.getCurrentConfig()?.id).toBe('cfg-1');
  });

  it('不传 configId 时使用导入返回的 id', () => {
    const { engine } = setup();

    const ok = engine.import({ id: 'imported-3', name: 'Imported', modules: {} });

    expect(ok).toBe(true);
    expect(engine.getCurrentConfigId()).toBe('imported-3');
    expect(engine.getCurrentConfig()?.id).toBe('imported-3');
  });
});
