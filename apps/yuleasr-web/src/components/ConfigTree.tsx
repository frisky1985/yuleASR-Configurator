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
  ChevronDownSquare, CircleDot, Layers2, Trash2, AlertTriangle as AlertTri
} from 'lucide-react'
import { useState, useMemo, useCallback, useEffect } from 'react'

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
  // Dynamic instance support
  isDynamic?: boolean
  isDynamicParent?: boolean
  parentContainerPath?: string
  instanceName?: string
  /** Number of instances for this dynamic parent (for × visibility check) */
  instanceCount?: number
  /** Minimum instances (× hidden when count <= min) */
  minInstanceCount?: number
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
  
  // Track dynamic instance counts per container
  // Key: container path, Value: array of instance names
  const [dynamicInstances, setDynamicInstances] = useState<Record<string, string[]>>(() => {
    // Initialize with default instances based on minInstances
    const initial: Record<string, string[]> = {}
    for (const module of config.modules) {
      // Use the same path format as buildModuleNode
      const modulePath = `layer:${module.layer}/module:${module.id}`
      collectDynamicContainers(module.containers, modulePath, initial)
    }
    return initial
  })
  
  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    containerPath: string
    instanceName: string
  } | null>(null)
  
  // Inline rename state
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    nodePath: string
    containerPath: string
    instanceName: string
  } | null>(null)

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])
  const [dragSource, setDragSource] = useState<{
    containerPath: string
    instanceName: string
  } | null>(null)
  
  // Collect initial dynamic instances from module containers
  function collectDynamicContainers(
    containers: ConfigContainer[], 
    parentPath: string, 
    acc: Record<string, string[]>
  ) {
    for (const container of containers) {
      const contPath = `${parentPath}/container:${container.id}`
      if (container.multiple && container.subContainers && container.subContainers.length > 0) {
        // Generate default instances
        const template = container.subContainers[0]
        const baseName = template.name.replace(/_\d+$/, '') || template.name
        const count = container.minInstances ?? 0
        const instances: string[] = []
        for (let i = 0; i < count; i++) {
          instances.push(`${baseName}_${i}`)
        }
        acc[contPath] = instances
      }
      if (container.subContainers) {
        collectDynamicContainers(container.subContainers, contPath, acc)
      }
    }
  }
  
  // Add a new dynamic instance
  const addInstance = useCallback((containerPath: string) => {
    setDynamicInstances(prev => {
      const instances = [...(prev[containerPath] || [])]
      let maxIdx = -1
      for (const inst of instances) {
        const match = inst.match(/_(\d+)$/)
        if (match) maxIdx = Math.max(maxIdx, parseInt(match[1]))
      }
      // Determine baseName from template or existing instances
      let baseName = 'Instance'
      if (instances.length > 0) {
        baseName = instances[0].replace(/_\d+$/, '') || baseName
      } else {
        // Search through all containers for the template
        for (const mod of config.modules) {
          const found = findTemplateName(mod.containers, containerPath, `layer:${mod.layer}/module:${mod.id}`)
          if (found) { baseName = found; break }
        }
      }
      instances.push(`${baseName}_${maxIdx + 1}`)
      return { ...prev, [containerPath]: instances }
    })
  }, [config])

  // Recursively search for template name matching a container path
  function findTemplateName(containers: ConfigContainer[], targetPath: string, parentPath: string): string | null {
    for (const c of containers) {
      const cp = `${parentPath}/container:${c.id}`
      if (cp === targetPath) {
        if (c.subContainers?.length) {
          // Prefer shortName if available, then strip numeric suffix from name
          const tpl = c.subContainers[0]
          return tpl.shortName || tpl.name.replace(/_\d+$/, '') || tpl.name
        }
        return null
      }
      if (c.subContainers?.length) {
        const found = findTemplateName(c.subContainers, targetPath, cp)
        if (found) return found
      }
    }
    return null
  }
  
  // Remove a dynamic instance
  const removeInstance = useCallback((containerPath: string, instanceName: string) => {
    setDynamicInstances(prev => {
      const instances = (prev[containerPath] || []).filter(n => n !== instanceName)
      return { ...prev, [containerPath]: instances }
    })
  }, [])
  
  // Rename an instance
  const renameInstance = useCallback((containerPath: string, oldName: string, newName: string) => {
    setDynamicInstances(prev => {
      const instances = (prev[containerPath] || []).map(n => n === oldName ? newName : n)
      return { ...prev, [containerPath]: instances }
    })
  }, [])
  
  // Copy an instance (adds a new one with auto-incremented name)
  const copyInstance = useCallback((containerPath: string, sourceName: string) => {
    setDynamicInstances(prev => {
      const instances = [...(prev[containerPath] || [])]
      let maxIdx = -1
      for (const inst of instances) {
        const match = inst.match(/_(\d+)$/)
        if (match) maxIdx = Math.max(maxIdx, parseInt(match[1]))
      }
      const baseName = sourceName.replace(/_\d+$/, '') || sourceName
      instances.push(`${baseName}_${maxIdx + 1}`)
      return { ...prev, [containerPath]: instances }
    })
  }, [])
  
  // Start rename (set editing state)
  const startRename = useCallback((path: string, currentName: string) => {
    setRenamingPath(path)
    setRenameValue(currentName)
  }, [])
  
  // Confirm rename
  const confirmRename = useCallback((containerPath: string) => {
    if (renamingPath && renameValue.trim()) {
      const currentName = dynamicInstances[containerPath]?.find(n => {
        const instPath = `${containerPath}/instance:${n}`
        return instPath === renamingPath
      })
      if (currentName) {
        renameInstance(containerPath, currentName, renameValue.trim())
      }
    }
    setRenamingPath(null)
    setRenameValue('')
  }, [renamingPath, renameValue, dynamicInstances, renameInstance])
  
  // Cancel rename
  const cancelRename = useCallback(() => {
    setRenamingPath(null)
    setRenameValue('')
  }, [])
  
  // Handle drag start
  const onDragStart = useCallback((containerPath: string, instanceName: string) => {
    setDragSource({ containerPath, instanceName })
  }, [])
  
  // Handle drag over (prevent default to allow drop)
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])
  
  // Handle drop - reorder instances
  const onDrop = useCallback((targetContainerPath: string, targetName: string) => {
    if (!dragSource || dragSource.containerPath !== targetContainerPath) {
      setDragSource(null)
      return
    }
    const { instanceName: sourceName } = dragSource
    if (sourceName === targetName) {
      setDragSource(null)
      return
    }
    setDynamicInstances(prev => {
      const instances = [...(prev[targetContainerPath] || [])]
      const fromIdx = instances.indexOf(sourceName)
      const toIdx = instances.indexOf(targetName)
      if (fromIdx === -1 || toIdx === -1) return prev
      instances.splice(fromIdx, 1)
      instances.splice(toIdx, 0, sourceName)
      return { ...prev, [targetContainerPath]: instances }
    })
    setDragSource(null)
  }, [dragSource])
  
  // Recursively search inside module containers and parameters
  function searchInModule(module: ConfigModule, query: string): boolean {
    for (const container of module.containers) {
      if (searchInContainer(container, query)) return true
    }
    return false
  }
  
  function searchInContainer(container: ConfigContainer, query: string): boolean {
    // Check container name
    if (container.displayName?.toLowerCase().includes(query)) return true
    if (container.name?.toLowerCase().includes(query)) return true
    
    // Check parameters
    for (const param of container.parameters || []) {
      if (param.displayName?.toLowerCase().includes(query)) return true
      if (param.name?.toLowerCase().includes(query)) return true
      if (String(param.value ?? '').toLowerCase().includes(query)) return true
    }
    
    // Check sub-containers recursively
    for (const sub of container.subContainers || []) {
      if (searchInContainer(sub, query)) return true
    }
    
    return false
  }

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
          m.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          // Search inside containers and parameters
          searchInModule(m, searchQuery.toLowerCase())
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
  }, [config, validationIssues, showDisabled, searchQuery, dynamicInstances])

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
    
    return {
      id: path,
      type: 'module',
      name: module.name,
      displayName: module.displayName || module.name,
      path,
      icon: <Folder className="w-4 h-4" />,
      hasChildren: containerNodes.length > 0,
      enabled: module.enabled,
      configStatus: module.configStatus,
      errorCount,
      warningCount,
      data: module,
      children: containerNodes,
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
    
    // Check for dynamic instances
    const isDynamic = container.multiple && container.subContainers && container.subContainers.length > 0
    const children: TreeNodeData[] = []
    
    if (isDynamic) {
      // Render dynamic instances
      const template = container.subContainers![0]
      const instances = dynamicInstances[path] || []
      const minCount = container.minInstances ?? 1
      
      for (const instName of instances) {
        // Create an instance node based on the template
        const instPath = `${path}/instance:${instName}`
        const subChildren: TreeNodeData[] = []
        
        // Render sub-containers of the template within each instance
        for (const sub of template.subContainers || []) {
          subChildren.push(buildContainerNode(sub, instPath, moduleName, issues))
        }
        
        children.push({
          id: instPath,
          type: 'container',
          name: instName,
          displayName: instName,
          path: instPath,
          icon: <FileText className="w-4 h-4" />,
          hasChildren: subChildren.length > 0,
          errorCount,
          warningCount,
          data: container,
          children: subChildren,
          isDynamic: true,
          parentContainerPath: path,
          instanceName: instName,
          instanceCount: instances.length,
          minInstanceCount: minCount,
        })
      }
    } else {
      // Render static sub-containers (existing behavior)
      for (const sub of container.subContainers || []) {
        children.push(buildContainerNode(sub, path, moduleName, issues))
      }
    }
    
    return {
      id: path,
      type: 'container',
      name: container.name,
      displayName: container.displayName || container.name,
      path,
      icon: isDynamic ? <FolderOpen className="w-4 h-4" /> : (container.subContainers?.length ? <FolderOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />),
      hasChildren: children.length > 0,
      errorCount,
      warningCount,
      data: container,
      children,
      isDynamicParent: isDynamic,
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
            node.type === 'layer' && layerColors[node.name],
            node.isDynamic && 'cursor-grab active:cursor-grabbing'
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
          draggable={node.isDynamic}
          onDragStart={(e) => {
            if (node.isDynamic && node.parentContainerPath) {
              onDragStart(node.parentContainerPath, node.instanceName!)
              e.dataTransfer.effectAllowed = 'move'
            }
          }}
          onDragOver={node.isDynamic ? onDragOver : undefined}
          onDrop={(e) => {
            if (node.isDynamic && node.parentContainerPath) {
              onDrop(node.parentContainerPath, node.instanceName!)
            }
          }}
          onContextMenu={(e) => {
            if (node.isDynamic && node.parentContainerPath) {
              e.preventDefault()
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                nodePath: node.path,
                containerPath: node.parentContainerPath,
                instanceName: node.instanceName!,
              })
            }
          }}
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
          
          {/* Node name - with inline rename for dynamic instances */}
          <span className={cn(
            'flex-1 text-sm truncate',
            isSelected ? 'text-primary-700 font-medium' : 'text-gray-700',
            node.type === 'layer' && 'font-semibold uppercase tracking-wider text-xs',
            node.type === 'parameter' && 'text-gray-600',
            node.enabled === false && 'opacity-50'
          )}>
            {node.isDynamic && renamingPath === node.path ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => {
                  if (node.parentContainerPath) confirmRename(node.parentContainerPath)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && node.parentContainerPath) {
                    confirmRename(node.parentContainerPath)
                  } else if (e.key === 'Escape') {
                    cancelRename()
                  }
                  e.stopPropagation()
                }}
                className="w-full px-1 py-0.5 text-sm border border-primary-400 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onDoubleClick={() => {
                  if (node.isDynamic) {
                    startRename(node.path, node.instanceName || node.name)
                  }
                }}
                title={node.isDynamic ? 'Double-click to rename' : undefined}
              >
                {node.displayName}
              </span>
            )}
          </span>
          
          {/* Dynamic instance controls */}
          {node.isDynamicParent && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                addInstance(node.path)
              }}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-green-600 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
              title={`Add ${node.displayName} instance`}
            >
              +
            </button>
          )}
          {node.isDynamic && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (node.parentContainerPath) {
                    copyInstance(node.parentContainerPath, node.instanceName!)
                  }
                }}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium"
                title={`Copy ${node.instanceName}`}
              >
                ⎘
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (node.parentContainerPath) {
                    setDeleteTarget({
                      containerPath: node.parentContainerPath,
                      instanceName: node.instanceName!
                    })
                  }
                }}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                title={`Delete ${node.instanceName}`}
              >
                ×
              </button>
            </>
          )}
          
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
        
        {/* Sub-container nodes (including dynamic instances) */}
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

      {/* Context menu for dynamic instances */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              startRename(contextMenu.nodePath, contextMenu.instanceName)
              setContextMenu(null)
            }}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            重命名
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              copyInstance(contextMenu.containerPath, contextMenu.instanceName)
              setContextMenu(null)
            }}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            复制
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            onClick={() => {
              setDeleteTarget({
                containerPath: contextMenu.containerPath,
                instanceName: contextMenu.instanceName,
              })
              setContextMenu(null)
            }}
          >
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            删除
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTri className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">确认删除</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  确定删除 <span className="font-medium text-gray-700">{deleteTarget.instanceName}</span>？
                </p>
              </div>
            </div>
            <p className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2 mb-4">
              该实例的所有参数配置将丢失，此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // Build the deleted instance's full path
                  const deletedPath = `${deleteTarget.containerPath}/instance:${deleteTarget.instanceName}`
                  // Clear selection if the deleted instance or any of its children was selected
                  if (selectedPath?.startsWith(deletedPath)) {
                    onSelectPath('')
                  }
                  removeInstance(deleteTarget.containerPath, deleteTarget.instanceName)
                  setDeleteTarget(null)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigTree
