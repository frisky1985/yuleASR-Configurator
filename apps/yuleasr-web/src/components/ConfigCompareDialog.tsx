/**
 * Configuration Comparison Dialog
 * Two-column layout with color-coded diff indicators
 */

import { X, FileJson, GitCompare, ChevronDown, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { configComparer, type ComparisonResult, type ConfigDiff, type CompareStatus, type ParamDiff } from '@/services/compareEngine'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/stores/configStore'

interface ConfigCompareDialogProps {
  isOpen: boolean
  onClose: () => void
  configAId?: string
  configBId?: string
}

// Color mapping for diff status
const statusColors: Record<CompareStatus, { bg: string; text: string; border: string; label: string }> = {
  same: {
    bg: 'bg-secondary',
    text: 'text-app-text-secondary',
    border: 'border-primary',
    label: 'Same',
  },
  different: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
    label: 'Different',
  },
  only_a: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    label: 'Only in A',
  },
  only_b: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    label: 'Only in B',
  },
}

// Instance count diff color (blue)
const instanceDiffColor = 'bg-blue-50 text-blue-700 border-blue-300'

function getStatusStyle(status: CompareStatus, isInstanceDiff?: boolean): { bg: string; text: string; border: string } {
  if (isInstanceDiff && status === 'different') {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' }
  }
  const s = statusColors[status]
  return { bg: s.bg, text: s.text, border: s.border }
}

function getStatusIcon(status: CompareStatus) {
  switch (status) {
    case 'same': return null
    case 'different': return <span className="text-red-500 font-bold">≠</span>
    case 'only_a': return <span className="text-yellow-500 font-bold">A</span>
    case 'only_b': return <span className="text-yellow-500 font-bold">B</span>
  }
}

function formatValue(val: unknown): string {
  if (val === undefined || val === null) return '—'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (Array.isArray(val)) return `[${val.join(', ')}]`
  return String(val)
}

export function ConfigCompareDialog({ isOpen, onClose, configAId, configBId }: ConfigCompareDialogProps) {
  const { t } = useTranslation()
  const { configList, loadConfig, currentConfig } = useConfigStore()
  const [leftConfigId, setLeftConfigId] = useState<string>(configAId || '')
  const [rightConfigId, setRightConfigId] = useState<string>(configBId || '')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'diff_only'>('all')
  const [selectedNode, setSelectedNode] = useState<ConfigDiff | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [syncedParamIds, setSyncedParamIds] = useState<Set<string>>(new Set())
  const [navIndex, setNavIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      loadConfigList()
      // Sync with props when dialog opens
      if (configAId) setLeftConfigId(configAId)
      if (configBId) setRightConfigId(configBId)
    }
  }, [isOpen, configAId, configBId])

  const loadConfigList = async () => {
    const store = useConfigStore.getState()
    if (store.loadConfigList) {
      await store.loadConfigList()
    }
  }

  const handleCompare = async () => {
    if (!leftConfigId || !rightConfigId) {
      setError(t('compare.selectBoth'))
      return
    }
    if (leftConfigId === rightConfigId) {
      setError(t('compare.sameConfig'))
      return
    }

    setIsComparing(true)
    setError(null)
    setResult(null)
    setSelectedNode(null)

    try {
      await loadConfig(leftConfigId)
      const configA = useConfigStore.getState().currentConfig

      await loadConfig(rightConfigId)
      const configB = useConfigStore.getState().currentConfig

      if (!configA || !configB) {
        throw new Error('Could not load configurations')
      }

      const comparison = configComparer.compare(configA, configB)
      setResult(comparison)

      // Auto-expand all modules
      const paths = new Set<string>()
      for (const md of comparison.moduleDiffs) {
        paths.add(md.moduleName)
      }
      setExpandedPaths(paths)
    } catch (err) {
      setError((err as Error).message || 'Comparison failed')
    } finally {
      setIsComparing(false)
    }
  }

  // Reset when config IDs change
  useEffect(() => {
    if (configAId) setLeftConfigId(configAId)
    if (configBId) setRightConfigId(configBId)
    setResult(null)
    setError(null)
    setSelectedNode(null)
  }, [configAId, configBId])

  const diffTree = useMemo(() => {
    if (!result) return []
    return configComparer.buildDiffTree(result, filter)
  }, [result, filter])

  const handleNodeClick = (node: ConfigDiff) => {
    setSelectedNode(node)
  }

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  // Re-run comparison after syncing
  const reCompare = async () => {
    const store = useConfigStore.getState()
    if (!leftConfigId || !rightConfigId) return

    await store.loadConfig(leftConfigId)
    const configA = store.currentConfig

    await store.loadConfig(rightConfigId)
    const configB = store.currentConfig

    if (configA && configB) {
      const comparison = configComparer.compare(configA, configB)
      setResult(comparison)
      // Auto-expand all modules
      const paths = new Set<string>()
      for (const md of comparison.moduleDiffs) {
        paths.add(md.moduleName)
      }
      setExpandedPaths(paths)
    }
  }

  // Find parameter in config by parameterId and update its value
  function updateParamValueInConfig(config: any, paramId: string, value: unknown) {
    const newConfig = JSON.parse(JSON.stringify(config))
    for (const mod of newConfig.modules) {
      for (const p of mod.parameters || []) {
        if (p.id === paramId) {
          p.value = value
          return newConfig
        }
      }
      for (const container of mod.containers || []) {
        for (const p of container.parameters || []) {
          if (p.id === paramId) {
            p.value = value
            return newConfig
          }
        }
        for (const sub of container.subContainers || []) {
          for (const p of sub.parameters || []) {
            if (p.id === paramId) {
              p.value = value
              return newConfig
            }
          }
        }
      }
    }
    return newConfig
  }

  // Sync a single parameter from source to target config
  const syncParameter = async (param: ParamDiff, direction: 'a_to_b' | 'b_to_a') => {
    const targetConfigId = direction === 'a_to_b' ? rightConfigId : leftConfigId
    const value = direction === 'a_to_b' ? param.valueA : param.valueB

    if (!targetConfigId) return

    const configKey = `yuleasr_config_${targetConfigId}`
    const configStr = localStorage.getItem(configKey)
    if (!configStr) return

    const config = JSON.parse(configStr)
    const updatedConfig = updateParamValueInConfig(config, param.parameterId, value)
    localStorage.setItem(configKey, JSON.stringify(updatedConfig))

    // Re-compare
    await reCompare()

    // Mark as synced
    setSyncedParamIds(prev => new Set([...prev, param.parameterId]))
  }

  // Batch sync all different params in current view
  const batchSync = async (direction: 'a_to_b' | 'b_to_a') => {
    const diffParams = selectedParams.filter(p => p.status === 'different')
    const targetConfigId = direction === 'a_to_b' ? rightConfigId : leftConfigId

    if (!targetConfigId || diffParams.length === 0) return

    const configKey = `yuleasr_config_${targetConfigId}`
    const configStr = localStorage.getItem(configKey)
    if (!configStr) return

    let config = JSON.parse(configStr)
    const synced: string[] = []

    for (const param of diffParams) {
      const value = direction === 'a_to_b' ? param.valueA : param.valueB
      const updated = updateParamValueInConfig(config, param.parameterId, value)
      if (updated !== config) {
        config = updated
        synced.push(param.parameterId)
      }
    }

    localStorage.setItem(configKey, JSON.stringify(config))

    // Re-compare
    await reCompare()

    // Mark all as synced
    setSyncedParamIds(prev => new Set([...prev, ...synced]))
  }

  // Collect all diff navigation items from tree
  const collectNavItems = (nodes: ConfigDiff[]): ConfigDiff[] => {
    const items: ConfigDiff[] = []
    for (const node of nodes) {
      if (node.status !== 'same') {
        items.push(node)
      }
      if (node.children) {
        items.push(...collectNavItems(node.children))
      }
    }
    return items
  }

  // Computed nav items from diff tree
  const navItems = useMemo(() => collectNavItems(diffTree), [diffTree])

  // Navigate to a diff item
  const navigateTo = (direction: 'prev' | 'next') => {
    if (navItems.length === 0) return

    let newIndex: number
    if (direction === 'next') {
      newIndex = (navIndex + 1) % navItems.length
    } else {
      newIndex = (navIndex - 1 + navItems.length) % navItems.length
    }
    setNavIndex(newIndex)

    const target = navItems[newIndex]
    setSelectedNode(target)

    // Auto-expand parent paths
    setExpandedPaths(prev => {
      const next = new Set(prev)
      const parts = target.path.split('.')
      for (let i = 0; i < parts.length; i++) {
        next.add(parts.slice(0, i + 1).join('.'))
      }
      return next
    })

    // Scroll to the target node
    setTimeout(() => {
      const el = document.querySelector(`[data-diff-path="${target.path}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  }

  // Collect params for the selected node
  const selectedParams = useMemo(() => {
    if (!selectedNode || !result) return []
    
    if (selectedNode.type === 'module') {
      return result.paramDiffs.filter(p => p.moduleName === selectedNode.name)
    }
    if (selectedNode.type === 'container') {
      // Container name could be qualified or simple
      const parts = selectedNode.path.split('.')
      const containerName = parts[parts.length - 1]
      const moduleName = parts[0]
      return result.paramDiffs.filter(
        p => p.moduleName === moduleName && (
          p.containerPath === selectedNode.path || 
          p.containerPath.endsWith(`.${containerName}`)
        )
      )
    }
    // For parameter-level, show just this param
    if (selectedNode.type === 'parameter') {
      return result.paramDiffs.filter(p => {
        const paramPath = `${p.containerPath}.${p.parameterName}`
        return paramPath === selectedNode.path
      })
    }
    return []
  }, [selectedNode, result])

  const renderTreeNode = (node: ConfigDiff, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedPaths.has(node.path)
    const isSelected = selectedNode?.path === node.path
    const style = getStatusStyle(node.status)

    return (
      <div key={node.path}>
        <button
          data-diff-path={node.path}
          onClick={() => {
            if (hasChildren) toggleExpand(node.path)
            handleNodeClick(node)
          }}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-accent/50 transition-colors',
            'border-l-2',
            isSelected ? style.border : 'border-transparent',
            style.bg
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          {/* Status indicator dot */}
          <span className={cn(
            'w-2 h-2 rounded-full shrink-0',
            node.status === 'same' && 'bg-app-bg-tertiary',
            node.status === 'different' && 'bg-red-500',
            (node.status === 'only_a' || node.status === 'only_b') && 'bg-yellow-500',
          )} />

          <span className={cn(
            'text-sm truncate',
            style.text,
            node.status !== 'same' && 'font-medium'
          )}>
            {node.name}
          </span>

          {/* Badge */}
          {node.status !== 'same' && (
            <span className={cn(
              'ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
              style.bg === 'bg-red-50' ? 'bg-red-100 text-red-600' :
              style.bg === 'bg-blue-50' ? 'bg-blue-100 text-blue-600' :
              'bg-yellow-100 text-yellow-600'
            )}>
              {node.status === 'different' ? '≠' :
               node.status === 'only_a' ? 'A' :
               node.status === 'only_b' ? 'B' : ''}
            </span>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">{t('compare.title') || 'Compare Configurations'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config Selection */}
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm text-muted-foreground mb-1 font-medium">Configuration A</label>
              <select
                value={leftConfigId}
                onChange={(e) => setLeftConfigId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="">{t('compare.selectConfig') || 'Select...'}</option>
                {configList.map((config) => (
                  <option key={config.id} value={config.id}>{config.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center pb-2">
              <span className="text-muted-foreground text-sm font-medium px-2">vs</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-muted-foreground mb-1 font-medium">Configuration B</label>
              <select
                value={rightConfigId}
                onChange={(e) => setRightConfigId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="">{t('compare.selectConfig') || 'Select...'}</option>
                {configList.map((config) => (
                  <option key={config.id} value={config.id}>{config.name}</option>
                ))}
              </select>
            </div>
            <div className="pb-2">
              <button
                onClick={handleCompare}
                disabled={!leftConfigId || !rightConfigId || isComparing}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isComparing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Comparing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4" />
                    Compare
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        {result ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Summary Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="font-medium">{result.summary.modulesDifferent + result.summary.containersDifferent + result.summary.paramsDifferent}</span>
                  <span className="text-muted-foreground">different</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="font-medium">{result.summary.modulesOnlyA + result.summary.modulesOnlyB + result.summary.containersOnlyA + result.summary.containersOnlyB + result.summary.paramsOnlyA + result.summary.paramsOnlyB}</span>
                  <span className="text-muted-foreground">missing</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-medium">{result.summary.containersDifferent}</span>
                  <span className="text-muted-foreground">instance diffs</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {navItems.length > 0 && (
                  <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
                    <button
                      onClick={() => navigateTo('prev')}
                      className="px-2 py-1 text-xs rounded hover:bg-accent/50 transition-colors border border-border"
                      title="Previous diff"
                    >
                      ⬆ Prev
                    </button>
                    <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                      {navIndex + 1} / {navItems.length}
                    </span>
                    <button
                      onClick={() => navigateTo('next')}
                      className="px-2 py-1 text-xs rounded hover:bg-accent/50 transition-colors border border-border"
                      title="Next diff"
                    >
                      ⬇ Next
                    </button>
                  </div>
                )}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs"
                >
                  <option value="all">All items</option>
                  <option value="diff_only">Differences only</option>
                </select>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left column - Config A Tree */}
              <div className="flex-1 border-r border-border overflow-y-auto">
                <div className="px-3 py-2 bg-muted/20 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    {result.configA.name}
                  </h3>
                </div>
                <div className="py-1">
                  {diffTree.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No items to display
                    </div>
                  ) : (
                    diffTree.map(node => renderTreeNode(node))
                  )}
                </div>
              </div>

              {/* Right column - Config B Tree */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-2 bg-muted/20 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    {result.configB.name}
                  </h3>
                </div>
                <div className="py-1">
                  {diffTree.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No items to display
                    </div>
                  ) : (
                    diffTree.map(node => renderTreeNode(node))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Panel - Detailed Param Diff Table */}
            {selectedNode && (
              <div className="border-t border-border max-h-[200px] overflow-y-auto">
                {/* Batch sync toolbar */}
                {(() => {
                  const diffCount = selectedParams.filter(p => p.status === 'different').length
                  if (diffCount === 0) return null
                  return (
                    <div className="px-4 py-1.5 bg-muted/20 border-b border-border flex items-center gap-2">
                      <button
                        onClick={() => batchSync('a_to_b')}
                        className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        Accept A → B ({diffCount})
                      </button>
                      <button
                        onClick={() => batchSync('b_to_a')}
                        className="px-2 py-1 text-xs rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        Accept B → A ({diffCount})
                      </button>
                    </div>
                  )
                })()}
                <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Parameters for: {selectedNode.name}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {selectedParams.filter(p => p.status !== 'same').length} differences
                  </span>
                </div>
                {selectedParams.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Parameter</th>
                        <th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Type</th>
                        <th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Value (A)</th>
                        <th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Value (B)</th>
                        <th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Status</th>
                        <th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedParams.map((param, idx) => {
                        const pStyle = getStatusStyle(param.status)
                        return (
                          <tr
                            key={`${param.parameterId}-${idx}`}
                            className={cn(
                              'border-t border-border hover:bg-accent/30',
                              param.status !== 'same' && pStyle.bg
                            )}
                          >
                            <td className="px-3 py-1.5 font-mono">{param.parameterName}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{param.type || '—'}</td>
                            <td className={cn(
                              'px-3 py-1.5 font-mono',
                              param.status === 'different' && 'text-red-600',
                              param.status === 'only_a' && 'text-yellow-600 font-medium',
                              (param.status === 'only_b' || param.status === 'same') && 'text-foreground'
                            )}>
                              {param.status === 'only_b' ? '—' : formatValue(param.valueA)}
                            </td>
                            <td className={cn(
                              'px-3 py-1.5 font-mono',
                              param.status === 'different' && 'text-green-600',
                              param.status === 'only_b' && 'text-yellow-600 font-medium',
                              (param.status === 'only_a' || param.status === 'same') && 'text-foreground'
                            )}>
                              {param.status === 'only_a' ? '—' : formatValue(param.valueB)}
                            </td>
                            <td className="px-3 py-1.5">
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                pStyle.bg,
                                pStyle.text
                              )}>
                                {param.status === 'same' ? '=' :
                                 param.status === 'different' ? '≠' :
                                 param.status === 'only_a' ? 'A only' : 'B only'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5">
                              {syncedParamIds.has(param.parameterId) ? (
                                <span className="text-green-600 text-[10px] font-medium">✅ Synced</span>
                              ) : param.status === 'different' ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => syncParameter(param, 'b_to_a')}
                                    className="px-1.5 py-0.5 rounded text-xs border border-border hover:bg-accent/50 transition-colors"
                                    title="Copy B → A"
                                  >
                                    ←
                                  </button>
                                  <button
                                    onClick={() => syncParameter(param, 'a_to_b')}
                                    className="px-1.5 py-0.5 rounded text-xs border border-border hover:bg-accent/50 transition-colors"
                                    title="Copy A → B"
                                  >
                                    →
                                  </button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-xs">
                    No parameters for this item
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Select two configurations and click Compare</p>
              <p className="text-xs text-muted-foreground mt-1">Color-coded diff indicators will show the differences</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
