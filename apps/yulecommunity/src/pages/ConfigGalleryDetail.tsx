import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  Eye,
  Clock,
  User,
  Tag,
  Cpu,
  Layers,
  Loader2,
  Download,
  Share2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Code2,
  Check,
  Copy,
} from 'lucide-react'
import { sharedConfigApi } from '../services/sharedConfigApi'
import { getApiToken } from '../services/apiClient'
import type { SharedConfig } from '../types/bswTemplate'

export function ConfigGalleryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [config, setConfig] = useState<SharedConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllModules, setShowAllModules] = useState(false)
  const [liking, setLiking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [importing, setImporting] = useState(false)
  const isLoggedIn = !!getApiToken()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    sharedConfigApi.get(parseInt(id, 10))
      .then(setConfig)
      .catch(err => setError(err.message || 'Failed to load config'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!config || !isLoggedIn) return
    setLiking(true)
    try {
      const result = await sharedConfigApi.like(config.id)
      setConfig(prev => prev ? { ...prev, likeCount: result.likeCount } : prev)
    } catch (err) {
      console.error('Like failed:', err)
    } finally {
      setLiking(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = () => {
    if (!config) return
    setImporting(true)

    // Store config data in localStorage for the configurator to pick up
    localStorage.setItem('yuleasr_import_template', JSON.stringify({
      name: config.name,
      description: config.description,
      configData: config.configData || { modules: config.modules },
    }))

    // Open yuleasr configurator
    window.open(`/configurator/?importGallery=${config.id}`, '_blank')
    setImporting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {error || 'Config not found'}
        </h2>
        <Link to="/gallery" className="text-primary-600 hover:underline">
          Back to Gallery
        </Link>
      </div>
    )
  }

  const displayModules = showAllModules ? config.modules : config.modules?.slice(0, 10)
  const modulesByLayer: Record<string, any[]> = {}
  for (const m of config.modules || []) {
    const layer = m.layer || 'General'
    if (!modulesByLayer[layer]) modulesByLayer[layer] = []
    modulesByLayer[layer].push(m)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/gallery"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {config.name}
            </h1>
            {config.description && (
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {config.description}
              </p>
            )}

            {/* Tags */}
            {config.tags && config.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                {config.tags.map((tag) => (
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
              Included Modules ({(config.modules || []).length})
            </h2>

            <div className="space-y-4">
              {Object.entries(modulesByLayer).map(([layer, mods]) => (
                <div key={layer}>
                  <h4 className="inline-block px-2.5 py-1 rounded text-xs font-semibold mb-2 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {layer}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(showAllModules ? mods : mods.slice(0, 4)).map((mod: any) => (
                      <div
                        key={mod.id || mod.name}
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

            {(config.modules?.length || 0) > 10 && !showAllModules && (
              <button
                onClick={() => setShowAllModules(true)}
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Show all {config.modules.length} modules
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            {showAllModules && (config.modules?.length || 0) > 10 && (
              <button
                onClick={() => setShowAllModules(false)}
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Show less
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Config Data Preview */}
          {config.configData && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Configuration Parameters
              </h2>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                  {JSON.stringify(config.configData, null, 2)}
                </pre>
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
                <Heart className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {config.likeCount}
                </div>
                <div className="text-xs text-slate-500">Likes</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Eye className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {config.viewCount}
                </div>
                <div className="text-xs text-slate-500">Views</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Layers className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {(config.modules || []).length}
                </div>
                <div className="text-xs text-slate-500">Modules</div>
              </div>
              {config.mcuType && (
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <Cpu className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {config.mcuType}
                  </div>
                  <div className="text-xs text-slate-500">MCU</div>
                </div>
              )}
            </div>
          </div>

          {/* Author info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Author
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                {config.author?.avatar ? (
                  <img src={config.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  config.author?.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {config.author?.username || 'Anonymous'}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(config.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={liking || !isLoggedIn}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
            >
              {liking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${config.likeCount > 0 ? 'fill-red-500' : ''}`} />
              )}
              Like ({config.likeCount})
            </button>

            {/* Import button */}
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
            >
              {importing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {importing ? 'Importing...' : 'Import to Editor'}
            </button>

            {/* Copy link button */}
            <button
              onClick={handleCopyLink}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          {!isLoggedIn && (
            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> to like and import configs
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigGalleryDetail
