import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfigStore } from '@/stores/configStore'
import { formatDate, cn } from '@/lib/utils'
import { 
  Plus, 
  FileJson, 
  FolderOpen, 
  Trash2, 
  Settings, 
  ChevronRight,
  Clock,
  Layers
} from 'lucide-react'

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
  const [newConfigName, setNewConfigName] = useState('')
  const [newConfigDesc, setNewConfigDesc] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDeleteConfig = async (id: string) => {
    setDeletingId(id)
    if (confirm('Are you sure you want to delete this configuration?')) {
      await deleteConfig(id)
    }
    setDeletingId(null)
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900">Open Existing</h3>
          <p className="text-sm text-gray-500 mt-1">Browse local config files</p>
        </button>
        
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <FileJson className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900">Import Config</h3>
          <p className="text-sm text-gray-500 mt-1">Import from JSON or XDM</p>
        </button>
        
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <Settings className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900">Templates</h3>
          <p className="text-sm text-gray-500 mt-1">Start from template</p>
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
    </div>
  )
}
