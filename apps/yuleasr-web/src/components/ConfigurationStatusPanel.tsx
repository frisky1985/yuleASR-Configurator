/**
 * Configuration Status Panel
 * Displays configuration statistics and progress
 * Similar to Vector Configurator's status overview
 */

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
import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import type { ConfigFile, ConfigModule, ValidationResult } from '@/types'

interface ConfigurationStatusPanelProps {
  config: ConfigFile
  onExportReport?: () => void
  validationResult?: ValidationResult | null
}

interface LayerStats {
  layer: string
  total: number
  configured: number
  configuring: number
  partial: number
  unconfigured: number
}

export function ConfigurationStatusPanel({ config, onExportReport, validationResult }: ConfigurationStatusPanelProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const total = config.modules.length
    const enabled = config.modules.filter(m => m.enabled).length
    const configured = config.modules.filter(m => m.configStatus === 'configured').length
    
    // Calculate score based on validation issues
    let validationScore = 100
    if (validationResult) {
      const errorPenalty = validationResult.errors.length * 15
      const warningPenalty = validationResult.warnings.length * 5
      validationScore = Math.max(0, 100 - errorPenalty - warningPenalty)
    }
    
    // Composite score: 60% config + 40% validation
    const configRatio = total > 0 ? configured / total : 0
    const progress = Math.round((configRatio * 60 + (validationScore / 100) * 40))
    
    const configuring = config.modules.filter(m => m.configStatus === 'configuring').length
    const partial = config.modules.filter(m => m.configStatus === 'partial').length
    const unconfigured = config.modules.filter(m => m.configStatus === 'unconfigured').length
    return { total, enabled, configured, configuring, partial, unconfigured, progress }
  }, [config, validationResult])

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

  /** Get progress bar color based on percentage */
  const getProgressColor = (pct: number) => {
    if (pct >= 100) return 'bg-green-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-app-bg-tertiary'
  }

  /** Small horizontal progress bar */
  const MiniProgressBar = ({ value, max, className }: { value: number; max: number; className?: string }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0
    return (
      <div className={cn("w-full h-1.5 bg-app-bg-tertiary rounded-full overflow-hidden", className)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 progress-bar-animated", getProgressColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }

  return (
    <div className="bg-app-bg-primary rounded-lg border border-app-border-primary overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-app-bg-secondary border-b border-app-border-primary flex items-center justify-between">
        <h3 className="text-sm font-semibold text-app-text-primary flex items-center gap-2">
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
            <span className="text-sm text-app-text-secondary">Overall Progress</span>
            <span className="text-sm font-semibold text-app-text-primary">{stats.progress}%</span>
          </div>
          <div className="h-2.5 bg-app-bg-tertiary rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out progress-bar-animated",
                stats.progress === 100 ? "bg-green-500" : stats.progress >= 50 ? "bg-yellow-500" : "bg-primary-500"
              )}
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-xs text-app-text-secondary mt-1">
            {stats.configured}/{stats.total} modules configured
            {stats.enabled < stats.total && ` (${stats.enabled} enabled)`}
          </p>
        </div>

        {/* Status Summary with visual progress bars */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 p-2 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-app-text-secondary">Configured</span>
              </div>
              <span className="text-sm font-semibold text-green-700">{stats.configured}</span>
            </div>
            <MiniProgressBar value={stats.configured} max={stats.total} />
          </div>
          <div className="flex flex-col gap-1 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-app-text-secondary">Configuring</span>
              </div>
              <span className="text-sm font-semibold text-blue-700">{stats.configuring}</span>
            </div>
            <MiniProgressBar value={stats.configuring} max={stats.total} />
          </div>
          <div className="flex flex-col gap-1 p-2 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                <span className="text-xs font-medium text-app-text-secondary">Partial</span>
              </div>
              <span className="text-sm font-semibold text-yellow-700">{stats.partial}</span>
            </div>
            <MiniProgressBar value={stats.partial} max={stats.total} />
          </div>
          <div className="flex flex-col gap-1 p-2 bg-app-bg-secondary rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleDashed className="w-3.5 h-3.5 text-app-text-secondary" />
                <span className="text-xs font-medium text-app-text-secondary">Unconfigured</span>
              </div>
              <span className="text-sm font-semibold text-primary">{stats.unconfigured}</span>
            </div>
            <MiniProgressBar value={stats.unconfigured} max={stats.total} className="bg-app-bg-tertiary" />
          </div>
        </div>

        {/* Layer Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            By Layer
          </h4>
          <div className="space-y-2">
            {layerStats.map(ls => (
              <div key={ls.layer} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-20">
                  {getLayerIcon(ls.layer)}
                  <span className="text-xs font-medium text-primary">{ls.layer}</span>
                </div>
                <div className="flex-1 h-1.5 bg-app-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      (ls.total > 0 ? (ls.configured / ls.total) * 100 : 0) >= 100
                        ? "bg-green-500"
                        : (ls.total > 0 ? (ls.configured / ls.total) * 100 : 0) >= 50
                        ? "bg-yellow-500"
                        : "bg-primary-500"
                    )}
                    style={{ width: `${ls.total > 0 ? (ls.configured / ls.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-app-text-secondary w-12 text-right">
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
        <div className="pt-3 border-t border-app-border-primary">
          <p className="text-xs text-app-text-secondary">
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
