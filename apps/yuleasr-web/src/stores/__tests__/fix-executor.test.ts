import { describe, it, expect } from 'vitest';

import { applyFix } from '@/stores/fix-executor';
import type { ConfigContainer, ConfigFile, ConfigModule, ConfigParameter } from '@/types';

function makeParam(
  id: string,
  name: string,
  value: ConfigParameter['value'],
  overrides: Partial<ConfigParameter> = {}
): ConfigParameter {
  return { id, name, type: 'integer', value, ...overrides };
}

function makeContainer(
  id: string,
  name: string,
  parameters: ConfigParameter[] = [],
  subContainers: ConfigContainer[] = []
): ConfigContainer {
  return { id, name, parameters, subContainers };
}

function makeModule(id: string, name: string, overrides: Partial<ConfigModule> = {}): ConfigModule {
  return {
    id,
    name,
    version: '4.4.0',
    layer: 'ECUAL',
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

function makeConfig(modules: ConfigModule[]): ConfigFile {
  return {
    id: 'cfg1',
    name: 'Test Config',
    modules,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('applyFix', () => {
  it('模块级参数夹值且不修改入参', () => {
    const config = makeConfig([
      makeModule('can', 'Can', {
        parameters: [makeParam('baud', 'BaudRate', 5000000)],
      }),
    ]);

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      parameter: 'BaudRate',
      value: 1000000,
    });

    expect(next.modules[0].parameters[0].value).toBe(1000000);
    expect(config.modules[0].parameters[0].value).toBe(5000000);
  });

  it('静态容器参数按 containerPath 定位', () => {
    const config = makeConfig([
      makeModule('can', 'Can', {
        containers: [
          makeContainer('CanConfigSet', 'CanConfigSet', [makeParam('baud', 'BaudRate', 9)]),
        ],
      }),
    ]);

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      containerPath: 'CanConfigSet',
      parameter: 'BaudRate',
      value: 1000000,
    });

    expect(next.modules[0].containers[0].parameters[0].value).toBe(1000000);
  });

  it('启用模块', () => {
    const config = makeConfig([makeModule('nvm', 'NvM', { enabled: false })]);

    const next = applyFix(config, { kind: 'enable-module', module: 'NvM' });

    expect(next.modules[0].enabled).toBe(true);
  });

  it('点号嵌套路径逐段下沉定位', () => {
    const config = makeConfig([
      makeModule('m', 'Can', {
        containers: [
          makeContainer(
            'Outer',
            'Outer',
            [],
            [makeContainer('Inner', 'Inner', [makeParam('p', 'Foo', 5)])]
          ),
        ],
      }),
    ]);

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      containerPath: 'Outer.Inner',
      parameter: 'Foo',
      value: 1,
    });

    expect(next.modules[0].containers[0].subContainers?.[0].parameters[0].value).toBe(1);
  });

  it('两个分支存在同名容器时只改路径指定的那一个', () => {
    const leftChild = makeContainer('Common', 'Common', [makeParam('p', 'Foo', 5)]);
    const rightChild = makeContainer('Common', 'Common', [makeParam('p', 'Foo', 5)]);
    const left = makeContainer('Left', 'Left', [], [leftChild]);
    const right = makeContainer('Right', 'Right', [], [rightChild]);
    const config = makeConfig([makeModule('m', 'Can', { containers: [left, right] })]);

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      containerPath: 'Right.Common',
      parameter: 'Foo',
      value: 1,
    });

    expect(next.modules[0].containers[1].subContainers?.[0].parameters[0].value).toBe(1);
    expect(next.modules[0].containers[0]).toBe(left);
    expect(left.subContainers?.[0].parameters[0].value).toBe(5);
  });

  it('模块不存在时返回同一引用', () => {
    const config = makeConfig([makeModule('can', 'Can')]);

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Nope',
      parameter: 'Foo',
      value: 1,
    });

    expect(next).toBe(config);
  });

  it('容器路径不存在时返回同一引用', () => {
    const config = makeConfig([
      makeModule('m', 'Can', {
        containers: [makeContainer('Outer', 'Outer', [], [makeContainer('Inner', 'Inner')])],
      }),
    ]);

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      containerPath: 'Outer.Missing',
      parameter: 'Foo',
      value: 1,
    });

    expect(next).toBe(config);
  });

  it('参数不存在时返回同一引用', () => {
    const config = makeConfig([
      makeModule('m', 'Can', {
        parameters: [makeParam('p', 'Foo', 5)],
        containers: [makeContainer('C', 'C', [makeParam('p', 'Foo', 5)])],
      }),
    ]);

    expect(
      applyFix(config, {
        kind: 'clamp-max',
        module: 'Can',
        parameter: 'Missing',
        value: 1,
      })
    ).toBe(config);
    expect(
      applyFix(config, {
        kind: 'clamp-max',
        module: 'Can',
        containerPath: 'C',
        parameter: 'Missing',
        value: 1,
      })
    ).toBe(config);
  });

  it('值已等于目标值时返回同一引用', () => {
    const config = makeConfig([
      makeModule('m', 'Can', {
        parameters: [makeParam('p', 'Foo', 5)],
        containers: [makeContainer('C', 'C', [makeParam('p', 'Foo', 5)])],
      }),
    ]);

    expect(
      applyFix(config, {
        kind: 'clamp-max',
        module: 'Can',
        parameter: 'Foo',
        value: 5,
      })
    ).toBe(config);
    expect(
      applyFix(config, {
        kind: 'clamp-max',
        module: 'Can',
        containerPath: 'C',
        parameter: 'Foo',
        value: 5,
      })
    ).toBe(config);
  });

  it('enable-module 目标已启用时返回同一引用', () => {
    const config = makeConfig([makeModule('nvm', 'NvM', { enabled: true })]);

    expect(applyFix(config, { kind: 'enable-module', module: 'NvM' })).toBe(config);
  });

  it('未修改的模块与兄弟容器保持原引用', () => {
    const target = makeContainer('Target', 'Target', [makeParam('p', 'Foo', 5)]);
    const sibling = makeContainer('Sibling', 'Sibling', [makeParam('p2', 'Bar', 5)]);
    const moduleA = makeModule('a', 'Can', { containers: [target, sibling] });
    const moduleB = makeModule('b', 'Can2');
    const config = makeConfig([moduleA, moduleB]);

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      containerPath: 'Target',
      parameter: 'Foo',
      value: 1,
    });

    expect(next).not.toBe(config);
    expect(next.modules[0]).not.toBe(moduleA);
    expect(next.modules[0].containers[0]).not.toBe(target);
    expect(next.modules[0].containers[1]).toBe(sibling);
    expect(next.modules[1]).toBe(moduleB);
  });
});
