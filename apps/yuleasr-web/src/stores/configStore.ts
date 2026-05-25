import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { DependencyValidator } from '@/core/DependencyValidator'
import { allModules } from '@/data/all-modules'
import { defaultOSConfig } from '@/data/os-config'
import type { ConfigFile, ConfigModule, ValidationResult, ConfigListItem, ValidationIssue } from '@/types'

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
  
  // 模板列表
  templates: ConfigTemplate[]
  
  // 模板操作
  saveTemplate: (name: string, description: string) => void
  deleteTemplate: (templateId: string) => void
  createFromTemplate: (templateId: string) => void
  loadTemplates: () => void
  
  // Actions
  setCurrentConfig: (config: ConfigFile | null) => void
  setSelectedPath: (path: string | null) => void
  updateModule: (moduleId: string, module: ConfigModule) => void
  updateOS: (os: ConfigFile['os']) => void
  updateModuleConfigStatus: (moduleId: string, status: ConfigModule['configStatus'], method?: ConfigModule['configMethod']) => void
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
  cloneConfig: (sourceId: string) => Promise<void>
}

export interface ConfigTemplate {
  id: string
  name: string
  description: string
  chip: string
  moduleCount: number
  config: ConfigFile
  createdAt: string
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

      updateOS: (os) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        const updatedConfig = {
          ...currentConfig,
          os,
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

      updateModuleConfigStatus: (moduleId, status, method) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        const updatedModules = currentConfig.modules.map(module =>
          module.id === moduleId 
            ? { 
                ...module, 
                configStatus: status,
                configMethod: method || module.configMethod,
                lastConfiguredAt: status === 'configured' ? new Date().toISOString() : module.lastConfiguredAt,
                updatedAt: new Date().toISOString()
              } 
            : module
        )

        set({
          currentConfig: {
            ...currentConfig,
            modules: updatedModules,
            updatedAt: new Date().toISOString()
          },
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
          const validation = validateConfig()
          if (!validation.valid) {
            console.warn('Configuration has errors, saving anyway')
          }

          const updated = {
            ...currentConfig,
            updatedAt: new Date().toISOString()
          }

          localStorage.setItem(`yuleasr_config_${updated.id}`, JSON.stringify(updated))
          // Update config list
          try {
            const configList = JSON.parse(localStorage.getItem('yuleasr_config_list') || '[]')
            const idx = configList.findIndex((c: any) => c.id === updated.id)
            if (idx >= 0) {
              configList[idx].lastModified = updated.updatedAt
              configList[idx].moduleCount = updated.modules.filter((m: any) => m.enabled).length
              localStorage.setItem('yuleasr_config_list', JSON.stringify(configList))
            }
          } catch {}
          
          set({ 
            isDirty: false,
            currentConfig: updated
          })
        } finally {
          set({ isLoading: false })
        }
      },

      loadConfig: async (configId) => {
        set({ isLoading: true })
        try {
          // Try loading specific config by ID, fall back to generic key
          let configStr = localStorage.getItem(`yuleasr_config_${configId}`)
          if (!configStr) {
            configStr = localStorage.getItem('yuleasr_config')
          }
          let config: ConfigFile
          
          if (configStr) {
            config = JSON.parse(configStr) as ConfigFile
            if (!config.modules) {
              config = createDefaultConfig(configId)
            }
          } else {
            config = createDefaultConfig(configId)
          }
          
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
          config.name = name || config.name
          config.description = description || config.description

          // Save to localStorage
          localStorage.setItem(`yuleasr_config_${configId}`, JSON.stringify(config))
          
          // Update config list
          await get().loadConfigList()
          
          // Switch to new config
          const validator = new DependencyValidator(config)
          const result = validator.validate()
          set({
            currentConfig: config,
            selectedPath: null,
            validationResult: result,
            validationIssues: result.errors,
            isDirty: false,
          })
        } finally {
          set({ isLoading: false })
        }
      },

      deleteConfig: async (configId) => {
        set({ isLoading: true })
        try {
          localStorage.removeItem(`yuleasr_config_${configId}`)
          const configList = JSON.parse(localStorage.getItem('yuleasr_config_list') || '[]')
            .filter((c: ConfigListItem) => c.id !== configId)
          localStorage.setItem('yuleasr_config_list', JSON.stringify(configList))
          
          set({ configList })
          
          // If current config was deleted, clear it
          const { currentConfig } = get()
          if (currentConfig?.id === configId) {
            set({ currentConfig: null, selectedPath: null })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      setConfigList: (list) => {
        set({ configList: list })
      },

      // Template operations
      saveTemplate: (name, description) => {
        const { currentConfig } = get()
        if (!currentConfig) return
        const templates = JSON.parse(localStorage.getItem('yuleasr_templates') || '[]') as ConfigTemplate[]
        const tpl: ConfigTemplate = {
          id: `tpl-${Date.now()}`,
          name,
          description,
          chip: currentConfig.targetChip || '',
          moduleCount: currentConfig.modules.filter(m => m.enabled).length,
          config: JSON.parse(JSON.stringify(currentConfig)),
          createdAt: new Date().toISOString(),
        }
        templates.push(tpl)
        localStorage.setItem('yuleasr_templates', JSON.stringify(templates))
        set({ templates })
      },
      
      deleteTemplate: (templateId) => {
        const templates = (JSON.parse(localStorage.getItem('yuleasr_templates') || '[]') as ConfigTemplate[])
          .filter(t => t.id !== templateId)
        localStorage.setItem('yuleasr_templates', JSON.stringify(templates))
        set({ templates })
      },
      
      createFromTemplate: (templateId) => {
        const templates = JSON.parse(localStorage.getItem('yuleasr_templates') || '[]') as ConfigTemplate[]
        const tpl = templates.find(t => t.id === templateId)
        if (!tpl) return
        const config = JSON.parse(JSON.stringify(tpl.config))
        config.id = `config-${Date.now()}`
        config.name = `${tpl.name} (copy)`
        config.createdAt = new Date().toISOString()
        config.updatedAt = new Date().toISOString()
        const validator = new DependencyValidator(config)
        const result = validator.validate()
        set({
          currentConfig: config,
          selectedPath: null,
          validationResult: result,
          validationIssues: result.errors,
          isDirty: false,
        })
        localStorage.setItem('yuleasr_config', JSON.stringify(config))
      },
      
      loadTemplates: () => {
        const templates = JSON.parse(localStorage.getItem('yuleasr_templates') || '[]') as ConfigTemplate[]
        set({ templates })
      },

      loadConfigList: async () => {
        set({ isLoading: true })
        try {
          const raw = localStorage.getItem('yuleasr_config_list')
          let list: ConfigListItem[] = []
          
          if (raw) {
            list = JSON.parse(raw)
            // Migration: if only 1 old config, seed Production + Development
            if (list.length === 1 && list[0].id === 'config-default') {
              const prodConfig = createDefaultConfig('config-production')
              prodConfig.name = 'Production Config'
              prodConfig.description = 'Production ready configuration with optimized settings'
              prodConfig.modules = prodConfig.modules.map(m => ({
                ...m,
                enabled: ['adc', 'mcu', 'can', 'cantrcv', 'port', 'dio', 'spi', 'gpt', 'icu', 'nvm', 'ecum'].includes(m.id),
              }))
              localStorage.setItem('yuleasr_config_config-production', JSON.stringify(prodConfig))
              
              const devConfig = createDefaultConfig('config-dev')
              devConfig.name = 'Development Config'
              devConfig.description = 'Development configuration with debug and diagnostic enabled'
              devConfig.modules = devConfig.modules.map(m => ({ ...m, enabled: true }))
              localStorage.setItem('yuleasr_config_config-dev', JSON.stringify(devConfig))
              
              list.push(
                { id: 'config-production', name: prodConfig.name, description: prodConfig.description || '', moduleCount: prodConfig.modules.filter(m => m.enabled).length, lastModified: prodConfig.updatedAt },
                { id: 'config-dev', name: devConfig.name, description: devConfig.description || '', moduleCount: devConfig.modules.filter(m => m.enabled).length, lastModified: devConfig.updatedAt },
              )
              localStorage.setItem('yuleasr_config_list', JSON.stringify(list))
            }
          } else {
            // First time: seed with sample configurations
            const defaultConfig = createDefaultConfig('config-default')
            defaultConfig.name = 'Development Config'
            defaultConfig.description = 'Development configuration with debug and diagnostic enabled'
            localStorage.setItem('yuleasr_config_config-default', JSON.stringify(defaultConfig))
            
            // Clone for production (fewer modules enabled)
            const prodConfig = createDefaultConfig('config-production') 
            prodConfig.name = 'Production Config'
            prodConfig.description = 'Production ready configuration with optimized settings'
            prodConfig.modules = prodConfig.modules.map(m => ({
              ...m,
              enabled: ['adc', 'mcu', 'can', 'cantrcv', 'port', 'dio', 'spi', 'gpt', 'icu', 'nvm', 'ecum'].includes(m.id),
            }))
            localStorage.setItem('yuleasr_config_config-production', JSON.stringify(prodConfig))
            
            // Development config - all modules enabled for debugging
            const devConfig = createDefaultConfig('config-dev')
            devConfig.name = 'Development Config'
            devConfig.description = 'Development configuration with debug and diagnostic enabled'
            devConfig.modules = devConfig.modules.map(m => ({ ...m, enabled: true }))
            localStorage.setItem('yuleasr_config_config-dev', JSON.stringify(devConfig))
            
            // Default config - full config
            const fullConfig = createDefaultConfig('config-full')
            fullConfig.name = 'Default Configuration'
            fullConfig.description = 'Complete yuleASR configuration with MCAL, BSW, OS layers'
            localStorage.setItem('yuleasr_config_config-full', JSON.stringify(fullConfig))
            
            list = [
              { id: 'config-full', name: fullConfig.name, description: fullConfig.description || '', moduleCount: allModules.length, lastModified: fullConfig.updatedAt },
              { id: 'config-production', name: prodConfig.name, description: prodConfig.description || '', moduleCount: prodConfig.modules.filter(m => m.enabled).length, lastModified: prodConfig.updatedAt },
              { id: 'config-dev', name: devConfig.name, description: devConfig.description || '', moduleCount: devConfig.modules.filter(m => m.enabled).length, lastModified: devConfig.updatedAt },
            ]
            localStorage.setItem('yuleasr_config_list', JSON.stringify(list))
          }
          
          set({ configList: list })
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    { name: 'config-store' }
  )
)

// Auto-save to localStorage on any state change
useConfigStore.subscribe((state) => {
  if (state.isDirty && state.currentConfig) {
    const updated = {
      ...state.currentConfig,
      updatedAt: new Date().toISOString()
    }
    // Save to config-specific key
    localStorage.setItem(`yuleasr_config_${state.currentConfig.id}`, JSON.stringify(updated))
    // Also update config list's lastModified
    try {
      const configList = JSON.parse(localStorage.getItem('yuleasr_config_list') || '[]')
      const idx = configList.findIndex((c: any) => c.id === state.currentConfig!.id)
      if (idx >= 0) {
        configList[idx].lastModified = updated.updatedAt
        configList[idx].moduleCount = updated.modules.filter((m: any) => m.enabled).length
        localStorage.setItem('yuleasr_config_list', JSON.stringify(configList))
      }
    } catch {}
  }
})
