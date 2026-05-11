// yuleASR 配置类型定义

export interface ModuleConfig {
  id: string
  name: string
  layer: 'MCAL' | 'ECUAL' | 'Service' | 'RTE' | 'ASW'
  version: string
  parameters: ConfigParameter[]
  containers: ContainerConfig[]
}

export interface ConfigParameter {
  name: string
  type: 'boolean' | 'integer' | 'float' | 'string' | 'enum' | 'reference'
  value: unknown
  default?: unknown
  min?: number
  max?: number
  options?: string[]
  description: string
  validation?: ValidationRule[]
}

export interface ContainerConfig {
  name: string
  multiple: boolean
  parameters: ConfigParameter[]
  subContainers?: ContainerConfig[]
}

export interface ValidationRule {
  type: 'required' | 'range' | 'regex' | 'dependency'
  message: string
  condition?: unknown
}

export interface ValidationError {
  path: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export interface ConfigFile {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  modules: ModuleConfig[]
}

export interface EditorState {
  currentConfig: ConfigFile | null
  selectedModuleId: string | null
  validationResult: ValidationResult | null
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
