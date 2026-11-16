import { describe, it, expect } from 'vitest';

import { DependencyValidator } from '@/core/DependencyValidator';
import type { ConfigFile } from '@/types';

function makeConfig(partial: Partial<ConfigFile>): ConfigFile {
  return {
    id: 'c1',
    name: 'test',
    targetChip: 'x',
    modules: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  } as ConfigFile;
}

describe('校验问题携带可执行修复描述', () => {
  it('参数超过 max 时输出 clamp-max', () => {
    const config = makeConfig({
      modules: [
        {
          id: 'can',
          name: 'Can',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [{ id: 'baud', name: 'BaudRate', type: 'integer', value: 5000000, max: 1000000 }],
          containers: [],
          dependencies: [],
        },
      ],
    } as Partial<ConfigFile>);

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

  it('必填参数缺失且存在默认值时输出 set-default', () => {
    const config = makeConfig({
      modules: [
        {
          id: 'com',
          name: 'Com',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [
            { id: 'mode', name: 'ComMode', type: 'enum', value: null, defaultValue: 'NORMAL', validation: { required: true } },
          ],
          containers: [],
          dependencies: [],
        },
      ],
    } as Partial<ConfigFile>);

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

  it('必需依赖未启用时输出 enable-module', () => {
    const config = makeConfig({
      modules: [
        {
          id: 'dem',
          name: 'Dem',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [],
          containers: [],
          dependencies: [{ module: 'NvM', required: true, autoEnable: true }],
        },
        { id: 'nvm', name: 'NvM', layer: 'ECUAL', enabled: false, description: '', parameters: [], containers: [], dependencies: [] },
      ],
    } as Partial<ConfigFile>);

    const result = new DependencyValidator(config).validate();
    const issue = result.errors.find(i => i.dependencyTarget === 'NvM');
    expect(issue?.fix).toEqual({ kind: 'enable-module', module: 'NvM' });
  });
});
