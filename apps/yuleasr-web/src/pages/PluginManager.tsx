import { useState, useEffect, useCallback } from 'react'
import {
  Puzzle,
  Settings,
  Power,
  PowerOff,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  RefreshCw,
  Loader2,
  FileJson,
  User,
  Tag,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import {
  fetchPlugins,
  fetchPlugin,
  updatePluginConfig,
  togglePlugin,
} from '@/services/pluginService'
import type { PluginMeta, PluginType } from '@/types/plugin'

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<PluginType, string> = {
  'code-generator': '代码生成器',
  validator: '校验器',
  'ui-extension': 'UI 扩展',
  'data-export': '数据导出',
}

const TYPE_COLORS: Record<PluginType, string> = {
  'code-generator': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  validator: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'ui-extension': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'data-export': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

function PluginTypeBadge({ type }: { type: PluginType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        TYPE_COLORS[type],
      )}
    >
      <Package className="w-3 h-3" />
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function StatusIndicator({ enabled, error }: { enabled: boolean; error?: string | null }) {
  if (error) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
        <AlertCircle className="w-3.5 h-3.5" />
        错误
      </span>
    )
  }
  if (enabled) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        已激活
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Clock className="w-3.5 h-3.5" />
      已停用
    </span>
  )
}

// ── PluginCard ───────────────────────────────────────────────────────────────

interface PluginCardProps {
  plugin: PluginMeta
  expanded: boolean
  saving: boolean
  onToggle: () => void
  onExpand: () => void
  onSaveConfig: (config: Record<string, unknown>) => void
}

function PluginCard({ plugin, expanded, saving, onToggle, onExpand, onSaveConfig }: PluginCardProps) {
  const [configText, setConfigText] = useState(() =>
    JSON.stringify(plugin.config ?? {}, null, 2),
  )

  // Reset editor text when expanding with fresh data
  useEffect(() => {
    if (expanded) {
      setConfigText(JSON.stringify(plugin.config ?? {}, null, 2))
    }
  }, [expanded, plugin.config])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(configText)
      onSaveConfig(parsed)
    } catch {
      // Invalid JSON — highlight handled by className but we just silently fail
      return
    }
  }

  const isJsonValid = (() => {
    try {
      JSON.parse(configText)
      return true
    } catch {
      return false
    }
  })()

  return (
    <div className="bg-app-bg-primary border border-app-border-primary rounded-lg overflow-hidden transition-shadow hover:shadow-sm">
      {/* Card header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: icon + info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 mt-0.5 shrink-0 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {plugin.name}
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  v{plugin.version}
                </span>
                <PluginTypeBadge type={plugin.type} />
                {plugin.source === 'internal' && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    内置
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {plugin.description}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {plugin.author}
                </span>
                {plugin.installedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(plugin.installedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: toggle + expand */}
          <div className="flex items-center gap-2 shrink-0">
            <StatusIndicator
              enabled={plugin.enabled}
              error={null}
            />

            {/* Toggle switch */}
            <button
              onClick={onToggle}
              disabled={saving}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                plugin.enabled
                  ? 'bg-primary-600'
                  : 'bg-gray-200 dark:bg-gray-700',
                saving && 'opacity-50 cursor-not-allowed',
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                  plugin.enabled ? 'translate-x-6' : 'translate-x-1',
                )}
              >
                {plugin.enabled ? (
                  <Power className="w-2.5 h-2.5 text-primary-600" />
                ) : (
                  <PowerOff className="w-2.5 h-2.5 text-gray-400" />
                )}
              </span>
            </button>

            {/* Expand config button */}
            <button
              onClick={onExpand}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="配置编辑"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded: Config editor */}
      {expanded && (
        <div className="border-t border-app-border-primary px-5 py-4 bg-app-bg-secondary/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              插件配置 (JSON)
            </h4>
            <button
              onClick={handleSave}
              disabled={saving || !isJsonValid}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                isJsonValid && !saving
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              保存配置
            </button>
          </div>
          <textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            className={cn(
              'w-full h-40 px-3 py-2 text-xs font-mono rounded-md border transition-colors resize-y',
              'bg-app-bg-primary border-app-border-primary text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              !isJsonValid && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            )}
            spellCheck={false}
          />
          {!isJsonValid && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              JSON 格式无效，请检查语法
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function PluginManager() {
  const [plugins, setPlugins] = useState<PluginMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadPlugins = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPlugins()
      setPlugins(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载插件列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlugins()
  }, [loadPlugins])

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    setSavingId(id)
    try {
      const result = await togglePlugin(id, !currentEnabled)
      setPlugins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, enabled: result.enabled } : p)),
      )
    } catch (err) {
      console.error('Failed to toggle plugin:', err)
    } finally {
      setSavingId(null)
    }
  }

  const handleSaveConfig = async (id: string, config: Record<string, unknown>) => {
    setSavingId(id)
    try {
      await updatePluginConfig(id, config)
      // Refresh the plugin data to get the latest config from server
      const updated = await fetchPlugin(id)
      setPlugins((prev) =>
        prev.map((p) => (p.id === id ? updated : p)),
      )
    } catch (err) {
      console.error('Failed to save plugin config:', err)
    } finally {
      setSavingId(null)
    }
  }

  const filteredPlugins = plugins.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    )
  })

  const enabledCount = plugins.filter((p) => p.enabled).length

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-muted-foreground">加载插件列表...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={loadPlugins}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Puzzle className="w-6 h-6" />
            插件管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理已安装的插件 ·{' '}
            <span className="font-medium text-foreground">{enabledCount}</span>/
            {plugins.length} 个已启用
          </p>
        </div>

        <button
          onClick={loadPlugins}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="刷新"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <FileJson className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索插件名称、描述、作者..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-app-border-primary bg-app-bg-primary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
      </div>

      {/* ── Plugin List ── */}
      {filteredPlugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Puzzle className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">
            {plugins.length === 0
              ? '暂无已安装的插件'
              : '没有匹配的插件'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              expanded={expandedId === plugin.id}
              saving={savingId === plugin.id}
              onToggle={() => handleToggle(plugin.id, plugin.enabled)}
              onExpand={() =>
                setExpandedId(expandedId === plugin.id ? null : plugin.id)
              }
              onSaveConfig={(config) => handleSaveConfig(plugin.id, config)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PluginManager
