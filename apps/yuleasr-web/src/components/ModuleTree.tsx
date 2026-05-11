import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleConfig } from '@/types'
import { Cpu, Settings, Layers, Box, Search, ChevronDown, ChevronRight, Power, Filter } from 'lucide-react'

interface ModuleTreeProps {
  modules: ModuleConfig[]
  selectedModuleId: string | null
  onSelectModule: (moduleId: string) => void
  onToggleModule?: (moduleId: string, enabled: boolean) => void
  filterText?: string
  onFilterChange?: (text: string) => void
  showDisabled?: boolean
  onShowDisabledChange?: (show: boolean) => void
}

const layerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MCAL: Cpu,
  ECUAL: Settings,
  Service: Layers,
  RTE: Box,
  ASW: Box,
}

const layerColors: Record<string, string> = {
  MCAL: 'bg-blue-50 text-blue-700 border-blue-200',
  ECUAL: 'bg-green-50 text-green-700 border-green-200',
  Service: 'bg-purple-50 text-purple-700 border-purple-200',
  RTE: 'bg-orange-50 text-orange-700 border-orange-200',
  ASW: 'bg-pink-50 text-pink-700 border-pink-200',
}

const layerOrder = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW']

export function ModuleTree({
  modules,
  selectedModuleId,
  onSelectModule,
  onToggleModule,
  filterText = '',
  onFilterChange,
  showDisabled = true,
  onShowDisabledChange,
}: ModuleTreeProps) {
  const [searchQuery, setSearchQuery] = useState(filterText)
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(layerOrder))
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Filter modules based on search query and enabled status
  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch =
        !searchQuery ||
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.layer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEnabled = showDisabled || module.enabled
      return matchesSearch && matchesEnabled
    })
  }, [modules, searchQuery, showDisabled])

  // Group filtered modules by layer
  const groupedModules = useMemo(() => {
    return filteredModules.reduce((acc, module) => {
      if (!acc[module.layer]) {
        acc[module.layer] = []
      }
      acc[module.layer].push(module)
      return acc
    }, {} as Record<string, ModuleConfig[]>)
  }, [filteredModules])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFilterChange?.(value)
  }

  // Toggle layer expansion
  const toggleLayer = (layer: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layer)) {
        next.delete(layer)
      } else {
        next.add(layer)
      }
      return next
    })
  }

  // Toggle module enabled/disabled
  const handleToggleModule = (module: ModuleConfig, e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleModule?.(module.id, !module.enabled)
  }

  // Count enabled modules per layer
  const getLayerStats = (layer: string) => {
    const layerModules = modules.filter((m) => m.layer === layer)
    const enabled = layerModules.filter((m) => m.enabled).length
    return { total: layerModules.length, enabled }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Header with search */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Modules</h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">
              {modules.filter((m) => m.enabled).length}/{modules.length} enabled
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="text-xs">×</span>
            </button>
          )}
        </div>

        {/* Filter toolbar */}
        <div className="flex items-center justify-between mt-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={cn(
                'inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
                showFilterMenu
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Filter className="w-3 h-3" />
              Filter
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1">
                <label className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDisabled}
                    onChange={(e) => onShowDisabledChange?.(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Show disabled</span>
                </label>
              </div>
            )}
          </div>

          {/* Expand/Collapse all */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpandedLayers(new Set(layerOrder))}
              className="text-xs text-gray-600 hover:text-primary-600 px-2 py-1"
            >
              Expand all
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setExpandedLayers(new Set())}
              className="text-xs text-gray-600 hover:text-primary-600 px-2 py-1"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Module tree */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-20rem)]">
        <div className="divide-y divide-gray-100">
          {layerOrder.map((layer) => {
            const layerModules = groupedModules[layer]
            if (!layerModules || layerModules.length === 0) return null

            const Icon = layerIcons[layer] || Settings
            const colorClass = layerColors[layer] || 'bg-gray-50 text-gray-700'
            const isExpanded = expandedLayers.has(layer)
            const stats = getLayerStats(layer)

            return (
              <div key={layer} className="py-1">
                {/* Layer header */}
                <button
                  onClick={() => toggleLayer(layer)}
                  className={cn(
                    'w-full px-3 py-2 mx-2 rounded-md flex items-center gap-2 transition-colors',
                    colorClass
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium uppercase tracking-wider flex-1 text-left">
                    {layer}
                  </span>
                  <span className="text-xs opacity-70">
                    {stats.enabled}/{stats.total}
                  </span>
                </button>

                {/* Module list */}
                {isExpanded && (
                  <div className="mt-1 space-y-0.5 px-2">
                    {layerModules.map((module) => (
                      <div
                        key={module.id}
                        className={cn(
                          'group flex items-center gap-2 rounded-md transition-colors',
                          selectedModuleId === module.id
                            ? 'bg-primary-50'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        {/* Module button */}
                        <button
                          onClick={() => onSelectModule(module.id)}
                          className={cn(
                            'flex-1 text-left px-3 py-2 text-sm transition-colors',
                            selectedModuleId === module.id
                              ? 'text-primary-700 font-medium'
                              : 'text-gray-700',
                            !module.enabled && 'opacity-50'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{module.name}</span>
                            <span className="text-xs text-gray-400">{module.version}</span>
                          </div>
                        </button>

                        {/* Enable/Disable toggle */}
                        <button
                          onClick={(e) => handleToggleModule(module, e)}
                          className={cn(
                            'p-1.5 rounded-md transition-colors mr-1',
                            module.enabled
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          )}
                          title={module.enabled ? 'Disable module' : 'Enable module'}
                        >
                          <Power className={cn('w-3.5 h-3.5', !module.enabled && 'opacity-50')} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {filteredModules.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">No modules found</p>
            {searchQuery && (
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search or filter
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
