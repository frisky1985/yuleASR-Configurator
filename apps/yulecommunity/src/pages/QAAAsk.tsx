import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Send, Loader2, X } from 'lucide-react'
import qaApi from '../services/qaApi'

const SUGGESTED_TAGS = ['MCAL', 'ECUAL', 'Service', 'CAN', 'DIO', 'ADC', 'SPI', 'OS', 'RTE', 'Fls', 'MemIf', 'E2E', 'XCP']

export function QAAAsk() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addTag = (t: string) => {
    if (!tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
    }
  }

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const t = tagInput.trim().replace(/,/g, '')
      if (t && !tags.includes(t) && tags.length < 5) {
        setTags([...tags, t])
      }
      setTagInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const question = await qaApi.createQuestion({
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : ['求助'],
      })
      navigate(`/qa/${question.id}`)
    } catch (err) {
      console.error('[QAAAsk] Failed to create question:', err)
      setError('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Helmet>
        <title>提问 - YuleTech 问答</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/qa" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回问答列表
        </Link>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-6">提出问题</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1.5">问题标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：ADC 模块在 DMA 模式下如何配置？"
                maxLength={200}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1.5">问题描述</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="详细描述你的问题，包括你已经尝试过的方法、相关错误信息等..."
                rows={8}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-y"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1.5">标签（最多5个）</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] rounded-full text-xs font-medium">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="输入标签后按 Enter 添加"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTag(t)}
                    className="px-2 py-0.5 bg-muted hover:bg-muted/80 rounded text-[11px] text-muted-foreground transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                发布问题
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QAAAsk
