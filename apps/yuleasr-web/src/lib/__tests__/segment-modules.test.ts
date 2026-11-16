import { describe, it, expect } from 'vitest';

import { modulesForSegment } from '@/lib/segment-modules';
import type { ConfigFile } from '@/types';

type Module = ConfigFile['modules'][number];

const mod = (name: string, layer: Module['layer']): Module =>
  ({
    id: name.toLowerCase(),
    name,
    layer,
    enabled: true,
    description: '',
    parameters: [],
    containers: [],
    dependencies: [],
  }) as unknown as Module;

const config = {
  id: 'c1',
  name: 't',
  targetChip: 'x',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  modules: [
    mod('Can', 'ECUAL'),
    mod('Com', 'ECUAL'),
    mod('Dem', 'ECUAL'),
    mod('Os', 'OS'),
    mod('Mcu', 'MCAL'),
    mod('CanSM', 'ECUAL'),
  ],
} as ConfigFile;

const names = (list: Module[]) => list.map(m => m.name);

describe('modulesForSegment', () => {
  it('basic 与 generate 返回全部模块', () => {
    expect(names(modulesForSegment(config, 'basic'))).toHaveLength(6);
    expect(names(modulesForSegment(config, 'generate'))).toHaveLength(6);
  });

  it('communication 只保留通信模块', () => {
    expect(names(modulesForSegment(config, 'communication'))).toEqual(['Can', 'Com', 'CanSM']);
  });

  it('diagnostics 只保留诊断模块', () => {
    expect(names(modulesForSegment(config, 'diagnostics'))).toEqual(['Dem']);
  });

  it('bsw 保留 ECUAL / Service / OS 层', () => {
    expect(names(modulesForSegment(config, 'bsw'))).toEqual(['Can', 'Com', 'Dem', 'Os', 'CanSM']);
  });
});
