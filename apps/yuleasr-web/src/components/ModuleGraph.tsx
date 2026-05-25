import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Connection,
} from '@xyflow/react'
import { useCallback, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '@xyflow/react/dist/style.css'

import { ModuleNode } from './ModuleNode'

import { useModuleLayout, useModuleFilter, useDependencyHighlight } from '@/hooks/useModuleLayout'
import { cn } from '@/lib/utils'
import type { ModuleLayer , ModuleConfig } from '@/types'

import {
  Search,
  Filter,
  LayoutGrid,
  Maximize2,
  X,
  Layers,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'


// Node types registry
const nodeTypes = {
  moduleNode: ModuleNode,
}

interface ModuleGraphProps {
  configId: string
  modules: ModuleConfig[]
  onNodeClick?: (moduleId: string) => void
  className?: string
}

function ModuleGraphInner({ configId, modules, onNodeClick, className }: ModuleGraphProps) {
  const navigate = useNavigate()
  const { fitView, zoomIn, zoomOut } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [selectedLayers, setSelectedLayers] = useState<ModuleLayer[]>([])
  const [showDisabled, setShowDisabled] = useState(true)
  const [highlightPath, setHighlightPath] = useState(true)

  // Filter modules
  const filteredModules = useModuleFilter(modules, searchQuery, {
    layers: selectedLayers.length > 0 ? selectedLayers : undefined,
    showDisabled,
  })

  // Generate layout
  const { nodes: layoutNodes, edges: layoutEdges } = useModuleLayout(filteredModules)
  
  // Highlight dependency paths
  const highlightedEdges = useDependencyHighlight(layoutEdges, highlightPath ? selectedNodeId : null)

  // Handle node click
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
    
    // Store click handler in node data
    const nodeData = node.data as { onClick?: (moduleId: string) => void }
    if (nodeData.onClick) {
      nodeData.onClick(node.id)
    }
    
    onNodeClick?.(node.id)
  }, [onNodeClick])

  // Handle node double click - navigate to config
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    navigate(`/editor/${configId}/${node.id}`)
  }, [navigate, configId])

  // Handle pane click - deselect
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Handle edge connection (visual only)
  const onConnect = useCallback((params: Connection) => {
    console.log('Connection attempted:', params)
    // Dependencies are read-only in graph view
  }, [])

  // Toggle layer filter
  const toggleLayer = useCallback((layer: ModuleLayer) => {
    setSelectedLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    )
  }, [])

  // Reset view
  const handleResetView = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 })
    setSelectedNodeId(null)
    setSearchQuery('')
    setSelectedLayers([])
    setShowDisabled(true)
  }, [fitView])

  // Fit view on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 })
    }, 100)
    return () => clearTimeout(timer)
  }, [fitView, modules.length])

  // Layer color map for legend
  const layerColors: Record<ModuleLayer, string> = {
    MCAL: '#3b82f6',    // blue-500
    ECUAL: '#a855f7',   // purple-500
    Service: '#f97316', // orange-500
    RTE: '#ec4899',     // pink-500
    ASW: '#22c55e',     // green-500
    OS: '#6366f1',      // indigo-500
  }

  const layerNames: Record<ModuleLayer, string> = {
    MCAL: 'MCAL',
    ECUAL: 'ECU Abstraction',
    Service: 'Services',
    RTE: 'Runtime',
    ASW: 'Application',
    OS: 'Operating System',
  }

  // Update nodes with click handler
  const nodes = layoutNodes.map(node => ({
    ...node,
    selected: node.id === selectedNodeId,
    data: {
      ...node.data,
      onClick: (moduleId: string) => {
        setSelectedNodeId(moduleId)
      },
    },
  }))

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full h-full rounded-xl overflow-hidden border border-gray-200',
        'bg-gray-50',
        className
      )}
      style={{ minHeight: '600px' }}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
        {/* Search */}
        <div className="pointer-events-auto bg-white rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 pr-8 py-2 text-sm bg-transparent border-0 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'pointer-events-auto p-2 rounded-lg border shadow-sm transition-colors',
            showFilters 
              ? 'bg-primary-50 border-primary-200 text-primary-700' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
          title="Toggle filters"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* View Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm p-1 ml-auto">
          <button
            onClick={() => zoomOut()}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => fitView({ padding: 0.2 })}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Fit view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomIn()}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              showMiniMap 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-100'
            )}
            title="Toggle minimap"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 z-10 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 space-y-4">
          {/* Layer Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Layers
            </h4>
            <div className="space-y-1">
              {(Object.keys(layerColors) as ModuleLayer[]).map(layer => (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    selectedLayers.includes(layer)
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  )}
                >
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: layerColors[layer] }}
                  />
                  <span className="flex-1 text-left">{layerNames[layer]}</span>
                  {selectedLayers.includes(layer) && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">
                      {filteredModules.filter(m => m.layer === layer).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Show Disabled Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show disabled modules</span>
            <button
              onClick={() => setShowDisabled(!showDisabled)}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                showDisabled ? 'text-primary-600' : 'text-gray-400'
              )}
            >
              {showDisabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Highlight Path Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Highlight dependency paths</span>
            <button
              onClick={() => setHighlightPath(!highlightPath)}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative',
                highlightPath ? 'bg-primary-500' : 'bg-gray-300'
              )}
            >
              <span 
                className={cn(
                  'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                  highlightPath ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Stats */}
          <div className="pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>Total: <span className="font-medium text-gray-900">{modules.length}</span></div>
              <div>Visible: <span className="font-medium text-gray-900">{filteredModules.length}</span></div>
              <div>Enabled: <span className="font-medium text-green-600">{filteredModules.filter(m => m.enabled).length}</span></div>
              <div>Selected: <span className="font-medium text-primary-600">{selectedNodeId ? 1 : 0}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Info */}
      {selectedNodeId && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900">Module Selected</h4>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Double-click to edit configuration
          </p>
          <button
            onClick={() => navigate(`/editor/${configId}/${selectedNodeId}`)}
            className="mt-3 w-full px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Open Configuration
          </button>
        </div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={highlightedEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="#e2e8f0" 
          gap={20} 
          size={1}
        />
        <Controls className="!bg-white !border-gray-200 !shadow-md" />
        {showMiniMap && (
          <MiniMap 
            className="!bg-white !border-gray-200 !rounded-lg !shadow-md"
            nodeColor={(node) => {
              const layer = (node.data?.layer as ModuleLayer) || 'MCAL'
              return layerColors[layer] || '#94a3b8'
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        )}
      </ReactFlow>
    </div>
  )
}

// Wrap with ReactFlowProvider
export function ModuleGraph(props: ModuleGraphProps) {
  return (
    <ReactFlowProvider>
      <ModuleGraphInner {...props} />
    </ReactFlowProvider>
  )
}
