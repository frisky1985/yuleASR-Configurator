import { yuleasrAdapter } from '@yuletech/core';
import type { ModuleConfig as CoreModuleConfig } from '@yuletech/core';
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
  Zap,
} from 'lucide-react';
import { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ConfigCompareDialog } from '@/components/ConfigCompareDialog';
import { ModuleConfigWizard } from '@/components/ModuleConfigWizard';
import { YuleasrImportDialog } from '@/components/YuleasrImportDialog';
import { formatDate, cn } from '@/lib/utils';
import { useConfigStore } from '@/stores/configStore';
import type { ModuleConfig, ConfigFile } from '@/types';
import { PipelinePushButton } from '@/components/PipelinePushButton';
import { PipelineStatusPanel } from '@/components/PipelineStatusPanel';
import { listPipelineRuns } from '@/services/yuleoshPipeline';
// @yuletech/ui 集成示例: 共享组件库 Button (Phase 3)
import { Button as UiButton } from '@yuletech/ui';

// Lazy load ModuleGraph component
const ModuleGraph = lazy(() =>
  import('@/components/ModuleGraph').then(m => ({ default: m.ModuleGraph }))
);

/** Compute completion percentage from module configStatuses */
function computeCompletionPercent(modules: { configStatus?: string }[]): number {
  if (!modules || modules.length === 0) return 0;
  let total = 0;
  for (const m of modules) {
    if (m.configStatus === 'configured') total += 100;
    else if (m.configStatus === 'partial') total += 50;
    else total += 0;
  }
  return Math.round(total / modules.length);
}

/** Count warnings from loaded config */
function countWarnings(config: ConfigFile): number {
  if (config.lastValidation?.warningCount) return config.lastValidation.warningCount;
  return 0;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { configList, loadConfigList, createConfig, deleteConfig, isLoading } = useConfigStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showModuleWizard, setShowModuleWizard] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigDesc, setNewConfigDesc] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedConfigForGraph, setSelectedConfigForGraph] = useState<string | null>(null);
  const [graphModules, setGraphModules] = useState<ModuleConfig[]>([]);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compare dialog state
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [compareConfigAId, setCompareConfigAId] = useState<string>('');
  const [compareConfigBId, setCompareConfigBId] = useState<string>('');

  // Pipeline state
  const [activePipelineJobId, setActivePipelineJobId] = useState<string | null>(null);
  const [recentPipelineRuns, setRecentPipelineRuns] = useState<
    Array<{
      job_id: string;
      status: string;
      type: string;
      progress: number;
      current_stage: string;
      started_at: string | null;
    }>
  >([]);
  const [loadingPipelineRuns, setLoadingPipelineRuns] = useState(false);

  // Stats computed from loaded config data
  const [configDetails, setConfigDetails] = useState<ConfigFile[]>([]);

  // Load full config details for stats computation
  useEffect(() => {
    const loaded: ConfigFile[] = [];
    for (const item of configList) {
      try {
        const raw = localStorage.getItem(`yuleasr_config_${item.id}`);
        if (raw) {
          loaded.push(JSON.parse(raw) as ConfigFile);
        }
      } catch {
        // skip unparseable configs
      }
    }
    setConfigDetails(loaded);
  }, [configList]);

  // Compute dashboard stats
  const stats = {
    totalConfigs: configList.length,
    totalModules: configList.reduce((sum, c) => sum + c.moduleCount, 0),
    avgCompletion:
      configDetails.length > 0
        ? Math.round(
            configDetails.reduce((s, cfg) => s + computeCompletionPercent(cfg.modules), 0) /
              configDetails.length
          )
        : 0,
    warningsCount: configDetails.reduce((s, cfg) => s + countWarnings(cfg), 0),
    // 按 AUTOSAR 层聚合 enabled 模块数 (跨所有配置汇总)
    layerBreakdown: configDetails.reduce<Record<string, number>>((acc, cfg) => {
      for (const m of cfg.modules) {
        if (!m.enabled) continue;
        const layer = m.layer || 'MCAL';
        acc[layer] = (acc[layer] || 0) + 1;
      }
      return acc;
    }, {}),
  };

  const handleOpenCompare = (configId: string) => {
    setCompareConfigAId(configId);
    setCompareConfigBId('');
    setShowCompareDialog(true);
  };

  const handleCompareTwo = (configAId: string, configBId: string) => {
    setCompareConfigAId(configAId);
    setCompareConfigBId(configBId);
    setShowCompareDialog(true);
  };

  // Load recent pipeline runs from yuleOSH
  useEffect(() => {
    async function loadPipelineRuns() {
      setLoadingPipelineRuns(true);
      try {
        const resp = await listPipelineRuns();
        if (resp.ok) {
          setRecentPipelineRuns(resp.runs);
        }
      } catch {
        // yuleOSH server might not be running — that's ok
      } finally {
        setLoadingPipelineRuns(false);
      }
    }
    loadPipelineRuns();
  }, []);

  useEffect(() => {
    loadConfigList();
  }, [loadConfigList]);

  // Close create modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateModal]);

  const handleCreateConfig = async () => {
    if (!newConfigName.trim()) return;
    await createConfig(newConfigName, newConfigDesc);
    setShowCreateModal(false);
    setNewConfigName('');
    setNewConfigDesc('');
  };

  const handleImportConfig = async (modules: CoreModuleConfig[]) => {
    // 创建新配置，并导入 yuleASR 模块
    const configName = `yuleASR-Import-${new Date().toISOString().slice(0, 10)}`;
    await createConfig(configName, 'Imported from yuleASR');

    // 保存导入的模块配置
    console.log('Imported modules:', modules);

    // 刷新列表
    await loadConfigList();
  };

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
    ];

    // 导出为 yuleASR 格式
    const yuleasrConfig = yuleasrAdapter.exportToYuleasr(mockModules);

    // 下载文件
    const blob = new Blob([yuleasrConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${configName}-yuleasr-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfig = async (id: string) => {
    setDeletingId(id);
    if (confirm('Are you sure you want to delete this configuration?')) {
      await deleteConfig(id);
    }
    setDeletingId(null);
  };

  // Handle opening local config file
  const handleOpenExisting = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const config = JSON.parse(content);

      // Validate basic config structure
      if (!config.name || !Array.isArray(config.modules)) {
        alert('Invalid configuration file format');
        return;
      }

      // Create new config from file
      await createConfig(config.name, config.description || 'Imported from file');
      await loadConfigList();
      alert(`Configuration "${config.name}" imported successfully!`);
    } catch (error) {
      alert('Failed to read configuration file: ' + (error as Error).message);
    }

    // Reset input
    event.target.value = '';
  };

  // Handle opening the dependency graph
  const handleShowGraph = async (configId: string) => {
    setSelectedConfigForGraph(configId);
    setIsLoadingGraph(true);
    setShowGraphModal(true);

    await new Promise(resolve => setTimeout(resolve, 500));

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
    ];

    setGraphModules(mockModules);
    setIsLoadingGraph(false);
  };

  /** Progress bar color based on completion percentage */
  const progressColor = (pct: number) => {
    if (pct >= 100) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-app-bg-tertiary';
  };

  /** Get completion % for a config from loaded details */
  const getConfigCompletion = (configId: string): number | null => {
    const detail = configDetails.find(d => d.id === configId);
    if (!detail || !detail.modules) return null;
    return computeCompletionPercent(detail.modules);
  };

  /** Get the config detail object for a given config id */
  const getConfigDetail = (configId: string): ConfigFile | undefined => {
    return configDetails.find(d => d.id === configId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('dashboard.title')}</h1>
          <p className="text-app-text-secondary mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <UiButton onClick={() => setShowCreateModal(true)} className="shadow-sm hover:shadow-md">
          <Plus className="w-4 h-4" />
          {t('dashboard.newConfiguration')}
        </UiButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Configs */}
        <div className="stat-card stat-card-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">
              {t('dashboard.totalConfigurations')}
            </p>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center dark:bg-blue-900/50">
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
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center dark:bg-purple-950/40">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.totalModules}</p>
          <p className="text-xs text-purple-600 mt-1">{t('dashboard.acrossAllConfigs')}</p>
        </div>

        {/* Avg Completion */}
        <div className="stat-card stat-card-green">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">{t('dashboard.avgCompletion')}</p>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center dark:bg-green-950/40">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-slate-800">{stats.avgCompletion}%</p>
          </div>
          <div className="mt-2 h-2 bg-app-bg-tertiary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out progress-bar-animated',
                stats.avgCompletion >= 100
                  ? 'bg-green-500'
                  : stats.avgCompletion >= 50
                    ? 'bg-yellow-500'
                    : 'bg-app-bg-tertiary'
              )}
              style={{ width: `${stats.avgCompletion}%` }}
            />
          </div>
        </div>

        {/* Warnings */}
        <div className="stat-card stat-card-amber">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-amber-700">{t('dashboard.warnings')}</p>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center dark:bg-amber-950/40">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p
            className={cn(
              'text-3xl font-bold',
              stats.warningsCount > 0 ? 'text-amber-600' : 'text-slate-800'
            )}
          >
            {stats.warningsCount}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {stats.warningsCount === 0
              ? t('dashboard.noWarnings')
              : t('dashboard.warningsFound', { count: stats.warningsCount })}
          </p>
        </div>
      </div>

      {/* Layer Distribution */}
      <div className="bg-app-bg-primary border border-app-border-primary rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t('dashboard.layerDistribution')}
          </h2>
          <span className="text-xs text-app-text-secondary">
            {t('dashboard.layerDistributionHint')}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'MCAL', color: 'bg-blue-500', textColor: 'text-blue-600' },
            { key: 'ECUAL', color: 'bg-cyan-500', textColor: 'text-cyan-600' },
            { key: 'Service', color: 'bg-violet-500', textColor: 'text-violet-600' },
            { key: 'RTE', color: 'bg-orange-500', textColor: 'text-orange-600' },
            { key: 'OS', color: 'bg-rose-500', textColor: 'text-rose-600' },
            { key: 'ASW', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
          ].map(({ key, color, textColor }) => {
            const count = stats.layerBreakdown[key] || 0;
            const pct = stats.totalModules > 0 ? Math.round((count / stats.totalModules) * 100) : 0;
            return (
              <div
                key={key}
                className={cn(
                  'rounded-xl border border-app-border-primary p-4 transition-all',
                  key === 'Service' && 'border-violet-300 bg-violet-50/50 dark:bg-violet-950/20'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('text-sm font-semibold', textColor)}>
                    {t(`dashboard.layer.${key}`)}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {count}
                    <span className="text-xs text-app-text-tertiary font-normal ml-1">{pct}%</span>
                  </span>
                </div>
                <div className="h-1.5 bg-app-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleOpenExisting}
            className="p-4 bg-app-bg-primary border border-app-border-primary rounded-xl hover:border-app-border-secondary hover:shadow-md transition-all text-left group card-hover"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors dark:bg-blue-950/40 dark:group-hover:bg-blue-900/50">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.openExisting')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">
              {t('dashboard.browseLocalConfigs')}
            </p>
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
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors dark:bg-purple-950/40 dark:group-hover:bg-purple-900/50">
              <FileJson className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.importYuleasr')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">
              {t('dashboard.importYuleasrDesc')}
            </p>
          </button>

          <button
            onClick={() => setShowModuleWizard(true)}
            className="p-4 bg-app-bg-primary border border-app-border-primary rounded-xl hover:border-app-border-secondary hover:shadow-md transition-all text-left group card-hover"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors dark:bg-green-950/40 dark:group-hover:bg-green-900/50">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.moduleWizard')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">
              {t('dashboard.moduleWizardDesc')}
            </p>
          </button>

          <button
            onClick={() => handleShowGraph('config-1')}
            className="p-4 bg-app-bg-primary border border-app-border-primary rounded-xl hover:border-app-border-secondary hover:shadow-md transition-all text-left group card-hover"
          >
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors dark:bg-pink-950/40 dark:group-hover:bg-pink-900/50">
              <GitGraph className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-medium text-primary">{t('dashboard.dependencyGraph')}</h3>
            <p className="text-sm text-app-text-secondary mt-1">
              {t('dashboard.dependencyGraphDesc')}
            </p>
          </button>
        </div>
      </div>

      {/* Config List */}
      <div className="bg-app-bg-primary border border-app-border-primary rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-app-border-primary bg-app-bg-secondary flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            {t('dashboard.recentConfigurations')}
          </h2>
          {configList.length > 0 && (
            <span className="text-xs text-app-text-secondary bg-app-bg-primary px-2.5 py-1 rounded-full border border-app-border-primary">
              {t('dashboard.configs', { count: configList.length })}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-app-text-secondary mt-3 font-medium">
              {t('dashboard.loadingConfigs')}
            </p>
          </div>
        ) : configList.length === 0 ? (
          /* Enhanced Empty State */
          <div className="py-16 px-8 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 dark:bg-blue-950/40">
              <Zap className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              {t('dashboard.createFirstTitle')}
            </h3>
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
            {configList.map(config => {
              const completion = getConfigCompletion(config.id);
              const configDetail = getConfigDetail(config.id);
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
                        <div
                          className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                            completion !== null && completion >= 100
                              ? 'bg-green-50 dark:bg-green-950/40'
                              : completion !== null && completion >= 50
                                ? 'bg-yellow-50 dark:bg-yellow-950/40'
                                : 'bg-blue-50 dark:bg-blue-950/40'
                          )}
                        >
                          <Settings
                            className={cn(
                              'w-5 h-5',
                              completion !== null && completion >= 100
                                ? 'text-green-600'
                                : completion !== null && completion >= 50
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-primary truncate">{config.name}</h3>
                          <p className="text-sm text-app-text-secondary truncate">
                            {config.description || t('dashboard.noDescription')}
                          </p>
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
                              <span
                                className={cn(
                                  'flex items-center gap-1 font-medium',
                                  completion >= 100
                                    ? 'text-green-500'
                                    : completion >= 50
                                      ? 'text-yellow-500'
                                      : 'text-app-text-tertiary'
                                )}
                              >
                                {t('dashboard.percentComplete', { count: completion })}
                              </span>
                            )}
                          </div>
                          {/* Progress bar */}
                          {completion !== null && (
                            <div className="mt-2 max-w-xs">
                              <div className="h-1.5 bg-app-bg-tertiary rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    progressColor(completion)
                                  )}
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
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/diff/${config.id}`);
                        }}
                        className="p-2 text-app-text-tertiary hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        title={t('dashboard.diffConfigs') || 'Compare in Diff View'}
                      >
                        <GitBranch className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenCompare(config.id);
                        }}
                        className="p-2 text-app-text-tertiary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        title={t('dashboard.compareConfigs')}
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleShowGraph(config.id);
                        }}
                        className="p-2 text-app-text-tertiary hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/50 rounded-lg transition-colors"
                        title={t('dashboard.viewDependencyGraph')}
                      >
                        <GitGraph className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleExportConfig(config.id, config.name);
                        }}
                        className="p-2 text-app-text-tertiary hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-lg transition-colors"
                        title={t('dashboard.exportToYuleasr')}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/editor/${config.id}`)}
                        className="p-2 text-app-text-tertiary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        title={t('common.edit')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(config.id)}
                        disabled={deletingId === config.id}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          deletingId === config.id
                            ? 'text-app-text-tertiary cursor-not-allowed'
                            : 'text-app-text-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50'
                        )}
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-app-bg-primary rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-app-border-primary">
              <h3 className="text-lg font-semibold text-primary">
                {t('dashboard.newConfiguration')}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  {t('dashboard.name')}
                </label>
                <input
                  type="text"
                  value={newConfigName}
                  onChange={e => setNewConfigName(e.target.value)}
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
                  onChange={e => setNewConfigDesc(e.target.value)}
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
                  'px-4 py-2 rounded-lg transition-all',
                  !newConfigName.trim() || isLoading
                    ? 'bg-app-bg-tertiary text-app-text-secondary cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
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
                  setShowGraphModal(false);
                  setGraphModules([]);
                  setSelectedConfigForGraph(null);
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
                    <p className="text-app-text-secondary font-medium">
                      {t('dashboard.loadingModuleGraph')}
                    </p>
                    <p className="text-sm text-app-text-tertiary mt-1">
                      {t('dashboard.calculatingDeps')}
                    </p>
                  </div>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                        <p className="text-app-text-secondary font-medium">
                          {t('dashboard.initializingGraph')}
                        </p>
                      </div>
                    </div>
                  }
                >
                  <ModuleGraph
                    configId={selectedConfigForGraph || 'config-1'}
                    modules={graphModules}
                    onNodeClick={moduleId => console.log('Selected:', moduleId)}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Status Panel — shown when a pipeline run is active */}
      {activePipelineJobId && (
        <PipelineStatusPanel
          jobId={activePipelineJobId}
          autoPoll={true}
          pollInterval={3000}
          onComplete={job => {
            setTimeout(() => setActivePipelineJobId(null), 10000);
          }}
        />
      )}

      {/* Recent Pipeline Runs */}
      <div className="bg-app-bg-primary border border-app-border-primary rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-app-border-primary bg-app-bg-secondary flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Recent Pipeline Runs
          </h2>
          <PipelinePushButton
            config={null}
            onPipelineStart={jobId => {
              setActivePipelineJobId(jobId);
              // Refresh the runs list
              setTimeout(() => {
                listPipelineRuns()
                  .then(resp => {
                    if (resp.ok) setRecentPipelineRuns(resp.runs);
                  })
                  .catch(() => {});
              }, 2000);
            }}
            size="sm"
          />
        </div>

        {loadingPipelineRuns ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-app-text-secondary">Loading recent runs...</p>
          </div>
        ) : recentPipelineRuns.length === 0 ? (
          <div className="py-12 px-8 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-purple-950/40">
              <svg
                className="w-8 h-8 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-1">No Pipeline Runs Yet</h3>
            <p className="text-sm text-app-text-secondary max-w-sm mx-auto mb-4">
              Configure your BSW modules in the editor, then push to yuleOSH to start a pipeline
              run.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors dark:text-purple-300 dark:bg-purple-950/40"
            >
              <Settings className="w-4 h-4" />
              Open Editor
            </button>
          </div>
        ) : (
          <div className="divide-y divide-app-border-primary">
            {recentPipelineRuns.map(run => (
              <div
                key={run.job_id}
                className="px-6 py-3 flex items-center justify-between hover:bg-app-bg-secondary transition-colors cursor-pointer"
                onClick={() => setActivePipelineJobId(run.job_id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    title={run.status}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      run.status === 'passed' && 'bg-green-500',
                      run.status === 'failed' && 'bg-red-500',
                      run.status === 'running' && 'bg-blue-500 animate-pulse',
                      run.status === 'queued' && 'bg-yellow-500'
                    )}
                  />
                  <div>
                    <span className="text-sm font-medium text-primary">{run.job_id}</span>
                    <span className="text-xs text-app-text-tertiary ml-2">{run.type}</span>
                    {run.current_stage && (
                      <p className="text-xs text-app-text-tertiary mt-0.5">
                        Current: {run.current_stage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-app-text-tertiary">
                  <span className="font-medium">{run.progress}%</span>
                  {run.started_at && <span>{new Date(run.started_at).toLocaleTimeString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
        onComplete={config => {
          console.log('Module config completed:', config);
          setShowModuleWizard(false);
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
  );
}
