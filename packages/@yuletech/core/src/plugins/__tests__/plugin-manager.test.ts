import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { YulePlugin, PluginContext } from '@yuletech/plugin-sdk';
import { pluginManager } from '../plugin-manager';
import { pluginRegistry } from '../plugin-registry';

const PLUGIN_ID = 'test-plugin';
const VALIDATOR_NAME = `${PLUGIN_ID}:mock-validator`;

/** 构造一个 activate 时注册 validator 的 mock 插件，并统计 activate/deactivate 调用次数 */
function makeMockPlugin(): {
  plugin: YulePlugin;
  calls: { activate: number; deactivate: number };
} {
  const calls = { activate: 0, deactivate: 0 };
  const plugin: YulePlugin = {
    id: PLUGIN_ID,
    name: 'Test Plugin',
    version: '1.0.0',
    type: 'validator',
    description: 'Test plugin for enable/disable lifecycle',
    author: 'test',
    activate: async (context: PluginContext) => {
      calls.activate += 1;
      context.registerValidator({
        name: 'mock-validator',
        description: 'Mock validator',
        targetModules: ['Mcu'],
        validate: async () => [],
      });
    },
    deactivate: async () => {
      calls.deactivate += 1;
    },
  };
  return { plugin, calls };
}

describe('plugin-manager enable/disable (Fix 23 / K12)', () => {
  beforeEach(() => {
    pluginRegistry.clear();
    // 静音默认 buildContext 的 console 日志
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disable → enable 后 validator 恢复存在且 getPluginMeta(id).enabled === true', async () => {
    const { plugin, calls } = makeMockPlugin();
    await pluginManager.activate(plugin, {}, 'internal');

    // 激活后 validator 已注册
    expect(pluginRegistry.getValidator(VALIDATOR_NAME)).toBeDefined();
    expect(pluginManager.getPluginMeta(PLUGIN_ID)?.enabled).toBe(true);

    // disable: 能力移除、实例标记失活
    expect(await pluginManager.disable(PLUGIN_ID)).toBe(true);
    expect(pluginManager.getPluginMeta(PLUGIN_ID)?.enabled).toBe(false);
    expect(pluginRegistry.getValidator(VALIDATOR_NAME)).toBeUndefined();
    expect(plugin.active).toBe(false);
    expect(calls.deactivate).toBe(1);

    // enable: 重新 activate，validator 恢复
    expect(await pluginManager.enable(PLUGIN_ID)).toBe(true);
    expect(pluginManager.getPluginMeta(PLUGIN_ID)?.enabled).toBe(true);
    expect(pluginRegistry.getValidator(VALIDATOR_NAME)).toBeDefined();
    expect(plugin.active).toBe(true);
    expect(calls.activate).toBe(2);
  });

  it('enable 一个从未失活的实例不会重复 activate', async () => {
    const { plugin, calls } = makeMockPlugin();
    await pluginManager.activate(plugin, {}, 'internal');

    expect(await pluginManager.enable(PLUGIN_ID)).toBe(true);
    // 首次激活后 active 为 undefined（非 false），不应触发重新 activate
    expect(calls.activate).toBe(1);
    expect(pluginRegistry.getValidator(VALIDATOR_NAME)).toBeDefined();
  });

  it('enable 未知插件 id 返回 false', async () => {
    expect(await pluginManager.enable('no-such-plugin')).toBe(false);
  });

  it('disable 未知插件 id 返回 false', async () => {
    expect(await pluginManager.disable('no-such-plugin')).toBe(false);
  });
});
