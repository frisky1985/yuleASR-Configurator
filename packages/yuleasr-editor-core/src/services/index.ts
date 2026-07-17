/**
 * yuleasr-editor-core - Services
 * 业务服务实现
 */

import type { ConfigValidator, ValidationResult } from '@yuletech/core';

import type { ConfigEngine } from '../engine';
import type { ConfigModel, ConfigProject, ConfigChangeEvent } from '../models';

// 导出 Git 服务
export { GitService, GitError } from './gitService';
export type {
  GitServiceConfig,
  CommitInfo,
  BranchInfo,
  DiffInfo,
  DiffHunk,
  FileStatus,
} from './gitService';

/**
 * 验证服务配置
 */
export interface ValidationServiceConfig {
  /** 是否实时验证 */
  realtime?: boolean;
  /** 验证延迟 (毫秒) */
  debounceMs?: number;
  /** 是否忽略警告 */
  ignoreWarnings?: boolean;
}

/**
 * 验证规则
 */
export interface ValidationRule {
  type: 'required' | 'type' | 'range' | 'pattern' | 'custom' | 'dependency';
  path: string;
  message: string;
  condition?: string;
  validate?: (value: unknown, context: Record<string, unknown>) => boolean;
}

/**
 * 验证服务
 * 负责调用验证器进行配置验证
 */
export class ValidationService {
  private engine: ConfigEngine;
  private config: ValidationServiceConfig;
  private validators: Map<string, ConfigValidator> = new Map();
  private customRules: ValidationRule[] = [];
  private debounceTimer?: ReturnType<typeof setTimeout>;
  private isEnabled = true;

  constructor(engine: ConfigEngine, config: ValidationServiceConfig = {}) {
    this.engine = engine;
    this.config = {
      realtime: true,
      debounceMs: 300,
      ignoreWarnings: false,
      ...config,
    };

    this.setupListeners();
  }

  /**
   * 设置事件监听
   */
  private setupListeners(): void {
    if (this.config.realtime) {
      // 实时验证 - 变更时触发
      this.engine.onChange((event: ConfigChangeEvent) => {
        if (this.isEnabled && event.type !== 'reset') {
          this.debouncedValidate();
        }
      });
    }
  }

  /**
   * 延迟验证
   */
  private debouncedValidate(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.validate();
    }, this.config.debounceMs);
  }

  /**
   * 注册验证器
   */
  registerValidator(moduleName: string, validator: ConfigValidator): void {
    this.validators.set(moduleName, validator);
  }

  /**
   * 注销验证器
   */
  unregisterValidator(moduleName: string): void {
    this.validators.delete(moduleName);
  }

  /**
   * 添加自定义验证规则
   */
  addCustomRule(rule: ValidationRule): void {
    this.customRules.push(rule);
  }

  /**
   * 移除自定义验证规则
   */
  removeCustomRule(index: number): void {
    this.customRules.splice(index, 1);
  }

  /**
   * 执行验证
   */
  validate(configId?: string): ValidationResult {
    const result = this.engine.validate();

    // 执行自定义规则验证
    const config = configId
      ? this.engine.getProject().getConfig(configId)
      : this.engine.getCurrentConfig();

    if (config) {
      for (const rule of this.customRules) {
        const ruleResult = this.validateCustomRule(rule, config);
        if (!ruleResult.valid) {
          result.errors.push(...ruleResult.errors);
          result.valid = false;
        }
      }
    }

    return result;
  }

  /**
   * 验证自定义规则
   */
  private validateCustomRule(rule: ValidationRule, config: ConfigModel): ValidationResult {
    const errors: Array<{
      severity: 'error';
      code: string;
      message: string;
      path: string;
      parameter?: string;
    }> = [];

    if (rule.validate) {
      const value = this.engine.getValue(rule.path);
      const context: Record<string, unknown> = {};

      // 收集上下文
      for (const [moduleName, module] of config.modules) {
        for (const [paramName, param] of module.parameters) {
          context[`${moduleName}.${paramName}`] = param.value;
        }
      }

      const isValid = rule.validate(value, context);
      if (!isValid) {
        errors.push({
          severity: 'error',
          code: 'CUSTOM_RULE',
          message: rule.message,
          path: rule.path,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * 验证特定模块
   */
  validateModule(moduleName: string): ValidationResult {
    const config = this.engine.getCurrentConfig();
    if (!config) {
      return { valid: false, errors: [], warnings: [] };
    }

    const module = config.modules.get(moduleName);
    if (!module) {
      return {
        valid: false,
        errors: [
          {
            severity: 'error',
            code: 'MODULE_NOT_FOUND',
            message: `模块 ${moduleName} 不存在`,
            path: moduleName,
          },
        ],
        warnings: [],
      };
    }

    // 清空之前的错误
    module.errors = [];
    module.warnings = [];

    // 验证模块的所有参数
    const errors: Array<{
      severity: 'error';
      code: string;
      message: string;
      path: string;
      parameter?: string;
    }> = [];

    for (const [paramName, param] of module.parameters) {
      // 检查必填字段
      if (
        module.schema.parameters.find(p => p.name === paramName)?.required &&
        (param.value === undefined || param.value === null || param.value === '')
      ) {
        const error = {
          severity: 'error' as const,
          code: 'REQUIRED',
          message: `参数 ${paramName} 为必填项`,
          path: `${moduleName}.${paramName}`,
          parameter: paramName,
        };
        errors.push(error);
        module.errors.push(error.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * 验证特定路径
   */
  validatePath(path: string): ValidationResult {
    const config = this.engine.getCurrentConfig();
    if (!config) {
      return { valid: false, errors: [], warnings: [] };
    }

    const parts = path.split('.');
    if (parts.length < 2) {
      return {
        valid: false,
        errors: [
          {
            severity: 'error',
            code: 'INVALID_PATH',
            message: `无效的路径: ${path}`,
            path,
          },
        ],
        warnings: [],
      };
    }

    const [moduleName, ...paramParts] = parts;
    const module = config.modules.get(moduleName);

    if (!module) {
      return {
        valid: false,
        errors: [
          {
            severity: 'error',
            code: 'MODULE_NOT_FOUND',
            message: `模块 ${moduleName} 不存在`,
            path,
          },
        ],
        warnings: [],
      };
    }

    const paramName = paramParts.join('.');
    const param = module.parameters.get(paramName);

    if (!param) {
      return {
        valid: false,
        errors: [
          {
            severity: 'error',
            code: 'PARAMETER_NOT_FOUND',
            message: `参数 ${paramName} 不存在`,
            path,
            parameter: paramName,
          },
        ],
        warnings: [],
      };
    }

    const errors: Array<{
      severity: 'error';
      code: string;
      message: string;
      path: string;
      parameter?: string;
    }> = [];

    // 检查必填
    const schemaParam = module.schema.parameters.find(p => p.name === paramName);
    if (
      schemaParam?.required &&
      (param.value === undefined || param.value === null || param.value === '')
    ) {
      errors.push({
        severity: 'error',
        code: 'REQUIRED',
        message: `参数 ${paramName} 为必填项`,
        path,
        parameter: paramName,
      });
    }

    const result = {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };

    // 更新参数错误状态
    if (!result.valid) {
      param.errors = result.errors.map(e => e.message);
      module.errors.push(...param.errors);
    } else {
      param.errors = undefined;
    }

    return result;
  }

  /**
   * 启用实时验证
   */
  enableRealtimeValidation(): void {
    this.isEnabled = true;
  }

  /**
   * 禁用实时验证
   */
  disableRealtimeValidation(): void {
    this.isEnabled = false;
  }

  /**
   * 检查是否实时验证启用
   */
  isRealtimeValidationEnabled(): boolean {
    return this.isEnabled && this.config.realtime === true;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

/**
 * 持久化配置
 */
export interface PersistenceConfig {
  /** 存储类型 */
  type: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory' | 'custom';
  /** 存储键前缀 */
  prefix?: string;
  /** 自定义存储实现 */
  storage?: Storage;
}

/**
 * 存储数据格式
 */
export interface StorageData {
  version: string;
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * 持久化服务
 * 负责配置的存储和读取
 */
export class PersistenceService {
  private config: PersistenceConfig;
  private memoryStore: Map<string, string> = new Map();

  constructor(config: PersistenceConfig) {
    this.config = {
      prefix: 'yuleasr:',
      ...config,
    };
  }

  /**
   * 保存配置
   */
  async save(configId: string, data: Record<string, unknown>): Promise<boolean> {
    try {
      const storageData: StorageData = {
        version: '1.0.0',
        timestamp: Date.now(),
        data,
      };

      const key = this.getKey(configId);
      const value = JSON.stringify(storageData);

      switch (this.config.type) {
        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
            return true;
          }
          return false;

        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(key, value);
            return true;
          }
          return false;

        case 'indexedDB':
          return await this.saveToIndexedDB(key, value);

        case 'memory':
          this.memoryStore.set(key, value);
          return true;

        case 'custom':
          if (this.config.storage) {
            this.config.storage.setItem(key, value);
            return true;
          }
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  }

  /**
   * 加载配置
   */
  async load(configId: string): Promise<Record<string, unknown> | null> {
    try {
      const key = this.getKey(configId);
      let value: string | null = null;

      switch (this.config.type) {
        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            value = localStorage.getItem(key);
          }
          break;

        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            value = sessionStorage.getItem(key);
          }
          break;

        case 'indexedDB':
          value = await this.loadFromIndexedDB(key);
          break;

        case 'memory':
          value = this.memoryStore.get(key) ?? null;
          break;

        case 'custom':
          if (this.config.storage) {
            value = this.config.storage.getItem(key);
          }
          break;
      }

      if (value) {
        const storageData = JSON.parse(value) as StorageData;
        return storageData.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  }

  /**
   * 删除配置
   */
  async delete(configId: string): Promise<boolean> {
    try {
      const key = this.getKey(configId);

      switch (this.config.type) {
        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
            return true;
          }
          return false;

        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(key);
            return true;
          }
          return false;

        case 'indexedDB':
          return await this.deleteFromIndexedDB(key);

        case 'memory':
          this.memoryStore.delete(key);
          return true;

        case 'custom':
          if (this.config.storage) {
            this.config.storage.removeItem(key);
            return true;
          }
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to delete config:', error);
      return false;
    }
  }

  /**
   * 列出所有保存的配置ID
   */
  async list(): Promise<string[]> {
    const configs: string[] = [];
    const prefix = this.config.prefix ?? 'yuleasr:';

    switch (this.config.type) {
      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(prefix)) {
              configs.push(key.slice(prefix.length));
            }
          }
        }
        break;

      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(prefix)) {
              configs.push(key.slice(prefix.length));
            }
          }
        }
        break;

      case 'indexedDB':
        return await this.listFromIndexedDB();

      case 'memory':
        for (const key of this.memoryStore.keys()) {
          if (key.startsWith(prefix)) {
            configs.push(key.slice(prefix.length));
          }
        }
        break;

      case 'custom':
        if (this.config.storage) {
          for (let i = 0; i < this.config.storage.length; i++) {
            const key = this.config.storage.key(i);
            if (key?.startsWith(prefix)) {
              configs.push(key.slice(prefix.length));
            }
          }
        }
        break;
    }

    return configs;
  }

  /**
   * 清空所有配置
   */
  async clear(): Promise<boolean> {
    try {
      const configs = await this.list();
      await Promise.all(configs.map(id => this.delete(id)));
      return true;
    } catch (error) {
      console.error('Failed to clear configs:', error);
      return false;
    }
  }

  /**
   * 生成存储键
   */
  private getKey(configId: string): string {
    return `${this.config.prefix}${configId}`;
  }

  /**
   * 保存到 IndexedDB
   */
  private async saveToIndexedDB(key: string, value: string): Promise<boolean> {
    return new Promise(resolve => {
      const request = indexedDB.open('yuleasr-editor', 1);

      request.onerror = () => resolve(false);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('configs')) {
          db.createObjectStore('configs', { keyPath: 'key' });
        }
      };

      request.onsuccess = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['configs'], 'readwrite');
        const store = transaction.objectStore('configs');
        const putRequest = store.put({ key, value });

        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => resolve(false);
      };
    });
  }

  /**
   * 从 IndexedDB 加载
   */
  private async loadFromIndexedDB(key: string): Promise<string | null> {
    return new Promise(resolve => {
      const request = indexedDB.open('yuleasr-editor', 1);

      request.onerror = () => resolve(null);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('configs')) {
          db.createObjectStore('configs', { keyPath: 'key' });
        }
      };

      request.onsuccess = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['configs'], 'readonly');
        const store = transaction.objectStore('configs');
        const getRequest = store.get(key);

        getRequest.onsuccess = () => {
          const result = getRequest.result as { value: string } | undefined;
          resolve(result?.value ?? null);
        };
        getRequest.onerror = () => resolve(null);
      };
    });
  }

  /**
   * 从 IndexedDB 删除
   */
  private async deleteFromIndexedDB(key: string): Promise<boolean> {
    return new Promise(resolve => {
      const request = indexedDB.open('yuleasr-editor', 1);

      request.onerror = () => resolve(false);

      request.onsuccess = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['configs'], 'readwrite');
        const store = transaction.objectStore('configs');
        const deleteRequest = store.delete(key);

        deleteRequest.onsuccess = () => resolve(true);
        deleteRequest.onerror = () => resolve(false);
      };
    });
  }

  /**
   * 从 IndexedDB 列出
   */
  private async listFromIndexedDB(): Promise<string[]> {
    return new Promise(resolve => {
      const configs: string[] = [];
      const prefix = this.config.prefix ?? 'yuleasr:';

      const request = indexedDB.open('yuleasr-editor', 1);

      request.onerror = () => resolve([]);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('configs')) {
          db.createObjectStore('configs', { keyPath: 'key' });
        }
      };

      request.onsuccess = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['configs'], 'readonly');
        const store = transaction.objectStore('configs');
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            const key = cursor.key as string;
            if (key.startsWith(prefix)) {
              configs.push(key.slice(prefix.length));
            }
            cursor.continue();
          } else {
            resolve(configs);
          }
        };

        cursorRequest.onerror = () => resolve(configs);
      };
    });
  }

  /**
   * 导出配置为 JSON 文件
   */
  exportToJSON(configId: string, data: Record<string, unknown>): string {
    const exportData = {
      id: configId,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 从 JSON 文件导入配置
   */
  importFromJSON(json: string): { configId: string; data: Record<string, unknown> } | null {
    try {
      const importData = JSON.parse(json) as {
        id: string;
        data: Record<string, unknown>;
        version?: string;
      };

      if (importData.id && importData.data) {
        return {
          configId: importData.id,
          data: importData.data,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to import config:', error);
      return null;
    }
  }
}

/**
 * 服务容器
 */
export class ServiceContainer {
  private services: Map<string, unknown> = new Map();
  private project: ConfigProject;
  private engine: ConfigEngine;
  private validationService?: ValidationService;
  private persistenceService?: PersistenceService;

  constructor(project: ConfigProject, engine: ConfigEngine) {
    this.project = project;
    this.engine = engine;
  }

  /**
   * 初始化验证服务
   */
  initValidationService(config?: ValidationServiceConfig): ValidationService {
    this.validationService = new ValidationService(this.engine, config);
    this.services.set('validation', this.validationService);
    return this.validationService;
  }

  /**
   * 初始化持久化服务
   */
  initPersistenceService(config: PersistenceConfig): PersistenceService {
    this.persistenceService = new PersistenceService(config);
    this.services.set('persistence', this.persistenceService);
    return this.persistenceService;
  }

  /**
   * 注册服务
   */
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * 获取服务
   */
  get<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /**
   * 获取验证服务
   */
  getValidationService(): ValidationService | undefined {
    return this.validationService;
  }

  /**
   * 获取持久化服务
   */
  getPersistenceService(): PersistenceService | undefined {
    return this.persistenceService;
  }

  /**
   * 获取项目
   */
  getProject(): ConfigProject {
    return this.project;
  }

  /**
   * 获取引擎
   */
  getEngine(): ConfigEngine {
    return this.engine;
  }

  /**
   * 清理所有服务
   */
  async dispose(): Promise<void> {
    for (const [_name, service] of this.services) {
      if (
        service &&
        typeof service === 'object' &&
        'dispose' in service &&
        typeof service.dispose === 'function'
      ) {
        await (service as { dispose(): Promise<void> }).dispose();
      }
    }
    this.services.clear();
  }
}

/**
 * 基础服务类
 */
export abstract class BaseService {
  protected container: ServiceContainer;

  constructor(container: ServiceContainer) {
    this.container = container;
  }

  /**
   * 初始化服务
   */
  abstract init(): Promise<void>;

  /**
   * 释放服务
   */
  abstract dispose(): Promise<void>;
}
