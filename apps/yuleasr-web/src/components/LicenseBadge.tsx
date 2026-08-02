import { Crown, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { UpgradeDialog } from '@/components/UpgradeDialog';
import { cn } from '@/lib/utils';
import { useLicenseStore } from '@/stores/licenseStore';

interface LicenseBadgeProps {
  className?: string;
}

export function LicenseBadge({ className }: LicenseBadgeProps) {
  const tier = useLicenseStore(s => s.tier);
  const expiresAt = useLicenseStore(s => s.expiresAt);
  // Fix 26: 服务端不可达时弱降级为「离线试用」—— 必须显式标注，不再静默视为 Pro。
  const offlineTrial = useLicenseStore(s => s.offlineTrial);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isExpired = expiresAt && new Date(expiresAt) < new Date();
  const displayTier = isExpired ? 'free' : tier;

  const handleClick = () => {
    setUpgradeOpen(true);
  };

  // Fix 26: 离线试用标识（弱降级，不授予缓存 Pro 能力，见 licenseStore）
  if (offlineTrial) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          'bg-slate-100 text-slate-600 border border-dashed border-slate-300',
          'dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-600',
          'hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300',
          'dark:hover:bg-primary-900/20 dark:hover:text-primary-400',
          'transition-all',
          className
        )}
        title="服务端不可达，当前为离线试用（本地缓存仅作弱降级，不授予 Pro 能力）"
      >
        <Sparkles className="w-3 h-3" />
        <span>离线试用</span>
      </button>
    );
  }

  if (displayTier === 'pro') {
    const daysLeft = expiresAt
      ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
            'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800',
            'dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300',
            'border border-amber-300/50 dark:border-amber-700/50',
            'hover:shadow-sm transition-all',
            className
          )}
          title={daysLeft !== null ? `剩余 ${daysLeft} 天` : 'Pro 用户'}
        >
          <Crown className="w-3 h-3" />
          <span>Pro</span>
          {daysLeft !== null && daysLeft <= 30 && (
            <span className="text-[10px] opacity-75">({daysLeft}天)</span>
          )}
        </button>
        <UpgradeDialog isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          'bg-app-bg-tertiary text-app-text-secondary border border-app-border-primary',
          'hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300',
          'dark:hover:bg-primary-900/20 dark:hover:text-primary-400',
          'transition-all',
          className
        )}
        title="点击升级到 Pro"
      >
        <Sparkles className="w-3 h-3" />
        <span>Free</span>
      </button>
      <UpgradeDialog isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
