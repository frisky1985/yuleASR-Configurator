import { describe, it, expect } from 'vitest';

import { applyFix } from '@/stores/fix-executor';
import type { ConfigFile } from '@/types';

const base = {
  id: 'c1',
  name: 'test',
  targetChip: 'x',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as ConfigFile;

describe('applyFix', () => {
  it('模块级参数夹值', () => {
    const config = {
      ...base,
      modules: [
        {
          id: 'can',
          name: 'Can',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [{ id: 'baud', name: 'BaudRate', type: 'integer', value: 5000000 }],
          containers: [],
          dependencies: [],
        },
      ],
    } as ConfigFile;

    const next = applyFix(config, {
      kind: 'clamp-max',
      module: 'Can',
      parameter: 'BaudRate',
      value: 1000000,
    });
    expect(next.modules[0].parameters[0].value).toBe(1000000);
    expect(config.modules[0].parameters[0].value).toBe(5000000); // 不可变
  });

  it('静态容器参数按 containerPath 末段定位', () => {
    const config = {
      ...base,
      modules: [
        {
          id: 'can',
          name: 'Can',
          layer: 'ECUAL',
          enabled: true,
          description: '',
          parameters: [],
          containers: [
            {
              id: 'CanConfigSet',
              name: 'CanConfigSet',
              parameters: [{ id: 'baud', name: 'BaudRate', type: 'integer', value: 9 }],
            },
          ],
          dependencies: [],
        },
      ],
    } as ConfigFile;

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
    const config = {
      ...base,
      modules: [
        {
          id: 'nvm',
          name: 'NvM',
          layer: 'ECUAL',
          enabled: false,
          description: '',
          parameters: [],
          containers: [],
          dependencies: [],
        },
      ],
    } as ConfigFile;

    const next = applyFix(config, { kind: 'enable-module', module: 'NvM' });
    expect(next.modules[0].enabled).toBe(true);
  });
});
