import { describe, it, expect } from 'vitest';

import { DependencyValidator } from '../DependencyValidator';

import type {
  ConfigFile,
  ConfigModule,
  ConfigContainer,
  ConfigParameter,
  ValidationIssue,
  ValidationResult,
} from '@/types/config';

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

// ============================================================================
// YAC-DEP-002：validateCrossModuleReferences — 14 条隐式规则全覆盖
// 规则表与 apps/yuleasr-web/src/core/DependencyValidator.ts:306-319 逐条对应
// ============================================================================

const IMPLICIT_RULES: ReadonlyArray<{
  source: string;
  target: string;
  severity: 'error' | 'warning' | 'info';
}> = [
  { source: 'Can', target: 'CanTrcv', severity: 'error' },
  { source: 'CanTp', target: 'Can', severity: 'error' },
  { source: 'CanNm', target: 'Can', severity: 'error' },
  { source: 'CanSM', target: 'Can', severity: 'error' },
  { source: 'CanSM', target: 'CanNm', severity: 'error' },
  { source: 'Dcm', target: 'CanTp', severity: 'warning' },
  { source: 'NvM', target: 'Fee', severity: 'warning' },
  { source: 'NvM', target: 'Fls', severity: 'warning' },
  { source: 'EcuM', target: 'Mcu', severity: 'warning' },
  { source: 'Csm', target: 'Crypto', severity: 'warning' },
  { source: 'Csm', target: 'CryIf', severity: 'warning' },
  { source: 'Crypto', target: 'CryIf', severity: 'error' },
  { source: 'CanIf', target: 'Can', severity: 'error' },
  { source: 'PduR', target: 'Can', severity: 'info' },
];

function crossModuleIssues(
  result: ValidationResult,
  source: string,
  target: string,
  fragment: string
): ValidationIssue[] {
  return result.errors
    .concat(result.warnings, result.info)
    .filter(
      i =>
        i.path === `${source}.dependencies` &&
        i.message.includes(`"${target}"`) &&
        i.message.includes(fragment)
    );
}

function bucketOf(
  result: ValidationResult,
  severity: 'error' | 'warning' | 'info'
): ValidationIssue[] {
  if (severity === 'error') return result.errors;
  if (severity === 'warning') return result.warnings;
  return result.info;
}

const OTHER_SEVERITIES = ['error', 'warning', 'info'] as const;

describe('DependencyValidator validateCrossModuleReferences (YAC-DEP-002)', () => {
  it.each(IMPLICIT_RULES)(
    '规则 $source→$target：目标模块存在但未启用时产生 $severity 级 issue（分支 A）',
    ({ source, target, severity }) => {
      const config = makeConfig([
        makeModule(`m-${source}`, source),
        makeModule(`m-${target}`, target, { enabled: false }),
      ]);

      const result = DependencyValidator.validate(config);

      // 目标模块存在但未启用 → 「not enabled」分支
      const hits = crossModuleIssues(result, source, target, 'which is not enabled');
      expect(hits.length).toBeGreaterThan(0);
      for (const h of hits) {
        expect(h.severity).toBe(severity);
        expect(bucketOf(result, severity)).toContain(h);
      }

      // 该关系不应出现在其它 severity 桶中
      for (const other of OTHER_SEVERITIES.filter(s => s !== severity)) {
        expect(
          bucketOf(result, other).some(
            i =>
              i.message.includes(`"${target}"`) && i.message.includes('which is not enabled')
          )
        ).toBe(false);
      }
    }
  );

  it.each(IMPLICIT_RULES)(
    '规则 $source→$target：目标模块不在配置中时产生 $severity 级 issue（分支 B）',
    ({ source, target, severity }) => {
      const config = makeConfig([makeModule(`m-${source}`, source)]);

      const result = DependencyValidator.validate(config);

      // 目标模块不在配置中 → 「not in the configuration」分支
      const hits = crossModuleIssues(result, source, target, 'which is not in the configuration');
      expect(hits.length).toBeGreaterThan(0);
      for (const h of hits) {
        expect(h.severity).toBe(severity);
        expect(bucketOf(result, severity)).toContain(h);
      }
    }
  );

  it('14 条规则的源模块与目标模块全部启用时不产生任何 issue', () => {
    const names = new Set<string>();
    for (const rule of IMPLICIT_RULES) {
      names.add(rule.source);
      names.add(rule.target);
    }

    const config = makeConfig([...names].map(n => makeModule(`m-${n}`, n)));
    const result = DependencyValidator.validate(config);

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.info).toHaveLength(0);
  });
});

// ============================================================================
// YAC-DEP-002：validateModuleDependencies — 模块依赖启用检查
// ============================================================================

describe('DependencyValidator validateModuleDependencies (YAC-DEP-002)', () => {
  it('required 依赖未启用 → error，且带目标模块信息', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        dependencies: [{ module: 'Port', required: true }],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    const err = result.errors.find(
      e => e.dependencySource === 'Can' && e.dependencyTarget === 'Port'
    );
    expect(err).toBeDefined();
    expect(err?.severity).toBe('error');
    expect(err?.message).toContain('Module "Can" requires "Port" which is not enabled');
    expect(err?.path).toBe('Can.dependencies');
  });

  it('required + autoEnable 依赖未启用 → error 且建议自动启用，getAutoEnableSuggestions 返回建议', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        dependencies: [{ module: 'Port', required: true, autoEnable: true }],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    const err = result.errors.find(e => e.dependencyTarget === 'Port');
    expect(err?.suggestion).toContain('automatically');
    expect(new DependencyValidator(config).getAutoEnableSuggestions()).toEqual([
      { source: 'Can', target: 'Port' },
    ]);
  });

  it('optional 依赖未启用 → info（不产生 error/warning）', () => {
    const config = makeConfig([
      makeModule('m-cantrcv', 'CanTrcv', {
        dependencies: [{ module: 'Dio', required: false }],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    const info = result.info.find(
      e => e.dependencySource === 'CanTrcv' && e.dependencyTarget === 'Dio'
    );
    expect(info).toBeDefined();
    expect(info?.severity).toBe('info');
    expect(info?.message).toContain('Optional dependency "Dio" for "CanTrcv" is not enabled');
    expect(result.errors.some(e => e.dependencyTarget === 'Dio')).toBe(false);
    expect(result.warnings.some(e => e.dependencyTarget === 'Dio')).toBe(false);
  });

  it('required 依赖已启用 → 不产生依赖相关 issue', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        dependencies: [{ module: 'Port', required: true }],
      }),
      makeModule('m-port', 'Port'),
    ]);

    const result = DependencyValidator.validate(config);
    expect(result.errors.some(e => e.dependencyTarget === 'Port')).toBe(false);
  });

  it('未启用源模块的依赖不参与检查', () => {
    const config = makeConfig([
      makeModule('m-can', 'Can', {
        dependencies: [{ module: 'Port', required: true }],
      }),
      makeModule('m-gpt', 'Gpt', {
        enabled: false,
        dependencies: [{ module: 'Mcu', required: true }],
      }),
    ]);

    const result = DependencyValidator.validate(config);
    const targets = result.errors.map(e => e.dependencyTarget);
    expect(targets).toContain('Port');
    expect(targets).not.toContain('Mcu');
  });

  it('autoEnable 建议仅含 required+autoEnable 且未启用的目标；目标启用后建议消失', () => {
    const deps = [
      { module: 'Port', required: true, autoEnable: true },
      { module: 'Dio', required: true },
      { module: 'Icu', required: false, autoEnable: true },
    ];

    const config1 = makeConfig([makeModule('m-can', 'Can', { dependencies: deps })]);
    const validator1 = new DependencyValidator(config1);
    expect(validator1.getAutoEnableSuggestions()).toEqual([{ source: 'Can', target: 'Port' }]);

    const result1 = validator1.validate();
    const portErr = result1.errors.find(e => e.dependencyTarget === 'Port');
    expect(portErr?.suggestion).toBe('Enable Port automatically');
    // 未声名 autoEnable 的 required 依赖不进建议列表
    expect(
      result1.errors.some(e => e.dependencyTarget === 'Dio' && e.suggestion?.includes('automatically'))
    ).toBe(false);

    const config2 = makeConfig([
      makeModule('m-can', 'Can', { dependencies: deps }),
      makeModule('m-port', 'Port'),
    ]);
    expect(new DependencyValidator(config2).getAutoEnableSuggestions()).toEqual([]);
  });
});
