/**
 * Configuration Status Panel
 * Displays configuration statistics and progress
 * Similar to Vector Configurator's status overview
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { ConfigFile, ConfigModule } from '@/types'
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CircleDashed,
  Layers,
  Cpu,
  Settings,
  Download,
  FileText
} from 'lucide-react'

interface ConfigurationStatusPanelProps {
  config: ConfigFile
  onExportReport?: () => void
}

interface LayerStats {
  layer: string
  total: number
  configured: number
  configuring: number
  partial: number
  unconfigured: number
}

export function ConfigurationStatusPanel({ config, onExportReport }: ConfigurationStatusPanelProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = config.modules.length
    const configured = config.modules.filter(m => m.configStatus === 'configured').length
    const configuring = config.modules.filter(m => m.configStatus === 'configuring').length
    const partial = config.modules.filter(m => m.configStatus === 'partial').length
    const unconfigured = config.modules.filter(m => m.configStatus === 'unconfigured').length
    const enabled = config.modules.filter(m => m.enabled).length
    
    const progress = total > 0 ? Math.round((configured / total) * 100) : 0
    
    return { total, configured, configuring, partial, unconfigured, enabled, progress }
  }, [config.modules])

  // Calculate per-layer statistics
  const layerStats = useMemo(() => {
    const layers = ['MCAL', 'ECUAL', 'Service', 'OS']
    return layers.map(layer => {
      const modules = config.modules.filter(m => m.layer === layer)
      return {
        layer,
        total: modules.length,
        configured: modules.filter(m => m.configStatus === 'configured').length,
        configuring: modules.filter(m => m.configStatus === 'configuring').length,
        partial: modules.filter(m => m.configStatus === 'partial').length,
        unconfigured: modules.filter(m => m.configStatus === 'unconfigured').length,
      }
    }).filter(ls => ls.total > 0)
  }, [config.modules])

  // Get unconfigured modules
  const unconfiguredModules = useMemo(() => {
    return config.modules.filter(m => m.configStatus === 'unconfigured' && m.enabled)
  }, [config.modules])

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'MCAL': return <Cpu className="w-4 h-4" />
      case 'ECUAL': return <Settings className="w-4 h-4" />
      case 'Service': return <Layers className="w-4 h-4" />
      default: return <Layers className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary-600" />
          Configuration Status
        </h3>
        {onExportReport && (
          <button
            onClick={onExportReport}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
          >
            <Download className="w-3 h-3" />
            Export Report
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">{stats.progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                stats.progress === 100 ? "bg-green-500" : "bg-primary-500"
              )}
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.configured}/{stats.total} modules configured
            {stats.enabled < stats.total && ` (${stats.enabled} enabled)`}
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Configured</p>
              <p className="text-lg font-semibold text-green-700">{stats.configured}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Configuring</p>
              <p className="text-lg font-semibold text-blue-700">{stats.configuring}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-xs text-gray-600">Partial</p>
              <p className="text-lg font-semibold text-yellow-700">{stats.partial}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <CircleDashed className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Unconfigured</p>
              <p className="text-lg font-semibold text-gray-700">{stats.unconfigured}</p>
            </div>
          </div>
        </div>

        {/* Layer Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            By Layer
          </h4>
          <div className="space-y-2">
            {layerStats.map(ls => (
              <div key={ls.layer} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-20">
                  {getLayerIcon(ls.layer)}
                  <span className="text-xs font-medium text-gray-700">{ls.layer}</span>
                </div>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${ls.total > 0 ? (ls.configured / ls.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">
                  {ls.configured}/{ls.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unconfigured Modules Alert */}
        {unconfiguredModules.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  {unconfiguredModules.length} module{unconfiguredModules.length > 1 ? 's' : ''} need configuration
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {unconfiguredModules.slice(0, 5).map(m => (
                    <span 
                      key={m.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700"
                    >
                      {m.name}
                    </span>
                  ))}
                  {unconfiguredModules.length > 5 && (
                    <span className="text-xs text-amber-600">
                      +{unconfiguredModules.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(config.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

// Generate configuration report
export function generateConfigReport(config: ConfigFile): string {
  const lines: string[] = []
  
  lines.push(`# Configuration Report: ${config.name}`)
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push(`Version: ${config.version}`)
  lines.push(`Target: ${config.targetPlatform} - ${config.targetChip}`)
  lines.push('')
  
  // Summary
  const total = config.modules.length
  const configured = config.modules.filter(m => m.configStatus === 'configured').length
  const progress = Math.round((configured / total) * 100)
  
  lines.push(`## Summary`)
  lines.push(`- Total Modules: ${total}`)
  lines.push(`- Configured: ${configured} (${progress}%)`)
  lines.push(`- Configuring: ${config.modules.filter(m => m.configStatus === 'configuring').length}`)
  lines.push(`- Partial: ${config.modules.filter(m => m.configStatus === 'partial').length}`)
  lines.push(`- Unconfigured: ${config.modules.filter(m => m.configStatus === 'unconfigured').length}`)
  lines.push('')
  
  // By Layer
  lines.push(`## Configuration by Layer`)
  const layers = ['MCAL', 'ECUAL', 'Service', 'OS']
  layers.forEach(layer => {
    const modules = config.modules.filter(m => m.layer === layer)
    if (modules.length > 0) {
      lines.push(`\n### ${layer}`)
      modules.forEach(m => {
        const status = m.configStatus || 'unconfigured'
        const icon = status === 'configured' ? '✓' : status === 'configuring' ? '◐' : '○'
        lines.push(`- ${icon} ${m.name}: ${status}`)
      })
    }
  })
  
  // OS Configuration
  if (config.os) {
    lines.push(`\n## OS Configuration`)
    lines.push(`- Version: ${config.os.version}`)
    lines.push(`- Tasks: ${config.os.tasks?.length || 0}`)
    lines.push(`- Events: ${config.os.events?.length || 0}`)
    lines.push(`- Alarms: ${config.os.alarms?.length || 0}`)
  }
  
  return lines.join('\n')
}

// Export report as file
export function exportConfigReport(config: ConfigFile) {
  const report = generateConfigReport(config)
  const blob = new Blob([report], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `config-report-${config.id}-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
