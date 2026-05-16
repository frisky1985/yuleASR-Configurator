import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConfigStore } from '@/stores/configStore'
import { ConfigTree } from '@/components/ConfigTree'
import { ParameterEditor } from '@/components/ParameterEditor'
import { cn, formatDate } from '@/lib/utils'
import type { ValidationResult } from '@/types'
import {
  Save,
  ArrowLeft,
  Play,
  Download,
  GitBranch,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Search,
  AlertTriangle,
  Info,
} from 'lucide-react'

export function Editor() {
  const { configId } = useParams<{ configId: string }>()
  const navigate = useNavigate()

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [showDisabled, setShowDisabled] = useState(true)
  const [isValidating, setIsValidating] = useState(false)

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

  const handleParameterChange = (paramName: string, value: unknown) => {
    if (selectedPath) {
      updateParameter(selectedPath, value)
    }
  }

  // Get selected module from path
  const selectedModule = selectedPath 
    ? currentConfig?.modules.find(m => selectedPath.includes(m.id))
    : null

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
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <GitBranch className="w-4 h-4" />
            Sync
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
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
            config={currentConfig}
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
            validationIssues={validationIssues}
            showDisabled={showDisabled}
            onToggleModule={(id, enabled) => toggleModuleEnabled(id, enabled)}
            filterText={searchQuery}
          />
        </div>

        {/* Center - Parameter Editor */}
        <div className="col-span-6 h-full overflow-hidden">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedModule ? `${selectedModule.displayName || selectedModule.name} Configuration` : 'Select an Item'}
              </h3>
              {selectedModule && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {selectedModule.parameters.length} params
                  </span>
                </div>
              )}
            </div>

            {selectedModule ? (
              <div className="p-4 space-y-6 overflow-y-auto flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 pb-4 border-b border-gray-100">
                  <span className="px-2 py-1 bg-gray-100 rounded">{selectedModule.layer}</span>
                  <span>Version: {selectedModule.version}</span>
                  <span
                    className={cn(
                      'px-2 py-1 rounded',
                      selectedModule.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {selectedModule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {!selectedModule.enabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      This module is currently disabled. Enable it in the module tree to activate
                      its configuration.
                    </p>
                  </div>
                )}

                {selectedModule.parameters.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No configurable parameters for this module
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedModule.parameters.map((param) => (
                      <ParameterEditor
                        key={param.id}
                        parameter={param}
                        onChange={(value) => handleParameterChange(param.name, value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center flex-1 flex items-center justify-center">
                <p className="text-gray-500">Select a module or container from the tree to configure</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Validation & Info */}
        <div className="col-span-3 space-y-4 h-full overflow-y-auto">
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
                    <div className="flex items-center gap-2 text-blue-600">
                      <Info className="w-4 h-4" />
                      <span className="text-sm">{validationResult.info.length} info</span>
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
                      // Navigate to the issue location
                      if (issue.module) {
                        const module = currentConfig?.modules.find(m => m.name === issue.module)
                        if (module) {
                          setSelectedPath(`layer:${module.layer}/module:${module.id}`)
                        }
                      }
                    }}
                  >
                    <div className="font-medium">{issue.path}</div>
                    <div className="mt-1">{issue.message}</div>
                    {issue.suggestion && (
                      <div className="mt-1 text-gray-500 italic">{issue.suggestion}</div>
                    )}
                  </div>
                ))}
                {validationIssues.length > 10 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{validationIssues.length - 10} more issues
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module Info Card */}
          {selectedModule && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Module Info</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium text-gray-900">{selectedModule.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Layer</dt>
                  <dd className="font-medium text-gray-900">{selectedModule.layer}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Version</dt>
                  <dd className="font-medium text-gray-900">{selectedModule.version}</dd>
                </div>
                {selectedModule.vendor && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Vendor</dt>
                    <dd className="font-medium text-gray-900">{selectedModule.vendor}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-medium">
                    <span
                      className={cn(
                        selectedModule.enabled ? 'text-green-600' : 'text-gray-500'
                      )}
                    >
                      {selectedModule.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Parameters</dt>
                  <dd className="font-medium text-gray-900">
                    {selectedModule.parameters.length}
                  </dd>
                </div>
                {selectedModule.containers.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Containers</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedModule.containers.length}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
