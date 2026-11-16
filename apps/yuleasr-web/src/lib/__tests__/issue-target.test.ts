import { describe, it, expect } from 'vitest';

import { issueToConfigPath } from '@/lib/issue-target';
import type { ConfigFile } from '@/types';

const config = {
  id: 'c1',
  name: 't',
  targetChip: 'x',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  modules: [
    {
      id: 'can',
      name: 'Can',
      layer: 'ECUAL',
      enabled: true,
      description: '',
      parameters: [],
      containers: [{ id: 'CanConfigSet', name: 'CanConfigSet', parameters: [], subContainers: [] }],
      dependencies: [],
    },
  ],
} as unknown as ConfigFile;

describe('issueToConfigPath', () => {
  it('模块级问题定位到模块', () => {
    expect(
      issueToConfigPath(config, {
        id: '1',
        path: 'Can.BaudRate',
        message: '',
        severity: 'error',
        module: 'Can',
      })
    ).toBe('layer:ECUAL/module:can');
  });

  it('容器问题定位到容器', () => {
    expect(
      issueToConfigPath(config, {
        id: '2',
        path: 'Can.CanConfigSet.BaudRate',
        message: '',
        severity: 'error',
        module: 'Can',
        container: 'CanConfigSet',
      })
    ).toBe('layer:ECUAL/module:can/container:CanConfigSet');
  });

  it('模块不存在返回 null', () => {
    expect(
      issueToConfigPath(config, {
        id: '3',
        path: 'X.Y',
        message: '',
        severity: 'error',
        module: 'X',
      })
    ).toBeNull();
  });
});
