import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { bswTemplateApi } from '../services/bswTemplateApi'
import { getApiToken } from '../services/apiClient'
import type { TemplateCategory } from '../types/bswTemplate'

const categories: { value: TemplateCategory; label: string }[] = [
  { value: 'mcal', label: 'MCAL' },
  { value: 'ecual', label: 'ECUAL' },
  { value: 'service', label: 'Service' },
  { value: 'full', label: 'Full' },
  { value: 'bsw', label: 'BSW' },
]

export function BSWTemplateUploadPage() {
  const navigate = useNavigate()
  const isLoggedIn = !!getApiToken()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TemplateCategory>('mcal')
  const [tagsStr, setTagsStr] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [minTier, setMinTier] = useState<'free' | 'pro'>('free')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !description.trim()) {
      setError('Name and description are required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const tags = tagsStr
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const result = await bswTemplateApi.create({
        name: name.trim(),
        description: description.trim(),
        category,
        tags,
        isPublic,
        minTier,
      })

      setSuccess(true)
      setTimeout(() => {
        navigate(`/templates-market/${result.id}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create template')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Sign in required
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          You need to sign in and have a Pro license to upload templates.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Template Created!
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Redirecting to template detail...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/templates-market"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Market
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Upload Template
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Share your BSW configuration with the community
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. CAN Communication Stack"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what this template includes..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
              rows={4}
              maxLength={2000}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    category === cat.value
                      ? 'bg-primary-50 text-primary-700 border-primary-300 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={e => setTagsStr(e.target.value)}
              placeholder="e.g. MCAL, CAN, communication"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            />
          </div>

          {/* Visibility & Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Visibility
              </label>
              <select
                value={isPublic ? 'public' : 'private'}
                onChange={e => setIsPublic(e.target.value === 'public')}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Tier
              </label>
              <select
                value={minTier}
                onChange={e => setMinTier(e.target.value as 'free' | 'pro')}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="free">Free</option>
                <option value="pro">Pro Only</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {submitting ? 'Publishing...' : 'Publish Template'}
            </button>
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
              Pro license required to publish templates. Templates are published as draft and reviewed by admins.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
