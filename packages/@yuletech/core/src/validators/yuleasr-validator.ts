/**
 * yuleASR 配置验证器
 * 基于 yuleASR 规则验证配置的正确性
 */

import type { ModuleConfig, ValidationError } from '../types';

// 本地验证规则类型，避免与 types/module.ts 中的 ValidationRule 冲突
interface YuleasrValidationRule {
  type: 'required' | 'range' | 'dependency' | 'custom';
  message: string;
  condition?: (config: ModuleConfig) => boolean;
}

export interface ModuleValidationRules {
  module: string;
  rules: YuleasrValidationRule[];
  parameterRules: Record<string, YuleasrValidationRule[]>;
}

/**
 * yuleASR 配置验证器
 */
export class YuleasrValidator {
  private moduleRules: Map<string, ModuleValidationRules> = new Map();

  /**
   * 注册模块验证规则
   */
  registerModuleRules(rules: ModuleValidationRules): void {
    this.moduleRules.set(rules.module, rules);
  }

  /**
   * 验证单个模块配置
   */
  validateModule(config: ModuleConfig): ValidationError[] {
    const errors: ValidationError[] = [];
    const rules = this.moduleRules.get(config.module);

    if (!rules) {
      // 如果没有特定规则，使用通用验证
      return this.validateGeneric(config);
    }

    // 验证模块级规则
    for (const rule of rules.rules) {
      if (rule.type === 'custom' && rule.condition) {
        if (!rule.condition(config)) {
          errors.push({
            path: config.module,
            message: rule.message,
            severity: 'error',
          });
        }
      }
    }

    // 验证参数级规则
    for (const [paramName, paramRules] of Object.entries(rules.parameterRules)) {
      const paramValue = config.parameters[paramName];

      for (const rule of paramRules) {
        if (rule.type === 'required' && (paramValue === undefined || paramValue === null)) {
          errors.push({
            path: `${config.module}.${paramName}`,
            message: rule.message || `${paramName} is required`,
            severity: 'error',
          });
        }

        if (rule.type === 'range' && paramValue !== undefined) {
          const numValue = Number(paramValue);
          if (isNaN(numValue)) {
            errors.push({
              path: `${config.module}.${paramName}`,
              message: `${paramName} must be a number`,
              severity: 'error',
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * 通用验证
   */
  private validateGeneric(config: ModuleConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    // 验证必填字段
    if (!config.module) {
      errors.push({
        path: 'module',
        message: 'Module name is required',
        severity: 'error',
      });
    }

    if (!config.version) {
      errors.push({
        path: `${config.module}.version`,
        message: 'Version is required',
        severity: 'error',
      });
    }

    // 验证参数类型
    for (const [key, value] of Object.entries(config.parameters)) {
      if (value === undefined || value === null) {
        errors.push({
          path: `${config.module}.${key}`,
          message: `${key} is required`,
          severity: 'warning',
        });
      }
    }

    return errors;
  }

  /**
   * 验证多个模块配置
   */
  validateModules(configs: ModuleConfig[]): ValidationError[] {
    const allErrors: ValidationError[] = [];

    for (const config of configs) {
      const errors = this.validateModule(config);
      allErrors.push(...errors);
    }

    // 检查模块间依赖
    const moduleNames = new Set(configs.map(c => c.module));
    
    for (const config of configs) {
      // 检查 Mcu 依赖
      if (config.module !== 'Mcu' && !moduleNames.has('Mcu')) {
        allErrors.push({
          path: config.module,
          message: `${config.module} requires Mcu module`,
          severity: 'error',
        });
      }

      // 检查特定模块依赖
      if (config.module === 'CanIf' && !moduleNames.has('Can')) {
        allErrors.push({
          path: 'CanIf',
          message: 'CanIf requires Can module',
          severity: 'error',
        });
      }

      if (config.module === 'PduR' && !moduleNames.has('CanIf')) {
        allErrors.push({
          path: 'PduR',
          message: 'PduR requires CanIf module',
          severity: 'warning',
        });
      }
    }

    return allErrors;
  }

  /**
   * 获取验证统计信息
   */
  getValidationStats(errors: ValidationError[]): {
    errorCount: number;
    warningCount: number;
    infoCount: number;
  } {
    return {
      errorCount: errors.filter(e => e.severity === 'error').length,
      warningCount: errors.filter(e => e.severity === 'warning').length,
      infoCount: errors.filter(e => e.severity === 'info').length,
    };
  }
}

// 默认验证器实例
export const yuleasrValidator = new YuleasrValidator();

// 注册默认验证规则
yuleasrValidator.registerModuleRules({
  module: 'Mcu',
  rules: [
    {
      type: 'custom',
      message: 'Mcu must be enabled for all configurations',
      condition: (config) => config.parameters.clock_frequency !== undefined,
    },
  ],
  parameterRules: {
    clock_frequency: [
      { type: 'required', message: 'Clock frequency is required' },
      { type: 'range', message: 'Clock frequency must be positive' },
    ],
    core_count: [
      { type: 'required', message: 'Core count is required' },
    ],
  },
});

yuleasrValidator.registerModuleRules({
  module: 'Can',
  rules: [],
  parameterRules: {
    baudrate: [
      { type: 'required', message: 'Baudrate is required' },
    ],
    controller_count: [
      { type: 'required', message: 'Controller count is required' },
    ],
  },
});
