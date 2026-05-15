/**
 * @yuletech/core - Validator
 * 配置验证器实现
 */

import type { ModuleSchema, ModuleConfig, ModuleParameter, ValidationError, ValidationResult } from '../types';

/**
 * 配置验证器
 */
export class ConfigValidator {
  constructor(private schemas: Map<string, ModuleSchema>) {}

  /**
   * 验证配置
   */
  validate(config: ModuleConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const schema = this.schemas.get(config.module);
    if (!schema) {
      errors.push({
        severity: 'error',
        message: `未找到模块: ${config.module}`,
        path: 'module',
      });
      return { valid: false, errors, warnings };
    }

    // 验证每个参数
    for (const param of schema.parameters) {
      const value = config.parameters[param.name];
      const paramResult = this.validateParameter(param, value, `parameters.${param.name}`);
      errors.push(...paramResult.errors);
      warnings.push(...paramResult.warnings);
    }

    // 检查未知参数
    for (const key of Object.keys(config.parameters)) {
      if (!schema.parameters.find(p => p.name === key)) {
        warnings.push({
          severity: 'warning',
          message: `未知参数: ${key}`,
          path: `parameters.${key}`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证单个参数
   */
  private validateParameter(
    param: ModuleParameter,
    value: unknown,
    path: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 必填检查
    if (param.required && (value === undefined || value === null)) {
      errors.push({
        severity: 'error',
        message: `参数 ${param.name} 为必填项`,
        path,
      });
      return { valid: false, errors, warnings };
    }

    // 空值且非必填，跳过验证
    if (value === undefined || value === null) {
      return { valid: true, errors, warnings };
    }

    // 类型验证
    const typeValid = this.validateType(param.type, value);
    if (!typeValid) {
      errors.push({
        severity: 'error',
        message: `参数 ${param.name} 类型错误，期望 ${param.type}，实际 ${typeof value}`,
        path,
      });
      return { valid: false, errors, warnings };
    }

    // 范围验证
    if (param.type === 'integer' || param.type === 'float') {
      const numValue = value as number;
      if (param.min !== undefined && numValue < param.min) {
        errors.push({
          severity: 'error',
          message: `参数 ${param.name} 不能小于 ${param.min}`,
          path,
        });
      }
      if (param.max !== undefined && numValue > param.max) {
        errors.push({
          severity: 'error',
          message: `参数 ${param.name} 不能大于 ${param.max}`,
          path,
        });
      }
    }

    // 字符串长度验证
    if (param.type === 'string' && typeof value === 'string') {
      if (param.minLength !== undefined && value.length < param.minLength) {
        errors.push({
          severity: 'error',
          message: `参数 ${param.name} 长度不能小于 ${param.minLength}`,
          path,
        });
      }
      if (param.maxLength !== undefined && value.length > param.maxLength) {
        errors.push({
          severity: 'error',
          message: `参数 ${param.name} 长度不能大于 ${param.maxLength}`,
          path,
        });
      }
      if (param.pattern && !new RegExp(param.pattern).test(value)) {
        errors.push({
          severity: 'error',
          message: `参数 ${param.name} 格式不匹配`,
          path,
        });
      }
    }

    // 枚举验证
    if (param.type === 'enum' && param.options) {
      const validValues = param.options.map(opt => opt.value);
      if (!validValues.includes(value as string | number | boolean)) {
        errors.push({
          severity: 'error',
          message: `参数 ${param.name} 值无效，必须是: ${validValues.join(', ')}`,
          path,
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证类型
   */
  private validateType(type: string, value: unknown): boolean {
    switch (type) {
      case 'boolean':
        return typeof value === 'boolean';
      case 'integer':
        return typeof value === 'number' && Number.isInteger(value);
      case 'float':
        return typeof value === 'number';
      case 'string':
      case 'reference':
        return typeof value === 'string';
      case 'enum':
        return ['string', 'number', 'boolean'].includes(typeof value);
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }
}

/**
 * 创建验证器工厂函数
 */
export function createValidator(schemas: ModuleSchema[]): ConfigValidator {
  const schemaMap = new Map(schemas.map(s => [s.name, s]));
  return new ConfigValidator(schemaMap);
}
