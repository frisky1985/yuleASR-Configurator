import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ValidationRule } from '@/types'

export type EditorTheme = 'light' | 'dark' | 'system'
export type UILanguage = 'zh-CN' | 'en-US'
export type ExportFormat = 'json' | 'arxml'
export type FileNamingRule = 'timestamp' | 'config-name' | 'custom'

export interface EditorSettings {
  defaultExpandParams: boolean
  autoSaveInterval: number // seconds, 0 means disabled
  theme: EditorTheme
}

export interface ValidationSettings {
  enabled: boolean
  rules: ValidationRule[]
  customThresholds: {
    maxParameterCount: number
    maxNestingDepth: number
    requireDescription: boolean
  }
}

export interface ImportExportSettings {
  defaultFormat: ExportFormat
  fileNamingRule: FileNamingRule
  customFilePattern: string
  includeMetadata: boolean
}

export interface UISettings {
  language: UILanguage
  sidebarCollapsed: boolean
  showTooltips: boolean
  confirmBeforeDelete: boolean
}

export interface SettingsState {
  editor: EditorSettings
  validation: ValidationSettings
  importExport: ImportExportSettings
  ui: UISettings
  version: string
  lastCheckedAt: string | null
  
  // Actions
  updateEditorSettings: (settings: Partial<EditorSettings>) => void
  updateValidationSettings: (settings: Partial<ValidationSettings>) => void
  updateImportExportSettings: (settings: Partial<ImportExportSettings>) => void
  updateUISettings: (settings: Partial<UISettings>) => void
  setVersion: (version: string) => void
  setLastCheckedAt: (date: string) => void
  resetAllSettings: () => void
}

const defaultSettings = {
  editor: {
    defaultExpandParams: true,
    autoSaveInterval: 30,
    theme: 'system' as EditorTheme,
  },
  validation: {
    enabled: true,
    rules: [],
    customThresholds: {
      maxParameterCount: 1000,
      maxNestingDepth: 5,
      requireDescription: true,
    },
  },
  importExport: {
    defaultFormat: 'json' as ExportFormat,
    fileNamingRule: 'config-name' as FileNamingRule,
    customFilePattern: '{name}-{date}',
    includeMetadata: true,
  },
  ui: {
    language: 'zh-CN' as UILanguage,
    sidebarCollapsed: false,
    showTooltips: true,
    confirmBeforeDelete: true,
  },
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        ...defaultSettings,
        version: '1.0.0',
        lastCheckedAt: null,

        updateEditorSettings: (settings) => {
          set((state) => ({
            editor: { ...state.editor, ...settings },
          }))
        },

        updateValidationSettings: (settings) => {
          set((state) => ({
            validation: { ...state.validation, ...settings },
          }))
        },

        updateImportExportSettings: (settings) => {
          set((state) => ({
            importExport: { ...state.importExport, ...settings },
          }))
        },

        updateUISettings: (settings) => {
          set((state) => ({
            ui: { ...state.ui, ...settings },
          }))
        },

        setVersion: (version) => {
          set({ version })
        },

        setLastCheckedAt: (date) => {
          set({ lastCheckedAt: date })
        },

        resetAllSettings: () => {
          set({
            ...defaultSettings,
            version: '1.0.0',
            lastCheckedAt: null,
          })
        },
      }),
      {
        name: 'yuleasr-settings',
        partialize: (state) => ({
          editor: state.editor,
          validation: state.validation,
          importExport: state.importExport,
          ui: state.ui,
          version: state.version,
          lastCheckedAt: state.lastCheckedAt,
        }),
      }
    ),
    { name: 'settings-store' }
  )
)
