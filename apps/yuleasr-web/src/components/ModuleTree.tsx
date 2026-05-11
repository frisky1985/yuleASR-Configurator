import { cn } from '@/lib/utils'
import type { ModuleConfig } from '@/types'
import { Cpu, Settings, Layers, Box } from 'lucide-react'

interface ModuleTreeProps {
  modules: ModuleConfig[]
  selectedModuleId: string | null
  onSelectModule: (moduleId: string) => void
}

const layerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MCAL: Cpu,
  ECUAL: Settings,
  Service: Layers,
  ASW: Box,
}

const layerColors: Record<string, string> = {
  MCAL: 'bg-blue-50 text-blue-700 border-blue-200',
  ECUAL: 'bg-green-50 text-green-700 border-green-200',
  Service: 'bg-purple-50 text-purple-700 border-purple-200',
  RTE: 'bg-orange-50 text-orange-700 border-orange-200',
  ASW: 'bg-pink-50 text-pink-700 border-pink-200',
}

export function ModuleTree({ modules, selectedModuleId, onSelectModule }: ModuleTreeProps) {
  // Group modules by layer
  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.layer]) {
      acc[module.layer] = []
    }
    acc[module.layer].push(module)
    return acc
  }, {} as Record<string, ModuleConfig[]>)

  const layerOrder = ['MCAL', 'ECUAL', 'Service', 'RTE', 'ASW']

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Modules</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {layerOrder.map((layer) => {
          const layerModules = groupedModules[layer]
          if (!layerModules || layerModules.length === 0) return null

          const Icon = layerIcons[layer] || Settings
          const colorClass = layerColors[layer] || 'bg-gray-50 text-gray-700'

          return (
            <div key={layer} className="py-2">
              <div className={cn('px-3 py-2 mx-2 rounded-md flex items-center gap-2', colorClass)}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{layer}</span>
                <span className="text-xs opacity-70">({layerModules.length})</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {layerModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => onSelectModule(module.id)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50',
                      selectedModuleId === module.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{module.name}</span>
                      <span className="text-xs text-gray-400">{module.version}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
