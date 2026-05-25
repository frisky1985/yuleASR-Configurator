/**
 * yuleasr-editor-core - Models
 * 配置数据模型定义
 */

import type {
  ModuleConfig,
  ModuleSchema,
  ParameterValue,
  ValidationResult,
  ValidationError,
} from '@yuletech/core';

// 本地别名：验证警告类型 (兼容旧代码)
export type ValidationWarning = ValidationError;

/**
 * 配置模型 - 代表一个完整的配置文件
 */
export interface ConfigModel {
  /** 配置唯一标识 */
  id: string;
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** 配置版本 */
  version: string;
  /** 包含的模块配置 */
  modules: Map<string, ModuleConfigModel>;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 是否已修改 */
  modified: boolean;
  /** 最后保存时间 */
  lastSaved?: Date;
  /** 配置元数据 */
  metadata?: ConfigMetadata;
}

/**
 * 配置元数据
 */
export interface ConfigMetadata {
  /** 作者 */
  author?: string;
  /** 项目 */
  project?: string;
  /** ECU ID */
  ecuId?: string;
  /** 硬件版本 */
  hardwareVersion?: string;
  /** 软件版本 */
  softwareVersion?: string;
  /** 自定义标签 */
  tags?: string[];
}

/**
 * 模块配置模型 - 代表一个模块的配置实例
 */
export interface ModuleConfigModel {
  /** 模块名称 */
  name: string;
  /** 模块 Schema */
  schema: ModuleSchema;
  /** 模块配置实例 */
  config: ModuleConfig;
  /** 参数值映射 */
  parameters: Map<string, ParameterValueModel>;
  /** 是否已修改 */
  modified: boolean;
  /** 验证错误 */
  errors: ValidationError[];
  /** 验证警告 */
  warnings: ValidationWarning[];
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 参数值模型 - 代表一个参数的值
 */
export interface ParameterValueModel {
  /** 参数名称 */
  name: string;
  /** 参数路径 */
  path: string;
  /** 参数值 */
  value: ParameterValue;
  /** 默认值 */
  defaultValue: ParameterValue;
  /** 是否使用默认值 */
  isDefault: boolean;
  /** 参数类型 */
  type: string;
  /** 是否已修改 */
  modified: boolean;
  /** 修改时间 */
  modifiedAt?: Date;
  /** 验证错误 */
  errors?: string[];
}

/**
 * 配置变更事件
 */
export interface ConfigChangeEvent {
  /** 变更类型 */
  type: 'add' | 'update' | 'delete' | 'reset';
  /** 变更路径 */
  path: string;
  /** 旧值 */
  oldValue?: ParameterValue;
  /** 新值 */
  newValue?: ParameterValue;
  /** 模块名称 */
  module?: string;
  /** 参数名称 */
  parameter?: string;
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 配置状态
 */
export interface ConfigState {
  version: string;
  modules: Map<string, ModuleModel>;
  modified: boolean;
  lastSaved?: Date;
}

/**
 * 模块模型 (简化版本)
 */
export interface ModuleModel {
  name: string;
  schema: ModuleSchema;
  config: ModuleConfig;
  modified: boolean;
  errors: string[];
}

/**
 * 配置项目模型 - 管理多个配置文件
 */
export class ConfigProject {
  private configs: Map<string, ConfigModel> = new Map();
  private activeConfigId?: string;

  /**
   * 创建新配置
   */
  createConfig(id: string, name: string, options?: Partial<ConfigModel>): ConfigModel {
    const now = new Date();
    const config: ConfigModel = {
      id,
      name,
      version: '1.0.0',
      modules: new Map(),
      createdAt: now,
      updatedAt: now,
      modified: false,
      ...options,
    };
    this.configs.set(id, config);
    return config;
  }

  /**
   * 获取配置
   */
  getConfig(id: string): ConfigModel | undefined {
    return this.configs.get(id);
  }

  /**
   * 获取所有配置
   */
  getAllConfigs(): ConfigModel[] {
    return Array.from(this.configs.values());
  }

  /**
   * 删除配置
   */
  deleteConfig(id: string): boolean {
    return this.configs.delete(id);
  }

  /**
   * 设置活动配置
   */
  setActiveConfig(id: string): boolean {
    if (this.configs.has(id)) {
      this.activeConfigId = id;
      return true;
    }
    return false;
  }

  /**
   * 获取活动配置
   */
  getActiveConfig(): ConfigModel | undefined {
    if (this.activeConfigId) {
      return this.configs.get(this.activeConfigId);
    }
    return this.configs.values().next().value;
  }

  /**
   * 添加模块到配置
   */
  addModule(configId: string, module: ModuleConfigModel): boolean {
    const config = this.configs.get(configId);
    if (config) {
      config.modules.set(module.name, module);
      config.modified = true;
      config.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * 从配置中移除模块
   */
  removeModule(configId: string, moduleName: string): boolean {
    const config = this.configs.get(configId);
    if (config) {
      const removed = config.modules.delete(moduleName);
      if (removed) {
        config.modified = true;
        config.updatedAt = new Date();
      }
      return removed;
    }
    return false;
  }

  /**
   * 标记配置为已保存
   */
  markSaved(configId: string): boolean {
    const config = this.configs.get(configId);
    if (config) {
      config.modified = false;
      config.lastSaved = new Date();
      return true;
    }
    return false;
  }

  /**
   * 检查配置是否已修改
   */
  isModified(configId: string): boolean {
    const config = this.configs.get(configId);
    return config?.modified ?? false;
  }

  /**
   * 导出配置为 JSON
   */
  exportConfig(configId: string): Record<string, unknown> | undefined {
    const config = this.configs.get(configId);
    if (!config) return undefined;

    const modules: Record<string, unknown> = {};
    for (const [name, module] of config.modules) {
      modules[name] = {
        name: module.name,
        parameters: Object.fromEntries(
          Array.from(module.parameters.entries()).map(([key, param]) => [
            key,
            param.value,
          ])
        ),
        enabled: module.enabled,
      };
    }

    return {
      id: config.id,
      name: config.name,
      version: config.version,
      description: config.description,
      metadata: config.metadata,
      modules,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  /**
   * 导入配置
   */
  importConfig(data: Record<string, unknown>): ConfigModel {
    const config = this.createConfig(
      (data.id as string) ?? `config-${Date.now()}`,
      (data.name as string) ?? 'Imported Config',
      {
        version: (data.version as string) ?? '1.0.0',
        description: data.description as string,
        metadata: data.metadata as ConfigMetadata,
        createdAt: new Date((data.createdAt as string) ?? Date.now()),
        updatedAt: new Date((data.updatedAt as string) ?? Date.now()),
      }
    );

    // 导入模块配置
    if (data.modules && typeof data.modules === 'object') {
      for (const [moduleName, moduleData] of Object.entries(data.modules)) {
        const params =
          typeof moduleData === 'object' && moduleData !== null
            ? (moduleData as Record<string, unknown>).parameters
            : undefined;

        if (params && typeof params === 'object') {
          for (const [paramName, value] of Object.entries(params)) {
            this.setParameterValue(config.id, moduleName, paramName, value as ParameterValue);
          }
        }
      }
    }

    return config;
  }

  /**
   * 设置参数值
   */
  setParameterValue(
    configId: string,
    moduleName: string,
    paramName: string,
    value: ParameterValue
  ): boolean {
    const config = this.configs.get(configId);
    if (!config) return false;

    const module = config.modules.get(moduleName);
    if (!module) return false;

    // 更新参数值
    const existingParam = module.parameters.get(paramName);
    const paramValue: ParameterValueModel = {
      name: paramName,
      path: `${moduleName}.${paramName}`,
      value,
      defaultValue: existingParam?.defaultValue ?? value,
      isDefault: false,
      type: typeof value,
      modified: true,
      modifiedAt: new Date(),
    };

    module.parameters.set(paramName, paramValue);
    module.modified = true;
    config.modified = true;
    config.updatedAt = new Date();

    return true;
  }

  /**
   * 获取参数值
   */
  getParameterValue(
    configId: string,
    moduleName: string,
    paramName: string
  ): ParameterValue | undefined {
    const config = this.configs.get(configId);
    if (!config) return undefined;

    const module = config.modules.get(moduleName);
    if (!module) return undefined;

    const param = module.parameters.get(paramName);
    return param?.value;
  }

  /**
   * 重置参数为默认值
   */
  resetParameterValue(configId: string, moduleName: string, paramName: string): boolean {
    const config = this.configs.get(configId);
    if (!config) return false;

    const module = config.modules.get(moduleName);
    if (!module) return false;

    const param = module.parameters.get(paramName);
    if (!param) return false;

    param.value = param.defaultValue;
    param.isDefault = true;
    param.modified = true;
    param.modifiedAt = new Date();

    config.modified = true;
    config.updatedAt = new Date();

    return true;
  }
}

/**
 * 创建参数值模型
 */
export function createParameterValueModel(
  name: string,
  value: ParameterValue,
  defaultValue?: ParameterValue
): ParameterValueModel {
  const isDefault = defaultValue !== undefined && value === defaultValue;
  return {
    name,
    path: name,
    value,
    defaultValue: defaultValue ?? value,
    isDefault,
    type: typeof value,
    modified: false,
  };
}

/**
 * 创建模块配置模型
 */
export function createModuleConfigModel(
  name: string,
  schema: ModuleSchema,
  config: ModuleConfig
): ModuleConfigModel {
  const parameters = new Map<string, ParameterValueModel>();

  // 初始化参数
  for (const param of schema.parameters) {
    const value = (config.parameters[param.name] as ParameterValue) ?? param.default;
    parameters.set(
      param.name,
      createParameterValueModel(param.name, value as ParameterValue, param.default as ParameterValue)
    );
  }

  return {
    name,
    schema,
    config,
    parameters,
    modified: false,
    errors: [],
    warnings: [],
    enabled: true,
  };
}

/**
 * 克隆配置模型
 */
export function cloneConfigModel(config: ConfigModel): ConfigModel {
  return {
    ...config,
    modules: new Map(
      Array.from(config.modules.entries()).map(([key, module]) => [
        key,
        {
          ...module,
          parameters: new Map(
            Array.from(module.parameters.entries()).map(([pkey, param]) => [
              pkey,
              { ...param },
            ])
          ),
        },
      ])
    ),
    createdAt: new Date(config.createdAt),
    updatedAt: new Date(config.updatedAt),
    lastSaved: config.lastSaved ? new Date(config.lastSaved) : undefined,
  };
}
