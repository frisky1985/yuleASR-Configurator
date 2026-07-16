import {
  CheckCircle2,
  AlertCircle,
  Code2,
  Globe,
  FileOutput,
  Info,
  RotateCcw,
  Check,
  Moon,
  Sun,
  Monitor,
  Download,
  RefreshCw,
  ChevronRight,
  Shield,
  FileJson,
  FileCode,
  Crown,
  Sparkles,
  Key,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useLicenseStore } from '@/stores/licenseStore'
import { 
  useSettingsStore, 
  type EditorTheme, 
  type UILanguage, 
  type ExportFormat,
  type FileNamingRule 
} from '@/stores/settingsStore'

interface SettingSectionProps {
  title: string
  description?: string
  icon: React.ReactNode
  children: React.ReactNode
}

function SettingSection({ title, description, icon, children }: SettingSectionProps) {
  return (
    <div className="bg-app-bg-primary border border-app-border-primary rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-app-border-primary bg-app-bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-app-text-primary">{title}</h2>
            {description && (
              <p className="text-sm text-app-text-secondary">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  )
}

interface SettingItemProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingItem({ label, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-app-text-primary">{label}</label>
        {description && (
          <p className="text-sm text-app-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary-600" : "bg-app-bg-tertiary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-app-bg-primary transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

function Select<T extends string>({ 
  value, 
  onChange, 
  options,
  disabled = false
}: { 
  value: T; 
  onChange: (value: T) => void; 
  options: { value: T; label: string; icon?: React.ReactNode }[]
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "appearance-none bg-app-bg-primary text-app-text-primary border border-app-border-primary rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          disabled && "opacity-50 cursor-not-allowed bg-app-bg-secondary"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronRight className="w-4 h-4 text-app-text-tertiary rotate-90" />
      </div>
    </div>
  )
}

function Input({ 
  value, 
  onChange, 
  type = "text",
  min,
  max,
  placeholder,
  disabled = false,
  className: inputClassName = ""
}: { 
  value: string | number; 
  onChange: (value: string) => void; 
  type?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-3 py-2 border border-app-border-primary rounded-lg text-sm bg-app-bg-primary text-app-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
        disabled && "opacity-50 cursor-not-allowed bg-app-bg-secondary",
        inputClassName
      )}
    />
  )
}

export function Settings() {
  const {
    editor,
    validation,
    importExport,
    ui,
    version,
    lastCheckedAt,
    updateEditorSettings,
    updateValidationSettings,
    updateImportExportSettings,
    updateUISettings,
    setLastCheckedAt,
    resetAllSettings,
  } = useSettingsStore()
  const navigate = useNavigate()
  const licenseTier = useLicenseStore((s) => s.tier)
  const licenseExpiresAt = useLicenseStore((s) => s.expiresAt)

  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState<boolean | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Show saved notification
  const showSaved = (message: string) => {
    setSavedMessage(message)
    setTimeout(() => setSavedMessage(null), 2000)
  }

  // Check for updates
  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setCheckingUpdate(false)
    setUpdateAvailable(false) // Mock: no update available
    setLastCheckedAt(new Date().toISOString())
  }

  // Reset all settings
  const handleReset = () => {
    resetAllSettings()
    setShowResetConfirm(false)
    showSaved('Settings reset to defaults')
  }

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement
      const isDark = 
        editor.theme === 'dark' || 
        (editor.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    applyTheme()
    
    if (editor.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', applyTheme)
      return () => mediaQuery.removeEventListener('change', applyTheme)
    }
  }, [editor.theme])

  const themeOptions: { value: EditorTheme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ]

  const languageOptions: { value: UILanguage; label: string }[] = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en-US', label: 'English' },
  ]

  const exportFormatOptions: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
    { value: 'arxml', label: 'ARXML', icon: <FileCode className="w-4 h-4" /> },
  ]

  const fileNamingOptions: { value: FileNamingRule; label: string }[] = [
    { value: 'timestamp', label: 'Timestamp (YYYYMMDD-HHmmss)' },
    { value: 'config-name', label: 'Config Name' },
    { value: 'custom', label: 'Custom Pattern' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">Settings</h1>
          <p className="text-app-text-secondary mt-1">
            Configure your yuleASR Configurator preferences
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>

      {/* Saved notification */}
      {savedMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{savedMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editor Settings */}
          <SettingSection
            title="Editor Settings"
            description="Customize the parameter editor behavior"
            icon={<Code2 className="w-5 h-5 text-primary-600" />}
          >
            <SettingItem
              label="Default Expand Parameters"
              description="Automatically expand all parameter sections when opening a module"
            >
              <Toggle
                checked={editor.defaultExpandParams}
                onChange={(checked) => {
                  updateEditorSettings({ defaultExpandParams: checked })
                  showSaved('Editor settings saved')
                }}
              />
            </SettingItem>

            <SettingItem
              label="Auto Save Interval"
              description="Automatically save changes after inactivity (seconds, 0 to disable)"
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={300}
                  value={editor.autoSaveInterval}
                  onChange={(value) => {
                    const num = parseInt(value) || 0
                    updateEditorSettings({ autoSaveInterval: num })
                  }}
                  className="w-24"
                />
                <span className="text-sm text-app-text-secondary">seconds</span>
              </div>
            </SettingItem>

            <SettingItem
              label="Editor Theme"
              description="Choose your preferred color theme"
            >
              <div className="flex items-center gap-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      updateEditorSettings({ theme: opt.value })
                      showSaved('Theme updated')
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                      editor.theme === opt.value
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-app-border-primary hover:border-app-border-primary hover:bg-app-bg-secondary"
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </SettingItem>
          </SettingSection>

          {/* Validation Settings */}
          <SettingSection
            title="Validation Settings"
            description="Configure validation rules and thresholds"
            icon={<Shield className="w-5 h-5 text-green-600" />}
          >
            <SettingItem
              label="Enable Validation"
              description="Validate configuration against rules in real-time"
            >
              <Toggle
                checked={validation.enabled}
                onChange={(checked) => {
                  updateValidationSettings({ enabled: checked })
                  showSaved('Validation settings saved')
                }}
              />
            </SettingItem>

            <div className={cn("space-y-6", !validation.enabled && "opacity-50 pointer-events-none")}>
              <SettingItem
                label="Max Parameter Count"
                description="Warn when a module exceeds this parameter limit"
              >
                <Input
                  type="number"
                  min={100}
                  max={10000}
                  value={validation.customThresholds.maxParameterCount}
                  onChange={(value) => {
                    updateValidationSettings({
                      customThresholds: {
                        ...validation.customThresholds,
                        maxParameterCount: parseInt(value) || 1000,
                      },
                    })
                  }}
                  className="w-32"
                />
              </SettingItem>

              <SettingItem
                label="Max Nesting Depth"
                description="Maximum allowed container nesting depth"
              >
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={validation.customThresholds.maxNestingDepth}
                  onChange={(value) => {
                    updateValidationSettings({
                      customThresholds: {
                        ...validation.customThresholds,
                        maxNestingDepth: parseInt(value) || 5,
                      },
                    })
                  }}
                  className="w-32"
                />
              </SettingItem>

              <SettingItem
                label="Require Descriptions"
                description="Warn when parameters lack descriptions"
              >
                <Toggle
                  checked={validation.customThresholds.requireDescription}
                  onChange={(checked) => {
                    updateValidationSettings({
                      customThresholds: {
                        ...validation.customThresholds,
                        requireDescription: checked,
                      },
                    })
                    showSaved('Validation settings saved')
                  }}
                />
              </SettingItem>
            </div>
          </SettingSection>

          {/* Import/Export Settings */}
          <SettingSection
            title="Import / Export Settings"
            description="Configure default import and export behavior"
            icon={<FileOutput className="w-5 h-5 text-purple-600" />}
          >
            <SettingItem
              label="Default Export Format"
              description="Preferred format for configuration exports"
            >
              <Select
                value={importExport.defaultFormat}
                onChange={(value) => {
                  updateImportExportSettings({ defaultFormat: value })
                  showSaved('Export settings saved')
                }}
                options={exportFormatOptions}
              />
            </SettingItem>

            <SettingItem
              label="File Naming Rule"
              description="How exported files should be named"
            >
              <Select
                value={importExport.fileNamingRule}
                onChange={(value) => {
                  updateImportExportSettings({ fileNamingRule: value })
                  showSaved('Naming rule saved')
                }}
                options={fileNamingOptions}
              />
            </SettingItem>

            {importExport.fileNamingRule === 'custom' && (
              <SettingItem
                label="Custom File Pattern"
                description="Use {name}, {date}, {time} as placeholders"
              >
                <Input
                  value={importExport.customFilePattern}
                  onChange={(value) => {
                    updateImportExportSettings({ customFilePattern: value })
                  }}
                  placeholder="{name}-{date}"
                  className="w-48"
                />
              </SettingItem>
            )}

            <SettingItem
              label="Include Metadata"
              description="Add creation timestamp and version info to exports"
            >
              <Toggle
                checked={importExport.includeMetadata}
                onChange={(checked) => {
                  updateImportExportSettings({ includeMetadata: checked })
                  showSaved('Export settings saved')
                }}
              />
            </SettingItem>
          </SettingSection>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* UI Settings */}
          <SettingSection
            title="Interface Settings"
            description="Language and display preferences"
            icon={<Globe className="w-5 h-5 text-blue-600" />}
          >
            <SettingItem
              label="Language"
              description="Select your preferred language"
            >
              <Select
                value={ui.language}
                onChange={(value) => {
                  updateUISettings({ language: value })
                  showSaved('Language updated')
                }}
                options={languageOptions}
              />
            </SettingItem>

            <SettingItem
              label="Show Tooltips"
              description="Display helpful tooltips on hover"
            >
              <Toggle
                checked={ui.showTooltips}
                onChange={(checked) => {
                  updateUISettings({ showTooltips: checked })
                  showSaved('UI settings saved')
                }}
              />
            </SettingItem>

            <SettingItem
              label="Confirm Before Delete"
              description="Show confirmation dialog before deleting items"
            >
              <Toggle
                checked={ui.confirmBeforeDelete}
                onChange={(checked) => {
                  updateUISettings({ confirmBeforeDelete: checked })
                  showSaved('UI settings saved')
                }}
              />
            </SettingItem>
          </SettingSection>

          {/* License Status */}
          <SettingSection
            title="License Status"
            description="Your yuleASR plan and subscription"
            icon={<Shield className="w-5 h-5 text-amber-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-app-text-secondary">Current Plan</span>
                <button
                  onClick={() => navigate('/settings/license')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-all hover:shadow-sm"
                >
                  {licenseTier === 'pro' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300">
                      <Crown className="w-3.5 h-3.5" />
                      Pro
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-bg-tertiary text-app-text-secondary">
                      <Sparkles className="w-3.5 h-3.5" />
                      Free
                    </span>
                  )}
                </button>
              </div>

              {licenseTier === 'pro' && licenseExpiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-app-text-secondary">Expires</span>
                  <span className="text-sm text-app-text-primary">
                    {new Date(licenseExpiresAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}

              <button
                onClick={() => navigate('/settings/license')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Key className="w-4 h-4" />
                {licenseTier === 'pro' ? 'Manage License' : 'Upgrade to Pro'}
              </button>
            </div>
          </SettingSection>

          {/* About */}
          <SettingSection
            title="About"
            description="Version information and updates"
            icon={<Info className="w-5 h-5 text-primary-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-app-text-secondary">Version</span>
                <span className="text-sm font-medium text-app-text-primary">{version}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-app-text-secondary">License</span>
                <span className="text-sm font-medium text-app-text-primary">MIT</span>
              </div>

              {lastCheckedAt && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-app-text-secondary">Last Checked</span>
                  <span className="text-sm text-app-text-secondary">
                    {new Date(lastCheckedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-app-border-primary">
                {updateAvailable === null ? (
                  <button
                    onClick={handleCheckUpdate}
                    disabled={checkingUpdate}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {checkingUpdate ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Check for Updates
                      </>
                    )}
                  </button>
                ) : updateAvailable ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Update available!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      A new version is ready to download.
                    </p>
                  </div>
                ) : (
                  <div className="bg-app-bg-secondary border border-app-border-primary rounded-lg p-3">
                    <div className="flex items-center gap-2 text-app-text-primary">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Up to date</span>
                    </div>
                    <p className="text-sm text-app-text-secondary mt-1">
                      You're running the latest version.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SettingSection>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-app-bg-primary rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-app-border-primary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-app-text-primary">Reset Settings</h3>
                  <p className="text-sm text-app-text-secondary">
                    This will restore all settings to their default values
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-app-text-secondary">
                Are you sure you want to reset all settings? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-app-border-primary flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-app-text-primary hover:bg-app-bg-tertiary rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
