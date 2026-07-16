import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import qaApi, { type Answer } from '../services/qaApi'

export function QAEditAnswer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    // We need the answer data; fetch the parent question and find the answer
    setLoading(false)
    // API doesn't have a direct GET /answers/:id endpoint, so we redirect to question
    // In practice the user would come from the question page
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !id) return
    setSubmitting(true)
    setError(null)
    try {
      await qaApi.updateAnswer(parseInt(id, 10), { content: content.trim() })
      navigate(-1)
    } catch (err) {
      console.error('[QAEditAnswer] Failed to update:', err)
      setError('更新失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Helmet>
        <title>编辑回答 - YuleTech 问答</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/qa" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回问答列表
        </Link>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-6">编辑回答</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">回答内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="编辑你的回答..."
                  rows={10}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-y"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存修改
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default QAEditAnswer
