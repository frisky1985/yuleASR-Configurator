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

  /**
   * 设置跨模块验证器
   */
  setCrossModuleValidator(schemas: ModuleSchema[]): void {
    this.crossModuleValidator = new CrossModuleValidator(new Map(schemas.map(s => [s.name, s])));
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
    
    // AUTOSAR BSW 标准依赖关系定义
    interface DependencyParamCheck {
      type: 'container_not_empty' | 'value_gt' | 'value_equals';
      container?: string;
      param?: string;
      expected?: unknown;
    }
    interface DependencyEntry {
      module: string;
      severity: 'error' | 'warning';
      message: string;
      paramCheck?: DependencyParamCheck;
    }

    const dependencyRules: Record<string, DependencyEntry[]> = {
      CanIf:    [{module: 'Can', severity: 'error', message: 'CanIf requires Can driver'},
                 {module: 'Can', severity: 'warning', message: 'CanIf requires at least one CAN controller configured', paramCheck: {type: 'container_not_empty', container: 'CanController'}}],
      CanNm:    [{module: 'CanIf', severity: 'error', message: 'CanNm requires CanIf'}, {module: 'Nm', severity: 'error', message: 'CanNm requires Nm'}],
      CanSM:    [{module: 'CanIf', severity: 'error', message: 'CanSM requires CanIf'}, {module: 'ComM', severity: 'warning', message: 'CanSM should have ComM'}],
      CanTp:    [{module: 'CanIf', severity: 'error', message: 'CanTp requires CanIf'}, {module: 'PduR', severity: 'error', message: 'CanTp requires PduR'}],
      CanTrcv:  [{module: 'Can', severity: 'warning', message: 'CanTrcv should have Can'}],
      Com:      [{module: 'PduR', severity: 'error', message: 'Com requires PduR'}],
      ComM:     [{module: 'Com', severity: 'error', message: 'ComM requires Com'}, {module: 'Nm', severity: 'warning', message: 'ComM should have Nm'}],
      Dcm:      [{module: 'Com', severity: 'error', message: 'Dcm requires Com'}, {module: 'PduR', severity: 'error', message: 'Dcm requires PduR'}, {module: 'Dem', severity: 'warning', message: 'Dcm should have Dem'}],
      Dem:      [{module: 'Dcm', severity: 'error', message: 'Dem requires Dcm'}, {module: 'NvM', severity: 'warning', message: 'Dem should have NvM'}],
      Det:      [],
      Dio:      [{module: 'Port', severity: 'error', message: 'Dio requires Port'}, {module: 'Mcu', severity: 'warning', message: 'Dio should have Mcu'}],
      EcuM:     [{module: 'Mcu', severity: 'error', message: 'EcuM requires Mcu'}],
      Fee:      [{module: 'Fls', severity: 'error', message: 'Fee requires Fls'}, {module: 'MemIf', severity: 'error', message: 'Fee requires MemIf'}],
      Fls:      [{module: 'Mcu', severity: 'warning', message: 'Fls should have Mcu'}],
      Gpt:      [{module: 'Mcu', severity: 'warning', message: 'Gpt should have Mcu'}],
      Icu:      [{module: 'Mcu', severity: 'warning', message: 'Icu should have Mcu'}],
      Mcl:      [{module: 'Mcu', severity: 'warning', message: 'Mcl should have Mcu'}],
      MemIf:    [{module: 'Fee', severity: 'error', message: 'MemIf requires Fee or Ea'}],
      Nm:       [{module: 'ComM', severity: 'error', message: 'Nm requires ComM'}],
      NvM:      [{module: 'MemIf', severity: 'error', message: 'NvM requires MemIf'}],
      Os:       [{module: 'EcuM', severity: 'warning', message: 'Os should have EcuM'}],
      PduR:     [{module: 'CanIf', severity: 'error', message: 'PduR requires CanIf'}],
      Rte:      [{module: 'Os', severity: 'error', message: 'Rte requires Os'}, {module: 'Com', severity: 'warning', message: 'Rte should have Com'}],
      Spi:      [{module: 'Mcu', severity: 'warning', message: 'Spi should have Mcu'}],
      Adc:      [{module: 'Mcu', severity: 'warning', message: 'Adc should have Mcu'}],
      Port:     [{module: 'Mcu', severity: 'warning', message: 'Port should have Mcu'}],
    };

    const configMap = new Map(configs.map(c => [c.module, c]));

    for (const config of configs) {
      const rules = dependencyRules[config.module];
      if (!rules) continue;

      for (const dep of rules) {
        if (!moduleNames.has(dep.module)) {
          allErrors.push({
            path: config.module,
            message: dep.message,
            severity: dep.severity,
          });
        } else if (dep.paramCheck) {
          // Module exists — perform parameter-level check
          const depConfig = configMap.get(dep.module);
          if (!depConfig) continue;

          const { paramCheck: pc } = dep;
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
              paramFailed = typeof val !== 'number' || val <= (pc.expected as number || 0);
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
              message: dep.message,
              severity: dep.severity,
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

// Auto-generated module rules for all 37 BSW modules
const allModuleNames = [
  'Adc','Arti','Ble','BswM','Can','CanIf','CanNm','CanSM','CanTp','CanTrcv',
  'Com','ComM','Crc','CryIf','Crypto','Csm','Dcm','Dem','Det','Dio',
  'EcuM','Fee','Fls','Gpt','Icu','IoHwAb','Mcl','Mcu','MemIf','Nm',
  'NvM','Os','PduR','Port','Rte','Sbc','Spi',
];

for (const modName of allModuleNames) {
  if (modName === 'Mcu' || modName === 'Can') continue; // already registered above
  yuleasrValidator.registerModuleRules({
    module: modName,
    rules: [],
    parameterRules: {
      [`${modName}DevErrorDetect`]: [{ type: 'required', message: `${modName}DevErrorDetect is required` }],
    },
  });
}
