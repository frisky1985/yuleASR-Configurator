/**
 * @yuletech/core - Constraint Propagator
 * Propagates value changes across module parameters by evaluating
 * expressions on source values and updating target parameter fields
 * (min, max, default, options).
 */

import type {
  PropagationRule,
  PropagationResult,
} from './propagator-types';
import { DependencyGraph } from './depends';
import type { ModuleSchema } from '../types';

/**
 * Evaluates a simple arithmetic/ternary expression with {source} substitution.
 *
 * Supported operators (precedence):
 *   ternary:   expr ? val : val   (lowest)
 *   additive:  +, -
 *   multiplicative: *, /
 *   unary:     -
 *   grouping:  ( expr )
 *
 * Numbers can be integer or float. {source} is replaced with the
 * source parameter value before evaluation.
 */
export function evaluateExpression(
  expression: string,
  sourceValue: unknown,
): unknown {
  // Pure passthrough: '{source}' returns the raw value
  if (expression.trim() === '{source}') {
    return sourceValue;
  }

  // Replace {source} with the actual value
  const sourceNum = Number(sourceValue);
  if (sourceValue === null || sourceValue === undefined || (typeof sourceValue !== 'number' && typeof sourceValue !== 'string')) {
    // If source is not a usable numeric value and expression isn't pure passthrough
    if (expression.includes('{source}')) {
      if (Number.isNaN(sourceNum) && typeof sourceValue === 'string') {
        // Try string source as a passthrough context — use it as literal
        const expr = expression.replace(/\{source\}/g, String(sourceNum));
        return evaluateMathExpr(expr);
      }
      const expr = expression.replace(/\{source\}/g, 'NaN');
      return evaluateMathExpr(expr);
    }
    return evaluateMathExpr(expression);
  }

  const expr = expression.replace(/\{source\}/g, String(sourceNum));
  return evaluateMathExpr(expr);
}

// ─── Internal Expression Evaluator ─────────────────────────────────

type TokenType =
  | 'NUMBER'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'LPAREN'
  | 'RPAREN'
  | 'QUESTION'
  | 'COLON'
  | 'GT'
  | 'LT'
  | 'GTE'
  | 'LTE'
  | 'EQ'
  | 'NEQ'
  | 'NAN'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const skipWs = () => {
    while (i < input.length && /\s/.test(input[i])) i++;
  };

  while (i < input.length) {
    skipWs();
    if (i >= input.length) break;

    const ch = input[i];

    // NaN literal
    if (input.slice(i, i + 3) === 'NaN' && !/[a-zA-Z0-9_]/.test(input[i + 3] ?? '')) {
      tokens.push({ type: 'NAN', value: 'NaN' });
      i += 3;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let num = '';
      if (ch === '.') {
        // Could be a float starting with .
        num = '0.';
        i++;
        while (i < input.length && /[0-9]/.test(input[i])) {
          num += input[i];
          i++;
        }
      } else {
        while (i < input.length && /[0-9.]/.test(input[i])) {
          num += input[i];
          i++;
        }
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    if (ch === '+') { tokens.push({ type: 'PLUS', value: '+' }); i++; continue; }
    if (ch === '-') { tokens.push({ type: 'MINUS', value: '-' }); i++; continue; }
    if (ch === '*') { tokens.push({ type: 'STAR', value: '*' }); i++; continue; }
    if (ch === '/') { tokens.push({ type: 'SLASH', value: '/' }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'LPAREN', value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN', value: ')' }); i++; continue; }
    if (ch === '?') { tokens.push({ type: 'QUESTION', value: '?' }); i++; continue; }
    if (ch === ':') { tokens.push({ type: 'COLON', value: ':' }); i++; continue; }

    // Multi-char comparison operators
    const two = input.slice(i, i + 2);
    if (two === '>=') { tokens.push({ type: 'GTE', value: '>=' }); i += 2; continue; }
    if (two === '<=') { tokens.push({ type: 'LTE', value: '<=' }); i += 2; continue; }
    if (two === '==') { tokens.push({ type: 'EQ', value: '==' }); i += 2; continue; }
    if (two === '!=') { tokens.push({ type: 'NEQ', value: '!=' }); i += 2; continue; }
    if (ch === '>') { tokens.push({ type: 'GT', value: '>' }); i++; continue; }
    if (ch === '<') { tokens.push({ type: 'LT', value: '<' }); i++; continue; }

    // Skip unknown characters (shouldn't happen with {source} replaced + valid expressions)
    i++;
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

function evaluateMathExpr(input: string): unknown {
  const tokens = tokenize(input);
  let pos = 0;

  const current = (): Token => tokens[pos];
  const advance = (): Token => tokens[pos++];
  const expect = (type: TokenType): Token => {
    const t = current();
    if (t.type !== type) {
      throw new Error(
        `Expected ${type} but got '${t.value}' at token ${pos}`,
      );
    }
    return advance();
  };

  // expr → ternary
  const parseExpr = (): number => parseTernary();

  // ternary → comparison '?' expr ':' expr | comparison
  const parseTernary = (): number => {
    const cond = parseComparison();
    if (current().type === 'QUESTION') {
      advance(); // consume '?'
      const trueVal = parseExpr();
      expect('COLON');
      const falseVal = parseExpr();
      return cond ? trueVal : falseVal;
    }
    return cond;
  };

  // comparison → additive (('>' | '<' | '>=' | '<=' | '==' | '!=') additive)?
  const parseComparison = (): number => {
    const left = parseAdditive();

    const cmpTypes: TokenType[] = ['GT', 'LT', 'GTE', 'LTE', 'EQ', 'NEQ'];
    if (cmpTypes.includes(current().type)) {
      const op = advance().value;
      const right = parseAdditive();

      switch (op) {
        case '>':  return left > right ? 1 : 0;
        case '<':  return left < right ? 1 : 0;
        case '>=': return left >= right ? 1 : 0;
        case '<=': return left <= right ? 1 : 0;
        case '==': return left === right ? 1 : 0;
        case '!=': return left !== right ? 1 : 0;
        default:   return 0;
      }
    }

    return left;
  };

  // additive → multiplicative (('+' | '-') multiplicative)*
  const parseAdditive = (): number => {
    let left = parseMultiplicative();
    while (current().type === 'PLUS' || current().type === 'MINUS') {
      const op = advance().value;
      const right = parseMultiplicative();
      if (op === '+') left = left + right;
      else left = left - right;
    }
    return left;
  };

  // multiplicative → unary (('*' | '/') unary)*
  const parseMultiplicative = (): number => {
    let left = parseUnary();
    while (current().type === 'STAR' || current().type === 'SLASH') {
      const op = advance().value;
      const right = parseUnary();
      if (op === '*') left = left * right;
      else left = left / right;
    }
    return left;
  };

  // unary → '-' unary | primary
  const parseUnary = (): number => {
    if (current().type === 'MINUS') {
      advance();
      return -parseUnary();
    }
    return parsePrimary();
  };

  // primary → NUMBER | NAN | '(' expr ')'
  const parsePrimary = (): number => {
    if (current().type === 'NUMBER') {
      return parseFloat(advance().value);
    }
    if (current().type === 'NAN') {
      advance();
      return NaN;
    }
    if (current().type === 'LPAREN') {
      advance();
      const val = parseExpr();
      expect('RPAREN');
      return val;
    }
    throw new Error(`Unexpected token '${current().value}'`);
  };

  try {
    const result = parseExpr();
    expect('EOF');
    return result;
  } catch {
    // Fallback: if parsing fails, try safe eval
    try {
      const sanitized = input
        .replace(/NaN/g, 'NaN') // keep NaN
        .replace(/[^0-9+\-*/.()?:<>!= ]/g, '');
      if (!sanitized.trim()) return input;
      // eslint-disable-next-line no-new-func
      return new Function(`"use strict"; return (${sanitized})`)();
    } catch {
      return input;
    }
  }
}

// ─── ConstraintPropagator ─────────────────────────────────────────

/**
 * Engine that propagates value changes across module parameters.
 * When a source parameter changes, it evaluates target expressions
 * and updates the corresponding fields (min/max/default/options)
 * on the target schema's parameters.
 */
export class ConstraintPropagator {
  private rules: PropagationRule[];
  private depGraph: DependencyGraph;

  constructor(rules: PropagationRule[]) {
    this.rules = rules;
    this.depGraph = this.buildDependencyGraph(rules);

    // Warn on circular dependencies at construction time
    const cycles = this.depGraph.detectCycles();
    if (cycles.length > 0) {
      console.warn(
        `[ConstraintPropagator] Circular dependencies detected in propagation rules:\n${cycles
          .map((c) => `  cycle: ${c.join(' → ')}`)
          .join('\n')}`,
      );
    }
  }

  /**
   * Build the dependency graph from propagation rules.
   * For each target, the target param depends on the source param.
   */
  private buildDependencyGraph(rules: PropagationRule[]): DependencyGraph {
    const graph = new DependencyGraph();

    for (const rule of rules) {
      const sourceKey = `${rule.module}.${rule.param}`;
      for (const target of rule.targets) {
        const targetKey = `${target.module}.${target.param}`;
        // Target depends on source
        graph.addNode(targetKey, [sourceKey]);
      }
      // Also add source as a node (no deps) so it appears in sorting
      if (!graph.getAllKeys().includes(sourceKey)) {
        graph.addNode(sourceKey, []);
      }
    }

    return graph;
  }

  /** Return the internal dependency graph */
  getDependencyGraph(): DependencyGraph {
    return this.depGraph;
  }

  /**
   * Propagate changes from specific params.
   * Returns all updates made.
   *
   * @param changedParams Array of { module, param, value } that changed
   * @param schemas       Map of module name → ModuleSchema to update
   * @returns             Array of PropagationResult describing each change
   */
  propagate(
    changedParams: Array<{ module: string; param: string; value: unknown }>,
    schemas: Map<string, ModuleSchema>,
  ): PropagationResult[] {
    const results: PropagationResult[] = [];

    // 1. Find matching rules for each changed param
    for (const changed of changedParams) {
      for (const rule of this.rules) {
        if (rule.module === changed.module && rule.param === changed.param) {
          // 2. Evaluate each target expression
          for (const target of rule.targets) {
            const schema = schemas.get(target.module);
            if (!schema) continue;

            const paramDef = schema.parameters.find(
              (p) => p.name === target.param,
            );
            if (!paramDef) continue;

            const oldValue = paramDef[target.field];
            const newValue = evaluateExpression(
              target.expression,
              changed.value,
            );

            // Only record changes if the value actually differs
            if (oldValue !== newValue) {
              // Update the parameter field
              if (target.field === 'options') {
                // options is an array of ParameterOption — the expression
                // should evaluate to an array, but for now handle as passthrough
                paramDef.options = newValue as any;
              } else {
                // min, max, default are single values
                (paramDef as any)[target.field] = newValue;
              }

              results.push({
                source: `${changed.module}.${changed.param}`,
                target: `${target.module}.${target.param}`,
                field: target.field,
                oldValue,
                newValue,
              });
            }
          }
        }
      }
    }

    return results;
  }
}
