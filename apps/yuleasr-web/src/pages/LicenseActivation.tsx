import {
  Crown,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Check,
  X,
  Zap,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLicenseStore, FEATURES } from '@/stores/licenseStore'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import { cn } from '@/lib/utils'

function SettingSection({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-app-bg-primary border border-app-border-primary rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-app-border-primary bg-app-bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-app-text-primary">{title}</h2>
            {description && (
              <p className="text-sm text-app-text-secondary">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  )
}

export function LicenseActivation() {
  const {
    tier,
    expiresAt,
    licenseKey,
    loading,
    error,
    loadFromServer,
    activateLicense,
  } = useLicenseStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  const [activationKey, setActivationKey] = useState('')
  const [activationError, setActivationError] = useState<string | null>(null)
  const [activationLoading, setActivationLoading] = useState(false)
  const [activationSuccess, setActivationSuccess] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutMockResult, setCheckoutMockResult] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadFromServer()
    }
  }, [isAuthenticated, loadFromServer])

  const isPro = tier === 'pro'
  const isExpired = expiresAt && new Date(expiresAt) < new Date()
  const daysLeft = expiresAt
    ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const handleActivate = async () => {
    if (!activationKey.trim()) return
    setActivationLoading(true)
    setActivationError(null)
    setActivationSuccess(false)

    try {
      await activateLicense(activationKey.trim())
      setActivationSuccess(true)
      setActivationKey('')
    } catch (err: any) {
      setActivationError(err?.message || '激活失败，请检查 License Key')
    } finally {
      setActivationLoading(false)
    }
  }

  const handleMockCheckout = async (priceId: 'pro_monthly' | 'pro_yearly') => {
    if (!isAuthenticated) {
      setCheckoutMockResult('请先登录后再订阅')
      return
    }
    setCheckoutLoading(true)
    setCheckoutMockResult(null)
    try {
      const result = await api.post<{ url: string; mock: boolean; sessionId: string }>(
        '/api/payment/create-checkout',
        { priceId },
      )
      if (result.mock) {
        // Simulate payment success
        await api.post('/api/payment/mock-success', { priceId })
        setCheckoutMockResult('支付模拟成功！Pro 许可证已激活。')
        await loadFromServer()
      } else {
        // Redirect to Stripe checkout
        window.location.href = result.url
      }
    } catch (err: any) {
      setCheckoutMockResult(`错误: ${err?.message || '支付失败'}`)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">License & Subscription</h1>
          <p className="text-app-text-secondary mt-1">
            管理您的 yuleASR 许可证和订阅
          </p>
        </div>
      </div>

      {/* Current Plan Status */}
      <SettingSection
        title="当前计划"
        description="您当前的 yuleASR 订阅状态"
        icon={
          isPro && !isExpired ? (
            <Crown className="w-5 h-5 text-amber-600" />
          ) : (
            <SparklesIcon />
          )
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold',
                  isPro && !isExpired
                    ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300'
                    : 'bg-app-bg-tertiary text-app-text-secondary',
                )}
              >
                {isPro && !isExpired ? (
                  <Crown className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {isPro && !isExpired ? 'Pro' : 'Free'}
              </span>

              {isExpired && (
                <span className="inline-flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  已过期
                </span>
              )}
            </div>

            {isPro && !isExpired && (
              <div className="mt-3 space-y-1">
                {daysLeft !== null && (
                  <div className="flex items-center gap-2 text-sm text-app-text-secondary">
                    <Clock className="w-4 h-4" />
                    到期时间：{new Date(expiresAt!).toLocaleDateString('zh-CN')}
                    {daysLeft <= 30 && (
                      <span className="text-amber-600 font-medium">（剩余 {daysLeft} 天）</span>
                    )}
                  </div>
                )}
                {licenseKey && (
                  <div className="flex items-center gap-2 text-sm text-app-text-secondary">
                    <Key className="w-4 h-4" />
                    License Key：{licenseKey}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SettingSection>

      {/* Activate License */}
      {!isPro || isExpired ? (
        <SettingSection
          title="激活 License"
          description="输入您的 License Key 以激活 Pro 功能"
          icon={<Key className="w-5 h-5 text-primary-600" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-1">
                License Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={activationKey}
                  onChange={(e) => {
                    setActivationKey(e.target.value.toUpperCase())
                    setActivationError(null)
                    setActivationSuccess(false)
                  }}
                  placeholder="YULE-XXXX-XXXX-XXXX"
                  className="flex-1 px-4 py-2.5 border border-app-border-primary rounded-lg text-sm bg-app-bg-primary text-app-text-primary font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength={19}
                />
                <button
                  onClick={handleActivate}
                  disabled={activationLoading || activationKey.length < 19}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {activationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  激活
                </button>
              </div>

              {activationError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {activationError}
                </p>
              )}
              {activationSuccess && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  License 激活成功！
                </p>
              )}
            </div>
          </div>
        </SettingSection>
      ) : null}

      {/* Subscribe */}
      <SettingSection
        title="订阅 Pro"
        description="获取所有专业功能"
        icon={<CreditCard className="w-5 h-5 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleMockCheckout('pro_monthly')}
            disabled={checkoutLoading || (isPro && !isExpired)}
            className="p-6 rounded-xl border-2 border-app-border-primary hover:border-primary-500 transition-all text-left disabled:opacity-50"
          >
            <div className="text-sm font-medium text-app-text-secondary mb-1">月度订阅</div>
            <div className="text-3xl font-bold text-app-text-primary">¥299/月</div>
            <div className="text-xs text-app-text-secondary mt-1">每月续费，随时取消</div>
          </button>

          <button
            onClick={() => handleMockCheckout('pro_yearly')}
            disabled={checkoutLoading || (isPro && !isExpired)}
            className="p-6 rounded-xl border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 hover:border-amber-500 transition-all text-left disabled:opacity-50 relative"
          >
            <div className="absolute -top-3 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              节省 17%
            </div>
            <div className="text-sm font-medium text-app-text-secondary mb-1">年度订阅</div>
            <div className="text-3xl font-bold text-app-text-primary">¥2,999/年</div>
            <div className="text-xs text-app-text-secondary mt-1">相当于 ¥250/月</div>
          </button>
        </div>

        {checkoutLoading && (
          <div className="flex items-center gap-2 text-sm text-primary-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            处理中...
          </div>
        )}

        {checkoutMockResult && (
          <div
            className={cn(
              'p-3 rounded-lg text-sm',
              checkoutMockResult.includes('成功')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800',
            )}
          >
            {checkoutMockResult}
          </div>
        )}

        <p className="text-xs text-app-text-secondary">
          * 当前为模拟支付模式。生产环境将使用 Stripe/LemonSqueezy 处理真实支付。
        </p>
      </SettingSection>

      {/* Feature Comparison */}
      <SettingSection
        title="功能对比"
        description="Free vs Pro 完整功能对比"
        icon={<Crown className="w-5 h-5 text-amber-600" />}
      >
        <div className="rounded-xl border border-app-border-primary overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-app-bg-secondary border-b border-app-border-primary">
                <th className="text-left px-4 py-3 font-medium text-app-text-primary">功能</th>
                <th className="text-center px-4 py-3 font-medium text-app-text-secondary">Free</th>
                <th className="text-center px-4 py-3 font-medium text-amber-600">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border-primary">
              {FEATURES.map((f) => {
                const freeVal = typeof f.free === 'number' ? (f.free === 9999 ? '无限' : `${f.free}`) : f.free ? '✓' : '✗'
                const proVal = typeof f.pro === 'number' ? (f.pro === 9999 ? '无限' : `${f.pro}`) : f.pro ? '✓' : '✗'
                const featureNames: Record<string, string> = {
                  maxModules: '最大模块数',
                  maxProjects: '最大项目数',
                  arxmlExport: 'ARXML 导出',
                  codeGen: '代码生成',
                  vscodeExtension: 'VS Code 扩展',
                  templateMarketUpload: '模板市场上传',
                }
                return (
                  <tr key={f.name} className="hover:bg-app-bg-secondary/50">
                    <td className="px-4 py-3 text-app-text-primary">
                      {featureNames[f.name] || f.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {freeVal === '✓' ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : freeVal === '✗' ? (
                        <X className="w-4 h-4 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-app-text-secondary">{freeVal}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {proVal === '✓' ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : proVal === '✗' ? (
                        <X className="w-4 h-4 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-amber-600 font-medium">{proVal}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SettingSection>
    </div>
  )
}

function SparklesIcon() {
  return (
    <svg className="w-5 h-5 text-app-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  )
}
