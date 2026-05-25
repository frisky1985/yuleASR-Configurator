/**
 * Configuration Comparison Dialog
 * UI for comparing two configurations
 */

import { X, FileJson, ChevronDown, ChevronUp, Download, Copy, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { configComparer, type ComparisonResult, type ConfigDiff } from '@/core/ConfigComparer'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/stores/configStore'

interface ConfigCompareDialogProps {
  isOpen: boolean
  onClose: () => void
  configAId?: string
  configBId?: string
}

export function ConfigCompareDialog({ isOpen, onClose, configAId, configBId }: ConfigCompareDialogProps) {
  const { t } = useTranslation()
  const { configList, loadConfig } = useConfigStore()
  const [leftConfigId, setLeftConfigId] = useState<string>(configAId || '')
  const [rightConfigId, setRightConfigId] = useState<string>(configBId || '')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'added' | 'removed' | 'modified'>('all')

  useEffect(() => {
    if (isOpen) {
      loadConfigList()
    }
  }, [isOpen])

  const loadConfigList = async () => {
    // This would load the config list
  }

  const handleCompare = async () => {
    if (!leftConfigId || !rightConfigId) return
    if (leftConfigId === rightConfigId) {
      alert(t('compare.sameConfig'))
      return
    }

    setIsComparing(true)
    try {
      await loadConfig(leftConfigId)
      const configA = useConfigStore.getState().currentConfig
      
      await loadConfig(rightConfigId)
      const configB = useConfigStore.getState().currentConfig
      
      if (configA && configB) {
        const comparison = configComparer.compareConfigs(configA, configB)
        setResult(comparison)
      }
    } finally {
      setIsComparing(false)
    }
  }

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(module)) {
      newExpanded.delete(module)
    } else {
      newExpanded.add(module)
    }
    setExpandedModules(newExpanded)
  }

  const exportToMarkdown = () => {
    if (!result) return
    const markdown = configComparer.exportToMarkdown(result)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compare-${result.configA.name}-vs-${result.configB.name}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredDiffs = result?.differences.filter(diff => {
    if (filter === 'all') return true
    return diff.type === filter
  }) || []

  const groupedDiffs = filteredDiffs.reduce((acc, diff) => {
    const module = diff.module || 'General'
    if (!acc[module]) acc[module] = []
    acc[module].push(diff)
    return acc
  }, {} as Record<string, ConfigDiff[]>)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{t('compare.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config Selection */}
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-muted-foreground mb-1">{t('compare.leftConfig')}</label>
              <select
                value={leftConfigId}
                onChange={(e) => setLeftConfigId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              >
                <option value="">{t('compare.selectConfig')}</option>
                {configList.map((config) => (
                  <option key={config.id} value={config.id}>{config.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center pt-6">
              <span className="text-muted-foreground">vs</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-muted-foreground mb-1">{t('compare.rightConfig')}</label>
              <select
                value={rightConfigId}
                onChange={(e) => setRightConfigId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              >
                <option value="">{t('compare.selectConfig')}</option>
                {configList.map((config) => (
                  <option key={config.id} value={config.id}>{config.name}</option>
                ))}
              </select>
            </div>
            <div className="pt-6">
              <button
                onClick={handleCompare}
                disabled={!leftConfigId || !rightConfigId || isComparing}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isComparing ? t('compare.comparing') : t('compare.compare')}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Summary Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{t('compare.added')}: {result.summary.added}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">{t('compare.removed')}: {result.summary.removed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{t('compare.modified')}: {result.summary.modified}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="all">{t('compare.allChanges')}</option>
                  <option value="added">{t('compare.addedOnly')}</option>
                  <option value="removed">{t('compare.removedOnly')}</option>
                  <option value="modified">{t('compare.modifiedOnly')}</option>
                </select>
                <button
                  onClick={exportToMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  {t('compare.export')}
                </button>
              </div>
            </div>

            {/* Differences List */}
            <div className="flex-1 overflow-y-auto p-4">
              {Object.entries(groupedDiffs).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t('compare.noChanges')}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedDiffs).map(([module, diffs]) => (
                    <div key={module} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModule(module)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <FileJson className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{module}</span>
                          <span className="text-sm text-muted-foreground">({diffs.length})</span>
                        </div>
                        {expandedModules.has(module) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {expandedModules.has(module) && (
                        <div className="divide-y divide-border">
                          {diffs.map((diff, index) => (
                            <div key={index} className="px-4 py-3 hover:bg-accent/50">
                              <div className="flex items-start gap-3">
                                <span className={cn(
                                  'px-2 py-0.5 rounded text-xs font-medium',
                                  diff.type === 'added' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                                  diff.type === 'removed' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                                  diff.type === 'modified' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                )}>
                                  {diff.type.toUpperCase()}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-mono text-muted-foreground truncate">
                                    {diff.path}
                                  </div>
                                  {diff.type === 'modified' ? (
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                      <span className="text-red-600 line-through">{String(diff.oldValue)}</span>
                                      <span className="text-muted-foreground">→</span>
                                      <span className="text-green-600">{String(diff.newValue)}</span>
                                    </div>
                                  ) : diff.type === 'added' ? (
                                    <div className="mt-1 text-sm text-green-600">+ {String(diff.newValue)}</div>
                                  ) : (
                                    <div className="mt-1 text-sm text-red-600">- {String(diff.oldValue)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!result && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileJson className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('compare.selectConfigsToCompare')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
