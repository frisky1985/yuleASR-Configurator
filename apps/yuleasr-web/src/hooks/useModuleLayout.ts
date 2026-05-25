import type { Node, Edge } from '@xyflow/react'
import { useMemo, useCallback } from 'react'

import type { ModuleConfig, ModuleLayer } from '@/types'

interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL'
  nodeWidth?: number
  nodeHeight?: number
  horizontalSpacing?: number
  verticalSpacing?: number
  layerHeight?: number
}

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: 'TB',
  nodeWidth: 240,
  nodeHeight: 160,
  horizontalSpacing: 80,
  verticalSpacing: 120,
  layerHeight: 200,
}

const LAYER_ORDER: ModuleLayer[] = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW']

interface LayoutResult {
  nodes: Node[]
  edges: Edge[]
}

export function useModuleLayout(
  modules: ModuleConfig[],
  options: LayoutOptions = {}
): LayoutResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Group modules by layer
  const modulesByLayer = useMemo(() => {
    const grouped = new Map<ModuleLayer, ModuleConfig[]>()
    
    // Initialize all layers
    LAYER_ORDER.forEach(layer => grouped.set(layer, []))
    
    // Group modules
    modules.forEach(module => {
      const layerModules = grouped.get(module.layer) || []
      layerModules.push(module)
      grouped.set(module.layer, layerModules)
    })
    
    return grouped
  }, [modules])

  // Calculate node positions using a hierarchical layout
  const calculatePositions = useCallback((): Map<string, { x: number; y: number }> => {
    const positions = new Map<string, { x: number; y: number }>()
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 400 : 1200 // Account for sidebar
    
    LAYER_ORDER.forEach((layer, layerIndex) => {
      const layerModules = modulesByLayer.get(layer) || []
      if (layerModules.length === 0) return
      
      const totalWidth = layerModules.length * opts.nodeWidth! + 
                        (layerModules.length - 1) * opts.horizontalSpacing!
      const startX = Math.max(0, (containerWidth - totalWidth) / 2)
      const y = layerIndex * opts.layerHeight! + 50 // Add some top padding
      
      layerModules.forEach((module, index) => {
        const x = startX + index * (opts.nodeWidth! + opts.horizontalSpacing!)
        positions.set(module.id, { x, y })
      })
    })
    
    return positions
  }, [modulesByLayer, opts])

  // Generate edges based on dependencies and layer relationships
  const generateEdges = useCallback((): Edge[] => {
    const edges: Edge[] = []
    const edgeSet = new Set<string>()
    
    modules.forEach((module) => {
      // Add edges for explicit dependencies in module metadata
      if (module.dependencies) {
        module.dependencies.forEach((dep: { module: string }) => {
          const targetModule = modules.find(m => m.name === dep.module || m.id === dep.module)
          if (targetModule) {
            const edgeId = `${targetModule.id}-${module.id}`
            if (!edgeSet.has(edgeId)) {
              edgeSet.add(edgeId)
              edges.push({
                id: edgeId,
                source: targetModule.id,
                target: module.id,
                type: 'smoothstep',
                animated: true,
                style: { 
                  stroke: '#3b82f6',
                  strokeWidth: 2,
                },
                markerEnd: {
                  type: 'arrowclosed',
                  width: 12,
                  height: 12,
                  color: '#3b82f6',
                },
              })
            }
          }
        })
      }
      
      // Add implicit edges between adjacent layers
      const sourceLayerIndex = LAYER_ORDER.indexOf(module.layer)
      if (sourceLayerIndex < LAYER_ORDER.length - 1) {
        const nextLayer = LAYER_ORDER[sourceLayerIndex + 1]
        const nextLayerModules = modulesByLayer.get(nextLayer) || []
        
        // Connect to modules in next layer that have dependencies back to this layer
        nextLayerModules.forEach(targetModule => {
          const hasDepToThis = targetModule.dependencies?.some(
            (dep: { module: string }) => dep.module === module.name || dep.module === module.id
          )
          
          if (hasDepToThis) {
            const edgeId = `${module.id}-${targetModule.id}`
            if (!edgeSet.has(edgeId)) {
              edgeSet.add(edgeId)
              edges.push({
                id: edgeId,
                source: module.id,
                target: targetModule.id,
                type: 'smoothstep',
                animated: false,
                style: { 
                  stroke: '#94a3b8',
                  strokeWidth: 1,
                },
                markerEnd: {
                  type: 'arrowclosed',
                  width: 10,
                  height: 10,
                  color: '#94a3b8',
                },
              })
            }
          }
        })
      }
    })
    
    return edges
  }, [modules, modulesByLayer])

  // Build final nodes with positions
  const nodes: Node[] = useMemo(() => {
    const positions = calculatePositions()
    
    return modules.map((module, index) => {
      const pos = positions.get(module.id) || { x: (index % 4) * 280 + 50, y: Math.floor(index / 4) * 200 + 50 }
      
      return {
        id: module.id,
        type: 'moduleNode',
        position: pos,
        data: {
          id: module.id,
          name: module.name,
          layer: module.layer,
          version: module.version,
          enabled: module.enabled,
          description: module.description,
          parameterCount: module.parameters?.length || 0,
          dependencyCount: module.dependencies?.length || 0,
        },
      }
    })
  }, [modules, calculatePositions])

  const edges = useMemo(() => generateEdges(), [generateEdges])

  return { nodes, edges }
}

// Hook for filtering and searching modules in the graph
export function useModuleFilter(
  modules: ModuleConfig[],
  searchQuery: string,
  filters: {
    layers?: ModuleLayer[]
    showDisabled?: boolean
  } = {}
) {
  return useMemo(() => {
    return modules.filter(module => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          module.name.toLowerCase().includes(query) ||
          (module.description?.toLowerCase().includes(query) ?? false) ||
          module.layer.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      
      // Filter by layers
      if (filters.layers && filters.layers.length > 0) {
        if (!filters.layers.includes(module.layer)) return false
      }
      
      // Filter by enabled status
      if (filters.showDisabled === false && !module.enabled) {
        return false
      }
      
      return true
    })
  }, [modules, searchQuery, filters])
}

// Hook for highlighting dependency path
export function useDependencyHighlight(
  edges: Edge[],
  selectedNodeId: string | null
): Edge[] {
  return useMemo(() => {
    if (!selectedNodeId) return edges
    
    // Find all connected edges (both upstream and downstream)
    const connectedEdgeIds = new Set<string>()
    const visited = new Set<string>()
    
    const findConnected = (nodeId: string, direction: 'upstream' | 'downstream') => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      
      edges.forEach(edge => {
        if (direction === 'downstream' && edge.source === nodeId) {
          connectedEdgeIds.add(edge.id)
          findConnected(edge.target, direction)
        } else if (direction === 'upstream' && edge.target === nodeId) {
          connectedEdgeIds.add(edge.id)
          findConnected(edge.source, direction)
        }
      })
    }
    
    findConnected(selectedNodeId, 'downstream')
    visited.clear()
    findConnected(selectedNodeId, 'upstream')
    
    // Update edge styles based on connection
    return edges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: connectedEdgeIds.has(edge.id) ? '#3b82f6' : (edge.style?.stroke as string) || '#94a3b8',
        strokeWidth: connectedEdgeIds.has(edge.id) ? 3 : (edge.style?.strokeWidth as number) || 2,
        opacity: connectedEdgeIds.has(edge.id) ? 1 : 0.4,
      },
      animated: connectedEdgeIds.has(edge.id) ? true : edge.animated,
    }))
  }, [edges, selectedNodeId])
}
