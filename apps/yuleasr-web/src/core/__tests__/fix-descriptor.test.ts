import { describe, it, expect } from 'vitest';

import { DependencyValidator } from '@/core/DependencyValidator';
import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config';

function makeParam(
  id: string,
  name: string,
  value: unknown,
  overrides: Partial<ConfigParameter> = {}
): ConfigParameter {
  return { id, name, type: 'string', value, ...overrides } as ConfigParameter;
}

function makeContainer(
  id: string,
  name: string,
  params: ConfigParameter[] = [],
  subContainers: ConfigContainer[] = []
): ConfigContainer {
  return { id, name, parameters: params, subContainers };
}

function makeModule(id: string, name: string, overrides: Partial<ConfigModule> = {}): ConfigModule {
  return {
    id,
    name,
    version: '4.4.0',
    autosarVersion: '4.4.0',
    enabled: true,
    layer: 'ECUAL',
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

describe('校验问题携带可执行修复描述', () => {
  it('参数超过 max 时输出 clamp-max', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        parameters: [makeParam('p-baud', 'BaudRate', 5000000, { type: 'integer', max: 1000000 })],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'BaudRate');
    expect(issue?.fix).toEqual({
      kind: 'clamp-max',
      module: 'Can',
      containerPath: undefined,
      parameter: 'BaudRate',
      value: 1000000,
    });
  });

  it('参数低于 min 时输出 clamp-min', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        parameters: [makeParam('p-baud', 'BaudRate', 100, { type: 'integer', min: 1000 })],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'BaudRate');
    expect(issue?.fix).toEqual({
      kind: 'clamp-min',
      module: 'Can',
      containerPath: undefined,
      parameter: 'BaudRate',
      value: 1000,
    });
  });

  it('容器内参数越界时 containerPath 指向容器，与 issue.path 对齐', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        containers: [
          makeContainer('c-general', 'General', [
            makeParam('p-baud', 'BaudRate', 5000000, { type: 'integer', max: 1000000 }),
          ]),
        ],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'BaudRate');
    expect(issue?.path).toBe('Can.General.BaudRate');
    expect(issue?.fix).toEqual({
      kind: 'clamp-max',
      module: 'Can',
      containerPath: 'General',
      parameter: 'BaudRate',
      value: 1000000,
    });
    const fix = issue?.fix;
    expect(fix && 'containerPath' in fix ? fix.containerPath : undefined).toBe('General');
  });

  it('必填参数缺失且存在默认值时输出 set-default', () => {
    const config = makeConfig([
      makeModule('m-com', 'Com', {
        parameters: [
          makeParam('p-mode', 'ComMode', null, {
            type: 'enum',
            defaultValue: 'NORMAL',
            validation: { required: true },
          }),
        ],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'ComMode');
    expect(issue?.fix).toEqual({
      kind: 'set-default',
      module: 'Com',
      containerPath: undefined,
      parameter: 'ComMode',
      value: 'NORMAL',
    });
  });

  it('必填参数缺失且无默认值时不输出 fix', () => {
    const config = makeConfig([
      makeModule('m-com', 'Com', {
        parameters: [
          makeParam('p-mode', 'ComMode', null, {
            type: 'enum',
            validation: { required: true },
          }),
        ],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'ComMode');
    expect(issue).toBeDefined();
    expect(issue?.fix).toBeUndefined();
  });

  it.each([
    ['空字符串', ''],
    ['null', null],
  ])('必填参数默认值为 %s 时不输出 set-default', (_label, defaultValue) => {
    const config = makeConfig([
      makeModule('m-com', 'Com', {
        parameters: [
          makeParam('p-mode', 'ComMode', null, {
            type: 'enum',
            defaultValue,
            validation: { required: true },
          }),
        ],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.parameter === 'ComMode');
    expect(issue).toBeDefined();
    expect(issue?.fix).toBeUndefined();
  });

  it('必填参数值为 null 时不因 min 误判 clamp-min', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        parameters: [
          makeParam('p-count', 'Count', null, {
            type: 'integer',
            min: 1,
            validation: { required: true },
          }),
        ],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issues = result.errors.filter(i => i.parameter === 'Count');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('is required');
    expect(issues.some(i => i.fix?.kind === 'clamp-min')).toBe(false);
  });

  it('必需依赖未启用且目标模块存在时输出 enable-module', () => {
    const config = makeConfig([
      makeModule('m-dem', 'Dem', {
        dependencies: [{ module: 'NvM', required: true, autoEnable: true }],
      }),
      makeModule('m-nvm', 'NvM', { enabled: false }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.dependencyTarget === 'NvM');
    expect(issue?.fix).toEqual({ kind: 'enable-module', module: 'NvM' });
  });

  it('必需依赖指向不存在的模块时不输出 enable-module', () => {
    const config = makeConfig([
      makeModule('m-dem', 'Dem', {
        dependencies: [{ module: 'NvM', required: true }],
      }),
    ]);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.dependencyTarget === 'NvM');
    expect(issue).toBeDefined();
    expect(issue?.fix).toBeUndefined();
  });
});
