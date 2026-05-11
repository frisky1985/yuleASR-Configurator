import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConfigStore } from '@/stores/configStore'
import { ModuleTree } from '@/components/ModuleTree'
import { ParameterEditor } from '@/components/ParameterEditor'
import { ValidationPanel } from '@/components/ValidationPanel'
import { cn, formatDate } from '@/lib/utils'
import { 
  Save, 
  ArrowLeft, 
  Play, 
  Download, 
  GitBranch,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export function Editor() {
  const { configId, moduleId } = useParams<{ configId: string; moduleId?: string }>()
  const navigate = useNavigate()
  
  const {
    currentConfig,
    selectedModuleId,
    validationResult,
    isDirty,
    isLoading,
    loadConfig,
    setSelectedModule,
    updateParameter,
    saveConfig,
    setValidationResult,
  } = useConfigStore()

  useEffect(() => {
    if (configId) {
      loadConfig(configId)
    }
  }, [configId, loadConfig])

  useEffect(() => {
    if (moduleId) {
      setSelectedModule(moduleId)
    }
  }, [moduleId, setSelectedModule])

  const selectedModule = currentConfig?.modules.find(m => m.id === selectedModuleId)

  const handleValidate = () => {
    // Mock validation - TODO: integrate with @yuletech/core validator
    const mockResult = {
      valid: true,
      errors: [] as Array<{ path: string; message: string; severity: 'error' | 'warning' | 'info' }>,
      warnings: [] as Array<{ path: string; message: string; severity: 'error' | 'warning' | 'info' }>,
    }
    setValidationResult(mockResult)
  }

  const handleSave = async () => {
    await saveConfig()
  }

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
            </div>
            <p className="text-sm text-gray-500">
              Last modified: {formatDate(currentConfig.updatedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Play className="w-4 h-4" />
            Validate
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isLoading}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              !isDirty || isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
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
      <div className="grid grid-cols-12 gap-4">
        {/* Left Sidebar - Module Tree */}
        <div className="col-span-3">
          <ModuleTree
            modules={currentConfig.modules}
            selectedModuleId={selectedModuleId}
            onSelectModule={(id) => {
              setSelectedModule(id)
              navigate(`/editor/${configId}/${id}`)
            }}
          />
        </div>

        {/* Center - Parameter Editor */}
        <div className="col-span-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedModule ? `${selectedModule.name} Configuration` : 'Select a Module'}
              </h3>
            </div>
            
            {selectedModule ? (
              <div className="p-4 space-y-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 pb-4 border-b border-gray-100">
                  <span className="px-2 py-1 bg-gray-100 rounded">{selectedModule.layer}</span>
                  <span>Version: {selectedModule.version}</span>
                </div>
                
                {selectedModule.parameters.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No configurable parameters for this module</p>
                  </div>
                ) : (
                  selectedModule.parameters.map((param) => (
                    <ParameterEditor
                      key={param.name}
                      parameter={param}
                      onChange={(value) => 
                        updateParameter(selectedModule.id, param.name, value)
                      }
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">Select a module from the sidebar to configure</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Validation & Info */}
        <div className="col-span-3 space-y-4">
          <ValidationPanel 
            result={validationResult}
            onNavigate={(path) => console.log('Navigate to:', path)}
          />
          
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
                <div className="flex justify-between">
                  <dt className="text-gray-500">Parameters</dt>
                  <dd className="font-medium text-gray-900">{selectedModule.parameters.length}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
