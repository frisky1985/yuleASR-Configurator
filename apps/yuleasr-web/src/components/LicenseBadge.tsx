import { Crown, Sparkles } from 'lucide-react'
import { useLicenseStore } from '@/stores/licenseStore'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

interface LicenseBadgeProps {
  className?: string
}

export function LicenseBadge({ className }: LicenseBadgeProps) {
  const tier = useLicenseStore((s) => s.tier)
  const expiresAt = useLicenseStore((s) => s.expiresAt)
  const navigate = useNavigate()

  const isExpired = expiresAt && new Date(expiresAt) < new Date()
  const displayTier = isExpired ? 'free' : tier

  if (displayTier === 'pro') {
    const daysLeft = expiresAt
      ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return (
      <button
        onClick={() => navigate('/settings/license')}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
          'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800',
          'dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300',
          'border border-amber-300/50 dark:border-amber-700/50',
          'hover:shadow-sm transition-all',
          className,
        )}
        title={daysLeft !== null ? `剩余 ${daysLeft} 天` : 'Pro 用户'}
      >
        <Crown className="w-3 h-3" />
        <span>Pro</span>
        {daysLeft !== null && daysLeft <= 30 && (
          <span className="text-[10px] opacity-75">({daysLeft}天)</span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={() => navigate('/settings/license')}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        'bg-app-bg-tertiary text-app-text-secondary border border-app-border-primary',
        'hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300',
        'dark:hover:bg-primary-900/20 dark:hover:text-primary-400',
        'transition-all',
        className,
      )}
      title="点击升级到 Pro"
    >
      <Sparkles className="w-3 h-3" />
      <span>Free</span>
    </button>
  )
}
