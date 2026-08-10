/**
 * yuleASR 配置验证器
 * 基于 yuleASR 规则验证配置的正确性
 */

import type { ModuleConfig, ValidationError, ModuleSchema } from '../types';

import { CrossModuleValidator } from './cross-module-validator';

// 本地验证规则类型，避免与 types/module.ts 中的 ValidationRule 冲突
interface YuleasrValidationRule {
  type: 'required' | 'range' | 'dependency' | 'custom';
  message: string;
  /** range 规则的最小值（含） */
  min?: number;
  /** range 规则的最大值（含） */
  max?: number;
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
  private crossModuleValidator: CrossModuleValidator | null = null;
  /** 统一管理（2026-08-10）：schema 引用，模块级依赖从 schema.dependencies 读取 */
  private schemaMap: Map<string, ModuleSchema> = new Map();

  /**
   * 设置跨模块验证器
   */
  setCrossModuleValidator(schemas: ModuleSchema[]): void {
    this.schemaMap = new Map(schemas.map(s => [s.name, s]));
    this.crossModuleValidator = new CrossModuleValidator(this.schemaMap);
  }

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
          } else {
            if (rule.min !== undefined && numValue < rule.min) {
              errors.push({
                path: `${config.module}.${paramName}`,
                message: `${paramName} must be >= ${rule.min}`,
                severity: 'error',
              });
            }
            if (rule.max !== undefined && numValue > rule.max) {
              errors.push({
                path: `${config.module}.${paramName}`,
                message: `${paramName} must be <= ${rule.max}`,
                severity: 'error',
              });
            }
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

    // 检查模块间依赖（统一管理 2026-08-10：从 schema.dependencies 数据读取，
    // 替代原先硬编码在 yuleasr-validator.ts 的 dependencyRules 表）
    const moduleNames = new Set(configs.map(c => c.module));
    const configMap = new Map(configs.map(c => [c.module, c]));

    for (const config of configs) {
      const schema = this.schemaMap.get(config.module);
      const deps = schema?.dependencies;
      if (!deps || deps.length === 0) continue;

      for (const dep of deps) {
        const severity = dep.severity || (dep.required ? 'error' : 'warning');
        const message = dep.description || `${config.module} depends on ${dep.module}`;
        if (!moduleNames.has(dep.module)) {
          allErrors.push({
            path: config.module,
            message,
            severity,
          });
        } else if (dep.paramCheck) {
          // Module exists — perform parameter-level check
          const depConfig = configMap.get(dep.module);
          if (!depConfig) continue;

          const pc = dep.paramCheck;
          let paramFailed = false;

          switch (pc.type) {
            case 'container_not_empty': {
              const containerName = pc.container || '';
              const instances = depConfig.containers?.[containerName];
              paramFailed = !Array.isArray(instances) || instances.length === 0;
              break;
            }
            case 'value_gt': {
              const val = depConfig.parameters[pc.param || ''];
              paramFailed = typeof val !== 'number' || val <= ((pc.expected as number) || 0);
              break;
            }
            case 'value_equals': {
              paramFailed = depConfig.parameters[pc.param || ''] !== pc.expected;
              break;
            }
          }

          if (paramFailed) {
            allErrors.push({
              path: config.module,
              message,
              severity,
            });
          }
        }
      }
    }

    // 跨模块参数引用约束检查
    if (this.crossModuleValidator) {
      const crossErrors = this.crossModuleValidator.validate(configs);
      allErrors.push(...crossErrors);
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
// TODO(#11): 全局单例 — 多配置并行时需要按 Config 实例化，移除此处单例
export const yuleasrValidator = new YuleasrValidator();

// 注册默认验证规则
yuleasrValidator.registerModuleRules({
  module: 'Mcu',
  rules: [
    // Fix 21 (K3): 原单条 custom 规则把「Mcu 必须启用」与「启用后缺 clock_frequency」
    // 混为一条，消息错位。拆成两条，语义分别对应启用态与参数完整性。
    {
      type: 'custom',
      message: 'Mcu must be enabled',
      condition: config => config.parameters.enabled !== false,
    },
    {
      type: 'custom',
      message: 'Mcu is enabled but clock_frequency is missing',
      // condition 返回 true 表示有效：模块已禁用（无需 clock）或已提供 clock_frequency
      condition: config =>
        config.parameters.enabled === false || config.parameters.clock_frequency !== undefined,
    },
  ],
  parameterRules: {
    clock_frequency: [
      { type: 'required', message: 'Clock frequency is required' },
      { type: 'range', message: 'Clock frequency must be positive' },
    ],
    core_count: [{ type: 'required', message: 'Core count is required' }],
  },
});

yuleasrValidator.registerModuleRules({
  module: 'Can',
  rules: [],
  parameterRules: {
    baudrate: [{ type: 'required', message: 'Baudrate is required' }],
    controller_count: [{ type: 'required', message: 'Controller count is required' }],
  },
});

// Auto-generated module rules for all 37 BSW modules
const allModuleNames = [
  'Adc',
  'Arti',
  'Ble',
  'BswM',
  'Can',
  'CanIf',
  'CanNm',
  'CanSM',
  'CanTp',
  'CanTrcv',
  'Com',
  'ComM',
  'Crc',
  'CryIf',
  'Crypto',
  'Csm',
  'Dcm',
  'Dem',
  'Det',
  'Dio',
  'EcuM',
  'Fee',
  'Fls',
  'Gpt',
  'Icu',
  'IoHwAb',
  'Mcl',
  'Mcu',
  'MemIf',
  'Nm',
  'NvM',
  'Os',
  'PduR',
  'Port',
  'Rte',
  'Sbc',
  'Spi',
];

for (const modName of allModuleNames) {
  if (modName === 'Mcu' || modName === 'Can') continue; // already registered above
  yuleasrValidator.registerModuleRules({
    module: modName,
    rules: [],
    parameterRules: {
      [`${modName}DevErrorDetect`]: [
        { type: 'required', message: `${modName}DevErrorDetect is required` },
      ],
    },
  });
}
