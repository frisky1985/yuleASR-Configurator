import { Link } from 'react-router-dom'
import {
  Cpu,
  Wifi,
  Database,
  Layers,
  Download,
  Eye,
  Star,
  CheckCircle2,
} from 'lucide-react'
import type { BSWTemplate } from '../types/bswTemplate'

interface Props {
  template: BSWTemplate
  onUse?: (template: BSWTemplate) => void
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  mcal: {
    icon: <Cpu className="w-5 h-5" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'MCAL',
  },
  ecual: {
    icon: <Wifi className="w-5 h-5" />,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'ECUAL',
  },
  service: {
    icon: <Database className="w-5 h-5" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    label: 'Service',
  },
  full: {
    icon: <Layers className="w-5 h-5" />,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Full',
  },
  bsw: {
    icon: <Layers className="w-5 h-5" />,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    label: 'BSW',
  },
}

export function BSWTemplateCard({ template, onUse }: Props) {
  const cfg = categoryConfig[template.category] || categoryConfig.bsw
  const moduleCount = template.modules?.length || 0

  return (
    <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all overflow-hidden">
      {/* Top color bar */}
      <div className={`h-2 ${cfg.bg.replace('50', '200')}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center ${cfg.color}`}>
            {cfg.icon}
          </div>
          <div className="flex items-center gap-1.5">
            {template.isOfficial && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100">
                <CheckCircle2 className="w-3 h-3" />
                Official
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <Link to={`/templates-market/${template.id}`} className="block">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {template.name}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {moduleCount} modules
          </span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            {template.downloadCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {template.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {template.rating || 0}
          </span>
          <span className="ml-auto text-slate-400 dark:text-slate-500">
            v{template.version}
          </span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
            {template.author?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {template.author?.username || 'Unknown'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/templates-market/${template.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Details
          </Link>
          {onUse && (
            <button
              onClick={() => onUse(template)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Use
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
