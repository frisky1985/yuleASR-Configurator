/**
 * @yuletech/core - Module Types
 * AutoSAR 模块定义和类型系统
 */

/**
 * AutoSAR 模块层级
 * - MCAL: Microcontroller Driver Layer
 * - ECUAL: ECU Abstraction Layer
 * - Service: Service Layer
 * - RTE: Runtime Environment
 * - ASW: Application Software
 */
export type ModuleLayer = 'MCAL' | 'ECUAL' | 'Service' | 'RTE' | 'ASW';

/**
 * 模块层级显示名称
 */
export const ModuleLayerNames: Record<ModuleLayer, string> = {
  MCAL: 'Microcontroller Driver Layer',
  ECUAL: 'ECU Abstraction Layer',
  Service: 'Service Layer',
  RTE: 'Runtime Environment',
  ASW: 'Application Software',
};

/**
 * 模块依赖关系
 */
export interface ModuleDependency {
  /** 依赖模块名称 */
  module: string;
  /** 依赖版本范围 (semver) */
  version?: string;
  /** 是否为必需依赖 */
  required: boolean;
  /** 依赖说明 */
  description?: string;
}

/**
 * 模块容器定义
 * 用于组织模块内的配置参数
 */
export interface ContainerSchema {
  /** 容器名称 */
  name: string;
  /** 容器显示标签 */
  label: string;
  /** 容器描述 */
  description?: string;
  /** 容器内的参数 */
  parameters?: string[];
  /** 嵌套子容器 */
  children?: ContainerSchema[];
  /** 是否可多实例 */
  multiple?: boolean;
  /** 最小实例数 */
  minInstances?: number;
  /** 最大实例数 */
  maxInstances?: number;
}

/**
 * 模块元数据
 */
export interface ModuleMetadata {
  /** 作者 */
  author?: string;
  /** 许可证 */
  license?: string;
  /** 文档链接 */
  documentation?: string;
  /** 标签 */
  tags?: string[];
  /** 类别 */
  category?: string;
}

/**
 * 模块 Schema 定义
 * 描述一个 AutoSAR 模块的配置结构
 */
export interface ModuleSchema {
  /** 模块名称 (如: Mcu, Can, Port) */
  name: string;
  /** 模块显示标签 */
  label?: string;
  /** AutoSAR 层级 */
  layer: ModuleLayer;
  /** AutoSAR 版本 */
  version: string;
  /** 模块描述 */
  description?: string;
  /** 可配置参数列表 */
  parameters: ModuleParameter[];
  /** 容器定义 */
  containers?: ContainerSchema[];
  /** 模块依赖 */
  dependencies?: ModuleDependency[];
  /** 模块元数据 */
  metadata?: ModuleMetadata;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 模块参数类型
 */
export type ParameterType =
  | 'boolean'
  | 'integer'
  | 'float'
  | 'string'
  | 'enum'
  | 'reference'
  | 'array'
  | 'object';

/**
 * 验证规则类型
 */
export type ValidationRuleType =
  | 'required'
  | 'min'
  | 'max'
  | 'range'
  | 'pattern'
  | 'custom'
  | 'dependency';

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 规则类型 */
  type: ValidationRuleType;
  /** 规则值 (根据类型不同含义不同) */
  value?: unknown;
  /** 错误消息 */
  message: string;
  /** 自定义验证函数 (仅用于 custom 类型) */
  validator?: string;
}

/**
 * 模块参数定义
 */
export interface ModuleParameter {
  /** 参数名称 */
  name: string;
  /** 参数显示标签 */
  label?: string;
  /** 参数类型 */
  type: ParameterType;
  /** 参数描述 */
  description?: string;
  /** 默认值 */
  default?: unknown;
  /** 数值类型最小值 (integer/float) */
  min?: number;
  /** 数值类型最大值 (integer/float) */
  max?: number;
  /** 字符串最小长度 */
  minLength?: number;
  /** 字符串最大长度 */
  maxLength?: number;
  /** 枚举选项 (enum 类型) */
  options?: ParameterOption[];
  /** 正则表达式模式 (string 类型) */
  pattern?: string;
  /** 验证规则 */
  validation?: ValidationRule[];
  /** 是否只读 */
  readonly?: boolean;
  /** 是否必需 */
  required?: boolean;
  /** 参数分组 */
  group?: string;
  /** 可见性条件 */
  visible?: string;
  /** 引用目标类型 (reference 类型) */
  referenceTarget?: string;
  /** 数组元素类型 (array 类型) */
  items?: ModuleParameter;
  /** 对象属性定义 (object 类型) */
  properties?: ModuleParameter[];
  /** 跨模块参数引用约束 */
  crossReferences?: CrossModuleReference[];
}

/**
 * 跨模块参数引用约束
 * 声明当前参数与另一个模块的参数之间的数值/枚举关系
 */
export interface CrossModuleReference {
  /** 目标模块名称 */
  module: string;
  /** 目标容器名称 (可选，用于容器内参数) */
  container?: string;
  /** 目标参数名称 */
  param: string;
  /** 关系类型 */
  relation: 'equals' | 'less_than' | 'greater_than' | 'in_range' | 'in_enum';
  /** 违反时的严重级别 */
  severity: 'error' | 'warning';
  /** 约束描述 (用于错误消息) */
  description: string;
  /** 是否双向检查 (默认 false) */
  bidirectional?: boolean;
}

/**
 * 参数选项 (用于 enum 类型)
 */
export interface ParameterOption {
  /** 选项值 */
  value: string | number | boolean;
  /** 选项显示标签 */
  label: string;
  /** 选项描述 */
  description?: string;
}

/**
 * 模块配置实例
 */
export interface ModuleConfig {
  /** 模块名称 */
  module: string;
  /** 配置版本 */
  version: string;
  /** 配置参数值 */
  parameters: Record<string, unknown>;
  /** 容器实例 */
  containers?: Record<string, ContainerConfig[]>;
  /** 配置元数据 */
  metadata?: {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 作者 */
    author?: string;
  };
}

/**
 * 容器配置实例
 */
export interface ContainerConfig {
  /** 实例 ID */
  id: string;
  /** 实例名称 */
  name?: string;
  /** 参数值 */
  parameters: Record<string, unknown>;
  /** 子容器 */
  children?: Record<string, ContainerConfig[]>;
}

/**
 * 模块注册表
 * 用于管理所有可用模块
 */
export interface ModuleRegistry {
  /** 注册模块 */
  register(schema: ModuleSchema): void;
  /** 取消注册 */
  unregister(name: string): void;
  /** 获取模块 */
  get(name: string): ModuleSchema | undefined;
  /** 获取所有模块 */
  getAll(): ModuleSchema[];
  /** 按层级获取模块 */
  getByLayer(layer: ModuleLayer): ModuleSchema[];
  /** 检查模块是否存在 */
  has(name: string): boolean;
}
