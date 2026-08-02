import {
  schemaExtractor,
  defaultMcuSchema,
  defaultCanSchema,
  defaultGptSchema,
} from '@yuletech/core/schema-extractor';
import { loadModuleSchemas } from '@yuletech/core/schema/load-generated';
import type { ContainerConfig, ModuleConfig, ModuleSchema } from '@yuletech/core/types';
import { CrossModuleValidator } from '@yuletech/core/validators';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { DependencyValidator } from '@/core/DependencyValidator';
import { allModules } from '@/data/all-modules';
import { defaultOSConfig } from '@/data/os-config';
import { api } from '@/services/api';
import { parseParamPath, matchesParamKey, updateContainerParam, setContainerInstances } from '@/stores/param-update';
import { useAuthStore } from '@/stores/authStore';
import type {
  ConfigContainer,
  ConfigContainerInstance,
  ConfigFile,
  ConfigModule,
  ValidationResult,
  ConfigListItem,
  ValidationIssue,
} from '@/types';

/**
 * 将 web 应用的 ConfigModule 转换为核心 ModuleConfig
 */
function toModuleConfig(webModule: ConfigModule): ModuleConfig {
  const params: Record<string, unknown> = {};
  for (const p of webModule.parameters) {
    params[p.name] = p.value;
  }
  return {
    module: webModule.name,
    version: webModule.version,
    parameters: params,
  };
}

/**
 * 将 web 应用的 ConfigFile 转换为核心 ModuleConfig[]
 */
function toModuleConfigs(config: ConfigFile): ModuleConfig[] {
  return config.modules.filter(m => m.enabled).map(toModuleConfig);
}

/**
 * Fix 17: 组装条件引擎（@yuletech/core/conditions）求值用的 ModuleConfig[]。
 *
 * 与 toModuleConfigs 的区别（toModuleConfigs 只处理模块级参数且过滤未启用模块）：
 * - 包含所有模块（含 disabled），并把模块 enabled 状态暴露为 parameters.enabled，
 *   使 "Can.enabled == true" 这类 core 约定表达式可直接求值；
 * - 递归收集容器（含子容器）参数到 containers[容器名][实例索引].parameters，
 *   支持 "Module.Container[idx].param" 寻址（evaluator 的 evaluatePath 规则）；
 * - 未找到的路径在 evaluator 中 fails-closed（返回 false → 隐藏/禁用）。
 */
export function toConditionModuleConfigs(config: ConfigFile): ModuleConfig[] {
  return config.modules.map(module => {
    // 模块级参数 + enabled 状态（core 约定：enabled 作为参数暴露）
    const parameters: Record<string, unknown> = { enabled: module.enabled };
    for (const p of module.parameters) {
      parameters[p.name] = p.value;
    }

    // 容器参数：containers[容器名] = 实例数组（static 容器即 1 个实例，idx=0）
    const containers: Record<string, ContainerConfig[]> = {};
    const collectContainer = (container: ConfigContainer): void => {
      const instance: ContainerConfig = {
        id: container.id,
        name: container.name,
        parameters: {},
      };
      for (const p of container.parameters) {
        instance.parameters[p.name] = p.value;
      }
      (containers[container.name] ??= []).push(instance);
      for (const sub of container.subContainers ?? []) {
        collectContainer(sub);
      }
    };
    for (const container of module.containers) {
      collectContainer(container);
    }

    return {
      module: module.name,
      version: module.version,
      parameters,
      ...(Object.keys(containers).length > 0 ? { containers } : {}),
    };
  });
}

/**
 * 增量跨模块验证：当用户修改某个参数时，
 * 只检查受该变更影响的跨模块引用约束
 *
 * Fix 19: 返回 { issues, failed }。跨模块验证失败时不再静默返回空 issues
 * （假绿灯），而是 failed: true 显式降级，由 UI 展示降级警告条。
 */
function validateCrossModuleChanges(
  config: ConfigFile,
  changedModuleName: string,
  changedParamName: string
): { issues: ValidationIssue[]; failed: boolean } {
  try {
    // P2-2: 使用 54 个 generated JSON schema (crossReferences 链路打通)
    const schemas: ModuleSchema[] = [
      defaultMcuSchema,
      defaultCanSchema,
      defaultGptSchema,
      ...schemaExtractor.getAllSchemas(),
      ...loadModuleSchemas(),
    ];
    const validator = new CrossModuleValidator(new Map(schemas.map(s => [s.name, s])));
    const configs = toModuleConfigs(config);

    const errors = validator.validateAffectedBy(
      [{ module: changedModuleName, param: changedParamName }],
      configs
    );

    return {
      issues: errors.map(e => ({
        id: `cross-${changedModuleName}-${changedParamName}`,
        path: e.path,
        message: e.message,
        severity: e.severity,
      })),
      failed: false,
    };
  } catch (err) {
    // Fix 19: 不再静默吞错。显式上报并标记降级，UI 据此显示警告条，
    // 避免用户看到"无错误"的假绿灯。
    console.error('[configStore] 跨模块验证失败（schema 加载失败），已降级，当前结论可能不完整:', err);
    return { issues: [], failed: true };
  }
}

interface ConfigState {
  // 当前配置状态
  currentConfig: ConfigFile | null;
  selectedPath: string | null;
  validationResult: ValidationResult | null;
  validationIssues: ValidationIssue[];
  /** Fix 19: 跨模块验证是否降级（schema 加载失败等）。true 时 UI 应显示降级警告条。 */
  validationDegraded: boolean;
  isDirty: boolean;
  isLoading: boolean;

  // 配置文件列表
  configList: ConfigListItem[];

  // Cloud sync status
  isCloudSynced: boolean;
  /** 云同步失败原因（Fix C4: 保存失败必须暴露，不得假标记已同步） */
  syncError: string | null;

  // 模板列表
  templates: ConfigTemplate[];

  // 模板操作
  saveTemplate: (name: string, description: string) => void;
  deleteTemplate: (templateId: string) => void;
  createFromTemplate: (templateId: string) => void;
  loadTemplates: () => void;

  // Actions
  setCurrentConfig: (config: ConfigFile | null) => void;
  setSelectedPath: (path: string | null) => void;
  updateModule: (moduleId: string, module: ConfigModule) => void;
  updateOS: (os: ConfigFile['os']) => void;
  updateModuleConfigStatus: (
    moduleId: string,
    status: ConfigModule['configStatus'],
    method?: ConfigModule['configMethod']
  ) => void;
  updateParameter: (path: string, value: unknown) => void;
  /**
   * 同步动态容器实例集合到 currentConfig（Fix C2）。
   * ConfigTree 的实例增删改操作后调用，保证实例数据随配置持久化。
   * @param containerPath 含 container: 段的完整路径（实例操作的目标容器）
   * @param instances 该容器的完整实例列表
   */
  updateContainerInstances: (containerPath: string, instances: ConfigContainerInstance[]) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  setValidationIssues: (issues: ValidationIssue[]) => void;
  validateConfig: () => ValidationResult;
  setDirty: (dirty: boolean) => void;
  setLoading: (loading: boolean) => void;
  saveConfig: () => Promise<void>;
  loadConfig: (configId: string) => Promise<void>;
  toggleModuleEnabled: (moduleId: string, enabled: boolean) => void;
  autoEnableDependencies: (moduleId: string) => void;

  // 配置列表操作
  setConfigList: (list: ConfigListItem[]) => void;
  loadConfigList: () => Promise<void>;
  createConfig: (name: string, description: string) => Promise<void>;
  deleteConfig: (configId: string) => Promise<void>;
  cloneConfig: (sourceId: string) => Promise<void>;

  // Cloud sync operations
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  updateConfigData: (id: string, data: unknown) => Promise<void>;

  // 从社区模板市场导入模板
  importTemplateFromMarket: (
    templateName: string,
    templateDescription: string,
    configData: ConfigFile
  ) => Promise<void>;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  chip: string;
  moduleCount: number;
  config: ConfigFile;
  createdAt: string;
}

// 创建默认配置 - 使用分层配置数据
function createDefaultConfig(configId: string): ConfigFile {
  return {
    id: configId,
    name: 'Default Configuration',
    description: 'yuleASR configuration with MCAL, BSW, and OS layers',
    targetPlatform: 'ARM Cortex-M4',
    targetChip: 'S32K144',
    compiler: 'GCC',

    // 使用所有37个BSW模块
    modules: JSON.parse(JSON.stringify(allModules)) as ConfigModule[],

    // OS 配置
    os: JSON.parse(JSON.stringify(defaultOSConfig)) as ConfigFile['os'],

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'yuleASR Configurator',
    version: '1.0.0',
  };
}

/** Check whether the user is authenticated by reading authStore state directly. */
function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

/** Saves a config to localStorage. */
function saveToLocalStorage(config: ConfigFile): void {
  localStorage.setItem(`yuleasr_config_${config.id}`, JSON.stringify(config));
}

/** Saves the config list to localStorage. */
function saveConfigListToLocalStorage(list: ConfigListItem[]): void {
  localStorage.setItem('yuleasr_config_list', JSON.stringify(list));
}

/** Loads the config list from localStorage. */
function loadConfigListFromLocalStorage(): ConfigListItem[] {
  try {
    const raw = localStorage.getItem('yuleasr_config_list');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useConfigStore = create<ConfigState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      currentConfig: null,
      selectedPath: null,
      validationResult: null,
      validationIssues: [],
      validationDegraded: false,
      isDirty: false,
      isLoading: false,
      configList: [],
      isCloudSynced: false,
      syncError: null,

      // ── Actions ──────────────────────────────────────────────

      setCurrentConfig: config => {
        set({
          currentConfig: config,
          selectedPath: null,
          isDirty: false,
        });
        // 验证新配置
        if (config) {
          const validator = new DependencyValidator(config);
          const result = validator.validate();
          set({
            validationResult: result,
            validationIssues: result.errors,
          });
        }
      },

      setSelectedPath: path => {
        set({ selectedPath: path });
      },

      updateModule: (moduleId, module) => {
        const { currentConfig } = get();
        if (!currentConfig) return;

        const updatedModules = currentConfig.modules.map(m => (m.id === moduleId ? module : m));

        const updatedConfig = {
          ...currentConfig,
          modules: updatedModules,
          updatedAt: new Date().toISOString(),
        };

        // 重新验证
        const validator = new DependencyValidator(updatedConfig);
        const result = validator.validate();

        set({
          currentConfig: updatedConfig,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: true,
        });
      },

      updateOS: os => {
        const { currentConfig } = get();
        if (!currentConfig) return;

        const updatedConfig = {
          ...currentConfig,
          os,
          updatedAt: new Date().toISOString(),
        };

        // 重新验证
        const validator = new DependencyValidator(updatedConfig);
        const result = validator.validate();

        set({
          currentConfig: updatedConfig,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: true,
        });
      },

      updateModuleConfigStatus: (moduleId, status, method) => {
        const { currentConfig } = get();
        if (!currentConfig) return;

        const updatedModules = currentConfig.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                configStatus: status,
                configMethod: method || module.configMethod,
                lastConfiguredAt:
                  status === 'configured' ? new Date().toISOString() : module.lastConfiguredAt,
                updatedAt: new Date().toISOString(),
              }
            : module
        );

        set({
          currentConfig: {
            ...currentConfig,
            modules: updatedModules,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      updateParameter: (path, value) => {
        const { currentConfig } = get();
        if (!currentConfig) return;

        // 统一路径规范: layer:/module:/container:/instance:/param:
        // GlobalSearch 已生成带 param: 段的路径；此处为兼容旧路径（无 param: 段）做兜底
        const { moduleId, containerId, instanceName, paramKey } = parseParamPath(path);

        if (!moduleId || !paramKey) {
          console.error(`[configStore] updateParameter: 路径缺少 module:/param: 段: ${path}`);
          return;
        }

        const targetModule = currentConfig.modules.find(m => m.id === moduleId);
        if (!targetModule) {
          console.error(`[configStore] updateParameter: 未找到模块 ${moduleId} (path: ${path})`);
          return;
        }

        const updatedModules = currentConfig.modules.map(module => {
          if (module.id !== moduleId) return module;

          // 模块级参数：无 container: 段
          if (!containerId) {
            if (!module.parameters.some(p => matchesParamKey(p, paramKey))) {
              console.error(`[configStore] 未找到模块级参数 ${paramKey} in ${module.id}`);
              return module;
            }
            return {
              ...module,
              parameters: module.parameters.map(p =>
                matchesParamKey(p, paramKey) ? { ...p, value } : p
              ),
            };
          }

          // 容器/实例级参数：递归容器树
          return {
            ...module,
            containers: updateContainerParam(
              module.containers,
              containerId,
              instanceName,
              paramKey,
              value
            ),
          };
        });

        const updatedConfig = {
          ...currentConfig,
          modules: updatedModules,
          updatedAt: new Date().toISOString(),
        };

        // 增量跨模块验证：只检查受影响的约束（Fix 19: failed 时显式降级，UI 显示警告条）
        const cross = validateCrossModuleChanges(
          updatedConfig,
          targetModule.name,
          paramKey
        );

        // 全量运行现有验证器，但合并跨模块增量结果
        const validator = new DependencyValidator(updatedConfig);
        const result = validator.validate();

        set({
          currentConfig: updatedConfig,
          validationResult: {
            ...result,
            errors: [...result.errors, ...cross.issues.filter(i => i.severity === 'error')],
            warnings: [...result.warnings, ...cross.issues.filter(i => i.severity === 'warning')],
          },
          validationIssues: [...result.errors, ...result.warnings, ...cross.issues],
          validationDegraded: cross.failed,
          isDirty: true,
        });
      },

      updateContainerInstances: (containerPath, instances) => {
        const { currentConfig } = get();
        if (!currentConfig) return;

        // 从路径提取 module: 与 container: 段（实例操作目标是容器，不含 instance:/param:）
        const { moduleId, containerId } = parseParamPath(containerPath);
        if (!moduleId || !containerId) {
          console.error(`[configStore] updateContainerInstances: 路径缺少 module:/container: 段: ${containerPath}`);
          return;
        }

        const updatedModules = currentConfig.modules.map(module => {
          if (module.id !== moduleId) return module;
          return {
            ...module,
            containers: setContainerInstances(module.containers, containerId, instances),
          };
        });

        set({
          currentConfig: {
            ...currentConfig,
            modules: updatedModules,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      toggleModuleEnabled: (moduleId, enabled) => {
        const { currentConfig, autoEnableDependencies } = get();
        if (!currentConfig) return;

        const updatedModules = currentConfig.modules.map(module =>
          module.id === moduleId ? { ...module, enabled } : module
        );

        const updatedConfig = {
          ...currentConfig,
          modules: updatedModules,
          updatedAt: new Date().toISOString(),
        };

        // 重新验证
        const validator = new DependencyValidator(updatedConfig);
        const result = validator.validate();

        set({
          currentConfig: updatedConfig,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: true,
        });

        // 如果启用模块，自动启用依赖
        if (enabled) {
          autoEnableDependencies(moduleId);
        }
      },

      autoEnableDependencies: moduleId => {
        const { currentConfig } = get();
        if (!currentConfig) return;

        const module = currentConfig.modules.find(m => m.id === moduleId);
        if (!module) return;

        let updated = false;
        const updatedModules = currentConfig.modules.map(m => {
          // 检查是否是这个模块的依赖
          const isDependency = module.dependencies.some(
            dep => dep.module === m.name && dep.required && dep.autoEnable && !m.enabled
          );

          if (isDependency) {
            updated = true;
            return { ...m, enabled: true };
          }
          return m;
        });

        if (updated) {
          const updatedConfig = {
            ...currentConfig,
            modules: updatedModules,
            updatedAt: new Date().toISOString(),
          };

          const validator = new DependencyValidator(updatedConfig);
          const result = validator.validate();

          set({
            currentConfig: updatedConfig,
            validationResult: result,
            validationIssues: result.errors,
            isDirty: true,
          });
        }
      },

      validateConfig: () => {
        const { currentConfig } = get();
        if (!currentConfig) {
          return { valid: true, errors: [], warnings: [], info: [] };
        }

        const validator = new DependencyValidator(currentConfig);
        const result = validator.validate();

        set({
          validationResult: result,
          validationIssues: [...result.errors, ...result.warnings],
        });

        return result;
      },

      setValidationResult: result => {
        set({ validationResult: result });
      },

      setValidationIssues: issues => {
        set({ validationIssues: issues });
      },

      setDirty: dirty => {
        set({ isDirty: dirty });
      },

      setLoading: loading => {
        set({ isLoading: loading });
      },

      // ── saveConfig ───────────────────────────────────────────
      // Saves to localStorage first (offline-safe), then syncs to API if authenticated.
      saveConfig: async () => {
        const { currentConfig, validateConfig } = get();
        if (!currentConfig) return;

        set({ isLoading: true });
        try {
          const validation = validateConfig();
          if (!validation.valid) {
            console.warn('Configuration has errors, saving anyway');
          }

          const updated = {
            ...currentConfig,
            updatedAt: new Date().toISOString(),
          };

          // Always save to localStorage first (offline-safe)
          saveToLocalStorage(updated);

          // Update config list in localStorage
          try {
            const configList = loadConfigListFromLocalStorage();
            const idx = configList.findIndex((c: any) => c.id === updated.id);
            if (idx >= 0) {
              configList[idx].lastModified = updated.updatedAt;
              configList[idx].moduleCount = updated.modules.filter((m: any) => m.enabled).length;
              saveConfigListToLocalStorage(configList);
            }
          } catch {}

          set({
            isDirty: false,
            currentConfig: updated,
          });

          // If authenticated, also sync to API
          if (isAuthenticated()) {
            try {
              await get().syncToCloud();
              set({ isCloudSynced: true, syncError: null });
            } catch (err) {
              // Fix C4: 同步失败必须置 false + 暴露错误，不得保留旧的"已同步"标记
              set({
                isCloudSynced: false,
                syncError: err instanceof Error ? err.message : '云同步失败',
              });
              console.warn('Cloud sync failed (offline or auth error), local save preserved:', err);
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // ── loadConfig ───────────────────────────────────────────
      // If authenticated: try API first, fall back to localStorage.
      // If not authenticated: use localStorage (existing behavior).
      loadConfig: async configId => {
        set({ isLoading: true });
        try {
          let config: ConfigFile | null = null;

          if (isAuthenticated()) {
            try {
              config = await api.get<ConfigFile>(`/v1/api/configs/${configId}`);
              // Cache in localStorage for offline access
              saveToLocalStorage(config);
            } catch {
              // API failed — fall through to localStorage
              config = null;
            }
          }

          // Fall back to localStorage if API didn't succeed
          if (!config) {
            let configStr = localStorage.getItem(`yuleasr_config_${configId}`);
            if (!configStr) {
              configStr = localStorage.getItem('yuleasr_config');
            }
            if (configStr) {
              config = JSON.parse(configStr) as ConfigFile;
            }
          }

          // Create default if nothing found
          if (!config || !config.modules) {
            config = createDefaultConfig(configId);
          }

          const validator = new DependencyValidator(config);
          const result = validator.validate();

          set({
            currentConfig: config,
            selectedPath: null,
            validationResult: result,
            validationIssues: result.errors,
            isDirty: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // ── syncToCloud ──────────────────────────────────────────
      // Push current config to API (only if authenticated).
      syncToCloud: async () => {
        const { currentConfig } = get();
        if (!currentConfig) return;
        if (!isAuthenticated()) return;

        try {
          await api.put(`/v1/api/configs/${currentConfig.id}`, {
            name: currentConfig.name,
            description: currentConfig.description,
            data: currentConfig,
          });
          set({ isCloudSynced: true, syncError: null });
        } catch (err: any) {
          // If 404, the config doesn't exist on the server yet — create it
          if (err?.status === 404) {
            const created = await api.post<ConfigFile>('/v1/api/configs', {
              name: currentConfig.name,
              description: currentConfig.description,
              data: currentConfig,
            });
            // Fix C4: post 失败（异常已抛出）或未返回 id 都不得标记已同步
            if (!created || !created.id) {
              throw new Error('Server did not return a config id after create');
            }
            // If server assigned a different ID, update local state
            if (created.id !== currentConfig.id) {
              const updatedConfig = { ...currentConfig, id: created.id };
              saveToLocalStorage(updatedConfig);
              set({ currentConfig: updatedConfig });

              // Also update config list
              try {
                const configList = loadConfigListFromLocalStorage();
                const idx = configList.findIndex((c: any) => c.id === currentConfig.id);
                if (idx >= 0) {
                  configList[idx].id = created.id;
                  saveConfigListToLocalStorage(configList);
                }
              } catch {}
            }
            set({ isCloudSynced: true, syncError: null });
            return;
          }
          throw err;
        }
      },

      // ── loadFromCloud ────────────────────────────────────────
      // Fetch config list from API (only if authenticated).
      loadFromCloud: async () => {
        if (!isAuthenticated()) return;

        try {
          const serverList = await api.get<ConfigListItem[]>('/v1/api/configs');
          set({ configList: serverList, isCloudSynced: true, syncError: null });

          // Also persist in localStorage for offline fallback
          saveConfigListToLocalStorage(serverList);

          // Optionally cache each config that's in the list
          for (const item of serverList) {
            try {
              const existing = localStorage.getItem(`yuleasr_config_${item.id}`);
              if (!existing) {
                // Only fetch if not already cached locally
                const detail = await api.get<ConfigFile>(`/v1/api/configs/${item.id}`);
                saveToLocalStorage(detail);
              }
            } catch {
              // Silently skip individual fetch failures
            }
          }
        } catch (err) {
          console.warn('Failed to fetch configs from API, using local cache:', err);
          // Fix C4: 拉取失败置 false + 暴露错误
          set({ isCloudSynced: false, syncError: '从云端拉取配置列表失败' });
          // Fall back to localStorage
          const localList = loadConfigListFromLocalStorage();
          set({ configList: localList });
        }
      },

      // ── loadConfigList ───────────────────────────────────────
      // If authenticated: fetch from API first, merge with localStorage (API wins), fall back to localStorage.
      // If not authenticated: use localStorage (existing behavior).
      loadConfigList: async () => {
        set({ isLoading: true });
        try {
          let list: ConfigListItem[] = [];

          if (isAuthenticated()) {
            try {
              const serverList = await api.get<ConfigListItem[]>('/v1/api/configs');
              const localList = loadConfigListFromLocalStorage();

              // Merge: API wins for items with the same id, local items not in API remain
              const serverMap = new Map(serverList.map(c => [c.id, c]));
              const merged = [...serverList];
              for (const item of localList) {
                if (!serverMap.has(item.id)) {
                  merged.push(item);
                }
              }
              list = merged;

              // Persist merged list to localStorage
              saveConfigListToLocalStorage(list);
              set({ isCloudSynced: true, syncError: null });
            } catch {
              // API failed — fall through to localStorage
              list = loadConfigListFromLocalStorage();
              set({ isCloudSynced: false, syncError: '从云端拉取配置列表失败' });
            }
          } else {
            list = loadConfigListFromLocalStorage();
          }

          // Seed sample configs if list is empty (existing behavior)
          if (list.length === 0) {
            // First time: seed with sample configurations
            const defaultConfig = createDefaultConfig('config-default');
            defaultConfig.name = 'Development Config';
            defaultConfig.description =
              'Development configuration with debug and diagnostic enabled';
            localStorage.setItem('yuleasr_config_config-default', JSON.stringify(defaultConfig));

            const prodConfig = createDefaultConfig('config-production');
            prodConfig.name = 'Production Config';
            prodConfig.description = 'Production ready configuration with optimized settings';
            prodConfig.modules = prodConfig.modules.map(m => ({
              ...m,
              enabled: [
                'adc',
                'mcu',
                'can',
                'cantrcv',
                'port',
                'dio',
                'spi',
                'gpt',
                'icu',
                'nvm',
                'ecum',
              ].includes(m.id),
            }));
            localStorage.setItem('yuleasr_config_config-production', JSON.stringify(prodConfig));

            const devConfig = createDefaultConfig('config-dev');
            devConfig.name = 'Development Config';
            devConfig.description = 'Development configuration with debug and diagnostic enabled';
            devConfig.modules = devConfig.modules.map(m => ({ ...m, enabled: true }));
            localStorage.setItem('yuleasr_config_config-dev', JSON.stringify(devConfig));

            const fullConfig = createDefaultConfig('config-full');
            fullConfig.name = 'Default Configuration';
            fullConfig.description = 'Complete yuleASR configuration with MCAL, BSW, OS layers';
            localStorage.setItem('yuleasr_config_config-full', JSON.stringify(fullConfig));

            list = [
              {
                id: 'config-full',
                name: fullConfig.name,
                description: fullConfig.description || '',
                moduleCount: allModules.length,
                lastModified: fullConfig.updatedAt,
              },
              {
                id: 'config-production',
                name: prodConfig.name,
                description: prodConfig.description || '',
                moduleCount: prodConfig.modules.filter(m => m.enabled).length,
                lastModified: prodConfig.updatedAt,
              },
              {
                id: 'config-dev',
                name: devConfig.name,
                description: devConfig.description || '',
                moduleCount: devConfig.modules.filter(m => m.enabled).length,
                lastModified: devConfig.updatedAt,
              },
            ];
            saveConfigListToLocalStorage(list);
          } else if (list.length === 1 && list[0].id === 'config-default') {
            // Migration: if only 1 old config, seed Production + Development
            const prodConfig = createDefaultConfig('config-production');
            prodConfig.name = 'Production Config';
            prodConfig.description = 'Production ready configuration with optimized settings';
            prodConfig.modules = prodConfig.modules.map(m => ({
              ...m,
              enabled: [
                'adc',
                'mcu',
                'can',
                'cantrcv',
                'port',
                'dio',
                'spi',
                'gpt',
                'icu',
                'nvm',
                'ecum',
              ].includes(m.id),
            }));
            localStorage.setItem('yuleasr_config_config-production', JSON.stringify(prodConfig));

            const devConfig = createDefaultConfig('config-dev');
            devConfig.name = 'Development Config';
            devConfig.description = 'Development configuration with debug and diagnostic enabled';
            devConfig.modules = devConfig.modules.map(m => ({ ...m, enabled: true }));
            localStorage.setItem('yuleasr_config_config-dev', JSON.stringify(devConfig));

            list.push(
              {
                id: 'config-production',
                name: prodConfig.name,
                description: prodConfig.description || '',
                moduleCount: prodConfig.modules.filter(m => m.enabled).length,
                lastModified: prodConfig.updatedAt,
              },
              {
                id: 'config-dev',
                name: devConfig.name,
                description: devConfig.description || '',
                moduleCount: devConfig.modules.filter(m => m.enabled).length,
                lastModified: devConfig.updatedAt,
              }
            );
            saveConfigListToLocalStorage(list);
          }

          set({ configList: list });
        } finally {
          set({ isLoading: false });
        }
      },

      // ── createConfig ─────────────────────────────────────────
      // Create in localStorage, then if authenticated also create via API and update local record.
      createConfig: async (name, description) => {
        set({ isLoading: true });
        try {
          const configId = `config-${Date.now()}`;
          const config = createDefaultConfig(configId);
          config.name = name || config.name;
          config.description = description || config.description;

          // Always save to localStorage first
          saveToLocalStorage(config);

          // Update the config list index in localStorage
          const list = loadConfigListFromLocalStorage();
          list.push({
            id: config.id,
            name: config.name,
            description: config.description || '',
            moduleCount: config.modules?.length || 0,
            lastModified: new Date().toISOString(),
          });
          saveConfigListToLocalStorage(list);

          // If authenticated, also create via API
          if (isAuthenticated()) {
            try {
              const created = await api.post<ConfigFile>('/v1/api/configs', {
                name: config.name,
                description: config.description,
                data: config,
              });

              // If server assigned a different ID, update local records
              if (created && created.id && created.id !== configId) {
                // Remove old local entry
                localStorage.removeItem(`yuleasr_config_${configId}`);
                // Save with server ID
                config.id = created.id;
                saveToLocalStorage(config);
              }

              set({ isCloudSynced: true, syncError: null });
            } catch (err) {
              console.warn('Failed to create config on server, local copy preserved:', err);
              // Fix C4: 创建失败不得标记已同步
              set({ isCloudSynced: false, syncError: '在云端创建配置失败' });
            }
          }

          // Reload config list
          await get().loadConfigList();

          // Switch to new config
          const validator = new DependencyValidator(config);
          const result = validator.validate();
          set({
            currentConfig: config,
            selectedPath: null,
            validationResult: result,
            validationIssues: result.errors,
            isDirty: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // ── deleteConfig ─────────────────────────────────────────
      // Delete from localStorage, then if authenticated also delete from API.
      deleteConfig: async configId => {
        set({ isLoading: true });
        try {
          // Always delete from localStorage first
          localStorage.removeItem(`yuleasr_config_${configId}`);
          const configList = loadConfigListFromLocalStorage().filter(
            (c: ConfigListItem) => c.id !== configId
          );
          saveConfigListToLocalStorage(configList);

          set({ configList });

          // If current config was deleted, clear it
          const { currentConfig } = get();
          if (currentConfig?.id === configId) {
            set({ currentConfig: null, selectedPath: null });
          }

          // If authenticated, also delete from API
          if (isAuthenticated()) {
            try {
              await api.delete(`/v1/api/configs/${configId}`);
            } catch (err) {
              console.warn('Failed to delete config from server, local copy removed:', err);
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // ── updateConfigData ─────────────────────────────────────
      // Update the config's data field directly (for the Editor's auto-save).
      // Writes to localStorage + API if authenticated.
      updateConfigData: async (id, data) => {
        const { currentConfig } = get();

        // Update localStorage
        try {
          const existingStr = localStorage.getItem(`yuleasr_config_${id}`);
          if (existingStr) {
            const existing = JSON.parse(existingStr) as ConfigFile;
            const updated = {
              ...existing,
              data,
              updatedAt: new Date().toISOString(),
            };
            saveToLocalStorage(updated);

            // Update config list entry
            const configList = loadConfigListFromLocalStorage();
            const idx = configList.findIndex((c: any) => c.id === id);
            if (idx >= 0) {
              configList[idx].lastModified = updated.updatedAt;
              saveConfigListToLocalStorage(configList);
            }

            // Also update currentConfig if it matches
            if (currentConfig?.id === id) {
              set({ currentConfig: updated });
            }
          }
        } catch {
          // Silently handle localStorage errors
        }

        // If authenticated, also push to API
        if (isAuthenticated()) {
          try {
            await api.put(`/v1/api/configs/${id}`, { data });
          } catch (err: any) {
            if (err?.status === 404) {
              // Config doesn't exist on server — create it
              try {
                const configStr = localStorage.getItem(`yuleasr_config_${id}`);
                if (configStr) {
                  const config = JSON.parse(configStr) as ConfigFile;
                  await api.post('/v1/api/configs', {
                    name: config.name,
                    description: config.description,
                    data: config,
                  });
                }
              } catch {
                // Silently fail
              }
            } else {
              console.warn('Failed to sync config data to API:', err);
            }
          }
        }
      },

      setConfigList: list => {
        set({ configList: list });
      },

      // ── Template operations ──────────────────────────────────

      saveTemplate: (name, description) => {
        const { currentConfig } = get();
        if (!currentConfig) return;
        const templates = JSON.parse(
          localStorage.getItem('yuleasr_templates') || '[]'
        ) as ConfigTemplate[];
        const tpl: ConfigTemplate = {
          id: `tpl-${Date.now()}`,
          name,
          description,
          chip: currentConfig.targetChip || '',
          moduleCount: currentConfig.modules.filter(m => m.enabled).length,
          config: JSON.parse(JSON.stringify(currentConfig)),
          createdAt: new Date().toISOString(),
        };
        templates.push(tpl);
        localStorage.setItem('yuleasr_templates', JSON.stringify(templates));
        set({ templates });
      },

      deleteTemplate: templateId => {
        const templates = (
          JSON.parse(localStorage.getItem('yuleasr_templates') || '[]') as ConfigTemplate[]
        ).filter(t => t.id !== templateId);
        localStorage.setItem('yuleasr_templates', JSON.stringify(templates));
        set({ templates });
      },

      createFromTemplate: templateId => {
        const templates = JSON.parse(
          localStorage.getItem('yuleasr_templates') || '[]'
        ) as ConfigTemplate[];
        const tpl = templates.find(t => t.id === templateId);
        if (!tpl) return;
        const config = JSON.parse(JSON.stringify(tpl.config));
        config.id = `config-${Date.now()}`;
        config.name = `${tpl.name} (copy)`;
        config.createdAt = new Date().toISOString();
        config.updatedAt = new Date().toISOString();

        const validator = new DependencyValidator(config);
        const result = validator.validate();
        set({
          currentConfig: config,
          selectedPath: null,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: false,
        });
        localStorage.setItem('yuleasr_config', JSON.stringify(config));
      },

      loadTemplates: () => {
        const templates = JSON.parse(
          localStorage.getItem('yuleasr_templates') || '[]'
        ) as ConfigTemplate[];
        set({ templates });
      },

      // ── Import from community template market ─────────────────

      importTemplateFromMarket: async (templateName, templateDescription, configData) => {
        const configId = `config-${Date.now()}`;
        const config: ConfigFile = {
          ...configData,
          id: configId,
          name: templateName || configData.name || 'Imported Template',
          description:
            templateDescription || configData.description || 'Imported from BSW Template Market',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to localStorage
        saveToLocalStorage(config);

        // Add to config list
        const configList = loadConfigListFromLocalStorage();
        configList.unshift({
          id: config.id,
          name: config.name,
          description: config.description || '',
          moduleCount: config.modules?.filter((m: any) => m.enabled !== false).length || 0,
          lastModified: config.updatedAt,
        });
        saveConfigListToLocalStorage(configList);

        // Set as current config
        const validator = new DependencyValidator(config);
        const result = validator.validate();
        set({
          currentConfig: config,
          configList,
          selectedPath: null,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: false,
          isLoading: false,
        });

        // If authenticated, also save to API
        if (isAuthenticated()) {
          try {
            await api.post('/v1/api/configs', {
              name: config.name,
              description: config.description,
              data: config,
            });
            set({ isCloudSynced: true, syncError: null });
          } catch (err) {
            console.warn('Failed to sync imported config to cloud:', err);
            // Fix C4: 导入同步失败不得标记已同步
            set({ isCloudSynced: false, syncError: '导入配置云同步失败' });
          }
        }
      },
    }),
    { name: 'config-store' }
  )
);

// ── Subscribe to authStore changes ─────────────────────────────
// When the user logs in, try to load configs from the cloud.
// When they log out, update the cloud sync flag.
useAuthStore.subscribe(state => {
  if (state.isAuthenticated) {
    // User just logged in — attempt to load from cloud
    useConfigStore
      .getState()
      .loadFromCloud()
      .catch(() => {
        // Silent — localStorage fallback already handled inside loadFromCloud
      });
  } else {
    // User just logged out — mark cloud sync as inactive
    useConfigStore.getState().setConfigList(loadConfigListFromLocalStorage());
    useConfigStore.setState({ isCloudSynced: false, syncError: null });
  }
});

// Auto-save to localStorage on any state change (keeps existing behavior)
useConfigStore.subscribe(state => {
  if (state.isDirty && state.currentConfig) {
    const updated = {
      ...state.currentConfig,
      updatedAt: new Date().toISOString(),
    };
    // Save to config-specific key
    localStorage.setItem(`yuleasr_config_${state.currentConfig.id}`, JSON.stringify(updated));
    // Also update config list's lastModified
    try {
      const configList = JSON.parse(localStorage.getItem('yuleasr_config_list') || '[]');
      const idx = configList.findIndex((c: any) => c.id === state.currentConfig!.id);
      if (idx >= 0) {
        configList[idx].lastModified = updated.updatedAt;
        configList[idx].moduleCount = updated.modules.filter((m: any) => m.enabled).length;
        localStorage.setItem('yuleasr_config_list', JSON.stringify(configList));
      }
    } catch {}
  }
});
