import { useEffect, useState, lazy, Suspense, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfigStore } from '@/stores/configStore'
import { formatDate, cn } from '@/lib/utils'
import { yuleasrAdapter } from '@yuletech/core'
import { YuleasrImportDialog } from '@/components/YuleasrImportDialog'
import { ModuleConfigWizard } from '@/components/ModuleConfigWizard'
import type { ModuleConfig } from '@/types'
import type { ModuleConfig as CoreModuleConfig } from '@yuletech/core'
import { 
  Plus, 
  FileJson, 
  FolderOpen, 
  Trash2, 
  Settings, 
  ChevronRight,
  Clock,
  Layers,
  GitGraph,
  X,
  Loader2,
  Download
} from 'lucide-react'

// Lazy load ModuleGraph component
const ModuleGraph = lazy(() => import('@/components/ModuleGraph').then(m => ({ default: m.ModuleGraph })))

export function Dashboard() {
  const navigate = useNavigate()
  const { 
    configList, 
    loadConfigList, 
    createConfig, 
    deleteConfig, 
    isLoading 
  } = useConfigStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showModuleWizard, setShowModuleWizard] = useState(false)
  const [newConfigName, setNewConfigName] = useState('')
  const [newConfigDesc, setNewConfigDesc] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showGraphModal, setShowGraphModal] = useState(false)
  const [selectedConfigForGraph, setSelectedConfigForGraph] = useState<string | null>(null)
  const [graphModules, setGraphModules] = useState<ModuleConfig[]>([])
  const [isLoadingGraph, setIsLoadingGraph] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadConfigList()
  }, [loadConfigList])

  const handleCreateConfig = async () => {
    if (!newConfigName.trim()) return
    await createConfig(newConfigName, newConfigDesc)
    setShowCreateModal(false)
    setNewConfigName('')
    setNewConfigDesc('')
  }

  const handleImportConfig = async (modules: CoreModuleConfig[]) => {
    // 创建新配置，并导入 yuleASR 模块
    const configName = `yuleASR-Import-${new Date().toISOString().slice(0, 10)}`
    await createConfig(configName, 'Imported from yuleASR')
    
    // 保存导入的模块配置
    console.log('Imported modules:', modules)
    
    // 刷新列表
    await loadConfigList()
  }

  const handleExportConfig = (_configId: string, configName: string) => {
    // 获取配置的模块列表
    const mockModules: CoreModuleConfig[] = [
      {
        module: 'Mcu',
        version: '1.0.0',
        parameters: {
          clock_frequency: 800000000,
          core_count: 4,
        },
      },
      {
        module: 'Can',
        version: '1.0.0',
        parameters: {
          baudrate: 500000,
          controller_count: 2,
        },
      },
    ]
    
    // 导出为 yuleASR 格式
    const yuleasrConfig = yuleasrAdapter.exportToYuleasr(mockModules)
    
    // 下载文件
    const blob = new Blob([yuleasrConfig], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${configName}-yuleasr-config.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeleteConfig = async (id: string) => {
    setDeletingId(id)
    if (confirm('Are you sure you want to delete this configuration?')) {
      await deleteConfig(id)
    }
    setDeletingId(null)
  }

  // Handle opening local config file
  const handleOpenExisting = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const config = JSON.parse(content)
      
      // Validate basic config structure
      if (!config.name || !Array.isArray(config.modules)) {
        alert('Invalid configuration file format')
        return
      }

      // Create new config from file
      await createConfig(config.name, config.description || 'Imported from file')
      await loadConfigList()
      alert(`Configuration "${config.name}" imported successfully!`)
    } catch (error) {
      alert('Failed to read configuration file: ' + (error as Error).message)
    }

    // Reset input
    event.target.value = ''
  }

  // Handle opening the dependency graph
  const handleShowGraph = async (configId: string) => {
    setSelectedConfigForGraph(configId)
    setIsLoadingGraph(true)
    setShowGraphModal(true)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockModules: ModuleConfig[] = [
      {
        id: 'mcu',
        name: 'Mcu',
        layer: 'MCAL',
        version: '4.4.0',
        enabled: true,
        description: 'Microcontroller Driver',
        parameters: [],
        containers: [],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'can',
        name: 'Can',
        layer: 'ECUAL',
        version: '4.4.0',
        enabled: true,
        description: 'CAN Driver',
        parameters: [],
        containers: [],
        dependencies: [{ module: 'Mcu', required: true, autoEnable: true }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    
    setGraphModules(mockModules)
    setIsLoadingGraph(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurations</h1>
          <p className="text-gray-500 mt-1">
            Manage your yuleASR configurations and modules
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Configuration
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={handleOpenExisting}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900">Open Existing</h3>
          <p className="text-sm text-gray-500 mt-1">Browse local config files</p>
        </button>
        
        {/* Hidden file input for opening existing configs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button 
          onClick={() => setShowImportDialog(true)}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <FileJson className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900">Import yuleASR</h3>
          <p className="text-sm text-gray-500 mt-1">Import from yuleASR config</p>
        </button>
        
        <button 
          onClick={() => setShowModuleWizard(true)}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <Settings className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900">Module Wizard</h3>
          <p className="text-sm text-gray-500 mt-1">Configure modules step-by-step</p>
        </button>

        <button 
          onClick={() => handleShowGraph('config-1')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left group"
        >
          <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors">
            <GitGraph className="w-5 h-5 text-pink-600" />
          </div>
          <h3 className="font-medium text-gray-900">Dependency Graph</h3>
          <p className="text-sm text-gray-500 mt-1">View module relationships</p>
        </button>
      </div>

      {/* Config List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Configurations</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-2">Loading configurations...</p>
          </div>
        ) : configList.length === 0 ? (
          <div className="p-8 text-center">
            <FileJson className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium">No configurations yet</h3>
            <p className="text-gray-500 mt-1">Create your first configuration to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {configList.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                <button
                  onClick={() => navigate(`/editor/${config.id}`)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{config.name}</h3>
                      <p className="text-sm text-gray-500">{config.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {config.moduleCount} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(config.lastModified)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShowGraph(config.id)
                    }}
                    className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    title="View Dependency Graph"
                  >
                    <GitGraph className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportConfig(config.id, config.name)
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Export to yuleASR"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/editor/${config.id}`)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    disabled={deletingId === config.id}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      deletingId === config.id
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                    )}
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">New Configuration</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  placeholder="My Configuration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newConfigDesc}
                  onChange={(e) => setNewConfigDesc(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConfig}
                disabled={!newConfigName.trim() || isLoading}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  !newConfigName.trim() || isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <GitGraph className="w-5 h-5 text-pink-600" />
                  Module Dependency Graph
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Visualize module relationships and dependencies
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGraphModal(false)
                  setGraphModules([])
                  setSelectedConfigForGraph(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {isLoadingGraph ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Loading module graph...</p>
                    <p className="text-sm text-gray-400 mt-1">Calculating dependencies</p>
                  </div>
                </div>
              ) : (
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Initializing graph...</p>
                    </div>
                  </div>
                }>
                  <ModuleGraph
                    configId={selectedConfigForGraph || 'config-1'}
                    modules={graphModules}
                    onNodeClick={(moduleId) => console.log('Selected:', moduleId)}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      )}

      {/* yuleASR Import Dialog */}
      <YuleasrImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportConfig}
      />

      {/* Module Config Wizard */}
      <ModuleConfigWizard
        isOpen={showModuleWizard}
        onClose={() => setShowModuleWizard(false)}
        onComplete={(config) => {
          console.log('Module config completed:', config)
          setShowModuleWizard(false)
          // 这里可以将配置添加到当前配置
        }}
      />
    </div>
  )
}
