// yuleASR 配置类型定义

// 导出所有配置类型
export * from './config'

// 保留旧的类型导出以兼容
export type ModuleLayer = 'MCAL' | 'ECUAL' | 'Service' | 'RTE' | 'ASW' | 'OS'

// 兼容性别名
export type { ConfigModule as ModuleConfig } from './config'
export type { ValidationIssue as ValidationError } from './config'

export interface EditorState {
  currentConfig: import('./config').ConfigFile | null
  selectedModuleId: string | null
  validationResult: import('./config').ValidationResult | null
  isDirty: boolean
  isLoading: boolean
}

export interface ConfigListItem {
  id: string
  name: string
  description: string
  moduleCount: number
  lastModified: string
}
