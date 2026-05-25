/**
 * Hierarchical Configuration Tree Component
 * Similar to Vector Configurator's module tree
 * 
 * Features:
 * - Collapsible layers (MCAL, ECUAL, Service, RTE, OS, ASW)
 * - Collapsible modules within each layer
 * - Collapsible containers within each module
 * - Visual indicators for errors/warnings
 * - Dependency highlighting
 */

import { 
  Cpu, Settings, Layers, Box, Code, Search, ChevronDown, ChevronRight, 
  Power, AlertCircle, AlertTriangle, Info, Folder, FolderOpen, 
  FileText, Hash, ToggleLeft, List, Filter, ChevronRightSquare,
  ChevronDownSquare, CircleDot, Layers2
} from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'

import { cn } from '@/lib/utils'
import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter, ValidationIssue } from '@/types/config'

interface ConfigTreeProps {
  config: ConfigFile
  selectedPath: string | null
  onSelectPath: (path: string) => void
  validationIssues?: ValidationIssue[]
  highlightDependencies?: boolean
  showDisabled?: boolean
  onToggleModule?: (moduleId: string, enabled: boolean) => void
  filterText?: string
}

interface TreeNodeData {
  id: string
  type: 'layer' | 'module' | 'container' | 'parameter'
  name: string
  displayName: string
  path: string
  icon: React.ReactNode
  hasChildren: boolean
  enabled?: boolean
  configStatus?: 'unconfigured' | 'configuring' | 'configured' | 'partial'
  errorCount: number
  warningCount: number
  children?: TreeNodeData[]
  data: ConfigModule | ConfigContainer | ConfigParameter
}

const layerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MCAL: Cpu,
  ECUAL: Settings,
  Service: Layers,
  RTE: Box,
  OS: Code,
  ASW: Box,
}

const layerColors: Record<string, string> = {
  MCAL: 'bg-blue-50 text-blue-700 border-blue-200',
  ECUAL: 'bg-green-50 text-green-700 border-green-200',
  Service: 'bg-purple-50 text-purple-700 border-purple-200',
  RTE: 'bg-orange-50 text-orange-700 border-orange-200',
  OS: 'bg-pink-50 text-pink-700 border-pink-200',
  ASW: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

const layerOrder = ['MCAL', 'ECUAL', 'Service', 'OS', 'RTE', 'ASW']

export function ConfigTree({
  config,
  selectedPath,
  onSelectPath,
  validationIssues = [],
  highlightDependencies = false,
  showDisabled = true,
  onToggleModule,
  filterText = '',
}: ConfigTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState(filterText)
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Build tree data structure
  const treeData = useMemo(() => {
    const nodes: TreeNodeData[] = []
    
    // Group modules by layer
    const modulesByLayer = config.modules.reduce((acc, module) => {
      if (!acc[module.layer]) acc[module.layer] = []
      acc[module.layer].push(module)
      return acc
    }, {} as Record<string, ConfigModule[]>)
    
    // Add OS if enabled
    if (config.os?.enabled) {
      modulesByLayer['OS'] = [{
        id: 'os',
        name: 'OS',
        displayName: 'Operating System',
        description: 'OSEK/AUTOSAR OS Configuration',
        version: config.os.version,
        layer: 'OS',
        enabled: true,
        configStatus: 'configured',
        containers: [
          { id: 'tasks', name: 'Tasks', displayName: 'Task Configuration', parameters: [], subContainers: [] },
          { id: 'isrs', name: 'ISRs', displayName: 'Interrupt Service Routines', parameters: [], subContainers: [] },
          { id: 'resources', name: 'Resources', displayName: 'OS Resources', parameters: [], subContainers: [] },
          { id: 'alarms', name: 'Alarms', displayName: 'OS Alarms', parameters: [], subContainers: [] },
          { id: 'events', name: 'Events', displayName: 'OS Events', parameters: [], subContainers: [] },
          { id: 'counters', name: 'Counters', displayName: 'OS Counters', parameters: [], subContainers: [] },
        ],
        parameters: [],
        dependencies: [],
        createdAt: '',
        updatedAt: '',
      } as ConfigModule]
    }
    
    // Build layer nodes
    for (const layer of layerOrder) {
      const modules = modulesByLayer[layer]
      if (!modules || modules.length === 0) continue
      
      // Filter modules based on search and enabled status
      const filteredModules = modules.filter(m => {
        const matchesSearch = !searchQuery || 
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesEnabled = showDisabled || m.enabled
        return matchesSearch && matchesEnabled
      })
      
      if (filteredModules.length === 0 && searchQuery) continue
      
      const Icon = layerIcons[layer] || Settings
      const layerPath = `layer:${layer}`
      
      // Count issues for this layer
      const layerIssues = validationIssues.filter(i => 
        i.module && modules.some(m => m.name === i.module)
      )
      const errorCount = layerIssues.filter(i => i.severity === 'error').length
      const warningCount = layerIssues.filter(i => i.severity === 'warning').length
      
      nodes.push({
        id: layerPath,
        type: 'layer',
        name: layer,
        displayName: layer,
        path: layerPath,
        icon: <Icon className="w-4 h-4" />,
        hasChildren: filteredModules.length > 0,
        errorCount,
        warningCount,
        data: null as any,
        children: filteredModules.map(module => buildModuleNode(module, layerPath, validationIssues)),
      })
    }
    
    return nodes
  }, [config, validationIssues, showDisabled, searchQuery])

  // Build module node recursively
  function buildModuleNode(module: ConfigModule, parentPath: string, issues: ValidationIssue[]): TreeNodeData {
    const path = `${parentPath}/module:${module.id}`
    const moduleIssues = issues.filter(i => i.module === module.name)
    const errorCount = moduleIssues.filter(i => i.severity === 'error').length
    const warningCount = moduleIssues.filter(i => i.severity === 'warning').length
    
    // Build container nodes
    const containerNodes = module.containers.map(container => 
      buildContainerNode(container, path, module.name, issues)
    )
    
    // Build parameter nodes
    const paramNodes = module.parameters.map(param => ({
      id: `${path}/param:${param.id}`,
      type: 'parameter' as const,
      name: param.name,
      displayName: param.displayName || param.name,
      path: `${path}/param:${param.id}`,
      icon: getParameterIcon(param.type),
      hasChildren: false,
      enabled: module.enabled,
      errorCount: 0,
      warningCount: 0,
      data: param,
    }))
    
    return {
      id: path,
      type: 'module',
      name: module.name,
      displayName: module.displayName || module.name,
      path,
      icon: <Folder className="w-4 h-4" />,
      hasChildren: containerNodes.length > 0 || paramNodes.length > 0,
      enabled: module.enabled,
      configStatus: module.configStatus,
      errorCount,
      warningCount,
      data: module,
      children: [...containerNodes, ...paramNodes],
    }
  }

  // Build container node recursively
  function buildContainerNode(container: ConfigContainer, parentPath: string, moduleName: string, issues: ValidationIssue[]): TreeNodeData {
    const path = `${parentPath}/container:${container.id}`
    const containerIssues = issues.filter(i => 
      i.module === moduleName && i.container === container.name
    )
    const errorCount = containerIssues.filter(i => i.severity === 'error').length
    const warningCount = containerIssues.filter(i => i.severity === 'warning').length
    
    // Build sub-container nodes
    const subContainerNodes = (container.subContainers || []).map(sub => 
      buildContainerNode(sub, path, moduleName, issues)
    )
    
    // Build parameter nodes
    const paramNodes = (container.parameters || []).map(param => ({
      id: `${path}/param:${param.id}`,
      type: 'parameter' as const,
      name: param.name,
      displayName: param.displayName || param.name,
      path: `${path}/param:${param.id}`,
      icon: getParameterIcon(param.type),
      hasChildren: false,
      errorCount: 0,
      warningCount: 0,
      data: param,
    }))
    
    return {
      id: path,
      type: 'container',
      name: container.name,
      displayName: container.displayName || container.name,
      path,
      icon: container.subContainers?.length ? <FolderOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />,
      hasChildren: subContainerNodes.length > 0 || paramNodes.length > 0,
      errorCount,
      warningCount,
      data: container,
      children: [...subContainerNodes, ...paramNodes],
    }
  }

  // Get icon based on parameter type
  function getParameterIcon(type: string): React.ReactNode {
    switch (type) {
      case 'integer':
      case 'float':
        return <Hash className="w-3.5 h-3.5" />
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5" />
      case 'enum':
        return <List className="w-3.5 h-3.5" />
      case 'array':
        return <Layers2 className="w-3.5 h-3.5" />
      default:
        return <FileText className="w-3.5 h-3.5" />
    }
  }

  // Toggle expansion of a node
  const toggleExpansion = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  // Expand all
  const expandAll = useCallback(() => {
    const allPaths = new Set<string>()
    const collectPaths = (nodes: TreeNodeData[]) => {
      for (const node of nodes) {
        allPaths.add(node.path)
        if (node.children) {
          collectPaths(node.children)
        }
      }
    }
    collectPaths(treeData)
    setExpandedPaths(allPaths)
  }, [treeData])

  // Collapse all
  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set())
  }, [])

  // Handle module toggle
  const handleToggleModule = (e: React.MouseEvent, node: TreeNodeData) => {
    e.stopPropagation()
    if (node.type === 'module' && onToggleModule) {
      const module = node.data as ConfigModule
      onToggleModule(module.id, !module.enabled)
    }
  }

  // Render tree node
  const renderNode = (node: TreeNodeData, level: number = 0) => {
    const isExpanded = expandedPaths.has(node.path)
    const isSelected = selectedPath === node.path
    const hasErrors = node.errorCount > 0
    const hasWarnings = node.warningCount > 0
    const paddingLeft = level * 12 + 8
    
    return (
      <div key={node.id}>
        {/* Node row */}
        <div
          className={cn(
            'group flex items-center gap-1.5 py-1.5 pr-2 cursor-pointer transition-colors',
            isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
            node.type === 'layer' && layerColors[node.name]
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            onSelectPath(node.path)
            if (node.hasChildren) {
              toggleExpansion(node.path)
            }
          }}
        >
          {/* Expand/Collapse icon */}
          {node.hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpansion(node.path)
              }}
              className="p-0.5 rounded hover:bg-black/5 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          
          {/* Node icon */}
          <span className={cn(
            'flex-shrink-0',
            node.type === 'parameter' && 'text-gray-400',
            node.type === 'container' && 'text-blue-500',
            node.type === 'module' && 'text-gray-600',
          )}>
            {node.icon}
          </span>
          
          {/* Node name */}
          <span className={cn(
            'flex-1 text-sm truncate',
            isSelected ? 'text-primary-700 font-medium' : 'text-gray-700',
            node.type === 'layer' && 'font-semibold uppercase tracking-wider text-xs',
            node.type === 'parameter' && 'text-gray-600',
            node.enabled === false && 'opacity-50'
          )}>
            {node.displayName}
          </span>
          
          {/* Configuration Status Indicator */}
          {node.type === 'module' && node.configStatus && (
            <span className={cn(
              'flex-shrink-0 w-2 h-2 rounded-full',
              node.configStatus === 'configured' && 'bg-green-500',
              node.configStatus === 'configuring' && 'bg-blue-500 animate-pulse',
              node.configStatus === 'partial' && 'bg-yellow-500',
              node.configStatus === 'unconfigured' && 'bg-gray-300'
            )} title={`Status: ${node.configStatus}`} />
          )}
          
          {/* Module enable toggle */}
          {node.type === 'module' && onToggleModule && (
            <button
              onClick={(e) => handleToggleModule(e, node)}
              className={cn(
                'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                node.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
              )}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* Error/Warning badges */}
          {hasErrors && (
            <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {node.errorCount}
            </span>
          )}
          {!hasErrors && hasWarnings && (
            <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
              {node.warningCount}
            </span>
          )}
        </div>
        
        {/* Children */}
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Count total modules and enabled modules
  const stats = useMemo(() => {
    const total = config.modules.length
    const enabled = config.modules.filter(m => m.enabled).length
    return { total, enabled }
  }, [config])

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Configuration Tree</h3>
          <span className="text-xs text-gray-500">
            {stats.enabled}/{stats.total} modules
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-7 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="text-xs">×</span>
            </button>
          )}
        </div>
        
        {/* Toolbar */}
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
              <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1">
                <label className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDisabled}
                    onChange={(e) => {}}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Show disabled modules</span>
                </label>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="text-xs text-gray-600 hover:text-primary-600 px-2 py-1"
            >
              Expand
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-600 hover:text-primary-600 px-2 py-1"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>
      
      {/* Tree content */}
      <div className="flex-1 overflow-y-auto">
        {treeData.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">No modules found</p>
          </div>
        ) : (
          <div className="py-1">
            {treeData.map(node => renderNode(node))}
          </div>
        )}
      </div>
      
      {/* Footer - validation summary */}
      {validationIssues.length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-3 text-xs">
            {validationIssues.filter(i => i.severity === 'error').length > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationIssues.filter(i => i.severity === 'error').length} errors
              </span>
            )}
            {validationIssues.filter(i => i.severity === 'warning').length > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                {validationIssues.filter(i => i.severity === 'warning').length} warnings
              </span>
            )}
            {validationIssues.filter(i => i.severity === 'info').length > 0 && (
              <span className="flex items-center gap-1 text-blue-600">
                <Info className="w-3.5 h-3.5" />
                {validationIssues.filter(i => i.severity === 'info').length} info
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigTree
