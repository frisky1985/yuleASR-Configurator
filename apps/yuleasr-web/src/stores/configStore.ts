import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ConfigFile, ModuleConfig, ValidationResult, ConfigListItem } from '@/types'

interface ConfigState {
  // 当前配置状态
  currentConfig: ConfigFile | null
  selectedModuleId: string | null
  validationResult: ValidationResult | null
  isDirty: boolean
  isLoading: boolean
  
  // 配置文件列表
  configList: ConfigListItem[]
  
  // Actions
  setCurrentConfig: (config: ConfigFile | null) => void
  setSelectedModule: (moduleId: string | null) => void
  updateModule: (moduleId: string, module: ModuleConfig) => void
  updateParameter: (moduleId: string, path: string, value: unknown) => void
  setValidationResult: (result: ValidationResult | null) => void
  setDirty: (dirty: boolean) => void
  setLoading: (loading: boolean) => void
  saveConfig: () => Promise<void>
  loadConfig: (configId: string) => Promise<void>
  // Module enable/disable
  toggleModuleEnabled: (moduleId: string, enabled: boolean) => void
  
  // 配置列表操作
  setConfigList: (list: ConfigListItem[]) => void
  loadConfigList: () => Promise<void>
  createConfig: (name: string, description: string) => Promise<void>
  deleteConfig: (configId: string) => Promise<void>
}

export const useConfigStore = create<ConfigState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      currentConfig: null,
      selectedModuleId: null,
      validationResult: null,
      isDirty: false,
      isLoading: false,
      configList: [],

      // Actions
      setCurrentConfig: (config) => {
        set({ 
          currentConfig: config, 
          selectedModuleId: config?.modules?.[0]?.id || null,
          isDirty: false 
        })
      },

      setSelectedModule: (moduleId) => {
        set({ selectedModuleId: moduleId })
      },

      updateModule: (moduleId, module) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        const updatedModules = currentConfig.modules.map(m =>
          m.id === moduleId ? module : m
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

      updateParameter: (moduleId, path, value) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        // 简化实现 - 实际应该递归更新参数
        const updatedModules = currentConfig.modules.map(module => {
          if (module.id !== moduleId) return module
          
          return {
            ...module,
            parameters: module.parameters.map(p => 
              p.name === path ? { ...p, value } : p
            )
          }
        })

        set({
          currentConfig: {
            ...currentConfig,
            modules: updatedModules,
            updatedAt: new Date().toISOString()
          },
          isDirty: true
        })
      },

      toggleModuleEnabled: (moduleId, enabled) => {
        const { currentConfig } = get()
        if (!currentConfig) return

        const updatedModules = currentConfig.modules.map(module =>
          module.id === moduleId ? { ...module, enabled } : module
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

      setValidationResult: (result) => {
        set({ validationResult: result })
      },

      setDirty: (dirty) => {
        set({ isDirty: dirty })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      saveConfig: async () => {
        const { currentConfig } = get()
        if (!currentConfig) return

        set({ isLoading: true })
        try {
          // TODO: 调用 API 保存配置
          console.log('Saving config:', currentConfig)
          
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set({ isDirty: false })
        } finally {
          set({ isLoading: false })
        }
      },

      loadConfig: async (configId) => {
        set({ isLoading: true })
        try {
          // TODO: 调用 API 加载配置
          console.log('Loading config:', configId)
          
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 模拟配置数据
          const mockConfig: ConfigFile = {
            id: configId,
            name: 'Default Config',
            description: 'Default yuleASR configuration',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            modules: [
              {
                id: 'mcu',
                name: 'Mcu',
                layer: 'MCAL',
                version: '4.4.0',
                enabled: true,
                parameters: [
                  {
                    name: 'McuClockSetting',
                    type: 'integer',
                    value: 16000000,
                    default: 16000000,
                    min: 1000000,
                    max: 180000000,
                    description: 'MCU clock frequency in Hz'
                  }
                ],
                containers: []
              },
              {
                id: 'port',
                name: 'Port',
                layer: 'MCAL',
                version: '4.4.0',
                enabled: true,
                parameters: [],
                containers: []
              },
              {
                id: 'dio',
                name: 'Dio',
                layer: 'MCAL',
                version: '4.4.0',
                enabled: false,
                parameters: [],
                containers: []
              },
              {
                id: 'can',
                name: 'Can',
                layer: 'ECUAL',
                version: '4.4.0',
                enabled: true,
                parameters: [
                  {
                    name: 'CanControllerId',
                    type: 'integer',
                    value: 0,
                    default: 0,
                    min: 0,
                    max: 255,
                    description: 'CAN Controller ID'
                  },
                  {
                    name: 'CanBaudrate',
                    type: 'enum',
                    value: '500K',
                    default: '500K',
                    options: ['125K', '250K', '500K', '1M'],
                    description: 'CAN bus baudrate'
                  },
                  {
                    name: 'CanTxPdus',
                    type: 'array',
                    value: ['Pdu1', 'Pdu2'],
                    default: [],
                    itemType: 'string',
                    description: 'List of TX PDUs'
                  }
                ],
                containers: []
              },
              {
                id: 'eth',
                name: 'Eth',
                layer: 'ECUAL',
                version: '4.4.0',
                enabled: false,
                parameters: [],
                containers: []
              }
            ]
          }
          
          set({ 
            currentConfig: mockConfig,
            selectedModuleId: mockConfig.modules[0]?.id || null,
            isDirty: false
          })
        } finally {
          set({ isLoading: false })
        }
      },

      createConfig: async (name, description) => {
        set({ isLoading: true })
        try {
          // TODO: 调用 API 创建配置
          console.log('Creating config:', { name, description })
          
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 刷新列表
          await get().loadConfigList()
        } finally {
          set({ isLoading: false })
        }
      },

      deleteConfig: async (configId) => {
        set({ isLoading: true })
        try {
          // TODO: 调用 API 删除配置
          console.log('Deleting config:', configId)
          
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 刷新列表
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
          // TODO: 调用 API 获取配置列表
          
          // 模拟数据
          const mockList: ConfigListItem[] = [
            {
              id: 'config-1',
              name: 'Default Configuration',
              description: 'Default yuleASR configuration for testing',
              moduleCount: 35,
              lastModified: '2025-05-10T14:30:00Z'
            },
            {
              id: 'config-2',
              name: 'Production Config',
              description: 'Production ready configuration',
              moduleCount: 35,
              lastModified: '2025-05-09T10:15:00Z'
            },
            {
              id: 'config-3',
              name: 'Development Config',
              description: 'Development configuration with debug enabled',
              moduleCount: 20,
              lastModified: '2025-05-08T16:45:00Z'
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
