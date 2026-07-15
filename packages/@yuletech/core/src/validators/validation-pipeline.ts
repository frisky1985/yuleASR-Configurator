/**
 * @yuletech/core - ValidationPipeline
 * 统一验证管道：整合 YuleasrValidator（模块级）、CrossModuleValidator（跨模块）、
 * ConditionEvaluator（条件表达式）为一个入口。
 */

import type { ModuleConfig, ModuleSchema, ValidationError } from '../types';
import { YuleasrValidator } from './yuleasr-validator';
import { createCrossModuleValidator } from './cross-module-validator';
import { evaluateCondition } from '../conditions/evaluator';

// ─── Result type ─────────────────────────────────────────────────────────

export interface ValidationPipelineResult {
  /** YuleasrValidator 模块级验证结果 */
  moduleErrors: ValidationError[];
  /** CrossModuleValidator 跨模块引用验证结果 */
  crossModuleErrors: ValidationError[];
  /** 条件引擎表达式求值错误 */
  conditionErrors: ValidationError[];
  /** 合并去重后的全部错误 */
  allErrors: ValidationError[];
  /** 警告信息 */
  warnings: string[];
  /** 配置模块数量 */
  moduleCount: number;
  /** 是否全部通过（无 error 级别的错误即视为有效） */
  isValid: boolean;
}

// ─── Pipeline ────────────────────────────────────────────────────────────

/**
 * 统一验证管道
 *
 * 用法：
 * ```ts
 * const pipeline = new ValidationPipeline();
 * const result = pipeline.validate(configs, schemas, myConditions);
 * ```
 */
export class ValidationPipeline {
  /**
   * 执行统一验证：
   *   1. 模块级验证（YuleasrValidator.validateModules）
   *   2. 跨模块引用验证（CrossModuleValidator.validate）
   *   3. 条件表达式求值捕获异常（evaluateCondition）
   *   4. 合并去重
   */
  validate(
    configs: ModuleConfig[],
    schemas: ModuleSchema[],
    conditions?: Record<string, string>,
  ): ValidationPipelineResult {
    const warnings: string[] = [];
    const moduleCount = configs.length;

    // ── 1. 模块级验证 ──
    const moduleErrors: ValidationError[] = [];
    if (configs.length > 0) {
      const validator = new YuleasrValidator();
      moduleErrors.push(...validator.validateModules(configs));
    }

    // ── 2. 跨模块验证 ──
    const crossModuleErrors: ValidationError[] = [];
    if (schemas.length > 0 && configs.length > 0) {
      const crossValidator = createCrossModuleValidator(schemas);
      crossModuleErrors.push(...crossValidator.validate(configs));
    }

    // ── 3. 条件求值 ──
    const conditionErrors: ValidationError[] = [];
    if (conditions) {
      for (const [key, expression] of Object.entries(conditions)) {
        try {
          evaluateCondition(expression, configs);
        } catch (err) {
          conditionErrors.push({
            path: `condition:${key}`,
            message: `Condition evaluation error — ${err instanceof Error ? err.message : String(err)}`,
            severity: 'error',
            code: 'CONDITION_ERROR',
          });
        }
      }
    }

    // ── 4. 合并去重 ──
    const allErrors = this.deduplicateErrors([
      ...moduleErrors,
      ...crossModuleErrors,
      ...conditionErrors,
    ]);

    const isValid = allErrors.filter((e) => e.severity === 'error').length === 0;

    return {
      moduleErrors,
      crossModuleErrors,
      conditionErrors,
      allErrors,
      warnings,
      moduleCount,
      isValid,
    };
  }

  /** 合并去重：相同 path + message 的只保留第一条 */
  private deduplicateErrors(errors: ValidationError[]): ValidationError[] {
    const seen = new Set<string>();
    return errors.filter((e) => {
      const key = `${e.path}|${e.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// ─── Convenience function ────────────────────────────────────────────────

/**
 * 便捷函数：一步完成所有验证，适合前端直接调用
 *
 * @param configs  模块配置列表
 * @param schemas  模块 Schema 列表
 * @param conditions 可选的条件表达式映射
 */
export function validateAll(
  configs: ModuleConfig[],
  schemas: ModuleSchema[],
  conditions?: Record<string, string>,
): ValidationPipelineResult {
  const pipeline = new ValidationPipeline();
  return pipeline.validate(configs, schemas, conditions);
}
