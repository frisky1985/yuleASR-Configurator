/**
 * @yuletech/core - Validator
 * 配置验证器实现
 */

import type { ModuleSchema, ModuleConfig, ModuleParameter, ValidationRule } from '../types';

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
  /** 警告列表 */
  warnings: ValidationWarning[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误类型 */
  type: 'error';
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 参数路径 */
  path: string;
  /** 参数名称 */
  parameter?: string;
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  /** 警告类型 */
  type: 'warning';
  /** 警告码 */
  code: string;
  /** 警告消息 */
  message: string;
  /** 参数路径 */
  path: string;
  /** 参数名称 */
  parameter?: string;
}

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
    const warnings: ValidationWarning[] = [];

    const schema = this.schemas.get(config.module);
    if (!schema) {
      errors.push({
        type: 'error',
        code: 'MODULE_NOT_FOUND',
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
          type: 'warning',
          code: 'UNKNOWN_PARAMETER',
          message: `未知参数: ${key}`,
          path: `parameters.${key}`,
          parameter: key,
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
    const warnings: ValidationWarning[] = [];

    // 必填检查
    if (param.required && (value === undefined || value === null)) {
      errors.push({
        type: 'error',
        code: 'REQUIRED',
        message: `参数 ${param.name} 为必填项`,
        path,
        parameter: param.name,
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
        type: 'error',
        code: 'TYPE_MISMATCH',
        message: `参数 ${param.name} 类型错误，期望 ${param.type}，实际 ${typeof value}`,
        path,
        parameter: param.name,
      });
      return { valid: false, errors, warnings };
    }

    // 范围验证
    if (param.type === 'integer' || param.type === 'float') {
      const numValue = value as number;
      if (param.min !== undefined && numValue < param.min) {
        errors.push({
          type: 'error',
          code: 'MIN_VIOLATION',
          message: `参数 ${param.name} 不能小于 ${param.min}`,
          path,
          parameter: param.name,
        });
      }
      if (param.max !== undefined && numValue > param.max) {
        errors.push({
          type: 'error',
          code: 'MAX_VIOLATION',
          message: `参数 ${param.name} 不能大于 ${param.max}`,
          path,
          parameter: param.name,
        });
      }
    }

    // 字符串长度验证
    if (param.type === 'string' && typeof value === 'string') {
      if (param.minLength !== undefined && value.length < param.minLength) {
        errors.push({
          type: 'error',
          code: 'MIN_LENGTH',
          message: `参数 ${param.name} 长度不能小于 ${param.minLength}`,
          path,
          parameter: param.name,
        });
      }
      if (param.maxLength !== undefined && value.length > param.maxLength) {
        errors.push({
          type: 'error',
          code: 'MAX_LENGTH',
          message: `参数 ${param.name} 长度不能大于 ${param.maxLength}`,
          path,
          parameter: param.name,
        });
      }
      if (param.pattern && !new RegExp(param.pattern).test(value)) {
        errors.push({
          type: 'error',
          code: 'PATTERN_MISMATCH',
          message: `参数 ${param.name} 格式不匹配`,
          path,
          parameter: param.name,
        });
      }
    }

    // 枚举验证
    if (param.type === 'enum' && param.options) {
      const validValues = param.options.map(opt => opt.value);
      if (!validValues.includes(value as string | number | boolean)) {
        errors.push({
          type: 'error',
          code: 'INVALID_ENUM',
          message: `参数 ${param.name} 值无效，必须是: ${validValues.join(', ')}`,
          path,
          parameter: param.name,
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
