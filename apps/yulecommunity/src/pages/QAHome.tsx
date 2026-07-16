import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  HelpCircle, CheckCircle2, MessageSquare, Eye,
  ThumbsUp, Plus, Search, Filter, Loader2, User, Clock, ChevronRight
} from 'lucide-react'
import qaApi, { type Question, type PaginatedQuestions } from '../services/qaApi'

const sortOptions = [
  { label: '最新提问', value: 'newest' },
  { label: '最多浏览', value: 'views' },
  { label: '最多点赞', value: 'likes' },
  { label: '最多回答', value: 'answers' },
]

const statusFilters = [
  { label: '全部', value: '' },
  { label: '未解决', value: 'open' },
  { label: '已解决', value: 'resolved' },
  { label: '已关闭', value: 'closed' },
]

const POPULAR_TAGS = ['MCAL', 'ECUAL', 'Service', 'CAN', 'DIO', 'ADC', 'SPI', 'OS', 'RTE']

export function QAHome() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const search = searchParams.get('search') || ''
  const tag = searchParams.get('tag') || ''
  const status = searchParams.get('status') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [searchInput, setSearchInput] = useState(search)

  const loadQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const result: PaginatedQuestions = await qaApi.getQuestions({
        page, pageSize: 20, search: search || undefined,
        tag: tag || undefined, status: status || undefined,
        sort: sort || undefined,
      })
      setQuestions(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.error('[QAHome] Failed to load questions:', err)
      setError('无法加载问题列表')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [page, search, tag, status, sort])

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v) newParams.set(k, v)
      else newParams.delete(k)
    })
    if (updates.page === undefined && !updates.page) newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput, page: '1' })
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    return d.toLocaleDateString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Helmet>
        <title>技术问答 - YuleTech | AutoSAR 问答社区</title>
        <meta name="description" content="AutoSAR 技术问答社区，解决 MCAL、ECUAL、Service 层开发中的具体技术难题。" />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-br from-muted/50 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">技术问答</h1>
              <p className="text-muted-foreground">提问、回答、共建 AutoSAR 知识库</p>
            </div>
            <Link
              to="/qa/ask"
              className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors px-5 py-2.5 rounded-lg font-medium self-start"
            >
              <Plus className="w-4 h-4" />
              我要提问
            </Link>
          </div>

          {/* Search & Sort */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索问题..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
              />
            </form>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filters */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => updateParams({ status: f.value, page: '1' })}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === f.value
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 flex-wrap">
          {POPULAR_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => updateParams({ tag: tag === t ? '' : t, page: '1' })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                tag === t
                  ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <div className="text-center py-16">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无问题</h3>
            <p className="text-muted-foreground mb-4">还没有人提问，来发布第一个问题吧！</p>
            <Link to="/qa/ask" className="text-[hsl(var(--primary))] hover:underline font-medium">
              我要提问 →
            </Link>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {questions.map((q) => (
              <Link
                key={q.id}
                to={`/qa/${q.id}`}
                className="block bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {q.status === 'resolved' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : q.status === 'closed' ? (
                      <CheckCircle2 className="w-6 h-6 text-gray-400" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-[hsl(var(--accent))]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{q.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{q.content}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {q.author.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(q.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {q.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {q.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {q.answerCount} 回答
                      </span>
                      <div className="flex gap-1 ml-auto">
                        {q.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-[10px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="px-3 py-1.5 bg-muted rounded-lg text-sm disabled:opacity-40"
            >
              上一页
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="px-3 py-1.5 bg-muted rounded-lg text-sm disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QAHome
