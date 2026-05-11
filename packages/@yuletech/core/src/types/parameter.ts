/**
 * @yuletech/core - Parameter Types
 * AutoSAR 配置参数类型定义
 */

/**
 * 参数基础类型
 */
export type ParameterBaseType = 
  | 'boolean' 
  | 'integer' 
  | 'float' 
  | 'string' 
  | 'enum' 
  | 'reference'
  | 'array'
  | 'object';

/**
 * 参数值类型
 */
export type ParameterValue = 
  | boolean 
  | number 
  | string 
  | null 
  | ParameterValue[] 
  | { [key: string]: ParameterValue };

/**
 * 参数验证规则类型
 */
export type ParamValidationRuleType =
  | 'required'
  | 'min'
  | 'max'
  | 'range'
  | 'pattern'
  | 'enum'
  | 'length'
  | 'custom'
  | 'dependency'
  | 'unique';

/**
 * 参数验证规则
 */
export interface ParameterValidationRule {
  /** 规则类型 */
  type: ValidationRuleType;
  /** 规则值 */
  value?: unknown;
  /** 错误消息 */
  message?: string;
  /** 规则启用条件 (表达式) */
  condition?: string;
}

/**
 * 枚举选项定义
 */
export interface EnumOption {
  /** 选项值 */
  value: string | number | boolean;
  /** 显示标签 */
  label: string;
  /** 选项描述 */
  description?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 参数约束定义
 */
export interface ParameterConstraints {
  /** 数值最小值 */
  min?: number;
  /** 数值最大值 */
  max?: number;
  /** 字符串最小长度 */
  minLength?: number;
  /** 字符串最大长度 */
  maxLength?: number;
  /** 正则表达式 */
  pattern?: string;
  /** 格式化模板 */
  format?: string;
  /** 精度 (小数位数) */
  precision?: number;
  /** 步长 */
  step?: number;
}

/**
 * UI 展示配置
 */
export interface ParameterUIConfig {
  /** 控件类型 */
  widget?: 
    | 'input' 
    | 'textarea' 
    | 'number' 
    | 'switch' 
    | 'select' 
    | 'radio' 
    | 'checkbox' 
    | 'slider'
    | 'color'
    | 'date'
    | 'reference'
    | 'array'
    | 'object';
  /** 占位符 */
  placeholder?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 是否隐藏标签 */
  hideLabel?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否多行 */
  multiline?: boolean;
  /** 行数 (textarea) */
  rows?: number;
  /** 占位符显示 */
  showPlaceholder?: boolean;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 图标 */
  icon?: string;
}

/**
 * 参数定义接口
 * 用于定义一个可配置参数的结构
 */
export interface ParameterDefinition {
  /** 参数名 */
  name: string;
  /** 显示标签 */
  label?: string;
  /** 参数类型 */
  type: ParameterBaseType;
  /** 参数描述 */
  description?: string;
  /** 默认值 */
  default?: ParameterValue;
  /** 是否必填 */
  required?: boolean;
  /** 验证规则 */
  validation?: ParameterValidationRule[];
  /** 参数约束 */
  constraints?: ParameterConstraints;
  /** 枚举选项 (enum 类型) */
  options?: EnumOption[];
  /** UI 配置 */
  ui?: ParameterUIConfig;
  /** 引用目标类型 (reference 类型) */
  referenceTarget?: ReferenceTarget;
  /** 数组元素类型 (array 类型) */
  items?: ParameterDefinition;
  /** 对象属性 (object 类型) */
  properties?: Record<string, ParameterDefinition>;
  /** 可见性条件表达式 */
  visibleWhen?: string;
  /** 启用条件表达式 */
  enabledWhen?: string;
  /** 分组 */
  group?: string;
  /** 排序优先级 */
  order?: number;
}

/**
 * 引用目标定义
 */
export interface ReferenceTarget {
  /** 目标模块 */
  module?: string;
  /** 目标容器 */
  container?: string;
  /** 目标参数 */
  parameter?: string;
  /** 过滤条件 */
  filter?: string;
}

/**
 * 参数值实例
 */
export interface ParameterValueInstance {
  /** 参数名 */
  name: string;
  /** 参数值 */
  value: ParameterValue;
  /** 是否为默认值 */
  isDefault: boolean;
  /** 修改时间 */
  modifiedAt?: string;
}

/**
 * 参数类型工厂
 */
export class ParameterTypeFactory {
  /**
   * 创建布尔参数
   */
  static createBoolean(name: string, options: Partial<ParameterDefinition> = {}): ParameterDefinition {
    return {
      name,
      type: 'boolean',
      default: false,
      ui: { widget: 'switch' },
      ...options,
    };
  }

  /**
   * 创建整数参数
   */
  static createInteger(name: string, options: Partial<ParameterDefinition> & Partial<ParameterConstraints> = {}): ParameterDefinition {
    const { min, max, step, ...rest } = options;
    return {
      name,
      type: 'integer',
      default: 0,
      constraints: { min, max, step },
      ui: { widget: 'number' },
      ...rest,
    };
  }

  /**
   * 创建浮点数参数
   */
  static createFloat(name: string, options: Partial<ParameterDefinition> & Partial<ParameterConstraints> = {}): ParameterDefinition {
    const { min, max, precision, step, ...rest } = options;
    return {
      name,
      type: 'float',
      default: 0.0,
      constraints: { min, max, precision, step },
      ui: { widget: 'number' },
      ...rest,
    };
  }

  /**
   * 创建字符串参数
   */
  static createString(name: string, options: Partial<ParameterDefinition> & Partial<ParameterConstraints> = {}): ParameterDefinition {
    const { minLength, maxLength, pattern, ...rest } = options;
    return {
      name,
      type: 'string',
      default: '',
      constraints: { minLength, maxLength, pattern },
      ui: { widget: 'input' },
      ...rest,
    };
  }

  /**
   * 创建枚举参数
   */
  static createEnum(name: string, options: EnumOption[], config: Partial<ParameterDefinition> = {}): ParameterDefinition {
    return {
      name,
      type: 'enum',
      default: options[0]?.value,
      options,
      ui: { widget: 'select' },
      ...config,
    };
  }

  /**
   * 创建引用参数
   */
  static createReference(name: string, target: ReferenceTarget, options: Partial<ParameterDefinition> = {}): ParameterDefinition {
    return {
      name,
      type: 'reference',
      referenceTarget: target,
      ui: { widget: 'reference' },
      ...options,
    };
  }

  /**
   * 创建数组参数
   */
  static createArray(name: string, itemType: ParameterDefinition, options: Partial<ParameterDefinition> = {}): ParameterDefinition {
    return {
      name,
      type: 'array',
      default: [],
      items: itemType,
      ui: { widget: 'array' },
      ...options,
    };
  }

  /**
   * 创建对象参数
   */
  static createObject(name: string, properties: Record<string, ParameterDefinition>, options: Partial<ParameterDefinition> = {}): ParameterDefinition {
    return {
      name,
      type: 'object',
      default: {},
      properties,
      ui: { widget: 'object' },
      ...options,
    };
  }
}

/**
 * 验证参数值
 */
export function validateParameterValue(
  definition: ParameterDefinition,
  value: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 必填验证
  if (definition.required && (value === undefined || value === null || value === '')) {
    errors.push(definition.validation?.find(v => v.type === 'required')?.message || `参数 ${definition.name} 为必填项`);
  }

  if (value === undefined || value === null) {
    return { valid: errors.length === 0, errors };
  }

  const constraints = definition.constraints;

  // 类型特定验证
  switch (definition.type) {
    case 'integer':
    case 'float':
      if (typeof value !== 'number') {
        errors.push(`参数 ${definition.name} 必须是数值`);
      } else {
        if (constraints?.min !== undefined && value < constraints.min) {
          errors.push(`参数 ${definition.name} 不能小于 ${constraints.min}`);
        }
        if (constraints?.max !== undefined && value > constraints.max) {
          errors.push(`参数 ${definition.name} 不能大于 ${constraints.max}`);
        }
      }
      break;

    case 'string':
      if (typeof value !== 'string') {
        errors.push(`参数 ${definition.name} 必须是字符串`);
      } else {
        if (constraints?.minLength !== undefined && value.length < constraints.minLength) {
          errors.push(`参数 ${definition.name} 长度不能小于 ${constraints.minLength}`);
        }
        if (constraints?.maxLength !== undefined && value.length > constraints.maxLength) {
          errors.push(`参数 ${definition.name} 长度不能大于 ${constraints.maxLength}`);
        }
        if (constraints?.pattern && !new RegExp(constraints.pattern).test(value)) {
          errors.push(`参数 ${definition.name} 格式不正确`);
        }
      }
      break;

    case 'enum':
      if (definition.options && !definition.options.some(opt => opt.value === value)) {
        errors.push(`参数 ${definition.name} 的值不在允许范围内`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`参数 ${definition.name} 必须是数组`);
      } else if (definition.items) {
        value.forEach((item, index) => {
          const items = definition.items;
          if (items) {
            const result = validateParameterValue(items, item);
            if (!result.valid) {
              errors.push(...result.errors.map(e => `[第${index + 1}项] ${e}`));
            }
          }
        });
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`参数 ${definition.name} 必须是对象`);
      } else if (definition.properties) {
        Object.entries(definition.properties).forEach(([key, prop]) => {
          const result = validateParameterValue(prop, (value as Record<string, unknown>)[key]);
          if (!result.valid) {
            errors.push(...result.errors.map(e => `[${key}] ${e}`));
          }
        });
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}
