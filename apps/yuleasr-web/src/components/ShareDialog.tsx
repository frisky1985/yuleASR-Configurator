/**
 * Share Dialog — Modal for sharing configurations
 *
 * Three share options in card layout:
 * 1. Share to Community (auth-gated)
 * 2. Download to Local
 * 3. Copy Share Link
 */

import {
  X,
  Globe,
  Download,
  Link,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogIn,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import type { ConfigFile } from '@/types/config'

// ── Props ──

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  config: ConfigFile
}

// ── Auto-tag generation ──

/** Generate suggested tags from config metadata */
function generateTags(config: ConfigFile): string[] {
  const tags: string[] = []

  // Add module layer tags
  const layers = new Set(config.modules.map((m) => m.layer))
  layers.forEach((layer) => {
    if (layer) tags.push(layer)
  })

  // Add platform/compiler tags if available
  if (config.targetPlatform) tags.push(config.targetPlatform)
  if (config.targetChip) tags.push(config.targetChip)
  if (config.compiler) tags.push(config.compiler)

  // Add module name tags (first 3 max)
  const moduleNames = [...new Set(config.modules.map((m) => m.name))].slice(0, 3)
  moduleNames.forEach((name) => tags.push(name))

  // Ensure unique, lowercase
  return [...new Set(tags.map((t) => t.toLowerCase()))]
}

// ── Component ──

export function ShareDialog({ isOpen, onClose, config }: ShareDialogProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // ── Community publish state ──
  const [postContent, setPostContent] = useState('')
  const [publishState, setPublishState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null)

  // ── Share link state ──
  const [linkState, setLinkState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)

  // ── Reset on open or config change ──
  useEffect(() => {
    if (isOpen) {
      setPostContent('')
      setPublishState('idle')
      setPublishError(null)
      setPublishedPostId(null)
      setLinkState('idle')
      setShareUrl(null)
      setLinkError(null)
    }
  }, [isOpen, config.id])

  // ── Download handler (same logic as Editor handleExport) ──
  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.name.replace(/\s+/g, '_')}.yuleasr.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [config])

  // ── Publish to community ──
  const handlePublish = useCallback(async () => {
    if (!isAuthenticated) return

    setPublishState('loading')
    setPublishError(null)

    try {
      const body = {
        title: config.name,
        content: postContent || `分享配置「${config.name}」的配置方案，欢迎讨论和反馈。`,
        tags: generateTags(config),
        configId: Number(config.id),
        status: 'published' as const,
      }
      const result = await api.post<{ id: string; slug?: string }>('/api/posts', body)
      setPublishedPostId(result.id)
      setPublishState('success')
    } catch (err) {
      setPublishState('error')
      setPublishError(
        err instanceof Error ? err.message : '发布失败，请重试',
      )
    }
  }, [isAuthenticated, config, postContent])

  // ── Generate / copy share link ──
  const handleCopyLink = useCallback(async () => {
    setLinkState('loading')
    setLinkError(null)

    try {
      // If config already has a shareToken (stored elsewhere), we'd use it.
      // Otherwise generate one via the API.
      let token: string

      // Try generating share token via API
      const result = await api.put<{ shareToken: string }>(
        `/api/configs/${config.id}/share`,
      )
      token = result.shareToken

      // Build the share URL
      const baseUrl = window.location.origin
      const url = `${baseUrl}/config/${config.id}?share=${token}`
      setShareUrl(url)

      // Copy to clipboard
      await navigator.clipboard.writeText(url)
      setLinkState('copied')
    } catch (err) {
      setLinkState('error')
      setLinkError(
        err instanceof Error ? err.message : '生成分享链接失败，请重试',
      )
    }
  }, [config.id])

  // ── Navigate to community ──
  const handleGoToCommunity = useCallback(() => {
    navigate(`/community/post/${publishedPostId}`)
    onClose()
  }, [navigate, publishedPostId, onClose])

  // ── Escape key handler ──
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-app-bg-primary rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border-primary shrink-0">
          <h2 className="text-lg font-semibold text-app-text-primary">
            分享配置
          </h2>
          <button
            onClick={onClose}
            className="text-app-text-tertiary hover:text-app-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body: three cards ── */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* ────────────────────────────────── */}
          {/* Option 1: Share to Community       */}
          {/* ────────────────────────────────── */}
          <div
            className={cn(
              'border rounded-xl p-5 transition-all duration-200',
              'border-app-border-primary bg-app-bg-primary',
              'hover:border-primary-300 hover:shadow-sm',
            )}
          >
            {!isAuthenticated ? (
              /* Not authenticated state */
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-app-bg-tertiary shrink-0">
                  <Globe className="w-5 h-5 text-app-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-app-text-primary">
                    分享到社区
                  </h3>
                  <p className="text-sm text-app-text-secondary mt-1">
                    登录后即可将配置发布到社区，与其他人讨论和分享反馈
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    登录后发布
                  </button>
                </div>
              </div>
            ) : publishState === 'success' ? (
              /* Success state */
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-green-100 shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-green-700">
                    发布成功 🎉
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    配置「{config.name}」已成功分享到社区
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={handleGoToCommunity}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      查看帖子
                    </button>
                    <button
                      onClick={() => setPublishState('idle')}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
                    >
                      重新发布
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Authenticated, idle/loading/error state */
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-app-bg-tertiary shrink-0">
                  <Globe className="w-5 h-5 text-app-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-app-text-primary">
                    分享到社区
                  </h3>
                  <p className="text-sm text-app-text-secondary mt-1">
                    发布到 yuleCommunity 进行讨论和反馈
                  </p>

                  {/* Preview fields */}
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-app-text-secondary mb-1">
                        标题
                      </label>
                      <div className="px-3 py-2 text-sm bg-app-bg-tertiary border border-app-border-primary rounded-lg text-app-text-primary">
                        {config.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-app-text-secondary mb-1">
                        标签
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {generateTags(config).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-app-text-secondary mb-1">
                        帖子内容
                      </label>
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder={`分享配置「${config.name}」的配置方案，欢迎讨论和反馈。`}
                        rows={3}
                        className={cn(
                          'w-full px-3 py-2 text-sm rounded-lg border transition-colors resize-none',
                          'bg-app-bg-primary border-app-border-primary text-app-text-primary',
                          'placeholder:text-app-text-tertiary',
                          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                        )}
                      />
                    </div>
                  </div>

                  {/* Error state */}
                  {publishState === 'error' && publishError && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-red-700">{publishError}</span>
                    </div>
                  )}

                  {/* Publish button */}
                  <button
                    onClick={handlePublish}
                    disabled={publishState === 'loading'}
                    className={cn(
                      'mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      publishState === 'loading'
                        ? 'bg-primary-400 text-white cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]',
                    )}
                  >
                    {publishState === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        发布中...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        发布到社区 →
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ────────────────────────────────── */}
          {/* Option 2: Share to Gallery         */}
          {/* ────────────────────────────────── */}
          <div
            className={cn(
              'border rounded-xl p-5 transition-all duration-200',
              'border-app-border-primary bg-app-bg-primary',
              'hover:border-primary-300 hover:shadow-sm',
            )}
          >
            {!isAuthenticated ? (
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-app-bg-tertiary shrink-0">
                  <Globe className="w-5 h-5 text-app-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-app-text-primary">
                    分享到 Gallery
                  </h3>
                  <p className="text-sm text-app-text-secondary mt-1">
                    登录后即可将配置分享到 Gallery，展示给所有 yuleASR 用户
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    登录后分享
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-app-bg-tertiary shrink-0">
                  <Globe className="w-5 h-5 text-app-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-app-text-primary">
                    分享到 Gallery
                  </h3>
                  <p className="text-sm text-app-text-secondary mt-1">
                    将配置分享到社区 Gallery，展示给所有 yuleASR 用户
                  </p>
                  <button
                    onClick={async () => {
                      setPublishState('loading')
                      try {
                        const tags = generateTags(config)
                        const modules = config.modules.map(m => ({
                          id: m.id || m.name,
                          name: m.name,
                          layer: m.layer || 'General',
                          parameters: m.parameters || {},
                        }))
                        await api.post('/api/shared-configs', {
                          name: config.name,
                          description: postContent || `分享配置「${config.name}」`,
                          mcuType: config.targetPlatform || config.targetChip || undefined,
                          modules,
                          configData: config,
                          tags,
                        })
                        setPublishState('success')
                      } catch (err) {
                        setPublishState('error')
                        setPublishError(
                          err instanceof Error ? err.message : '分享失败，请重试',
                        )
                      }
                    }}
                    disabled={publishState === 'loading'}
                    className={cn(
                      'mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      publishState === 'loading'
                        ? 'bg-primary-400 text-white cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]',
                    )}
                  >
                    {publishState === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        分享中...
                      </>
                    ) : publishState === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        已分享 ✓
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        分享到 Gallery →
                      </>
                    )}
                  </button>

                  {publishState === 'error' && publishError && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-red-700">{publishError}</span>
                    </div>
                  )}

                  {publishState === 'success' && (
                    <button
                      onClick={() => {
                        window.open(`/community/#/gallery`, '_blank')
                        onClose()
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      查看 Gallery
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ────────────────────────────────── */}
          {/* Option 3: Download to Local        */}
          {/* ────────────────────────────────── */}
          <div
            className={cn(
              'border rounded-xl p-5 transition-all duration-200',
              'border-app-border-primary bg-app-bg-primary',
              'hover:border-primary-300 hover:shadow-sm',
            )}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-app-bg-tertiary shrink-0">
                <Download className="w-5 h-5 text-app-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-app-text-primary">
                  下载到本地
                </h3>
                <p className="text-sm text-app-text-secondary mt-1">
                  保存为 .yuleasr.json 文件，用于离线使用或导入到其他设备
                </p>
                <button
                  onClick={handleDownload}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary hover:border-primary-300 transition-all duration-200 active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  下载 ↓
                </button>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────── */}
          {/* Option 3: Copy Share Link          */}
          {/* ────────────────────────────────── */}
          <div
            className={cn(
              'border rounded-xl p-5 transition-all duration-200',
              'border-app-border-primary bg-app-bg-primary',
              'hover:border-primary-300 hover:shadow-sm',
            )}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-app-bg-tertiary shrink-0">
                <Link className="w-5 h-5 text-app-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-app-text-primary">
                  复制分享链接
                </h3>
                <p className="text-sm text-app-text-secondary mt-1">
                  生成一个公开只读链接，任何人都可以无需登录查看此配置
                </p>

                {/* Share URL display */}
                {shareUrl && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 text-xs bg-app-bg-tertiary border border-app-border-primary rounded-lg text-app-text-secondary truncate font-mono">
                      {shareUrl}
                    </div>
                    {linkState === 'copied' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        已复制
                      </span>
                    )}
                  </div>
                )}

                {/* Error state */}
                {linkState === 'error' && linkError && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-red-700">{linkError}</span>
                  </div>
                )}

                {/* Copy button */}
                <button
                  onClick={handleCopyLink}
                  disabled={linkState === 'loading'}
                  className={cn(
                    'mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    linkState === 'copied'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : linkState === 'loading'
                        ? 'bg-app-bg-tertiary text-app-text-tertiary cursor-not-allowed border border-app-border-primary'
                        : 'text-app-text-primary bg-app-bg-primary border border-app-border-primary hover:bg-app-bg-secondary hover:border-primary-300 active:scale-[0.98]',
                  )}
                >
                  {linkState === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成中...
                    </>
                  ) : linkState === 'copied' ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制链接
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end px-6 py-4 border-t border-app-border-primary shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-app-text-primary bg-app-bg-primary border border-app-border-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareDialog
