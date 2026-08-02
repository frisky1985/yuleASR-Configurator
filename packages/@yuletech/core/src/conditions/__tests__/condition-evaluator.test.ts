import { describe, it, expect } from 'vitest';

import type { ModuleConfig } from '../../types';
import { ConditionEvaluator, evaluateCondition } from '../evaluator';
import { parseCondition, SyntaxError } from '../parser';

/**
 * Helper: create a minimal ModuleConfig for testing.
 */
function makeConfig(module: string, params: Record<string, unknown> = {}): ModuleConfig {
  return {
    module,
    version: '4.4.0',
    parameters: params,
    ...(params._containers ? { containers: params._containers as Record<string, any[]> } : {}),
  };
}

/**
 * Helper: quickly evaluate a string expression.
 */
function evalExpr(expression: string, configs: ModuleConfig[]): boolean {
  const evaluator = new ConditionEvaluator();
  const expr = parseCondition(expression);
  return evaluator.evaluate(expr, configs);
}

// ─── ConditionEvaluator.evaluate() ──────────────────────────────────

describe('ConditionEvaluator', () => {
  describe('PathExpr — simple module.param resolution', () => {
    it('resolves Can.baudrate == 500 → true when value matches', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Can.baudrate == 500', configs)).toBe(true);
    });

    it('resolves Can.baudrate == 500 → false when value differs', () => {
      const configs = [makeConfig('Can', { baudrate: 250 })];
      expect(evalExpr('Can.baudrate == 500', configs)).toBe(false);
    });

    it('resolves Can.baudrate > 100 && Can.baudrate < 1000 → true', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Can.baudrate > 100 && Can.baudrate < 1000', configs)).toBe(true);
    });

    it('resolves Mcu.enabled || Can.enabled → true when either is true', () => {
      const configs = [makeConfig('Mcu', { enabled: false }), makeConfig('Can', { enabled: true })];
      expect(evalExpr('Mcu.enabled || Can.enabled', configs)).toBe(true);
    });

    it('resolves Mcu.enabled || Can.enabled → false when both are false', () => {
      const configs = [
        makeConfig('Mcu', { enabled: false }),
        makeConfig('Can', { enabled: false }),
      ];
      expect(evalExpr('Mcu.enabled || Can.enabled', configs)).toBe(false);
    });

    it('negation: !Can.enabled flips boolean', () => {
      const configs = [makeConfig('Can', { enabled: false })];
      expect(evalExpr('!Can.enabled', configs)).toBe(true);
    });

    it('negation: !!Can.enabled is identity', () => {
      const configs = [makeConfig('Can', { enabled: true })];
      expect(evalExpr('!!Can.enabled', configs)).toBe(true);
    });
  });

  describe('PathExpr — container path resolution', () => {
    it('Port.containers[0].direction == "DIO" resolves container path', () => {
      const configs = [
        makeConfig('Port', {
          _containers: {
            containers: [
              { id: '0', parameters: { direction: 'DIO' } },
              { id: '1', parameters: { direction: 'ANALOG' } },
            ],
          },
        }),
      ];
      expect(evalExpr('Port.containers[0].direction == "DIO"', configs)).toBe(true);
    });

    it('Port.containers[1].direction == "DIO" → false for different index', () => {
      const configs = [
        makeConfig('Port', {
          _containers: {
            containers: [
              { id: '0', parameters: { direction: 'DIO' } },
              { id: '1', parameters: { direction: 'ANALOG' } },
            ],
          },
        }),
      ];
      expect(evalExpr('Port.containers[1].direction == "DIO"', configs)).toBe(false);
    });
  });

  describe('Unresolved paths — fail closed', () => {
    it('returns false when module does not exist in configs', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Mcu.clockSpeed == 100', configs)).toBe(false);
    });

    it('returns false when parameter does not exist in config', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Can.nonExistentParam == 100', configs)).toBe(false);
    });

    it('returns false for container path with non-existent container', () => {
      const configs = [makeConfig('Port', { parameters: {} })];
      expect(evalExpr('Port.containers[0].direction == "DIO"', configs)).toBe(false);
    });

    it('returns false for container path with out-of-bounds index', () => {
      const configs = [
        makeConfig('Port', {
          _containers: {
            containers: [{ id: '0', parameters: { direction: 'DIO' } }],
          },
        }),
      ];
      expect(evalExpr('Port.containers[5].direction == "DIO"', configs)).toBe(false);
    });
  });

  describe('String literal comparisons', () => {
    it('Can.mode == "normal" → true when strings match', () => {
      const configs = [makeConfig('Can', { mode: 'normal' })];
      expect(evalExpr('Can.mode == "normal"', configs)).toBe(true);
    });

    it('Can.mode == "normal" → false when strings differ', () => {
      const configs = [makeConfig('Can', { mode: 'sleep' })];
      expect(evalExpr('Can.mode == "normal"', configs)).toBe(false);
    });

    it('Can.mode != "normal" → true when strings differ', () => {
      const configs = [makeConfig('Can', { mode: 'sleep' })];
      expect(evalExpr('Can.mode != "normal"', configs)).toBe(true);
    });

    it('supports single-quoted strings', () => {
      const configs = [makeConfig('Can', { mode: 'normal' })];
      expect(evalExpr("Can.mode == 'normal'", configs)).toBe(true);
    });
  });

  describe('null comparison', () => {
    it('Can.value == null → true when value is null', () => {
      const configs = [makeConfig('Can', { value: null })];
      expect(evalExpr('Can.value == null', configs)).toBe(true);
    });

    it('Can.value == null → false when value is not null', () => {
      const configs = [makeConfig('Can', { value: 42 })];
      expect(evalExpr('Can.value == null', configs)).toBe(false);
    });

    it('Can.value != null → true when value is not null', () => {
      const configs = [makeConfig('Can', { value: 42 })];
      expect(evalExpr('Can.value != null', configs)).toBe(true);
    });
  });

  describe('Grouped expressions', () => {
    it('(Can.baudrate > 100 && Can.baudrate < 500) || Mcu.emergencyMode', () => {
      const configs = [
        makeConfig('Can', { baudrate: 300 }),
        makeConfig('Mcu', { emergencyMode: false }),
      ];
      expect(
        evalExpr('(Can.baudrate > 100 && Can.baudrate < 500) || Mcu.emergencyMode', configs)
      ).toBe(true);
    });

    it('grouped expression resolves to false when both sides fail', () => {
      const configs = [
        makeConfig('Can', { baudrate: 50 }),
        makeConfig('Mcu', { emergencyMode: false }),
      ];
      expect(
        evalExpr('(Can.baudrate > 100 && Can.baudrate < 500) || Mcu.emergencyMode', configs)
      ).toBe(false);
    });
  });

  describe('Short-circuit evaluation', () => {
    it('|| short-circuits on true left side (does not crash on missing right)', () => {
      // Mcu module does not have an 'enabled' param, but left side is true
      const configs = [makeConfig('Can', { enabled: true })];
      expect(evalExpr('Can.enabled || Mcu.enabled', configs)).toBe(true);
    });

    it('&& short-circuits on false left side', () => {
      const configs = [makeConfig('Can', { enabled: false })];
      expect(evalExpr('Can.enabled && Mcu.enabled', configs)).toBe(false);
    });
  });

  describe('Numeric comparisons (<, >, <=, >=)', () => {
    it('Can.baudrate < 1000', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Can.baudrate < 1000', configs)).toBe(true);
    });

    it('Can.baudrate <= 500', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Can.baudrate <= 500', configs)).toBe(true);
    });

    it('Can.baudrate >= 500', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Can.baudrate >= 500', configs)).toBe(true);
    });

    it('Can.baudrate > 1000 → false', () => {
      const configs = [makeConfig('Can', { baudrate: 500 })];
      expect(evalExpr('Can.baudrate > 1000', configs)).toBe(false);
    });
  });
});

// ─── evaluateCondition convenience function ─────────────────────────

describe('evaluateCondition convenience function', () => {
  it('parses and evaluates in one call', () => {
    const configs = [makeConfig('Can', { baudrate: 500 })];
    expect(evaluateCondition('Can.baudrate == 500', configs)).toBe(true);
  });

  it('throws SyntaxError on invalid expressions', () => {
    const configs = [makeConfig('Can', { baudrate: 500 })];
    expect(() => evaluateCondition('Can.baudrate ==', configs)).toThrow();
  });
});

// ─── Parser robustness (Fix 20) ────────────────────────────────────

describe('parser robustness — depth/length limits', () => {
  it("rejects '!'.repeat(1e6) with SyntaxError instead of stack overflow", () => {
    expect(() => parseCondition('!'.repeat(1e6))).toThrow(SyntaxError);
  });

  it('rejects 100k nested parentheses with SyntaxError instead of stack overflow', () => {
    const input = '('.repeat(100000) + 'true' + ')'.repeat(100000);
    expect(() => parseCondition(input)).toThrow(SyntaxError);
  });

  it('rejects expressions longer than 4096 chars', () => {
    const input = 'a && '.repeat(1100); // 5500 chars
    expect(() => parseCondition(input)).toThrow(SyntaxError);
    expect(() => parseCondition(input)).toThrow(/too long/);
  });

  it('accepts exactly 4096 chars', () => {
    // '&&' chains are parsed iteratively (no recursion), so a long flat
    // expression at the length limit must still parse: 1 + 1365 * 3 = 4096
    const input = 'x' + '&&x'.repeat(1365);
    expect(input).toHaveLength(4096);
    expect(() => parseCondition(input)).not.toThrow();
  });

  it('rejects deeply nested parens (depth > 200) with SyntaxError', () => {
    const input = '('.repeat(250) + 'true' + ')'.repeat(250);
    expect(() => parseCondition(input)).toThrow(SyntaxError);
    expect(() => parseCondition(input)).toThrow(/too deeply nested/);
  });

  it("rejects a '!' chain deeper than 200 with SyntaxError", () => {
    expect(() => parseCondition('!'.repeat(500) + 'true')).toThrow(SyntaxError);
    expect(() => parseCondition('!'.repeat(500) + 'true')).toThrow(/too deeply nested/);
  });

  it("rejects a '-' chain deeper than 200 with SyntaxError", () => {
    expect(() => parseCondition('-'.repeat(500) + '1')).toThrow(SyntaxError);
  });

  it('still accepts moderately nested expressions (≤ 200 levels)', () => {
    // Keep under the evaluator's own MAX_DEPTH (50) as well
    expect(evalExpr('!'.repeat(20) + 'true', [])).toBe(true);
    expect(evalExpr('('.repeat(20) + 'true' + ')'.repeat(20), [])).toBe(true);
  });
});

describe('parser robustness — malformed numbers', () => {
  it('rejects 1.2.3 as an invalid number literal', () => {
    expect(() => parseCondition('1.2.3')).toThrow(SyntaxError);
    expect(() => parseCondition('1.2.3')).toThrow(/Invalid number literal/);
  });

  it('rejects a literal with three dots', () => {
    expect(() => parseCondition('Can.baudrate == 1.2.3.4')).toThrow(SyntaxError);
  });

  it('still accepts valid floats and integers', () => {
    expect(evalExpr('Can.baudrate == 1.5', [makeConfig('Can', { baudrate: 1.5 })])).toBe(true);
    expect(evalExpr('Can.baudrate == 500', [makeConfig('Can', { baudrate: 500 })])).toBe(true);
  });

  it('still accepts container index numbers (path lexing unaffected)', () => {
    const configs = [
      makeConfig('Port', {
        _containers: { containers: [{ id: '0', parameters: { direction: 'DIO' } }] },
      }),
    ];
    expect(evalExpr('Port.containers[0].direction == "DIO"', configs)).toBe(true);
  });
});

// ─── Prototype chain / missing-parameter defense (Fix 20) ──────────

describe('prototype chain defense', () => {
  it('Mod.__proto__ evaluates to false instead of leaking the prototype object', () => {
    const configs = [makeConfig('Mod', {})];
    expect(evalExpr('Mod.__proto__', configs)).toBe(false);
  });

  it('Mod.constructor evaluates to false instead of leaking the constructor', () => {
    const configs = [makeConfig('Mod', {})];
    expect(evalExpr('Mod.constructor', configs)).toBe(false);
  });

  it('container instance __proto__ path evaluates to false', () => {
    const configs = [
      makeConfig('Port', {
        _containers: { containers: [{ id: '0', parameters: {} }] },
      }),
    ];
    expect(evalExpr('Port.containers[0].__proto__', configs)).toBe(false);
  });

  it('long-path fallback also blocks __proto__', () => {
    const configs = [makeConfig('Mod', {})];
    expect(evalExpr('Mod.a.b.__proto__', configs)).toBe(false);
  });

  it('still resolves a genuine own __proto__ parameter via hasOwnProperty', () => {
    // JSON.parse creates an own data property named '__proto__' (unlike object literals)
    const ownProto = JSON.parse('{"__proto__": 42}') as Record<string, unknown>;
    const configs = [makeConfig('Mod', ownProto)];
    expect(evalExpr('Mod.__proto__ == 42', configs)).toBe(true);
  });

  it('still resolves regular own parameters', () => {
    const configs = [makeConfig('Mod', { value: 7 })];
    expect(evalExpr('Mod.value == 7', configs)).toBe(true);
  });

  it('handles configs with a missing parameters object (undefined → {})', () => {
    const config = { module: 'Mod', version: '4.4.0' } as unknown as ModuleConfig;
    expect(evalExpr('Mod.anyParam == 1', [config])).toBe(false);
  });

  it('handles container instances with a missing parameters object', () => {
    const configs = [
      makeConfig('Port', {
        _containers: { containers: [{ id: '0' }] },
      }) as unknown as ModuleConfig,
    ];
    expect(evalExpr('Port.containers[0].direction == "DIO"', configs)).toBe(false);
  });
});
