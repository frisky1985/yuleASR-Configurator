import { describe, it, expect } from 'vitest';

import {
  uiModuleToGenerator,
  buildModuleSchema,
  buildModuleConfig,
  getModuleShortName,
} from '../ui-adapter';

import type { ConfigModule, ConfigContainer, ConfigParameter } from '@/types/config';

function makeModule(overrides: Partial<ConfigModule> = {}): ConfigModule {
  return {
    id: 'can',
    name: 'Can',
    displayName: 'CAN Driver',
    version: '4.4.0',
    autosarVersion: '4.4.0',
    enabled: true,
    layer: 'MCAL',
    parameters: [],
    containers: [],
    dependencies: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    configStatus: 'configured',
    ...overrides,
  };
}

describe('getModuleShortName', () => {
  it('handles already-short names', () => {
    expect(getModuleShortName(makeModule({ name: 'Can' }))).toBe('Can');
    expect(getModuleShortName(makeModule({ name: 'Mcu' }))).toBe('Mcu');
  });

  it('extracts short name from display names', () => {
    expect(getModuleShortName(makeModule({ name: 'ADC Driver' }))).toBe('Adc');
    expect(getModuleShortName(makeModule({ name: 'CAN Driver' }))).toBe('Can');
    expect(getModuleShortName(makeModule({ name: 'PORT Driver' }))).toBe('Port');
  });
});

describe('buildModuleSchema', () => {
  it('builds schema with parameters from non-multiple containers', () => {
    const module = makeModule({
      containers: [
        {
          id: 'cangeneral',
          name: 'CanGeneral',
          parameters: [
            { id: 'det', name: 'CanDevErrorDetect', type: 'boolean', value: true },
            { id: 'ver', name: 'CanVersionInfoApi', type: 'boolean', value: false },
          ],
        },
      ],
    });
    const schema = buildModuleSchema(module, 'Can');
    expect(schema.name).toBe('Can');
    expect(schema.label).toBe('CAN Driver');
    expect(schema.layer).toBe('MCAL');
    expect(schema.version).toBe('4.4.0');
    expect(schema.parameters).toHaveLength(2);
    expect(schema.parameters[0].name).toBe('CanDevErrorDetect');
    expect(schema.parameters[0].type).toBe('boolean');
  });

  it('builds container schema from multiple containers with subContainers', () => {
    const module = makeModule({
      containers: [
        {
          id: 'canconfigset',
          name: 'CanConfigSet',
          multiple: true,
          minInstances: 0,
          parameters: [],
          subContainers: [
            {
              id: 'ctrl0',
              name: 'CanController_0',
              shortName: 'CanController',
              parameters: [
                { id: 'baud', name: 'CanControllerBaudRate', type: 'integer', value: 500000 },
                { id: 'id', name: 'CanControllerId', type: 'integer', value: 0 },
              ],
            },
          ],
        },
      ],
    });
    const schema = buildModuleSchema(module, 'Can');
    expect(schema.containers).toHaveLength(1);
    expect(schema.containers[0].name).toBe('CanController');
    expect(schema.containers[0].multiple).toBe(true);
    expect(schema.containers[0].parameters).toContain('CanControllerBaudRate');
    expect(schema.containers[0].parameters).toContain('CanControllerId');
  });
});

describe('buildModuleConfig', () => {
  it('extracts parameters from non-multiple container parameters', () => {
    const module = makeModule({
      containers: [
        {
          id: 'cangeneral',
          name: 'CanGeneral',
          parameters: [{ id: 'det', name: 'CanDevErrorDetect', type: 'boolean', value: true }],
        },
      ],
    });
    const config = buildModuleConfig(module, 'Can');
    expect(config.module).toBe('Can');
    expect(config.parameters.CanDevErrorDetect).toBe(true);
  });

  it('builds container instances from multiple containers', () => {
    const module = makeModule({
      containers: [
        {
          id: 'canconfigset',
          name: 'CanConfigSet',
          multiple: true,
          parameters: [],
          subContainers: [
            {
              id: 'ctrl0',
              name: 'CanController_0',
              shortName: 'CanController',
              parameters: [
                { id: 'baud', name: 'CanControllerBaudRate', type: 'integer', value: 500000 },
              ],
            },
            {
              id: 'ctrl1',
              name: 'CanController_1',
              shortName: 'CanController',
              parameters: [
                { id: 'baud', name: 'CanControllerBaudRate', type: 'integer', value: 250000 },
              ],
            },
          ],
        },
      ],
    });
    const config = buildModuleConfig(module, 'Can');
    expect(config.containers).toBeDefined();
    expect(config.containers!['CanController']).toHaveLength(2);
    expect(config.containers!['CanController'][0].parameters.CanControllerBaudRate).toBe(500000);
    expect(config.containers!['CanController'][1].parameters.CanControllerBaudRate).toBe(250000);
  });
});

describe('uiModuleToGenerator', () => {
  it('returns null for disabled module', () => {
    const module = makeModule({ enabled: false });
    expect(uiModuleToGenerator(module)).toBeNull();
  });

  it('produces valid schema + config pair for a configured module', () => {
    const module = makeModule({
      containers: [
        {
          id: 'cangeneral',
          name: 'CanGeneral',
          parameters: [{ id: 'det', name: 'CanDevErrorDetect', type: 'boolean', value: false }],
        },
        {
          id: 'canconfigset',
          name: 'CanConfigSet',
          multiple: true,
          parameters: [],
          subContainers: [
            {
              id: 'ctrl0',
              name: 'CanController_0',
              shortName: 'CanController',
              parameters: [
                { id: 'baud', name: 'CanControllerBaudRate', type: 'integer', value: 500000 },
              ],
            },
          ],
        },
      ],
    });
    const result = uiModuleToGenerator(module);
    expect(result).not.toBeNull();
    expect(result!.schema.name).toBe('Can');
    expect(result!.config.module).toBe('Can');
    // Schema should have params from non-multiple containers
    expect(result!.schema.parameters.some(p => p.name === 'CanDevErrorDetect')).toBe(true);
    // And containers from multiple containers
    expect(result!.schema.containers).toHaveLength(1);
    expect(result!.schema.containers[0].name).toBe('CanController');
  });
});
