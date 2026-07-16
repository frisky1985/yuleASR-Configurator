import { yuleasrAdapter } from '@yuletech/core'
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
  GitCompare,
  GitBranch,
  X,
  Loader2,
  Download,
  AlertTriangle,
  BarChart3,
  FileBox,
  Zap
} from 'lucide-react'
import { useEffect, useState, lazy, Suspense, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { ModuleConfigWizard } from '@/components/ModuleConfigWizard'
import { YuleasrImportDialog } from '@/components/YuleasrImportDialog'
import { ConfigCompareDialog } from '@/components/ConfigCompareDialog'
import { formatDate, cn } from '@/lib/utils'
import { useConfigStore } from '@/stores/configStore'
import { useTranslation } from 'react-i18next'
import type { ModuleConfig, ConfigFile } from '@/types'


// Lazy load ModuleGraph component
const ModuleGraph = lazy(() => import('@/components/ModuleGraph').then(m => ({ default: m.ModuleGraph })))

/** Compute completion percentage from module configStatuses */
function computeCompletionPercent(modules: { configStatus?: string }[]): number {
  if (!modules || modules.length === 0) return 0
  let total = 0
  for (const m of modules) {
    if (m.configStatus === 'configured') total += 100
    else if (m.configStatus === 'partial') total += 50
    else total += 0
  }
  return Math.round(total / modules.length)
}

/** Count warnings from loaded config */
function countWarnings(config: ConfigFile): number {
  if (config.lastValidation?.warningCount) return config.lastValidation.warningCount
  return 0
}

export function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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

  // Compare dialog state
  const [showCompareDialog, setShowCompareDialog] = useState(false)
  const [compareConfigAId, setCompareConfigAId] = useState<string>('')
  const [compareConfigBId, setCompareConfigBId] = useState<string>('')

  // Stats computed from loaded config data
  const [configDetails, setConfigDetails] = useState<ConfigFile[]>([])

  // Load full config details for stats computation
  useEffect(() => {
    const loaded: ConfigFile[] = []
    for (const item of configList) {
      try {
        const raw = localStorage.getItem(`yuleasr_config_${item.id}`)
        if (raw) {
          loaded.push(JSON.parse(raw) as ConfigFile)
        }
      } catch {
        // skip unparseable configs
      }
    }
    setConfigDetails(loaded)
  }, [configList])

  // Compute dashboard stats
  const stats = {
    totalConfigs: configList.length,
    totalModules: configList.reduce((sum, c) => sum + c.moduleCount, 0),
    avgCompletion: configDetails.length > 0
      ? Math.round(configDetails.reduce((s, cfg) => s + computeCompletionPercent(cfg.modules), 0) / configDetails.length)
      : 0,
    warningsCount: configDetails.reduce((s, cfg) => s + countWarnings(cfg), 0),
  }

  const handleOpenCompare = (configId: string) => {
    setCompareConfigAId(configId)
    setCompareConfigBId('')
    setShowCompareDialog(true)
  }

  const handleCompareTwo = (configAId: string, configBId: string) => {
    setCompareConfigAId(configAId)
    setCompareConfigBId(configBId)
    setShowCompareDialog(true)
  }

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
        configStatus: 'configured',
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
        configStatus: 'configured',
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

  /** Progress bar color based on completion percentage */
  const progressColor = (pct: number) => {
    if (pct >= 100) return 'bg-green-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-app-bg-tertiary'
  }

  /** Get completion % for a config from loaded details */
  const getConfigCompletion = (configId: string): number | null => {
    const detail = configDetails.find(d => d.id === configId)
    if (!detail || !detail.modules) return null
    return computeCompletionPercent(detail.modules)
  }

  /** Get the config detail object for a given config id */
  const getConfigDetail = (configId: string): ConfigFile | undefined => {
    return configDetails.find(d => d.id === configId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('dashboard.title')}</h1>
          <p className="text-app-text-secondary mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.newConfiguration')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Configs */}
        <div className="stat-card stat-card-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">{t('dashboard.totalConfigurations')}</p>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileBox className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.totalConfigs}</p>
          <p className="text-xs text-blue-600 mt-1">
            {t('dashboard.configCount', { count: stats.totalConfigs })}
          </p>
        </div>

        {/* Total Modules */}
        <div className="stat-card stat-card-purple">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-700">{t('dashboard.totalModules')}</p>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.totalModules}</p>
          <p className="text-xs text-purple-600 mt-1">
            {t('dashboard.acrossAllConfigs')}
          </p>
        </div>

        {/* Avg Completion */}
        <div className="stat-card stat-card-green">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">{t('dashboard.avgCompletion')}</p>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-slate-800">{stats.avgCompletion}%</p>
          </div>
          <div className="mt-2 h-2 bg-app-bg-tertiary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out progress-bar-animated",
                stats.avgCompletion >= 100 ? "bg-green-500" : stats.avgCompletion >= 50 ? "bg-yellow-500" : "bg-app-bg-tertiary"
              )}
              style={{ width: `${stats.avgCompletion}%` }}
            />
          </div>
        </div>

        {/* Warnings */}
        <div className="stat-card stat-card-amber">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-amber-700">{t('dashboard.warnings')}</p>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className={cn(
            "text-3xl font-bold",
            stats.warningsCount > 0 ? "text-amber-600" : "text-slate-800"
          )}>
            {stats.warningsCount}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {stats.warningsCount === 0 ? t('dashboard.noWarnings') : t('dashboard.warningsFound', { count: stats.warningsCount })}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={handleOpenExisting}
            className="p-4 bg-app-bg-primary border border-app-border-primary rounded-xl hover:border-app-border-secondary hover:shadow-md transition-all text-left group card-hover"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.openExisting')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">{t('dashboard.browseLocalConfigs')}</p>
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
            className="p-4 bg-app-bg-primary border border-app-border-primary rounded-xl hover:border-app-border-secondary hover:shadow-md transition-all text-left group card-hover"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
              <FileJson className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.importYuleasr')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">{t('dashboard.importYuleasrDesc')}</p>
          </button>
          
          <button 
            onClick={() => setShowModuleWizard(true)}
            className="p-4 bg-app-bg-primary border border-app-border-primary rounded-xl hover:border-app-border-secondary hover:shadow-md transition-all text-left group card-hover"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.moduleWizard')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">{t('dashboard.moduleWizardDesc')}</p>
          </button>

          <button 
            onClick={() => handleShowGraph('config-1')}
            className="p-4 bg-app-bg-primary border border-app-border-primary rounded-xl hover:border-app-border-secondary hover:shadow-md transition-all text-left group card-hover"
          >
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors">
              <GitGraph className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.dependencyGraph')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">{t('dashboard.dependencyGraphDesc')}</p>
          </button>
        </div>
      </div>

      {/* Config List */}
      <div className="bg-app-bg-primary border border-app-border-primary rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-app-border-primary bg-app-bg-secondary flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">{t('dashboard.recentConfigurations')}</h2>
          {configList.length > 0 && (
            <span className="text-xs text-app-text-secondary bg-app-bg-primary px-2.5 py-1 rounded-full border border-app-border-primary">
              {t('dashboard.configs', { count: configList.length })}
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-app-text-secondary mt-3 font-medium">{t('dashboard.loadingConfigs')}</p>
          </div>
        ) : configList.length === 0 ? (
          /* Enhanced Empty State */
          <div className="py-16 px-8 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">{t('dashboard.createFirstTitle')}</h3>
            <p className="text-app-text-secondary max-w-md mx-auto mb-8">
              {t('dashboard.createFirstDesc')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                {t('dashboard.newConfiguration')}
              </button>
              <button
                onClick={handleOpenExisting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border border-app-border-primary text-primary-foreground rounded-lg hover:bg-primary-600 hover:border-primary-600 transition-all active:scale-[0.98]"
              >
                <FolderOpen className="w-4 h-4" />
                {t('dashboard.openExisting')}
              </button>
              <button
                onClick={() => setShowImportDialog(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border border-app-border-primary text-primary-foreground rounded-lg hover:bg-primary-600 hover:border-primary-600 transition-all active:scale-[0.98]"
              >
                <FileJson className="w-4 h-4" />
                {t('dashboard.import')}
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-app-border-primary">
            {configList.map((config) => {
              const completion = getConfigCompletion(config.id)
              const configDetail = getConfigDetail(config.id)
              return (
                <div
                  key={config.id}
                  className="px-6 py-4 hover:bg-app-bg-secondary transition-colors group"
                >
                  <div className="flex items-center justify-between gap-4">
                  <div
                    onClick={() => navigate(`/editor/${config.id}`)}
                    className="flex-1 text-left min-w-0 cursor-pointer"
                  >
                  <div className="flex items-center gap-4">
                    {/* Icon with status ring */}
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                      completion !== null && completion >= 100
                        ? "bg-green-50"
                        : completion !== null && completion >= 50
                        ? "bg-yellow-50"
                        : "bg-blue-50"
                    )}>
                      <Settings className={cn(
                        "w-5 h-5",
                        completion !== null && completion >= 100
                          ? "text-green-600"
                          : completion !== null && completion >= 50
                          ? "text-yellow-600"
                          : "text-blue-600"
                      )} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-primary truncate">{config.name}</h3>
                      <p className="text-sm text-app-text-secondary truncate">{config.description || t('dashboard.noDescription')}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-app-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {t('dashboard.moduleCount', { count: config.moduleCount })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(config.lastModified)}
                        </span>
                        {completion !== null && (
                          <span className={cn(
                            "flex items-center gap-1 font-medium",
                            completion >= 100 ? "text-green-500" : completion >= 50 ? "text-yellow-500" : "text-app-text-tertiary"
                          )}>
                            {t('dashboard.percentComplete', { count: completion })}
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      {completion !== null && (
                        <div className="mt-2 max-w-xs">
                          <div className="h-1.5 bg-app-bg-tertiary rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-500", progressColor(completion))}
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/diff/${config.id}`)
                        }}
                        className="p-2 text-app-text-tertiary hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={t('dashboard.diffConfigs') || 'Compare in Diff View'}
                      >
                        <GitBranch className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenCompare(config.id)
                        }}
                        className="p-2 text-app-text-tertiary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('dashboard.compareConfigs')}
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShowGraph(config.id)
                        }}
                        className="p-2 text-app-text-tertiary hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        title={t('dashboard.viewDependencyGraph')}
                      >
                        <GitGraph className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportConfig(config.id, config.name)
                        }}
                        className="p-2 text-app-text-tertiary hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t('dashboard.exportToYuleasr')}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/editor/${config.id}`)}
                        className="p-2 text-app-text-tertiary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('common.edit')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(config.id)}
                        disabled={deletingId === config.id}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          deletingId === config.id
                            ? "text-app-text-tertiary cursor-not-allowed"
                            : "text-app-text-tertiary hover:text-red-600 hover:bg-red-50"
                        )}
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-app-bg-primary rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-app-border-primary">
              <h3 className="text-lg font-semibold text-primary">{t('dashboard.newConfiguration')}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {t('dashboard.name')}
                </label>
                <input
                  type="text"
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  placeholder={t('dashboard.myConfig')}
                  className="w-full px-3 py-2 border border-app-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {t('dashboard.description')}
                </label>
                <textarea
                  value={newConfigDesc}
                  onChange={(e) => setNewConfigDesc(e.target.value)}
                  placeholder={t('dashboard.optionalDesc')}
                  rows={3}
                  className="w-full px-3 py-2 border border-app-border-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-app-border-primary flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-primary hover:bg-app-bg-secondary rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateConfig}
                disabled={!newConfigName.trim() || isLoading}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all",
                  !newConfigName.trim() || isLoading
                    ? "bg-app-bg-tertiary text-app-text-secondary cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                )}
              >
                {isLoading ? t('dashboard.creating') : t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-app-bg-primary rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border-primary bg-app-bg-secondary">
              <div>
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <GitGraph className="w-5 h-5 text-pink-600" />
                  {t('dashboard.moduleDependencyGraph')}
                </h3>
                <p className="text-sm text-app-text-secondary mt-0.5">
                  {t('dashboard.visualizeDeps')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowGraphModal(false)
                  setGraphModules([])
                  setSelectedConfigForGraph(null)
                }}
                className="p-2 text-app-text-tertiary hover:text-app-text-secondary hover:bg-app-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {isLoadingGraph ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-app-text-secondary font-medium">{t('dashboard.loadingModuleGraph')}</p>
                    <p className="text-sm text-app-text-tertiary mt-1">{t('dashboard.calculatingDeps')}</p>
                  </div>
                </div>
              ) : (
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                      <p className="text-app-text-secondary font-medium">{t('dashboard.initializingGraph')}</p>
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

      {/* Config Compare Dialog */}
      <ConfigCompareDialog
        isOpen={showCompareDialog}
        onClose={() => setShowCompareDialog(false)}
        configAId={compareConfigAId || undefined}
        configBId={compareConfigBId || undefined}
      />
    </div>
  )
}
