/**
 * yuleasr-editor-core - Engine
 * 配置引擎实现
 */

import type { ValidationResult, ValidationError, ValidationWarning } from '@yuletech/core';
import EventEmitter from 'eventemitter3';
import type { ConfigProject, ConfigModel, ModuleConfigModel, ParameterValueModel } from '../models';
import type { ConfigChangeEvent, ParameterValue } from '../models';

/**
 * 历史记录类型
 */
export interface HistoryEntry {
  type: 'set' | 'delete' | 'add' | 'batch';
  path: string;
  oldValue?: ParameterValue;
  newValue?: ParameterValue;
  module?: string;
  parameter?: string;
  timestamp: number;
  description?: string;
}

/**
 * 批量操作历史记录
 */
export interface BatchHistoryEntry extends HistoryEntry {
  type: 'batch';
  entries: HistoryEntry[];
}

/**
 * 历史管理器
 */
export class HistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex = -1;
  private maxSize = 100;

  /**
   * 添加历史记录
   */
  push(entry: HistoryEntry): void {
    // 删除 redo 状态的历史记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(entry);
    this.currentIndex++;

    // 限制历史记录数量
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * 批量添加历史记录
   */
  pushBatch(entries: HistoryEntry[], description?: string): void {
    const batchEntry: BatchHistoryEntry = {
      type: 'batch',
      path: entries[0]?.path ?? '',
      entries,
      timestamp: Date.now(),
      description,
    };
    this.push(batchEntry);
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 撤销上一次操作
   */
  undo(): HistoryEntry | undefined {
    if (!this.canUndo()) return undefined;
    return this.history[this.currentIndex--];
  }

  /**
   * 重做上一次撤销的操作
   */
  redo(): HistoryEntry | undefined {
    if (!this.canRedo()) return undefined;
    return this.history[++this.currentIndex];
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * 获取当前历史记录数量
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * 获取当前位置
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * 获取所有历史记录
   */
  getAllHistory(): readonly HistoryEntry[] {
    return this.history;
  }
}

/**
 * 引擎事件
 */
export interface EngineEvents {
  change: (event: ConfigChangeEvent) => void;
  validate: (result: ValidationResult) => void;
  save: (configId: string) => void;
  undo: (entry: HistoryEntry) => void;
  redo: (entry: HistoryEntry) => void;
  error: (error: Error) => void;
}

/**
 * 配置引擎类
 */
export class ConfigEngine extends EventEmitter<EngineEvents> {
  private project: ConfigProject;
  private history: HistoryManager;
  private currentConfigId?: string;
  private validationResults: Map<string, ValidationResult> = new Map();

  constructor(project: ConfigProject) {
    super();
    this.project = project;
    this.history = new HistoryManager();
  }

  /**
   * 设置当前配置
   */
  setCurrentConfig(configId: string): boolean {
    const config = this.project.getConfig(configId);
    if (config) {
      this.currentConfigId = configId;
      this.history.clear();
      this.validationResults.clear();
      return true;
    }
    return false;
  }

  /**
   * 获取当前配置ID
   */
  getCurrentConfigId(): string | undefined {
    return this.currentConfigId;
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig(): ConfigModel | undefined {
    if (this.currentConfigId) {
      return this.project.getConfig(this.currentConfigId);
    }
    return this.project.getActiveConfig();
  }

  /**
   * 通过路径获取值
   * 路径格式: moduleName.parameterName 或 moduleName.containerName.parameterName
   */
  getValue(path: string): unknown {
    const config = this.getCurrentConfig();
    if (!config) return undefined;

    const parts = path.split('.');
    if (parts.length < 2) return undefined;

    const [moduleName, ...paramParts] = parts;
    const module = config.modules.get(moduleName);
    if (!module) return undefined;

    const paramName = paramParts.join('.');
    const param = module.parameters.get(paramName);
    return param?.value;
  }

  /**
   * 通过路径设置值
   */
  setValue(path: string, value: ParameterValue): boolean {
    const config = this.getCurrentConfig();
    if (!config) return false;

    const parts = path.split('.');
    if (parts.length < 2) return false;

    const [moduleName, ...paramParts] = parts;
    const module = config.modules.get(moduleName);
    if (!module) return false;

    const paramName = paramParts.join('.');
    const oldParam = module.parameters.get(paramName);
    const oldValue = oldParam?.value;

    // 记录历史
    this.history.push({
      type: 'set',
      path,
      oldValue,
      newValue: value,
      module: moduleName,
      parameter: paramName,
      timestamp: Date.now(),
    });

    // 更新值
    const success = this.project.setParameterValue(config.id, moduleName, paramName, value);

    if (success) {
      // 发送变更事件
      const event: ConfigChangeEvent = {
        type: oldParam ? 'update' : 'add',
        path,
        oldValue,
        newValue: value,
        module: moduleName,
        parameter: paramName,
        timestamp: new Date(),
      };
      this.emit('change', event);
    }

    return success;
  }

  /**
   * 批量设置值
   */
  setValues(changes: Array<{ path: string; value: ParameterValue }>): boolean[] {
    const entries: HistoryEntry[] = [];
    const results: boolean[] = [];
    const config = this.getCurrentConfig();

    if (!config) {
      return changes.map(() => false);
    }

    // 收集历史记录
    for (const { path, value } of changes) {
      const parts = path.split('.');
      if (parts.length < 2) {
        results.push(false);
        continue;
      }

      const [moduleName, ...paramParts] = parts;
      const module = config.modules.get(moduleName);
      if (!module) {
        results.push(false);
        continue;
      }

      const paramName = paramParts.join('.');
      const oldParam = module.parameters.get(paramName);

      entries.push({
        type: 'set',
        path,
        oldValue: oldParam?.value,
        newValue: value,
        module: moduleName,
        parameter: paramName,
        timestamp: Date.now(),
      });

      results.push(true);
    }

    // 应用变更
    let successCount = 0;
    for (let i = 0; i < changes.length; i++) {
      if (results[i]) {
        const { path, value } = changes[i];
        const parts = path.split('.');
        const [moduleName, ...paramParts] = parts;
        const paramName = paramParts.join('.');

        if (this.project.setParameterValue(config.id, moduleName, paramName, value)) {
          successCount++;

          // 发送变更事件
          const event: ConfigChangeEvent = {
            type: 'update',
            path,
            newValue: value,
            module: moduleName,
            parameter: paramName,
            timestamp: new Date(),
          };
          this.emit('change', event);
        }
      }
    }

    // 添加批量历史记录
    if (entries.length > 0) {
      this.history.pushBatch(entries, `Batch update of ${entries.length} values`);
    }

    return results;
  }

  /**
   * 删除参数值
   */
  deleteValue(path: string): boolean {
    const config = this.getCurrentConfig();
    if (!config) return false;

    const parts = path.split('.');
    if (parts.length < 2) return false;

    const [moduleName, ...paramParts] = parts;
    const module = config.modules.get(moduleName);
    if (!module) return false;

    const paramName = paramParts.join('.');
    const param = module.parameters.get(paramName);
    if (!param) return false;

    // 记录历史
    this.history.push({
      type: 'delete',
      path,
      oldValue: param.value,
      module: moduleName,
      parameter: paramName,
      timestamp: Date.now(),
    });

    // 删除参数
    module.parameters.delete(paramName);
    module.modified = true;
    config.modified = true;

    // 发送变更事件
    const event: ConfigChangeEvent = {
      type: 'delete',
      path,
      oldValue: param.value,
      module: moduleName,
      parameter: paramName,
      timestamp: new Date(),
    };
    this.emit('change', event);

    return true;
  }

  /**
   * 撤销上一次操作
   */
  undo(): boolean {
    const entry = this.history.undo();
    if (!entry) return false;

    const config = this.getCurrentConfig();
    if (!config) return false;

    if (entry.type === 'batch' && 'entries' in entry) {
      // 批量撤销
      const batchEntry = entry as BatchHistoryEntry;
      for (const subEntry of batchEntry.entries.reverse()) {
        this.applyUndoEntry(subEntry, config);
      }
    } else {
      this.applyUndoEntry(entry, config);
    }

    this.emit('undo', entry);
    return true;
  }

  /**
   * 应用撤销记录
   */
  private applyUndoEntry(entry: HistoryEntry, config: ConfigModel): void {
    if (entry.module && entry.parameter) {
      if (entry.type === 'delete') {
        // 恢复删除的参数
        const module = config.modules.get(entry.module);
        if (module && entry.oldValue !== undefined) {
          const param: ParameterValueModel = {
            name: entry.parameter,
            path: entry.path,
            value: entry.oldValue,
            defaultValue: entry.oldValue,
            isDefault: false,
            type: typeof entry.oldValue,
            modified: true,
            modifiedAt: new Date(),
          };
          module.parameters.set(entry.parameter, param);
        }
      } else if (entry.type === 'set') {
        // 恢复之前的值
        this.project.setParameterValue(config.id, entry.module, entry.parameter, entry.oldValue as ParameterValue);
      }

      // 发送变更事件
      this.emit('change', {
        type: 'update',
        path: entry.path,
        oldValue: entry.newValue,
        newValue: entry.oldValue,
        module: entry.module,
        parameter: entry.parameter,
        timestamp: new Date(),
      });
    }
  }

  /**
   * 重做上一次撤销的操作
   */
  redo(): boolean {
    const entry = this.history.redo();
    if (!entry) return false;

    const config = this.getCurrentConfig();
    if (!config) return false;

    if (entry.type === 'batch' && 'entries' in entry) {
      const batchEntry = entry as BatchHistoryEntry;
      for (const subEntry of batchEntry.entries) {
        this.applyRedoEntry(subEntry, config);
      }
    } else {
      this.applyRedoEntry(entry, config);
    }

    this.emit('redo', entry);
    return true;
  }

  /**
   * 应用重做记录
   */
  private applyRedoEntry(entry: HistoryEntry, config: ConfigModel): void {
    if (entry.module && entry.parameter) {
      if (entry.type === 'delete') {
        // 重新删除
        this.project.setParameterValue(config.id, entry.module, entry.parameter, undefined as unknown as ParameterValue);
      } else if (entry.type === 'set' && entry.newValue !== undefined) {
        // 重新应用新值
        this.project.setParameterValue(config.id, entry.module, entry.parameter, entry.newValue);
      }

      // 发送变更事件
      this.emit('change', {
        type: 'update',
        path: entry.path,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        module: entry.module,
        parameter: entry.parameter,
        timestamp: new Date(),
      });
    }
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.history.canUndo();
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.history.canRedo();
  }

  /**
   * 验证当前配置
   */
  validate(): ValidationResult {
    const config = this.getCurrentConfig();
    if (!config) {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            type: 'error',
            code: 'NO_CONFIG',
            message: '没有活动的配置',
            path: '',
          },
        ],
        warnings: [],
      };
      this.emit('validate', result);
      return result;
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 验证每个模块
    for (const [moduleName, module] of config.modules) {
      // 清空之前的错误
      module.errors = [];
      module.warnings = [];

      // 基本验证
      if (!module.enabled) continue;

      // 验证参数
      for (const [paramName, param] of module.parameters) {
        if (param.errors && param.errors.length > 0) {
          for (const error of param.errors) {
            const validationError: ValidationError = {
              type: 'error',
              code: 'PARAMETER_ERROR',
              message: error,
              path: `${moduleName}.${paramName}`,
              parameter: paramName,
            };
            errors.push(validationError);
            module.errors.push(error);
          }
        }
      }
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
    };

    this.validationResults.set(config.id, result);
    this.emit('validate', result);
    return result;
  }

  /**
   * 获取验证结果
   */
  getValidationResult(configId?: string): ValidationResult | undefined {
    const id = configId ?? this.currentConfigId;
    if (id) {
      return this.validationResults.get(id);
    }
    return undefined;
  }

  /**
   * 导出配置
   */
  export(configId?: string): unknown {
    const id = configId ?? this.currentConfigId;
    if (!id) return undefined;
    return this.project.exportConfig(id);
  }

  /**
   * 导入配置
   */
  import(data: Record<string, unknown>, configId?: string): boolean {
    try {
      const config = this.project.importConfig(data);
      if (configId) {
        this.setCurrentConfig(configId);
      } else {
        this.currentConfigId = config.id;
      }
      return true;
    } catch (error) {
      this.emit('error', error as Error);
      return false;
    }
  }

  /**
   * 保存配置
   */
  save(): boolean {
    const config = this.getCurrentConfig();
    if (!config) return false;

    const success = this.project.markSaved(config.id);
    if (success) {
      this.emit('save', config.id);
    }
    return success;
  }

  /**
   * 重置配置
   */
  reset(): boolean {
    const config = this.getCurrentConfig();
    if (!config) return false;

    // 重置所有参数为默认值
    for (const [moduleName, module] of config.modules) {
      for (const [paramName, param] of module.parameters) {
        this.project.resetParameterValue(config.id, moduleName, paramName);
      }
    }

    // 清空历史
    this.history.clear();

    // 发送重置事件
    this.emit('change', {
      type: 'reset',
      path: '',
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * 添加模块到当前配置
   */
  addModule(module: ModuleConfigModel): boolean {
    const config = this.getCurrentConfig();
    if (!config) return false;

    const success = this.project.addModule(config.id, module);
    if (success) {
      // 记录历史
      this.history.push({
        type: 'add',
        path: module.name,
        module: module.name,
        timestamp: Date.now(),
      });

      // 发送变更事件
      this.emit('change', {
        type: 'add',
        path: module.name,
        module: module.name,
        timestamp: new Date(),
      });
    }

    return success;
  }

  /**
   * 移除模块
   */
  removeModule(moduleName: string): boolean {
    const config = this.getCurrentConfig();
    if (!config) return false;

    const module = config.modules.get(moduleName);
    if (!module) return false;

    // 记录历史
    this.history.push({
      type: 'delete',
      path: moduleName,
      oldValue: module as unknown as ParameterValue,
      module: moduleName,
      timestamp: Date.now(),
    });

    const success = this.project.removeModule(config.id, moduleName);
    if (success) {
      this.emit('change', {
        type: 'delete',
        path: moduleName,
        module: moduleName,
        timestamp: new Date(),
      });
    }

    return success;
  }

  /**
   * 获取历史管理器
   */
  getHistory(): HistoryManager {
    return this.history;
  }

  /**
   * 获取项目
   */
  getProject(): ConfigProject {
    return this.project;
  }

  /**
   * 注册变更监听器
   */
  onChange(callback: (event: ConfigChangeEvent) => void): () => void {
    this.on('change', callback);
    return () => this.off('change', callback);
  }

  /**
   * 注册验证监听器
   */
  onValidate(callback: (result: ValidationResult) => void): () => void {
    this.on('validate', callback);
    return () => this.off('validate', callback);
  }

  /**
   * 注册保存监听器
   */
  onSave(callback: (configId: string) => void): () => void {
    this.on('save', callback);
    return () => this.off('save', callback);
  }

  /**
   * 注册错误监听器
   */
  onError(callback: (error: Error) => void): () => void {
    this.on('error', callback);
    return () => this.off('error', callback);
  }
}

export default ConfigEngine;
