/**
 * Virtualized ConfigTree Component
 * For large configurations, only renders visible items
 */

import { Folder, FileJson, Settings, Hash, Type, ToggleLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { useMemo, useCallback, memo } from 'react'

import { VirtualList } from './VirtualList'

import { cn } from '@/lib/utils'
import type { ConfigFile, ConfigModule, ValidationIssue } from '@/types'

interface ConfigTreeVirtualProps {
  config: ConfigFile
  selectedPath: string | null
  onSelectPath: (path: string) => void
  validationIssues: ValidationIssue[]
  showDisabled: boolean
  onToggleModule: (id: string, enabled: boolean) => void
  filterText?: string
}

interface TreeNode {
  id: string
  type: 'layer' | 'module' | 'container' | 'parameter'
  name: string
  displayName: string
  path: string
  depth: number
  icon: React.ReactNode
  enabled?: boolean
  hasChildren: boolean
  isExpanded: boolean
}

// Tree item height in pixels
const ITEM_HEIGHT = 36

export const ConfigTreeVirtual = memo(function ConfigTreeVirtual({
  config,
  selectedPath,
  onSelectPath,
  validationIssues,
  showDisabled,
  onToggleModule,
  filterText,
}: ConfigTreeVirtualProps) {
  // Flatten tree structure for virtualization
  const flattenedNodes = useMemo(() => {
    const nodes: TreeNode[] = []
    const expandedPaths = new Set<string>()

    // Build expanded paths from selected path
    if (selectedPath) {
      const parts = selectedPath.split('/')
      let currentPath = ''
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        expandedPaths.add(currentPath)
      })
    }

    // Group modules by layer
    const modulesByLayer: Record<string, ConfigModule[]> = {}
    config.modules.forEach((module) => {
      if (!showDisabled && !module.enabled) return
      if (filterText && !matchesFilter(module, filterText)) return
      
      if (!modulesByLayer[module.layer]) {
        modulesByLayer[module.layer] = []
      }
      modulesByLayer[module.layer].push(module)
    })

    // Create layer nodes
    const layers = ['MCAL', 'ECUAL', 'Service', 'RTE', 'OS', 'ASW']
    layers.forEach((layer) => {
      if (modulesByLayer[layer]) {
        const layerPath = `layer:${layer}`
        const isExpanded = expandedPaths.has(layerPath)
        
        nodes.push({
          id: layerPath,
          type: 'layer',
          name: layer,
          displayName: layer,
          path: layerPath,
          depth: 0,
          icon: <Folder className="w-4 h-4 text-blue-500" />,
          hasChildren: modulesByLayer[layer].length > 0,
          isExpanded,
        })

        if (isExpanded) {
          modulesByLayer[layer].forEach((module) => {
            const modulePath = `${layerPath}/module:${module.id}`
            const moduleExpanded = expandedPaths.has(modulePath)
            const hasErrors = validationIssues.some(
              (i) => i.module === module.name && i.severity === 'error'
            )

            nodes.push({
              id: modulePath,
              type: 'module',
              name: module.name,
              displayName: module.displayName || module.name,
              path: modulePath,
              depth: 1,
              icon: hasErrors ? (
                <FileJson className="w-4 h-4 text-red-500" />
              ) : (
                <FileJson className="w-4 h-4 text-amber-500" />
              ),
              enabled: module.enabled,
              hasChildren: module.containers.length > 0 || module.parameters.length > 0,
              isExpanded: moduleExpanded,
            })

            // Add container nodes if expanded
            if (moduleExpanded) {
              module.containers.forEach((container) => {
                const containerPath = `${modulePath}/container:${container.id}`
                nodes.push({
                  id: containerPath,
                  type: 'container',
                  name: container.name,
                  displayName: container.displayName || container.name,
                  path: containerPath,
                  depth: 2,
                  icon: <Settings className="w-4 h-4 text-gray-500" />,
                  hasChildren: container.parameters.length > 0,
                  isExpanded: expandedPaths.has(containerPath),
                })
              })
            }
          })
        }
      }
    })

    return nodes
  }, [config, selectedPath, validationIssues, showDisabled, filterText])

  const matchesFilter = (module: ConfigModule, filter: string): boolean => {
    const lowerFilter = filter.toLowerCase()
    return (
      module.name.toLowerCase().includes(lowerFilter) ||
      (module.displayName && module.displayName.toLowerCase().includes(lowerFilter)) ||
      module.containers.some(
        (c) =>
          c.name.toLowerCase().includes(lowerFilter) ||
          (c.displayName && c.displayName.toLowerCase().includes(lowerFilter))
      )
    )
  }

  const handleToggleExpand = useCallback((node: TreeNode) => {
    if (!node.hasChildren) {
      onSelectPath(node.path)
      return
    }

    // Toggle expansion by selecting or deselecting
    if (selectedPath?.startsWith(node.path)) {
      // Collapse: go to parent
      const parentPath = node.path.split('/').slice(0, -1).join('/')
      onSelectPath(parentPath || node.path)
    } else {
      // Expand
      onSelectPath(node.path)
    }
  }, [onSelectPath, selectedPath])

  const renderNode = useCallback((node: TreeNode) => {
    const isSelected = selectedPath === node.path
    const hasErrors = validationIssues.some((i) => i.path.includes(node.name))

    return (
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-2 cursor-pointer select-none transition-colors',
          isSelected
            ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30'
            : 'hover:bg-accent',
          node.enabled === false && 'opacity-50'
        )}
        style={{ paddingLeft: `${8 + node.depth * 20}px` }}
        onClick={() => handleToggleExpand(node)}
      >
        {/* Expand/Collapse indicator */}
        {node.hasChildren && (
          <span className="w-4 h-4 flex items-center justify-center">
            {node.isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </span>
        )}
        {!node.hasChildren && <span className="w-4" />}

        {/* Icon */}
        <span className="flex-shrink-0">{node.icon}</span>

        {/* Name */}
        <span
          className={cn(
            'flex-1 text-sm truncate',
            isSelected ? 'font-medium' : 'text-foreground',
            hasErrors && !isSelected && 'text-red-600'
          )}
        >
          {node.displayName}
        </span>

        {/* Enabled toggle for modules */}
        {node.type === 'module' && node.enabled !== undefined && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              const moduleId = node.id.split(':')[1]
              onToggleModule(moduleId, !node.enabled)
            }}
            className={cn(
              'w-8 h-4 rounded-full transition-colors relative',
              node.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform',
                node.enabled ? 'right-0.5' : 'left-0.5'
              )}
            />
          </button>
        )}
      </div>
    )
  }, [selectedPath, validationIssues, handleToggleExpand, onToggleModule])

  return (
    <div className="h-full bg-card border border-border rounded-lg overflow-hidden">
      <VirtualList
        items={flattenedNodes}
        itemHeight={ITEM_HEIGHT}
        renderItem={(node) => renderNode(node)}
        className="h-full"
      />
    </div>
  )
})
