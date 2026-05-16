import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ConfigFile, ConfigModule, ValidationResult, ConfigListItem, ValidationIssue } from '@/types'
import { mcalModules } from '@/data/mcal-config'
import { ecualModules, serviceModules } from '@/data/ecual-config'
import { defaultOSConfig } from '@/data/os-config'
import { DependencyValidator } from '@/core/DependencyValidator'

interface ConfigState {
  // 当前配置状态
  currentConfig: ConfigFile | null
  selectedPath: string | null
  validationResult: ValidationResult | null
  validationIssues: ValidationIssue[]
  isDirty: boolean
  isLoading: boolean
  
  // 配置文件列表
  configList: ConfigListItem[]
  
  // Actions
  setCurrentConfig: (config: ConfigFile | null) => void
  setSelectedPath: (path: string | null) => void
  updateModule: (moduleId: string, module: ConfigModule) => void
  updateParameter: (path: string, value: unknown) => void
  setValidationResult: (result: ValidationResult | null) => void
  setValidationIssues: (issues: ValidationIssue[]) => void
  validateConfig: () => ValidationResult
  setDirty: (dirty: boolean) => void
  setLoading: (loading: boolean) => void
  saveConfig: () => Promise<void>
  loadConfig: (configId: string) => Promise<void>
  toggleModuleEnabled: (moduleId: string, enabled: boolean) => void
  autoEnableDependencies: (moduleId: string) => void
  
  // 配置列表操作
  setConfigList: (list: ConfigListItem[]) => void
  loadConfigList: () => Promise<void>
  createConfig: (name: string, description: string) => Promise<void>
  deleteConfig: (configId: string) => Promise<void>
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
    
    // 合并所有模块
    modules: [
      ...(JSON.parse(JSON.stringify(mcalModules)) as ConfigModule[]),
      ...(JSON.parse(JSON.stringify(ecualModules)) as ConfigModule[]),
      ...(JSON.parse(JSON.stringify(serviceModules)) as ConfigModule[]),
    ],
    
    // OS 配置
    os: JSON.parse(JSON.stringify(defaultOSConfig)) as ConfigFile['os'],
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'yuleASR Configurator',
    version: '1.0.0',
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
      isDirty: false,
      isLoading: false,
      configList: [],

      // Actions
      setCurrentConfig: (config) => {
        set({ 
          currentConfig: config, 
          selectedPath: null,
          isDirty: false 
        })
        // 验证新配置
        if (config) {
          const validator = new DependencyValidator(config)
          const result = validator.validate()
          set({ 
            validationResult: result,
            validationIssues: result.errors
          })
        }
      },

      setSelectedPath: (path) => {
        set({ selectedPath: path })
      },

      updateModule: (moduleId, module) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        const updatedModules = currentConfig.modules.map(m =>
          m.id === moduleId ? module : m
        )

        const updatedConfig = {
          ...currentConfig,
          modules: updatedModules,
          updatedAt: new Date().toISOString()
        }

        // 重新验证
        const validator = new DependencyValidator(updatedConfig)
        const result = validator.validate()

        set({
          currentConfig: updatedConfig,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: true
        })
      },

      updateParameter: (path, value) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        // 解析路径并更新参数
        const pathParts = path.split('/')
        let targetModule: ConfigModule | undefined
        let targetParam: any

        // 简化版本 - 实际应该递归搜索
        for (const part of pathParts) {
          if (part.startsWith('module:')) {
            const moduleId = part.replace('module:', '')
            targetModule = currentConfig.modules.find(m => m.id === moduleId)
          }
        }

        if (targetModule) {
          const updatedModules = currentConfig.modules.map(module => {
            if (module.id !== targetModule!.id) return module
            
            return {
              ...module,
              parameters: module.parameters.map(p => 
                p.id === pathParts[pathParts.length - 1] ? { ...p, value } : p
              )
            }
          })

          const updatedConfig = {
            ...currentConfig,
            modules: updatedModules,
            updatedAt: new Date().toISOString()
          }

          set({
            currentConfig: updatedConfig,
            isDirty: true
          })
        }
      },

      toggleModuleEnabled: (moduleId, enabled) => {
        const { currentConfig, autoEnableDependencies } = get()
        if (!currentConfig) return

        const updatedModules = currentConfig.modules.map(module =>
          module.id === moduleId ? { ...module, enabled } : module
        )

        const updatedConfig = {
          ...currentConfig,
          modules: updatedModules,
          updatedAt: new Date().toISOString()
        }

        // 重新验证
        const validator = new DependencyValidator(updatedConfig)
        const result = validator.validate()

        set({
          currentConfig: updatedConfig,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: true
        })

        // 如果启用模块，自动启用依赖
        if (enabled) {
          autoEnableDependencies(moduleId)
        }
      },

      autoEnableDependencies: (moduleId) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        const module = currentConfig.modules.find(m => m.id === moduleId)
        if (!module) return

        let updated = false
        const updatedModules = currentConfig.modules.map(m => {
          // 检查是否是这个模块的依赖
          const isDependency = module.dependencies.some(dep => 
            dep.module === m.name && dep.required && dep.autoEnable && !m.enabled
          )
          
          if (isDependency) {
            updated = true
            return { ...m, enabled: true }
          }
          return m
        })

        if (updated) {
          const updatedConfig = {
            ...currentConfig,
            modules: updatedModules,
            updatedAt: new Date().toISOString()
          }

          const validator = new DependencyValidator(updatedConfig)
          const result = validator.validate()

          set({
            currentConfig: updatedConfig,
            validationResult: result,
            validationIssues: result.errors,
            isDirty: true
          })
        }
      },

      validateConfig: () => {
        const { currentConfig } = get()
        if (!currentConfig) {
          return { valid: true, errors: [], warnings: [], info: [] }
        }

        const validator = new DependencyValidator(currentConfig)
        const result = validator.validate()

        set({
          validationResult: result,
          validationIssues: [...result.errors, ...result.warnings]
        })

        return result
      },

      setValidationResult: (result) => {
        set({ validationResult: result })
      },

      setValidationIssues: (issues) => {
        set({ validationIssues: issues })
      },

      setDirty: (dirty) => {
        set({ isDirty: dirty })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      saveConfig: async () => {
        const { currentConfig, validateConfig } = get()
        if (!currentConfig) return

        set({ isLoading: true })
        try {
          // 先验证
          const validation = validateConfig()
          if (!validation.valid) {
            console.warn('Configuration has errors, saving anyway')
          }

          console.log('Saving config:', currentConfig)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set({ 
            isDirty: false,
            currentConfig: {
              ...currentConfig,
              updatedAt: new Date().toISOString()
            }
          })
        } finally {
          set({ isLoading: false })
        }
      },

      loadConfig: async (configId) => {
        set({ isLoading: true })
        try {
          // 使用默认分层配置
          const config = createDefaultConfig(configId)
          
          // 初始验证
          const validator = new DependencyValidator(config)
          const result = validator.validate()
          
          set({ 
            currentConfig: config,
            selectedPath: null,
            validationResult: result,
            validationIssues: result.errors,
            isDirty: false
          })
        } finally {
          set({ isLoading: false })
        }
      },

      createConfig: async (name, description) => {
        set({ isLoading: true })
        try {
          const configId = `config-${Date.now()}`
          const config = createDefaultConfig(configId)
          config.name = name
          config.description = description

          console.log('Creating config:', config)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          await get().loadConfigList()
        } finally {
          set({ isLoading: false })
        }
      },

      deleteConfig: async (configId) => {
        set({ isLoading: true })
        try {
          console.log('Deleting config:', configId)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          await get().loadConfigList()
        } finally {
          set({ isLoading: false })
        }
      },

      setConfigList: (list) => {
        set({ configList: list })
      },

      loadConfigList: async () => {
        set({ isLoading: true })
        try {
          // 模拟配置列表
          const mockList: ConfigListItem[] = [
            {
              id: 'config-1',
              name: 'Default Configuration',
              description: 'Complete yuleASR configuration with MCAL, BSW, OS layers',
              moduleCount: mcalModules.length + ecualModules.length + serviceModules.length,
              lastModified: '2025-05-16T14:30:00Z'
            },
            {
              id: 'config-2',
              name: 'Production Config',
              description: 'Production ready configuration with optimized settings',
              moduleCount: 12,
              lastModified: '2025-05-15T10:15:00Z'
            },
            {
              id: 'config-3',
              name: 'Development Config',
              description: 'Development configuration with debug and diagnostic enabled',
              moduleCount: 15,
              lastModified: '2025-05-14T16:45:00Z'
            }
          ]
          
          set({ configList: mockList })
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    { name: 'config-store' }
  )
)
