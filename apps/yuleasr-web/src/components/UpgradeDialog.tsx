import { X, Check, Crown, Zap } from 'lucide-react'
import { FEATURES, useLicenseStore } from '@/stores/licenseStore'

interface UpgradeDialogProps {
  isOpen: boolean
  onClose: () => void
}

const MONTHLY_PRICE = '¥299/月'
const YEARLY_PRICE = '¥2,999/年'

const planComparison = [
  { feature: '最大模块数', free: '5 个', pro: '无限' },
  { feature: '最大项目数', free: '1 个', pro: '无限' },
  { feature: 'ARXML 导出', free: '✗', pro: '✓' },
  { feature: '代码生成 (codeGen)', free: '✓', pro: '✓' },
  { feature: 'VS Code 扩展', free: '✗', pro: '✓' },
  { feature: '模板市场上传', free: '✗', pro: '✓' },
]

export function UpgradeDialog({ isOpen, onClose }: UpgradeDialogProps) {
  const tier = useLicenseStore((s) => s.tier)
  const alreadyPro = tier === 'pro'

  if (!isOpen) return null

  const handleSubscribeMonthly = () => {
    // In production, this would redirect to the checkout URL
    window.location.href = '/settings/license'
  }

  const handleSubscribeYearly = () => {
    window.location.href = '/settings/license'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-app-bg-primary rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 text-center border-b border-app-border-primary">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-app-bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-app-text-secondary" />
          </button>

          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-app-text-primary">
            {alreadyPro ? '您已是 Pro 用户' : '升级到 yuleASR Pro'}
          </h2>
          <p className="text-app-text-secondary mt-2 max-w-md mx-auto">
            {alreadyPro
              ? '感谢您的支持！您已拥有所有 Pro 功能。'
              : '解锁无限模块、高级导出和更多专业功能。'
            }
          </p>
        </div>

        {!alreadyPro && (
          <>
            {/* Pricing */}
            <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSubscribeMonthly}
                className="group relative p-6 rounded-xl border-2 border-app-border-primary hover:border-primary-500 transition-all text-left"
              >
                <div className="text-sm font-medium text-app-text-secondary mb-1">月度订阅</div>
                <div className="text-3xl font-bold text-app-text-primary">{MONTHLY_PRICE}</div>
                <div className="text-xs text-app-text-secondary mt-1">每月续费，随时取消</div>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium group-hover:bg-primary-700 transition-colors">
                    <Zap className="w-4 h-4" />
                    订阅月度
                  </span>
                </div>
              </button>

              <button
                onClick={handleSubscribeYearly}
                className="group relative p-6 rounded-xl border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 hover:border-amber-500 transition-all text-left"
              >
                <div className="absolute -top-3 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                  节省 17%
                </div>
                <div className="text-sm font-medium text-app-text-secondary mb-1">年度订阅</div>
                <div className="text-3xl font-bold text-app-text-primary">{YEARLY_PRICE}</div>
                <div className="text-xs text-app-text-secondary mt-1">相当于 ¥250/月</div>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium group-hover:bg-amber-600 transition-colors">
                    <Crown className="w-4 h-4" />
                    订阅年度
                  </span>
                </div>
              </button>
            </div>

            {/* Comparison Table */}
            <div className="px-8 pb-8">
              <h3 className="text-sm font-semibold text-app-text-primary uppercase tracking-wider mb-4">
                功能对比
              </h3>
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
                    {planComparison.map((row, i) => (
                      <tr key={i} className="hover:bg-app-bg-secondary/50">
                        <td className="px-4 py-3 text-app-text-primary">{row.feature}</td>
                        <td className="px-4 py-3 text-center text-app-text-secondary">{row.free}</td>
                        <td className="px-4 py-3 text-center">
                          {row.pro === '✓' ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : row.pro === '✗' ? (
                            <X className="w-4 h-4 text-red-400 mx-auto" />
                          ) : (
                            <span className="text-amber-600 font-medium">{row.pro}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {alreadyPro && (
          <div className="px-8 pb-8 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-app-bg-primary border border-app-border-primary rounded-lg text-app-text-primary hover:bg-app-bg-secondary transition-colors"
            >
              继续使用
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
