import { describe, it, expect } from 'vitest';

import { DependencyValidator } from '../DependencyValidator';

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

function makeModule(
  id: string,
  name: string,
  overrides: Partial<ConfigModule> = {}
): ConfigModule {
  return {
    id,
    name,
    version: '4.4.0',
    autosarVersion: '4.4.0',
    enabled: true,
    layer: 'MCAL',
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

describe('DependencyValidator required check (Fix 25)', () => {
  it('flags null values for required parameters', () => {
    const config = makeConfig([
      makeModule('m1', 'Can', {
        parameters: [
          makeParam('p1', 'CanBaudrate', null, { validation: { required: true } }),
        ],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    const err = result.errors.find(e => e.parameter === 'CanBaudrate');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
  });

  it('flags undefined values for required parameters', () => {
    const config = makeConfig([
      makeModule('m1', 'Can', {
        parameters: [
          makeParam('p1', 'CanBaudrate', undefined, { validation: { required: true } }),
        ],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    expect(result.errors.some(e => e.parameter === 'CanBaudrate')).toBe(true);
  });

  it('flags empty-string values for required parameters', () => {
    const config = makeConfig([
      makeModule('m1', 'Can', {
        parameters: [
          makeParam('p1', 'CanBaudrate', '', { validation: { required: true } }),
        ],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    expect(result.errors.some(e => e.parameter === 'CanBaudrate')).toBe(true);
  });

  it('does not flag present values (including 0 / false) for required parameters', () => {
    const config = makeConfig([
      makeModule('m1', 'Can', {
        parameters: [
          makeParam('p1', 'CanCount', 0, { validation: { required: true } }),
          makeParam('p2', 'CanEnabled', false, { validation: { required: true } }),
        ],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    expect(result.errors.filter(e => e.parameter === 'CanCount' || e.parameter === 'CanEnabled')).toHaveLength(0);
  });
});

describe('DependencyValidator validateRTEConsistency (Fix 25 minimal)', () => {
  it('reports ports referencing non-existent interfaces', () => {
    const config = makeConfig([
      makeModule('rte1', 'Rte', {
        layer: 'RTE',
        containers: [
          makeContainer('if1', 'SenderReceiverInterfaces', [
            makeParam('i1', 'VehicleSpeed_IF', 'VehicleSpeed_IF'),
            makeParam('i2', 'EngineSpeed_IF', 'EngineSpeed_IF'),
          ]),
          makeContainer('pt1', 'SenderReceiverPorts', [
            makeParam('r1', 'VehicleSpeed_Port', 'VehicleSpeed_IF', { type: 'reference' }),
            makeParam('r2', 'MissingPort', 'NonExistent_IF', { type: 'reference' }),
          ]),
        ],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    const err = result.errors.find(e => e.parameter === 'MissingPort');
    expect(err).toBeDefined();
    expect(err?.message).toContain('NonExistent_IF');
    // Valid reference must not produce an error
    expect(result.errors.some(e => e.parameter === 'VehicleSpeed_Port')).toBe(false);
  });

  it('passes when all port references exist', () => {
    const config = makeConfig([
      makeModule('rte1', 'Rte', {
        layer: 'RTE',
        containers: [
          makeContainer('if1', 'Interfaces', [
            makeParam('i1', 'CanIf_Tx', 'CanIf_Tx'),
          ]),
          makeContainer('pt1', 'Ports', [
            makeParam('r1', 'CanTxPort', 'CanIf_Tx', { type: 'reference' }),
          ]),
        ],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    expect(result.errors.filter(e => e.message.includes('interface'))).toHaveLength(0);
  });

  it('reports structural error when ports exist but no interface containers', () => {
    const config = makeConfig([
      makeModule('rte1', 'Rte', {
        layer: 'RTE',
        containers: [
          makeContainer('pt1', 'Ports', [
            makeParam('r1', 'SomePort', 'Some_IF', { type: 'reference' }),
          ]),
        ],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    expect(result.errors.some(e => e.message.includes('no interface containers'))).toBe(true);
  });

  it('is a no-op when no RTE module exists', () => {
    const config = makeConfig([
      makeModule('m1', 'Can', { containers: [makeContainer('c1', 'Ports', [])] }),
    ]);

    const result = DependencyValidator.validate(config);
    expect(result.errors.filter(e => e.message.includes('interface'))).toHaveLength(0);
  });
});
