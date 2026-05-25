/**
 * Bulk Operations Panel
 * Enable/disable multiple modules at once
 */

import { 
  CheckSquare, 
  Square, 
  Power, 
  PowerOff, 
  Layers,
  ChevronDown,
  Filter,
  Search
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import type { ConfigModule } from '@/types/config'

interface BulkOperationsPanelProps {
  modules: ConfigModule[]
  onToggleModules: (moduleIds: string[], enabled: boolean) => void
  className?: string
}

export function BulkOperationsPanel({ modules, onToggleModules, className }: BulkOperationsPanelProps) {
  const { t } = useTranslation()
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [filterLayer, setFilterLayer] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const layers = useMemo(() => {
    const layerSet = new Set(modules.map(m => m.layer))
    return Array.from(layerSet).sort()
  }, [modules])

  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      if (filterLayer !== 'all' && module.layer !== filterLayer) return false
      if (filterStatus !== 'all') {
        const isEnabled = module.enabled
        if (filterStatus === 'enabled' && !isEnabled) return false
        if (filterStatus === 'disabled' && isEnabled) return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          module.name.toLowerCase().includes(query) ||
          (module.displayName && module.displayName.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [modules, filterLayer, filterStatus, searchQuery])

  const allSelected = filteredModules.length > 0 && filteredModules.every(m => selectedModules.has(m.id))
  const someSelected = filteredModules.some(m => selectedModules.has(m.id)) && !allSelected

  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered
      const newSelected = new Set(selectedModules)
      filteredModules.forEach(m => newSelected.delete(m.id))
      setSelectedModules(newSelected)
    } else {
      // Select all filtered
      const newSelected = new Set(selectedModules)
      filteredModules.forEach(m => newSelected.add(m.id))
      setSelectedModules(newSelected)
    }
  }

  const toggleModuleSelection = (moduleId: string) => {
    const newSelected = new Set(selectedModules)
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId)
    } else {
      newSelected.add(moduleId)
    }
    setSelectedModules(newSelected)
  }

  const handleBulkEnable = () => {
    onToggleModules(Array.from(selectedModules), true)
    setSelectedModules(new Set())
  }

  const handleBulkDisable = () => {
    onToggleModules(Array.from(selectedModules), false)
    setSelectedModules(new Set())
  }

  const getLayerColor = (layer: string) => {
    const colors: Record<string, string> = {
      MCAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      ECUAL: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Service: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      RTE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      OS: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      ASW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    }
    return colors[layer] || 'bg-app-bg-tertiary text-gray-800 dark:bg-app-bg-tertiary dark:text-app-text-tertiary'
  }

  return (
    <div className={cn('bg-card border border-border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{t('bulkOperations.title')}</span>
          {selectedModules.size > 0 && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {selectedModules.size}
            </span>
          )}
        </div>
        <ChevronDown className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')} />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Filters */}
          <div className="p-4 border-b border-border space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('bulkOperations.searchModules')}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
              />
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterLayer}
                onChange={(e) => setFilterLayer(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">{t('bulkOperations.allLayers')}</option>
                {layers.map(layer => (
                  <option key={layer} value={layer}>{layer}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">{t('bulkOperations.allStatus')}</option>
                <option value="enabled">{t('bulkOperations.enabled')}</option>
                <option value="disabled">{t('bulkOperations.disabled')}</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedModules.size > 0 && (
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('bulkOperations.selected', { count: selectedModules.size })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkEnable}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  <Power className="w-4 h-4" />
                  {t('bulkOperations.enable')}
                </button>
                <button
                  onClick={handleBulkDisable}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  <PowerOff className="w-4 h-4" />
                  {t('bulkOperations.disable')}
                </button>
              </div>
            </div>
          )}

          {/* Module List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Select All Header */}
            {filteredModules.length > 0 && (
              <div className="sticky top-0 px-4 py-2 bg-muted/50 border-b border-border flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm hover:text-primary"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : someSelected ? (
                    <div className="w-4 h-4 border-2 border-app-border-primary bg-primary/50 rounded" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>{t('bulkOperations.selectAll')}</span>
                </button>
                <span className="text-xs text-muted-foreground">
                  ({filteredModules.length} {t('bulkOperations.modules')})
                </span>
              </div>
            )}

            {/* Modules */}
            <div className="divide-y divide-border">
              {filteredModules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => toggleModuleSelection(module.id)}
                  className={cn(
                    'px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors',
                    selectedModules.has(module.id) && 'bg-primary/5'
                  )}
                >
                  {selectedModules.has(module.id) ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {module.displayName || module.name}
                      </span>
                      <span className={cn('px-1.5 py-0.5 rounded text-xs', getLayerColor(module.layer))}>
                        {module.layer}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {module.enabled ? t('bulkOperations.enabled') : t('bulkOperations.disabled')}
                      {' · '}
                      {module.containers.length} {t('bulkOperations.containers')}
                    </div>
                  </div>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    module.enabled ? 'bg-green-500' : 'bg-app-bg-tertiary dark:bg-gray-600'
                  )} />
                </div>
              ))}
            </div>

            {filteredModules.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                {t('bulkOperations.noModulesFound')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
