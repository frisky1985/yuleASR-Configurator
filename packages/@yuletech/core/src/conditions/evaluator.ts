/**
 * @yuletech/core - Condition Expression Evaluator
 * Walks a parsed condition expression AST against module configs
 * and produces a boolean result for visibleWhen / enabledWhen.
 */

import type {
  ConditionExpr,
  BinaryOpExpr,
  UnaryOpExpr,
  CompareOpExpr,
  PathExpr,
} from './types';
import { parseCondition } from './parser';
import type { ModuleConfig } from '../types';

/**
 * Evaluates parsed condition expression ASTs against module configurations.
 *
 * Resolution rules:
 * - `module.param`          → configs.find(m => m.module === module)?.parameters?.[param]
 * - `module.container[idx]  → configs.find(m => m.module === module)
 *   .param`                   ?.containers?.[container]?.[idx]?.parameters?.[param]
 * - Unresolvable paths       → false (fails closed — invisible / disabled)
 */
export class ConditionEvaluator {
  /**
   * Evaluate a condition expression tree against an array of module configs.
   */
  evaluate(expr: ConditionExpr, configs: ModuleConfig[]): boolean {
    return Boolean(this.evaluateNode(expr, configs));
  }

  // ─── internal recursion ────────────────────────────────────────────

  private evaluateNode(node: ConditionExpr, configs: ModuleConfig[]): unknown {
    switch (node.type) {
      case 'path':
        return this.evaluatePath(node, configs);
      case 'literal':
        return node.value;
      case 'compare':
        return this.evaluateCompare(node, configs);
      case 'binary_op':
        return this.evaluateBinary(node, configs);
      case 'unary_op':
        return this.evaluateUnary(node, configs);
      case 'group':
        return this.evaluateNode(node.expression, configs);
      default:
        return false;
    }
  }

  // ─── path resolution ───────────────────────────────────────────────

  private evaluatePath(node: PathExpr, configs: ModuleConfig[]): unknown {
    const { segments, index } = node;

    // Basic two-segment path: module.param
    if (segments.length === 2 && index === undefined) {
      const [moduleName, paramName] = segments;
      const config = configs.find((c) => c.module === moduleName);
      if (!config) return undefined;
      // Return raw value (null, undefined, number, string, boolean, etc.)
      if (paramName in config.parameters) return config.parameters[paramName];
      return undefined;
    }

    // Container path with 3 segments and an index: module.container[index].param
    if (segments.length === 3 && index !== undefined) {
      const [moduleName, containerName, paramName] = segments;
      const config = configs.find((c) => c.module === moduleName);
      if (!config) return undefined;
      const container = config.containers?.[containerName];
      if (!container) return undefined;
      const instance = container[index];
      if (!instance) return undefined;
      if (paramName in instance.parameters) return instance.parameters[paramName];
      return undefined;
    }

    // Fallback – try simple segments[0] path even for longer paths
    // (graceful degradation: resolve what we can)
    const [moduleName, ...rest] = segments;
    const config = configs.find((c) => c.module === moduleName);
    if (!config || rest.length === 0) return undefined;
    const paramName = rest.join('.');
    if (paramName in config.parameters) return config.parameters[paramName];
    return undefined;
  }

  // ─── comparison ────────────────────────────────────────────────────

  private evaluateCompare(
    node: CompareOpExpr,
    configs: ModuleConfig[],
  ): boolean {
    const left = this.evaluateNode(node.left, configs);
    const right = this.evaluateNode(node.right, configs);

    switch (node.operator) {
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '<':
        return this.isNumber(left) && this.isNumber(right)
          ? (left as number) < (right as number)
          : false;
      case '>':
        return this.isNumber(left) && this.isNumber(right)
          ? (left as number) > (right as number)
          : false;
      case '<=':
        return this.isNumber(left) && this.isNumber(right)
          ? (left as number) <= (right as number)
          : false;
      case '>=':
        return this.isNumber(left) && this.isNumber(right)
          ? (left as number) >= (right as number)
          : false;
      default:
        return false;
    }
  }

  // ─── binary logical operators ──────────────────────────────────────

  private evaluateBinary(
    node: BinaryOpExpr,
    configs: ModuleConfig[],
  ): boolean {
    const left = Boolean(this.evaluateNode(node.left, configs));

    if (node.operator === '||') {
      // Short-circuit: if left is truthy, skip right
      if (left) return true;
      return Boolean(this.evaluateNode(node.right, configs));
    }

    // '&&'
    // Short-circuit: if left is falsy, skip right
    if (!left) return false;
    return Boolean(this.evaluateNode(node.right, configs));
  }

  // ─── unary operators ───────────────────────────────────────────────

  private evaluateUnary(node: UnaryOpExpr, configs: ModuleConfig[]): unknown {
    const operand = this.evaluateNode(node.operand, configs);

    if (node.operator === '!') {
      return !operand;
    }

    // '-'
    if (typeof operand === 'number') {
      return -operand;
    }
    // Non-numeric unary minus yields NaN → falsy in boolean context
    return NaN;
  }

  // ─── helpers ───────────────────────────────────────────────────────

  private isNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
  }
}

/**
 * Convenience function: parse + evaluate a condition expression string.
 *
 * @param expression Raw condition string (e.g. `"Can.baudrate == 500"`)
 * @param configs    Module configurations to evaluate against
 * @returns          Boolean result (fails closed on unresolved paths)
 * @throws           {SyntaxError} if the expression cannot be parsed
 */
export function evaluateCondition(
  expression: string,
  configs: ModuleConfig[],
): boolean {
  const expr = parseCondition(expression);
  const evaluator = new ConditionEvaluator();
  return evaluator.evaluate(expr, configs);
}
