import { describe, it, expect } from 'vitest';

import type { ModuleSchema, ModuleParameter, ParameterOption } from '../../types';
import { DependencyGraph } from '../depends';
import { ConstraintPropagator, evaluateExpression } from '../propagator';
import type { PropagationRule, PropagationResult } from '../propagator-types';

// ─── Helpers ──────────────────────────────────────────────────────

function makeParam(name: string, overrides: Partial<ModuleParameter> = {}): ModuleParameter {
  return {
    name,
    type: 'integer',
    ...overrides,
  };
}

function makeSchema(name: string, ...params: ModuleParameter[]): ModuleSchema {
  return {
    name,
    layer: 'MCAL',
    version: '4.4.0',
    parameters: params,
  };
}

function makeOption(value: string | number | boolean, label: string): ParameterOption {
  return { value, label };
}

// ─── evaluateExpression ──────────────────────────────────────────

describe('evaluateExpression', () => {
  it('passthrough: {source} returns the source value directly', () => {
    expect(evaluateExpression('{source}', 500)).toBe(500);
  });

  it('arithmetic: {source} * 2 multiplies', () => {
    expect(evaluateExpression('{source} * 2', 500)).toBe(1000);
  });

  it('arithmetic: {source} + 1000 adds', () => {
    expect(evaluateExpression('{source} + 1000', 500)).toBe(1500);
  });

  it('arithmetic: {source} / 2 divides', () => {
    expect(evaluateExpression('{source} / 2', 1000)).toBe(500);
  });

  it('arithmetic: {source} - 100 subtracts', () => {
    expect(evaluateExpression('{source} - 100', 500)).toBe(400);
  });

  it('arithmetic: complex expression with parentheses', () => {
    expect(evaluateExpression('({source} + 100) * 2', 500)).toBe(1200);
  });

  it('constant expression without {source}', () => {
    expect(evaluateExpression('500', 0)).toBe(500);
  });

  it('ternary: source > 100 ? 500 : 1000 (true branch)', () => {
    expect(evaluateExpression('{source} > 100 ? 500 : 1000', 200)).toBe(500);
  });

  it('ternary: source > 100 ? 500 : 1000 (false branch)', () => {
    expect(evaluateExpression('{source} > 100 ? 500 : 1000', 50)).toBe(1000);
  });

  it('ternary: source == 0 ? true : false', () => {
    expect(evaluateExpression('{source} == 0 ? 1 : 0', 0)).toBe(1);
  });

  it('ternary with arithmeric in branches', () => {
    expect(evaluateExpression('{source} > 100 ? {source} * 2 : {source} / 2', 200)).toBe(400);
  });

  it('negative unary: -{source}', () => {
    expect(evaluateExpression('-{source}', 50)).toBe(-50);
  });

  it('null source returns NaN', () => {
    const result = evaluateExpression('{source} * 2', null);
    expect(Number.isNaN(result)).toBe(true);
  });

  it('undefined source returns NaN', () => {
    const result = evaluateExpression('{source} * 2', undefined);
    expect(Number.isNaN(result)).toBe(true);
  });
});

// ─── DependencyGraph ─────────────────────────────────────────────

describe('DependencyGraph', () => {
  describe('sort (topological)', () => {
    it('returns nodes in topologically sorted order', () => {
      const graph = new DependencyGraph();
      graph.addNode('CanTrcv.maxBaud', ['Can.baudrate']);
      graph.addNode('Can.baudrate', []);
      graph.addNode('Gpt.maxTicks', ['Mcu.clockSpeed']);
      graph.addNode('Mcu.clockSpeed', []);

      const sorted = graph.sort();
      // Sources should come before dependents
      expect(sorted.indexOf('Can.baudrate')).toBeLessThan(sorted.indexOf('CanTrcv.maxBaud'));
      expect(sorted.indexOf('Mcu.clockSpeed')).toBeLessThan(sorted.indexOf('Gpt.maxTicks'));
    });

    it('returns single node graph correctly', () => {
      const graph = new DependencyGraph();
      graph.addNode('Can.baudrate', []);
      expect(graph.sort()).toEqual(['Can.baudrate']);
    });

    it('handles diamond dependencies', () => {
      const graph = new DependencyGraph();
      graph.addNode('A', []);
      graph.addNode('B', ['A']);
      graph.addNode('C', ['A']);
      graph.addNode('D', ['B', 'C']);

      const sorted = graph.sort();
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('B'));
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('D'));
      expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
    });
  });

  describe('detectCycles', () => {
    it('returns empty for acyclic graphs', () => {
      const graph = new DependencyGraph();
      graph.addNode('A', []);
      graph.addNode('B', ['A']);
      graph.addNode('C', ['B']);
      expect(graph.detectCycles()).toHaveLength(0);
    });

    it('detects a simple cycle (A -> B -> A)', () => {
      const graph = new DependencyGraph();
      graph.addNode('A', ['B']);
      graph.addNode('B', ['A']);
      const cycles = graph.detectCycles();
      expect(cycles.length).toBeGreaterThan(0);
      // Each cycle should form a loop
      for (const cycle of cycles) {
        expect(cycle.length).toBeGreaterThan(1);
        expect(cycle[0]).toBe(cycle[cycle.length - 1]);
      }
    });

    it('detects a longer cycle (A -> B -> C -> A)', () => {
      const graph = new DependencyGraph();
      graph.addNode('A', ['B']);
      graph.addNode('B', ['C']);
      graph.addNode('C', ['A']);
      const cycles = graph.detectCycles();
      expect(cycles.length).toBeGreaterThan(0);
      for (const cycle of cycles) {
        expect(cycle.length).toBeGreaterThan(1);
        expect(cycle[0]).toBe(cycle[cycle.length - 1]);
      }
    });

    it('detects self-loop as a cycle', () => {
      const graph = new DependencyGraph();
      graph.addNode('A', ['A']);
      const cycles = graph.detectCycles();
      expect(cycles.length).toBeGreaterThan(0);
    });
  });

  describe('getDependents', () => {
    it('returns all nodes depending on a given key', () => {
      const graph = new DependencyGraph();
      graph.addNode('Can.baudrate', []);
      graph.addNode('CanTrcv.maxBaud', ['Can.baudrate']);
      graph.addNode('CanTrcv.defaultBaud', ['Can.baudrate']);

      const dependents = graph.getDependents('Can.baudrate');
      expect(dependents).toContain('CanTrcv.maxBaud');
      expect(dependents).toContain('CanTrcv.defaultBaud');
      expect(dependents).toHaveLength(2);
    });

    it('returns empty array for unreferenced keys', () => {
      const graph = new DependencyGraph();
      graph.addNode('Can.baudrate', []);
      expect(graph.getDependents('Can.baudrate')).toHaveLength(0);
    });
  });

  describe('getDependencies', () => {
    it('returns the dependencies of a node', () => {
      const graph = new DependencyGraph();
      graph.addNode('CanTrcv.maxBaud', ['Can.baudrate', 'Can.mode']);
      const deps = graph.getDependencies('CanTrcv.maxBaud');
      expect(deps).toEqual(['Can.baudrate', 'Can.mode']);
    });

    it('returns empty array for unknown node', () => {
      const graph = new DependencyGraph();
      expect(graph.getDependencies('Unknown')).toHaveLength(0);
    });
  });
});

// ─── ConstraintPropagator ────────────────────────────────────────

describe('ConstraintPropagator', () => {
  describe('single propagation rule: max field', () => {
    it('Can.baudrate changes → CanTrcv.maxBaud max = source * 2', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Can',
          param: 'baudrate',
          targets: [
            {
              module: 'CanTrcv',
              param: 'maxBaud',
              field: 'max',
              expression: '{source} * 2',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);

      const canTrcv = makeSchema(
        'CanTrcv',
        makeParam('maxBaud', { max: 500 }) // start low; will become 2000
      );
      const can = makeSchema('Can', makeParam('baudrate', { default: 500 }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Can', can);
      schemas.set('CanTrcv', canTrcv);

      const results = propagator.propagate(
        [{ module: 'Can', param: 'baudrate', value: 1000 }],
        schemas
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        source: 'Can.baudrate',
        target: 'CanTrcv.maxBaud',
        field: 'max',
        newValue: 2000,
      });
      // Verify the schema was actually updated
      expect(canTrcv.parameters[0].max).toBe(2000);
    });
  });

  describe('min propagation', () => {
    it('Mcu.clockSpeed changes → Gpt.maxTicks = source / 1000', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Mcu',
          param: 'clockSpeed',
          targets: [
            {
              module: 'Gpt',
              param: 'maxTicks',
              field: 'min',
              expression: '{source} / 1000',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const gpt = makeSchema('Gpt', makeParam('maxTicks', { min: 0 }));
      const mcu = makeSchema('Mcu', makeParam('clockSpeed', { default: 16000000 }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Mcu', mcu);
      schemas.set('Gpt', gpt);

      const results = propagator.propagate(
        [{ module: 'Mcu', param: 'clockSpeed', value: 8000000 }],
        schemas
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        source: 'Mcu.clockSpeed',
        target: 'Gpt.maxTicks',
        field: 'min',
        newValue: 8000,
      });
      expect(gpt.parameters[0].min).toBe(8000);
    });
  });

  describe('default propagation', () => {
    it('Can.baudrate changes → CanTrcv.defaultBaud = source', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Can',
          param: 'baudrate',
          targets: [
            {
              module: 'CanTrcv',
              param: 'defaultBaud',
              field: 'default',
              expression: '{source}',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const canTrcv = makeSchema('CanTrcv', makeParam('defaultBaud', { default: 500 }));
      const can = makeSchema('Can', makeParam('baudrate', { default: 500 }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Can', can);
      schemas.set('CanTrcv', canTrcv);

      const results = propagator.propagate(
        [{ module: 'Can', param: 'baudrate', value: 1000 }],
        schemas
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        target: 'CanTrcv.defaultBaud',
        field: 'default',
        newValue: 1000,
      });
      expect(canTrcv.parameters[0].default).toBe(1000);
    });
  });

  describe('options propagation', () => {
    it('Adc.transferType changes → AdcGroup.conversionMode options filtered', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Adc',
          param: 'transferType',
          targets: [
            {
              module: 'AdcGroup',
              param: 'conversionMode',
              field: 'options',
              expression: '{source}',
              description: 'Update conversion mode options based on transfer type',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const adcGroup = makeSchema(
        'AdcGroup',
        makeParam('conversionMode', {
          type: 'enum',
          options: [makeOption('single', 'Single'), makeOption('continuous', 'Continuous')],
        })
      );
      const adc = makeSchema('Adc', makeParam('transferType', { default: 'hw' }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Adc', adc);
      schemas.set('AdcGroup', adcGroup);

      // The expression is '{source}' which passes through the transferType value
      // For options, this directly sets the value
      const results = propagator.propagate(
        [{ module: 'Adc', param: 'transferType', value: 'hw' }],
        schemas
      );

      expect(results).toHaveLength(1);
      expect(results[0].field).toBe('options');
      expect(results[0].newValue).toBe('hw');
    });
  });

  describe('multiple targets from one source', () => {
    it('one source change updates multiple targets', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Can',
          param: 'baudrate',
          targets: [
            {
              module: 'CanTrcv',
              param: 'maxBaud',
              field: 'max',
              expression: '{source} * 2',
            },
            {
              module: 'CanTrcv',
              param: 'defaultBaud',
              field: 'default',
              expression: '{source}',
            },
            {
              module: 'CanTrcv',
              param: 'minBaud',
              field: 'min',
              expression: '{source} / 2',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const canTrcv = makeSchema(
        'CanTrcv',
        makeParam('maxBaud', { max: 500 }), // will become 2000
        makeParam('defaultBaud', { default: 500 }),
        makeParam('minBaud', { min: 100 })
      );
      const can = makeSchema('Can', makeParam('baudrate', { default: 500 }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Can', can);
      schemas.set('CanTrcv', canTrcv);

      const results = propagator.propagate(
        [{ module: 'Can', param: 'baudrate', value: 1000 }],
        schemas
      );

      expect(results).toHaveLength(3);
      expect(results.map(r => r.target)).toContain('CanTrcv.maxBaud');
      expect(results.map(r => r.target)).toContain('CanTrcv.defaultBaud');
      expect(results.map(r => r.target)).toContain('CanTrcv.minBaud');
      expect(canTrcv.parameters[0].max).toBe(2000);
      expect(canTrcv.parameters[1].default).toBe(1000);
      expect(canTrcv.parameters[2].min).toBe(500);
    });
  });

  describe('no propagation for unchanged params', () => {
    it('returns empty when no rules match changed params', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Can',
          param: 'baudrate',
          targets: [
            {
              module: 'CanTrcv',
              param: 'maxBaud',
              field: 'max',
              expression: '{source} * 2',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const canTrcv = makeSchema('CanTrcv', makeParam('maxBaud', { max: 2000 }));
      const mcu = makeSchema('Mcu', makeParam('clockSpeed', { default: 16000000 }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Mcu', mcu);
      schemas.set('CanTrcv', canTrcv);

      const results = propagator.propagate(
        [{ module: 'Mcu', param: 'clockSpeed', value: 8000000 }],
        schemas
      );

      expect(results).toHaveLength(0);
    });

    it('returns empty when schema not found', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Can',
          param: 'baudrate',
          targets: [
            {
              module: 'Missing',
              param: 'param',
              field: 'max',
              expression: '{source} * 2',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const can = makeSchema('Can', makeParam('baudrate', { default: 500 }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Can', can);

      const results = propagator.propagate(
        [{ module: 'Can', param: 'baudrate', value: 1000 }],
        schemas
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('dependency graph integration', () => {
    it('getDependencyGraph builds correct graph from rules', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Can',
          param: 'baudrate',
          targets: [
            {
              module: 'CanTrcv',
              param: 'maxBaud',
              field: 'max',
              expression: '{source} * 2',
            },
          ],
        },
        {
          module: 'Mcu',
          param: 'clockSpeed',
          targets: [
            {
              module: 'Gpt',
              param: 'maxTicks',
              field: 'min',
              expression: '{source} / 1000',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const graph = propagator.getDependencyGraph();

      const sorted = graph.sort();
      // Can.baudrate should come before CanTrcv.maxBaud
      expect(sorted.indexOf('Can.baudrate')).toBeLessThan(sorted.indexOf('CanTrcv.maxBaud'));
      // Mcu.clockSpeed should come before Gpt.maxTicks
      expect(sorted.indexOf('Mcu.clockSpeed')).toBeLessThan(sorted.indexOf('Gpt.maxTicks'));
    });

    it('detects cycles in the dependency graph', () => {
      const rules: PropagationRule[] = [
        {
          module: 'A',
          param: 'x',
          targets: [
            {
              module: 'B',
              param: 'y',
              field: 'max',
              expression: '{source} * 2',
            },
          ],
        },
        {
          module: 'B',
          param: 'y',
          targets: [
            {
              module: 'A',
              param: 'x',
              field: 'min',
              expression: '{source} / 2',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const graph = propagator.getDependencyGraph();
      const cycles = graph.detectCycles();
      expect(cycles.length).toBeGreaterThan(0);
    });
  });

  describe('ternary expression evaluation in propagation', () => {
    it('source > 100 ? 500 : 1000 — selects correct branch', () => {
      const rules: PropagationRule[] = [
        {
          module: 'Can',
          param: 'baudrate',
          targets: [
            {
              module: 'CanTrcv',
              param: 'maxBaud',
              field: 'max',
              expression: '{source} > 100 ? 500 : 1000',
            },
          ],
        },
      ];

      const propagator = new ConstraintPropagator(rules);
      const canTrcv = makeSchema('CanTrcv', makeParam('maxBaud', { max: 2000 }));
      const can = makeSchema('Can', makeParam('baudrate', { default: 500 }));

      const schemas = new Map<string, ModuleSchema>();
      schemas.set('Can', can);
      schemas.set('CanTrcv', canTrcv);

      // source=200 (>100) → true branch → 500
      const results1 = propagator.propagate(
        [{ module: 'Can', param: 'baudrate', value: 200 }],
        schemas
      );
      expect(results1[0].newValue).toBe(500);

      // Reset
      canTrcv.parameters[0].max = 2000;

      // source=50 (<100) → false branch → 1000
      const results2 = propagator.propagate(
        [{ module: 'Can', param: 'baudrate', value: 50 }],
        schemas
      );
      expect(results2[0].newValue).toBe(1000);
    });
  });
});
