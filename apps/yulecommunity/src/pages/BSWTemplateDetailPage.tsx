import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  Eye,
  Star,
  Layers,
  Clock,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Tag,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { bswTemplateApi } from '../services/bswTemplateApi'
import { getApiToken } from '../services/apiClient'
import type { BSWTemplate, BSWTemplateVersion } from '../types/bswTemplate'

const categoryLabels: Record<string, { label: string; color: string }> = {
  mcal: { label: 'MCAL', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  ecual: { label: 'ECUAL', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  service: { label: 'Service', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  full: { label: 'Full', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  bsw: { label: 'BSW', color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
}

const layerColors: Record<string, string> = {
  MCAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  ECUAL: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Service: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  RTE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export function BSWTemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<BSWTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllModules, setShowAllModules] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const isLoggedIn = !!getApiToken()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    bswTemplateApi.get(parseInt(id, 10))
      .then(setTemplate)
      .catch(err => setError(err.message || 'Failed to load template'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
    if (!template) return
    setDownloading(true)
    try {
      await bswTemplateApi.download(template.id)
      setTemplate(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev)

      // Navigate to yuleasr configurator with template data
      const configData = template.configData
        ? JSON.parse(template.configData)
        : {
            modules: template.modules.map(m => ({
              id: m.id,
              name: m.name,
              enabled: true,
              parameters: m.parameters || {},
            })),
          }

      // Store template data in localStorage for the configurator to pick up
      localStorage.setItem('yuleasr_import_template', JSON.stringify({
        name: template.name,
        description: template.description,
        configData,
      }))

      // Open yuleasr configurator (in new tab)
      window.open(`/configurator/?importTemplate=${template.id}`, '_blank')
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {error || 'Template not found'}
        </h2>
        <Link to="/templates-market" className="text-primary-600 hover:underline">
          Back to market
        </Link>
      </div>
    )
  }

  const catCfg = categoryLabels[template.category] || categoryLabels.bsw
  const displayModules = showAllModules ? template.modules : template.modules?.slice(0, 8)
  const versions = template.versions || []

  // Group modules by layer
  const modulesByLayer: Record<string, typeof template.modules> = {}
  for (const m of template.modules || []) {
    if (!modulesByLayer[m.layer]) modulesByLayer[m.layer] = []
    modulesByLayer[m.layer].push(m)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/templates-market"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Market
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template header */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {template.name}
                  </h1>
                  {template.isOfficial && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Official
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Tag className="w-4 h-4 text-slate-400" />
                {template.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modules Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Included Modules ({template.modules?.length || 0})
            </h2>

            {/* Grouped by layer */}
            <div className="space-y-4">
              {Object.entries(modulesByLayer).map(([layer, mods]) => (
                <div key={layer}>
                  <h4 className={`inline-block px-2.5 py-1 rounded text-xs font-semibold mb-2 ${layerColors[layer] || 'bg-slate-100 text-slate-700'}`}>
                    {layer}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(showAllModules ? mods : mods.slice(0, 4)).map((mod: any) => (
                      <div
                        key={mod.id}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                          {mod.name}
                        </span>
                      </div>
                    ))}
                    {!showAllModules && mods.length > 4 && (
                      <button
                        onClick={() => setShowAllModules(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 col-span-full mt-1"
                      >
                        +{mods.length - 4} more in {layer}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(template.modules?.length || 0) > 8 && !showAllModules && (
              <button
                onClick={() => setShowAllModules(true)}
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Show all {template.modules.length} modules
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            {showAllModules && (template.modules?.length || 0) > 8 && (
              <button
                onClick={() => setShowAllModules(false)}
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Show less
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Version History */}
          {versions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Version History
              </h2>
              <div className="space-y-3">
                {versions.map((v: BSWTemplateVersion) => (
                  <div
                    key={v.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                        v{v.version}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                          {v.name || `Version ${v.version}`}
                        </span>
                        {v.version === template.version && (
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded dark:bg-green-900/30 dark:text-green-300">
                            Latest
                          </span>
                        )}
                      </div>
                      {v.changelog && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {v.changelog}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Download className="w-5 h-5 mx-auto text-primary-600 mb-1" />
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {template.downloadCount}
                </div>
                <div className="text-xs text-slate-500">Downloads</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Eye className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {template.viewCount}
                </div>
                <div className="text-xs text-slate-500">Views</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Star className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {template.rating || 0}
                </div>
                <div className="text-xs text-slate-500">Rating</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <BarChart3 className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  v{template.version}
                </div>
                <div className="text-xs text-slate-500">Version</div>
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Category</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${catCfg.color}`}>
                  {catCfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Modules</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {template.modules?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tier</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  template.minTier === 'pro'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {template.minTier === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Visibility</span>
                <span className="capitalize text-slate-700 dark:text-slate-300">
                  {template.visibility}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {template.author?.username || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
          >
            {downloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {downloading ? 'Importing...' : 'Use This Template'}
          </button>

          {!isLoggedIn && (
            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> to download and import templates
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
