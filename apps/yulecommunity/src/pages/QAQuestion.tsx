import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  HelpCircle, CheckCircle2, ThumbsUp, ThumbsDown,
  MessageSquare, Eye, User, Clock, ArrowLeft,
  Loader2, Send, Edit3, Trash2
} from 'lucide-react'
import qaApi, { type QuestionDetail, type Answer } from '../services/qaApi'

export function QAQuestion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadQuestion = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const q = await qaApi.getQuestion(parseInt(id, 10))
      setQuestion(q)
    } catch (err) {
      console.error('[QAQuestion] Failed to load:', err)
      setError('无法加载问题详情')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestion()
  }, [id])

  const handleVote = async (targetType: 'question' | 'answer', targetId: number, voteType: 'up' | 'down') => {
    try {
      await qaApi.vote({ targetType, targetId, voteType })
      loadQuestion() // Refresh
    } catch (err) {
      console.error('Vote failed:', err)
    }
  }

  const handleAcceptAnswer = async (answerId: number) => {
    try {
      await qaApi.acceptAnswer(answerId)
      loadQuestion()
    } catch (err) {
      console.error('Accept failed:', err)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim() || !id) return
    setSubmitting(true)
    try {
      await qaApi.createAnswer(parseInt(id, 10), { content: answerContent.trim() })
      setAnswerContent('')
      loadQuestion()
    } catch (err) {
      console.error('Submit answer failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!question || !confirm('确定删除此问题？')) return
    try {
      await qaApi.deleteQuestion(question.id)
      navigate('/qa')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '问题不存在'}</p>
          <Link to="/qa" className="text-[hsl(var(--primary))] hover:underline">返回问答列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Helmet>
        <title>{question.title} - YuleTech 问答</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/qa" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回问答列表
        </Link>

        {/* Question */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {question.status === 'resolved' ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <HelpCircle className="w-8 h-8 text-[hsl(var(--accent))]" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{question.author.username}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(question.createdAt)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{question.viewCount}</span>
              </div>
              <div className="flex gap-2 mb-4">
                {question.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-muted rounded-full text-xs">{t}</span>
                ))}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  question.status === 'resolved' ? 'bg-green-500/10 text-green-600' :
                  question.status === 'closed' ? 'bg-gray-500/10 text-gray-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {question.status === 'resolved' ? '已解决' : question.status === 'closed' ? '已关闭' : '待解决'}
                </span>
              </div>
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap mb-4">
                {question.content}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVote('question', question.id, 'up')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[hsl(var(--accent))]"
                >
                  <ThumbsUp className="w-4 h-4" /> {question.likeCount}
                </button>
                <button
                  onClick={() => handleVote('question', question.id, 'down')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> 删除
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {question.answers?.length || 0} 个回答
          </h2>

          {(!question.answers || question.answers.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              暂无回答，来写第一个回答吧！
            </div>
          )}

          <div className="space-y-4">
            {question.answers?.map((answer) => (
              <div
                key={answer.id}
                className={`bg-card border rounded-xl p-5 ${
                  answer.isAccepted ? 'border-green-500/30 bg-green-500/5' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                    {answer.author.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{answer.author.username}</span>
                      {answer.isAccepted && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" /> 已采纳
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{formatTime(answer.createdAt)}</span>
                    </div>
                    <div className="text-sm text-foreground whitespace-pre-wrap mb-3">{answer.content}</div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVote('answer', answer.id, 'up')}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[hsl(var(--accent))]"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> {answer.likeCount}
                      </button>
                      <button
                        onClick={() => handleVote('answer', answer.id, 'down')}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      {question.status === 'open' && !answer.isAccepted && (
                        <button
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> 采纳回答
                        </button>
                      )}
                      <Link
                        to={`/qa/answer/${answer.id}/edit`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> 编辑
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Form */}
        {question.status !== 'closed' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">写回答</h3>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder={question.status === 'resolved' ? '该问题已解决，仍可继续回答' : '写下你的回答...'}
              rows={5}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 resize-none mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitAnswer}
                disabled={!answerContent.trim() || submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                提交回答
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QAQuestion
