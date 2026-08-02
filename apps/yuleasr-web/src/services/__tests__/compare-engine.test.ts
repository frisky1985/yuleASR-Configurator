import { describe, it, expect } from 'vitest';

import { configComparer } from '../compareEngine';

import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config';

function makeParam(id: string, name: string, value: unknown): ConfigParameter {
  return { id, name, type: 'integer', value } as ConfigParameter;
}

function makeContainer(
  id: string,
  name: string,
  params: ConfigParameter[] = [],
  subContainers: ConfigContainer[] = []
): ConfigContainer {
  return { id, name, parameters: params, subContainers };
}

function makeModule(
  id: string,
  name: string,
  containers: ConfigContainer[] = [],
  parameters: ConfigParameter[] = []
): ConfigModule {
  return {
    id,
    name,
    displayName: name,
    version: '4.4.0',
    autosarVersion: '4.4.0',
    enabled: true,
    layer: 'MCAL',
    containers,
    parameters,
    dependencies: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    configStatus: 'configured',
  };
}

function makeConfig(id: string, modules: ConfigModule[]): ConfigFile {
  return {
    id,
    name: `Config ${id}`,
    modules,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('configComparer.compare', () => {
  it('assigns unified containerPath keys for top-level and sub containers', () => {
    const configA = makeConfig('a', [
      makeModule('m1', 'Can', [
        makeContainer('c1', 'CanGeneral', [makeParam('p1', 'Baudrate', 500)]),
      ]),
    ]);
    const configB = makeConfig('b', [
      makeModule('m1', 'Can', [
        makeContainer('c1', 'CanGeneral', [makeParam('p1', 'Baudrate', 250)]),
      ]),
    ]);

    const result = configComparer.compare(configA, configB);

    // Top-level container path
    const topContainer = result.containerDiffs.find(c => c.containerId === 'c1');
    expect(topContainer?.containerPath).toBe('Can.CanGeneral');

    // Top-level param diff uses the same key
    const topParam = result.paramDiffs.find(p => p.parameterId === 'p1');
    expect(topParam?.containerPath).toBe('Can.CanGeneral');
  });

  it('associates sub-container param diffs with the correct container node (Fix 25)', () => {
    // Sub-container param value differs between A and B
    const configA = makeConfig('a', [
      makeModule('m1', 'Can', [
        makeContainer('c1', 'CanGeneral', [], [
          makeContainer('sub1', 'CanFilter', [makeParam('p2', 'FilterCount', 4)]),
        ]),
      ]),
    ]);
    const configB = makeConfig('b', [
      makeModule('m1', 'Can', [
        makeContainer('c1', 'CanGeneral', [], [
          makeContainer('sub1', 'CanFilter', [makeParam('p2', 'FilterCount', 8)]),
        ]),
      ]),
    ]);

    const result = configComparer.compare(configA, configB);

    // Sub-container diff exists with unified path
    const subContainer = result.containerDiffs.find(c => c.containerId === 'sub1');
    expect(subContainer).toBeDefined();
    expect(subContainer?.containerPath).toBe('Can.CanGeneral.CanFilter');

    // Sub-container param diff uses the same unified key
    const subParam = result.paramDiffs.find(p => p.parameterId === 'p2');
    expect(subParam?.containerPath).toBe('Can.CanGeneral.CanFilter');

    // buildDiffTree: the param must appear under the sub-container node
    const tree = configComparer.buildDiffTree(result);
    const moduleNode = tree.find(n => n.name === 'Can');
    expect(moduleNode).toBeDefined();
    const generalNode = moduleNode?.children?.find(n => n.name === 'CanGeneral');
    expect(generalNode).toBeDefined();
    const filterNode = generalNode?.children?.find(n => n.name === 'CanFilter');
    expect(filterNode).toBeDefined();
    expect(filterNode?.path).toBe('Can.CanGeneral.CanFilter');
    const paramNode = filterNode?.children?.find(n => n.name === 'FilterCount');
    expect(paramNode).toBeDefined();
    expect(paramNode?.status).toBe('different');
    expect(paramNode?.oldValue).toBe(4);
    expect(paramNode?.newValue).toBe(8);
  });

  it('includes sub-container params even when parent container has no own params', () => {
    const configA = makeConfig('a', [
      makeModule('m1', 'Mcu', [
        makeContainer('c1', 'McuGeneral', [], [
          makeContainer('sub1', 'McuClockRef', [makeParam('p3', 'ClockRef', 'SysClk')]),
        ]),
      ]),
    ]);
    const configB = makeConfig('b', [
      makeModule('m1', 'Mcu', [
        makeContainer('c1', 'McuGeneral', [], [
          makeContainer('sub1', 'McuClockRef', [makeParam('p3', 'ClockRef', 'AltClk')]),
        ]),
      ]),
    ]);

    const result = configComparer.compare(configA, configB);
    const tree = configComparer.buildDiffTree(result);

    const moduleNode = tree.find(n => n.name === 'Mcu');
    const generalNode = moduleNode?.children?.find(n => n.name === 'McuGeneral');
    const clockRefNode = generalNode?.children?.find(n => n.name === 'McuClockRef');
    expect(clockRefNode?.children?.some(n => n.name === 'ClockRef')).toBe(true);
  });

  it('handles module only in A with sub-container params', () => {
    const configA = makeConfig('a', [
      makeModule('m1', 'Can', [
        makeContainer('c1', 'CanGeneral', [], [
          makeContainer('sub1', 'CanFilter', [makeParam('p2', 'FilterCount', 4)]),
        ]),
      ]),
    ]);
    const configB = makeConfig('b', []);

    const result = configComparer.compare(configA, configB);

    const subContainer = result.containerDiffs.find(c => c.containerId === 'sub1');
    expect(subContainer?.containerPath).toBe('Can.CanGeneral.CanFilter');
    expect(subContainer?.status).toBe('only_a');

    const subParam = result.paramDiffs.find(p => p.parameterId === 'p2');
    expect(subParam?.containerPath).toBe('Can.CanGeneral.CanFilter');
    expect(subParam?.status).toBe('only_a');

    // Tree must associate the sub param with the sub container node
    const tree = configComparer.buildDiffTree(result);
    const moduleNode = tree.find(n => n.name === 'Can');
    const generalNode = moduleNode?.children?.find(n => n.name === 'CanGeneral');
    const filterNode = generalNode?.children?.find(n => n.name === 'CanFilter');
    expect(filterNode?.children?.some(n => n.name === 'FilterCount')).toBe(true);
  });
});
