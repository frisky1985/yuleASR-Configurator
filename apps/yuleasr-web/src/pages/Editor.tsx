import JSZip from 'jszip';
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
  Share2,
  Eye,
  FileJson,
} from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { CodeDiffPreview } from '@/components/CodeDiffPreview';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import type { ConfigTreeHandle } from '@/components/ConfigTree';
import { ConfigTree } from '@/components/ConfigTree';
import {
  ConfigurationStatusPanel,
  exportConfigReport,
} from '@/components/ConfigurationStatusPanel';
import { GlobalSearch } from '@/components/GlobalSearch';
import { ModuleConfigWizard } from '@/components/ModuleConfigWizard';
import { OSEditor } from '@/components/OSEditor';
import { ParameterEditor } from '@/components/ParameterEditor';
import { useTheme } from '@/components/ThemeProvider';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { ShareDialog } from '@/components/ShareDialog';
import { ValidationPanel } from '@/components/ValidationPanel';
import { ContainerConfigSection } from '@/components/ContainerConfigSection';
import { ContainerParameterList } from '@/components/ContainerParameterList';
import { cn, formatDate } from '@/lib/utils';
import { generateArxml } from '@/services/arxml-exporter';
import { parseArxmlContent, arxmlToConfigModules } from '@/services/arxml-parser';
import { generateAllHeaders } from '@/services/codegen';
import type { GeneratedFile } from '@/services/codegen';
import { downloadAuditReport } from '@/services/configReportGenerator';
import { useConfigStore } from '@/stores/configStore';
import type { ValidationResult } from '@/types';
import type { ConfigContainer } from '@/types/config';

export function Editor() {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDisabled, setShowDisabled] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const configTreeRef = useRef<ConfigTreeHandle>(null);
  const { toggleTheme } = useTheme();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDiffPreview, setShowDiffPreview] = useState(false);
  const [savedGeneratedCode, setSavedGeneratedCode] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const importMenuRef = useRef<HTMLDivElement>(null);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const overflowMenuRef = useRef<HTMLDivElement>(null);

  // ── Code gen state (declared early — used by Electron useEffect below) ──
  const [importing, setImporting] = useState(false);
  const [importArxml, setImportArxml] = useState(false);
  const [codeGenResult, setCodeGenResult] = useState<GeneratedFile | null>(null);
  const [codeGenFiles, setCodeGenFiles] = useState<GeneratedFile[]>([]);
  const [gccResults, setGccResults] = useState<Array<{
    filename: string;
    status: string;
    errors?: string[];
  }> | null>(null);
  const [gccAvailable, setGccAvailable] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const verifyFnRef = useRef<() => Promise<void>>(async () => {});

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
  } = useConfigStore();

  useEffect(() => {
    if (configId) {
      loadConfig(configId);
    }
  }, [configId, loadConfig]);

  // Close dropdown menus on click outside
  useEffect(() => {
    if (!showExportMenu && !showSaveMenu && !showOverflowMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (importMenuRef.current && !importMenuRef.current.contains(e.target as Node)) {
        setShowImportMenu(false);
      }
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setShowSaveMenu(false);
      }
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExportMenu, showSaveMenu, showOverflowMenu]);

  // Electron menu event listeners
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onExportCode(() => {
      if (currentConfig) {
        const blob = new Blob([JSON.stringify(currentConfig, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentConfig.name.replace(/\s+/g, '_')}.yuleasr.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
    window.electronAPI.onRunVerify(async () => {
      if (codeGenFiles.length > 0) {
        await verifyFnRef.current();
      }
    });
  }, [currentConfig, codeGenFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) {
          handleSave();
        }
      }
      // Ctrl/Cmd + Shift + V to validate
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        handleValidate();
      }
      // Ctrl/Cmd + E to export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
      // Ctrl/Cmd + D to toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
      // ? to show keyboard shortcuts (not focused on input)
      if (
        e.key === '?' &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        )
      ) {
        e.preventDefault();
        setShowShortcutsHelp(true);
      }
      // Escape to close shortcuts help
      if (e.key === 'Escape') {
        setShowShortcutsHelp(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty]);

  // Handle validation
  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    const result = validateConfig();
    setIsValidating(false);
    return result;
  }, [validateConfig]);

  const handleSave = async () => {
    await saveConfig();
  };

  const handleExport = () => {
    if (!currentConfig) return;
    const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConfig.name.replace(/\s+/g, '_')}.yuleasr.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync verify ref with current codeGenFiles so Electron menu can trigger it
  useEffect(() => {
    verifyFnRef.current = async () => {
      if (!window.electronAPI) return;
      setVerifying(true);
      setGccResults(null);
      const results = await window.electronAPI.gccVerify(codeGenFiles);
      setGccResults(results);
      setVerifying(false);
    };
  }, [codeGenFiles]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const arxmlInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const config = JSON.parse(reader.result as string);
        setSelectedPath('');
        useConfigStore.setState({ currentConfig: config, isDirty: false });
        localStorage.setItem('yuleasr_config', JSON.stringify(config));
      } catch (err) {
        alert('导入失败：无效的配置文件');
      }
      setImporting(false);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = '';
  };

  const handleImportArxml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportArxml(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = parseArxmlContent(reader.result as string);
        if (result.errors.length > 0) {
          alert(`ARXML 解析失败:\n${result.errors.join('\n')}`);
        } else if (result.modules.length === 0) {
          alert('未找到 ECUC 模块配置');
        } else {
          const modules = arxmlToConfigModules(result.modules);
          // Merge with current config or create new
          if (currentConfig) {
            const updatedModules = [...currentConfig.modules];
            for (const m of modules) {
              const idx = updatedModules.findIndex(ex => ex.id === m.id);
              if (idx >= 0) {
                updatedModules[idx] = m;
              } else {
                updatedModules.push(m);
              }
            }
            const updated = {
              ...currentConfig,
              modules: updatedModules,
              updatedAt: new Date().toISOString(),
            };
            useConfigStore.setState({ currentConfig: updated, isDirty: true });
            localStorage.setItem('yuleasr_config', JSON.stringify(updated));
          }
          alert(`ARXML 导入成功: ${result.modules.length} 个模块`);
        }
      } catch (err) {
        alert(`导入失败: ${err instanceof Error ? err.message : String(err)}`);
      }
      setImportArxml(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleParameterChange = (paramName: string, value: unknown) => {
    if (selectedPath) {
      updateParameter(selectedPath, value);
    }
  };

  // Get selected module from path
  const selectedModule = selectedPath
    ? currentConfig?.modules.find(m => selectedPath.includes(m.id))
    : null;

  // Extract selected container id from path (e.g. "layer:MCAL/module:adc/container:AdcConfigSet")
  const selectedContainerId = selectedPath?.match(/container:([^/]+)/)?.[1] ?? null;

  // Find the selected container in the module's container tree (deep search)
  const findContainer = (containers: ConfigContainer[], id: string): ConfigContainer | null => {
    for (const c of containers) {
      if (c.id === id) return c;
      if (c.subContainers?.length) {
        const found = findContainer(c.subContainers, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedContainer =
    selectedContainerId && selectedModule?.containers
      ? findContainer(selectedModule.containers, selectedContainerId)
      : null;

  // Extract instance name from path (e.g. "layer:MCAL/module:adc/container:adcconfigset/instance:AdcHwUnit_0")
  const selectedInstanceName = selectedPath?.match(/instance:([^/]+)/)?.[1] ?? null;

  // When an instance is selected, create a virtual container from the template
  const instanceContainer =
    selectedInstanceName && selectedContainer?.multiple && selectedContainer.subContainers?.length
      ? ({
          ...selectedContainer.subContainers[0],
          id: `${selectedContainer.id}_${selectedInstanceName}`,
          name: selectedInstanceName,
          displayName: selectedInstanceName,
          description: `Instance of ${selectedContainer.displayName || selectedContainer.name}`,
        } as ConfigContainer)
      : null;

  // Check if OS is selected
  const isOSSelected = selectedPath?.includes('layer:OS') || selectedPath?.includes('/os');

  if (isLoading && !currentConfig) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-app-border-primary-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-app-text-secondary mt-2">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!currentConfig) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-app-text-tertiary mx-auto mb-3" />
          <h3 className="text-app-text-primary font-medium">Configuration not found</h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg-tertiary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-app-text-primary">{currentConfig.name}</h1>
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
            <p className="text-sm text-app-text-secondary">
              {currentConfig.targetChip} | {currentConfig.modules.filter(m => m.enabled).length}{' '}
              modules | Last modified: {formatDate(currentConfig.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-app-bg-tertiary rounded text-xs">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors disabled:opacity-50"
          >
            {isValidating ? (
              <div className="animate-spin w-4 h-4 border-2 border-app-border-secondary border-t-transparent rounded-full" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Validate
          </button>
          {/* Save Split Button — left: save, right: dropdown arrow (always clickable) */}
          <div className="relative flex" ref={saveMenuRef}>
            <button
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-l-lg transition-colors border-r border-primary-700',
                !isDirty || isLoading
                  ? 'bg-app-bg-tertiary text-app-text-tertiary cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className={cn(
                'inline-flex items-center px-2 py-2 text-sm font-medium rounded-r-lg transition-colors',
                !isDirty || isLoading
                  ? 'bg-app-bg-tertiary text-app-text-tertiary'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              )}
              title="More save options"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showSaveMenu && (
              <div className="absolute right-0 top-full mt-1 bg-app-bg-primary border border-app-border-primary rounded-lg shadow-lg z-50 min-w-[190px] py-1">
                <button
                  onClick={() => {
                    setShowSaveMenu(false);
                    const name = prompt('模板名称:', currentConfig?.name || '');
                    if (name) {
                      const desc = prompt('模板描述:', '');
                      useConfigStore.getState().saveTemplate(name, desc || '');
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  Save as Template
                </button>
              </div>
            )}
          </div>
          {/* Export Dropdown — JSON + Audit Report + ARXML */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
              Export
              <svg
                className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-app-bg-primary border border-app-border-primary rounded-lg shadow-lg z-50 min-w-[190px] py-1">
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    handleExport();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4 text-blue-500" />
                  Export JSON
                </button>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    if (currentConfig) {
                      downloadAuditReport(currentConfig);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export Audit Report
                </button>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    if (!currentConfig) return;
                    const arxml = generateArxml(currentConfig);
                    const blob = new Blob([arxml], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${currentConfig.name.replace(/\s+/g, '_')}.arxml`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export ARXML
                </button>
              </div>
            )}
          </div>
          {/* Import Dropdown — JSON + ARXML */}
          <div className="relative" ref={importMenuRef}>
            <button
              onClick={() => setShowImportMenu(!showImportMenu)}
              disabled={importing || importArxml}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors disabled:opacity-50"
              title="Import configuration"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : importArxml ? 'Parsing...' : 'Import'}
              <svg
                className={`w-3 h-3 transition-transform ${showImportMenu ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showImportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-app-bg-primary border border-app-border-primary rounded-lg shadow-lg z-50 min-w-[190px] py-1">
                <button
                  onClick={() => {
                    setShowImportMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4 text-blue-500" />
                  Import JSON
                </button>
                <button
                  onClick={() => {
                    setShowImportMenu(false);
                    arxmlInputRef.current?.click();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Import ARXML
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yuleasr.json"
            onChange={handleImport}
            className="hidden"
          />
          <input
            ref={arxmlInputRef}
            type="file"
            accept=".arxml"
            onChange={handleImportArxml}
            className="hidden"
          />
          <button
            onClick={async () => {
              if (!currentConfig) return;
              const files = await generateAllHeaders(currentConfig.modules);
              if (files.length === 0) {
                alert(
                  'No enabled modules with code generation support.\nEnable a module (e.g. Adc, Mcu, Can) first.'
                );
                return;
              }
              setCodeGenFiles(files);
              setCodeGenResult(files[0]);
              setGccResults(null);
              // Check gcc availability in Electron
              if (window.electronAPI) {
                const result = await window.electronAPI.gccCheck();
                setGccAvailable(result.available);
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
            title="Generate _Cfg.h source files from configuration"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Generate
          </button>
          {/* Overflow menu — secondary actions & future extensions */}
          <div className="relative" ref={overflowMenuRef}>
            <button
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              className="p-2 text-app-text-secondary hover:text-app-text-primary hover:bg-app-bg-tertiary rounded-lg transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showOverflowMenu && (
              <div className="absolute right-0 top-full mt-1 bg-app-bg-primary border border-app-border-primary rounded-lg shadow-lg z-50 min-w-[190px] py-1">
                <button
                  onClick={() => {
                    setShowOverflowMenu(false);
                    setShowShareDialog(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-sky-500" />
                  Share Configuration
                </button>
                <button
                  onClick={() => {
                    setShowOverflowMenu(false);
                    setShowDiffPreview(true);
                  }}
                  disabled={codeGenFiles.length === 0}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-app-bg-secondary transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  View Diff
                </button>
              </div>
            )}
          </div>
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

        {/* Center - Validation + Selected Container Parameters */}
        <div className="col-span-6 h-full overflow-y-auto space-y-4">
          {/* Validation Summary */}
          <div className="bg-app-bg-primary border border-app-border-primary rounded-lg p-4">
            <h3 className="text-sm font-semibold text-app-text-primary mb-3">Validation</h3>
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
              <p className="text-sm text-app-text-secondary">
                Click Validate to check configuration
              </p>
            )}
          </div>

          {/* Validation Issues List */}
          {validationIssues.length > 0 && (
            <div className="bg-app-bg-primary border border-app-border-primary rounded-lg p-4">
              <h3 className="text-sm font-semibold text-app-text-primary mb-3">Issues</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {validationIssues.slice(0, 10).map(issue => (
                  <div
                    key={issue.id}
                    className={cn(
                      'text-xs p-2 rounded cursor-pointer hover:bg-app-bg-secondary',
                      issue.severity === 'error' && 'bg-red-50 text-red-700 border border-red-100',
                      issue.severity === 'warning' &&
                        'bg-yellow-50 text-yellow-700 border border-yellow-100',
                      issue.severity === 'info' && 'bg-blue-50 text-blue-700 border border-blue-100'
                    )}
                    onClick={() => {
                      if (issue.module) {
                        const module = currentConfig?.modules.find(m => m.name === issue.module);
                        if (module) setSelectedPath(`layer:${module.layer}/module:${module.id}`);
                      }
                    }}
                  >
                    <div className="font-medium">{issue.path}</div>
                    <div className="mt-1">{issue.message}</div>
                    {issue.suggestion && (
                      <div className="mt-1 text-app-text-secondary italic">{issue.suggestion}</div>
                    )}
                  </div>
                ))}
                {validationIssues.length > 10 && (
                  <div className="text-xs text-app-text-secondary text-center">
                    +{validationIssues.length - 10} more issues
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Container Parameters - show when a container is clicked */}
          {selectedContainer && (
            <div className="bg-app-bg-primary border border-app-border-primary rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-app-bg-secondary border-b border-app-border-primary flex items-center justify-between">
                <h3 className="text-sm font-semibold text-app-text-primary">
                  {(instanceContainer || selectedContainer).displayName ||
                    (instanceContainer || selectedContainer).name}
                </h3>
                <span className="text-xs text-app-text-secondary">
                  {instanceContainer
                    ? `${instanceContainer.parameters.length} params · ${instanceContainer.description || ''}`
                    : `${selectedContainer.parameters.length + (selectedContainer.subContainers?.reduce((s, sc) => s + sc.parameters.length, 0) ?? 0)} params`}
                </span>
              </div>
              <div className="p-3">
                {selectedContainer.multiple && !selectedInstanceName ? (
                  /* Dynamic container with no instance selected - empty state */
                  <div className="text-center py-8">
                    <button
                      onClick={() => {
                        const containerPath = `layer:${selectedModule?.layer}/module:${selectedModule?.id}/container:${selectedContainer.id}`;
                        const instanceName = configTreeRef.current?.addInstance(containerPath);
                        if (instanceName) {
                          setSelectedPath(`${containerPath}/instance:${instanceName}`);
                        }
                      }}
                      className="w-12 h-12 rounded-full bg-app-bg-tertiary flex items-center justify-center mx-auto mb-3 hover:bg-primary-50 transition-colors cursor-pointer group"
                      title="添加实例"
                    >
                      <svg
                        className="w-6 h-6 text-app-text-tertiary group-hover:text-primary-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                    <p className="text-sm font-medium text-app-text-primary mb-1">
                      {selectedContainer.displayName || selectedContainer.name}
                    </p>
                    <p className="text-sm text-app-text-secondary">
                      点击上方 [+] 添加
                      {selectedContainer.subContainers?.[0]?.displayName ||
                        selectedContainer.subContainers?.[0]?.name ||
                        '实例'}{' '}
                      实例
                    </p>
                    <p className="text-xs text-app-text-tertiary mt-2">
                      创建实例后，在树中选择实例查看和编辑参数
                    </p>
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
        <div className="col-span-3 h-full overflow-y-auto">
          <ConfigurationStatusPanel
            config={currentConfig}
            onExportReport={() => exportConfigReport(currentConfig)}
            validationResult={validationResult}
          />
        </div>
      </div>

      {/* Global Search */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={path => setSelectedPath(path)}
      />

      {/* Code Generation Preview Modal */}
      {codeGenResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => {
            setCodeGenResult(null);
            setCodeGenFiles([]);
          }}
        >
          <div
            className="bg-app-bg-primary rounded-lg shadow-xl border border-app-border-primary w-[800px] max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-app-border-primary">
              <h3 className="text-sm font-semibold text-app-text-primary">
                Code Generation Preview
              </h3>
              <div className="flex items-center gap-2">
                {/* Desktop: Save to Folder */}
                {window.electronAPI && (
                  <button
                    onClick={async () => {
                      const result = await window.electronAPI.saveFiles(codeGenFiles);
                      if (result.success) {
                        alert(`✅ ${result.count} files saved to:\n${result.path}`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded hover:bg-app-bg-secondary"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save to Folder
                  </button>
                )}
                {/* Desktop: Verify with GCC */}
                {window.electronAPI && gccAvailable && (
                  <button
                    onClick={async () => {
                      setVerifying(true);
                      setGccResults(null);
                      const results = await window.electronAPI!.gccVerify(codeGenFiles);
                      setGccResults(results);
                      setVerifying(false);
                    }}
                    disabled={verifying}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded hover:bg-app-bg-secondary disabled:opacity-50"
                  >
                    {verifying ? (
                      <div className="animate-spin w-3 h-3 border-2 border-app-border-secondary border-t-transparent rounded-full" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {verifying ? 'Verifying...' : 'Verify with GCC'}
                  </button>
                )}
                {codeGenFiles.length > 1 && (
                  <button
                    onClick={async () => {
                      const zip = new JSZip();
                      for (const f of codeGenFiles) {
                        zip.file(f.filename, f.content);
                      }
                      const blob = await zip.generateAsync({ type: 'blob' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `yuleasr-generated-code.zip`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded hover:bg-app-bg-secondary"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download All ({codeGenFiles.length} files)
                  </button>
                )}
                <button
                  onClick={() => {
                    const blob = new Blob([codeGenResult.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = codeGenResult.filename;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded hover:bg-app-bg-secondary"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download {codeGenResult.filename}
                </button>
                <button
                  onClick={() => {
                    setCodeGenResult(null);
                    setCodeGenFiles([]);
                  }}
                  className="p-1.5 text-app-text-tertiary hover:text-app-text-secondary"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
            <div className="px-5 py-2 bg-app-bg-secondary border-b border-app-border-primary flex items-center gap-2">
              <span className="text-xs font-medium text-app-text-secondary">Filename:</span>
              <span className="text-xs font-mono text-app-text-primary">
                {codeGenResult.filename}
              </span>
              {codeGenFiles.length > 1 && (
                <div className="ml-auto flex gap-1">
                  {codeGenFiles.map((f, i) => (
                    <button
                      key={f.filename}
                      onClick={() => setCodeGenResult(f)}
                      className={`px-2 py-0.5 text-xs rounded ${
                        codeGenResult.filename === f.filename
                          ? 'bg-primary-600 text-white'
                          : 'bg-app-bg-tertiary text-app-text-secondary hover:bg-app-bg-primary'
                      }`}
                    >
                      {f.filename}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* GCC Verification Results */}
            {gccResults && (
              <div className="px-5 py-2 bg-app-bg-secondary border-b border-app-border-primary">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-app-text-secondary">
                    GCC Syntax Check:
                  </span>
                  {gccResults.every(r => r.status === 'pass') ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" /> All {gccResults.length} files passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />{' '}
                      {gccResults.filter(r => r.status === 'fail').length} failed
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {gccResults.map(r => (
                    <span
                      key={r.filename}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${
                        r.status === 'pass'
                          ? 'bg-green-100 text-green-800'
                          : r.status === 'fail'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️'} {r.filename}
                    </span>
                  ))}
                </div>
                {gccResults
                  .filter(r => r.status === 'fail' && r.errors)
                  .map(r => (
                    <div key={r.filename + '-errors'} className="mt-2">
                      <pre className="text-xs font-mono text-red-700 bg-red-50 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                        {r.errors.join('\n')}
                      </pre>
                    </div>
                  ))}
              </div>
            )}
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs font-mono leading-relaxed text-gray-800 bg-app-bg-secondary rounded-lg p-4 overflow-x-auto whitespace-pre">
                {codeGenResult.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Share Dialog */}
      {currentConfig && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          config={currentConfig}
        />
      )}

      {/* Code Diff Preview */}
      {currentConfig && (
        <CodeDiffPreview
          isOpen={showDiffPreview}
          onClose={() => setShowDiffPreview(false)}
          generatedCode={codeGenFiles.map(f => `// === ${f.path} ===\n${f.content}`).join('\n\n')}
          savedCode={savedGeneratedCode}
          moduleName={currentConfig.name}
        />
      )}

      {currentConfig && codeGenFiles.length > 0 && (
        <button
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all active:scale-95"
          onClick={() => {
            setSavedGeneratedCode(
              codeGenFiles.map(f => `// === ${f.path} ===\n${f.content}`).join('\n\n')
            );
            setShowDiffPreview(true);
          }}
          title="Compare saved vs new code"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Diff</span>
        </button>
      )}
    </div>
  );
}
