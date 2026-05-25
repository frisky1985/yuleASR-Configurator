import {
  Save,
  ArrowLeft,
  Play,
  Download,
  Upload,
  GitBranch,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Search,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { ConfigTree } from '@/components/ConfigTree'
import type { ConfigTreeHandle } from '@/components/ConfigTree'
import { ConfigurationStatusPanel, exportConfigReport } from '@/components/ConfigurationStatusPanel'
import { GlobalSearch } from '@/components/GlobalSearch'
import { ModuleConfigWizard } from '@/components/ModuleConfigWizard'
import { OSEditor } from '@/components/OSEditor'
import { ParameterEditor } from '@/components/ParameterEditor'
import { useTheme } from '@/components/ThemeProvider'
import { ValidationPanel } from '@/components/ValidationPanel'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { ContainerConfigSection } from '@/components/ContainerConfigSection'
import { ContainerParameterList } from '@/components/ContainerParameterList'
import { cn, formatDate } from '@/lib/utils'
import { useConfigStore } from '@/stores/configStore'
import type { ValidationResult } from '@/types'
import type { ConfigContainer } from '@/types/config'

export function Editor() {
  const { configId } = useParams<{ configId: string }>()
  const navigate = useNavigate()

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [showDisabled, setShowDisabled] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const configTreeRef = useRef<ConfigTreeHandle>(null)

  const {
    currentConfig,
    selectedPath,
    validationResult,
    validationIssues,
    isDirty,
    isLoading,
    loadConfig,
    setSelectedPath,
    updateParameter,
    saveConfig,
    validateConfig,
    toggleModuleEnabled,
  } = useConfigStore()

  useEffect(() => {
    if (configId) {
      loadConfig(configId)
    }
  }, [configId, loadConfig])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) {
          handleSave()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDirty])

  // Handle validation
  const handleValidate = useCallback(async () => {
    setIsValidating(true)
    const result = validateConfig()
    setIsValidating(false)
    return result
  }, [validateConfig])

  const handleSave = async () => {
    await saveConfig()
  }

  const handleExport = () => {
    if (!currentConfig) return
    const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentConfig.name.replace(/\s+/g, '_')}.yuleasr.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const config = JSON.parse(reader.result as string)
        setSelectedPath('')
        useConfigStore.setState({ currentConfig: config, isDirty: false })
        localStorage.setItem('yuleasr_config', JSON.stringify(config))
      } catch (err) {
        alert('导入失败：无效的配置文件')
      }
      setImporting(false)
    }
    reader.readAsText(file)
    // Reset input so same file can be re-imported
    e.target.value = ''
  }

  const handleParameterChange = (paramName: string, value: unknown) => {
    if (selectedPath) {
      updateParameter(selectedPath, value)
    }
  }

  // Get selected module from path
  const selectedModule = selectedPath 
    ? currentConfig?.modules.find(m => selectedPath.includes(m.id))
    : null

  // Extract selected container id from path (e.g. "layer:MCAL/module:adc/container:AdcConfigSet")
  const selectedContainerId = selectedPath?.match(/container:([^/]+)/)?.[1] ?? null

  // Find the selected container in the module's container tree (deep search)
  const findContainer = (containers: ConfigContainer[], id: string): ConfigContainer | null => {
    for (const c of containers) {
      if (c.id === id) return c
      if (c.subContainers?.length) {
        const found = findContainer(c.subContainers, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedContainer = selectedContainerId && selectedModule?.containers
    ? findContainer(selectedModule.containers, selectedContainerId)
    : null

  // Extract instance name from path (e.g. "layer:MCAL/module:adc/container:adcconfigset/instance:AdcHwUnit_0")
  const selectedInstanceName = selectedPath?.match(/instance:([^/]+)/)?.[1] ?? null

  // When an instance is selected, create a virtual container from the template
  const instanceContainer = selectedInstanceName && selectedContainer?.multiple && selectedContainer.subContainers?.length
    ? {
        ...selectedContainer.subContainers[0],
        id: `${selectedContainer.id}_${selectedInstanceName}`,
        name: selectedInstanceName,
        displayName: selectedInstanceName,
        description: `Instance of ${selectedContainer.displayName || selectedContainer.name}`,
      } as ConfigContainer
    : null
  
  // Check if OS is selected
  const isOSSelected = selectedPath?.includes('layer:OS') || selectedPath?.includes('/os')

  if (isLoading && !currentConfig) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-2">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (!currentConfig) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-medium">Configuration not found</h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{currentConfig.name}</h1>
              {isDirty ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Unsaved
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              )}
              {validationIssues.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  {validationIssues.filter(i => i.severity === 'error').length} Errors
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {currentConfig.targetChip} | {currentConfig.modules.filter(m => m.enabled).length} modules | 
              Last modified: {formatDate(currentConfig.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+K</kbd>
          </button>

          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isValidating ? (
              <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Validate
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isLoading}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              !isDirty || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Export configuration as JSON"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Import configuration from JSON"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yuleasr.json"
            onChange={handleImport}
            className="hidden"
          />
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
        {/* Left Sidebar - Hierarchical Config Tree */}
        <div className="col-span-3 h-full">
          <ConfigTree
            ref={configTreeRef}
            config={currentConfig}
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
            validationIssues={validationIssues}
            showDisabled={showDisabled}
            onToggleModule={(id, enabled) => toggleModuleEnabled(id, enabled)}
            filterText={searchQuery}
          />
        </div>

        {/* Center - Validation + Selected Container Parameters (wide) */}
        <div className="col-span-7 h-full overflow-y-auto space-y-4">
          {/* Validation Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Validation</h3>
            {validationResult ? (
              <div className="space-y-2">
                {validationResult.valid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">All checks passed</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{validationResult.errors.length} errors</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{validationResult.warnings.length} warnings</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Click Validate to check configuration</p>
            )}
          </div>

          {/* Validation Issues List */}
          {validationIssues.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Issues</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {validationIssues.slice(0, 10).map((issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      'text-xs p-2 rounded cursor-pointer hover:bg-gray-50',
                      issue.severity === 'error' && 'bg-red-50 text-red-700 border border-red-100',
                      issue.severity === 'warning' && 'bg-yellow-50 text-yellow-700 border border-yellow-100',
                      issue.severity === 'info' && 'bg-blue-50 text-blue-700 border border-blue-100'
                    )}
                    onClick={() => {
                      if (issue.module) {
                        const module = currentConfig?.modules.find(m => m.name === issue.module)
                        if (module) setSelectedPath(`layer:${module.layer}/module:${module.id}`)
                      }
                    }}
                  >
                    <div className="font-medium">{issue.path}</div>
                    <div className="mt-1">{issue.message}</div>
                    {issue.suggestion && <div className="mt-1 text-gray-500 italic">{issue.suggestion}</div>}
                  </div>
                ))}
                {validationIssues.length > 10 && (
                  <div className="text-xs text-gray-500 text-center">+{validationIssues.length - 10} more issues</div>
                )}
              </div>
            </div>
          )}

          {/* Selected Container Parameters - show when a container is clicked */}
          {selectedContainer && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {(instanceContainer || selectedContainer).displayName || (instanceContainer || selectedContainer).name}
                </h3>
                <span className="text-xs text-gray-500">
                  {instanceContainer
                    ? `${(instanceContainer).parameters.length} params · ${(instanceContainer).description || ''}`
                    : `${selectedContainer.parameters.length + (selectedContainer.subContainers?.reduce((s, sc) => s + sc.parameters.length, 0) ?? 0)} params`
                  }
                </span>
              </div>
              <div className="p-3">
                {selectedContainer.multiple && !selectedInstanceName ? (
                  /* Dynamic container with no instance selected - empty state */
                  <div className="text-center py-8">
                    <button
                      onClick={() => {
                        const path = `layer:${selectedModule?.layer}/module:${selectedModule?.id}/container:${selectedContainer.id}`
                        configTreeRef.current?.addInstance(path)
                      }}
                      className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 hover:bg-primary-50 transition-colors cursor-pointer group"
                      title="添加实例"
                    >
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {selectedContainer.displayName || selectedContainer.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      点击上方 [+] 添加{selectedContainer.subContainers?.[0]?.displayName || selectedContainer.subContainers?.[0]?.name || '实例'} 实例
                    </p>
                    <p className="text-xs text-gray-400 mt-2">创建实例后，在树中选择实例查看和编辑参数</p>
                  </div>
                ) : (
                  /* Static container or instance selected - show parameters normally */
                  <ContainerParameterList
                    container={instanceContainer || selectedContainer}
                    onParamChange={(name, value) => handleParameterChange(name, value)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right - Configuration Status only */}
        <div className="col-span-2 h-full overflow-y-auto">
          <ConfigurationStatusPanel
            config={currentConfig}
            onExportReport={() => exportConfigReport(currentConfig)}
          />
        </div>
      </div>

      {/* Global Search */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(path) => setSelectedPath(path)}
      />
    </div>
  )
}
