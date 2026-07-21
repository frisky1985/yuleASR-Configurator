/**
 * Mobile Navigation
 * Bottom navigation bar for mobile devices
 */

import { Home, FileJson, ArrowLeftRight, GitBranch, Settings, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/templates', label: t('nav.templates'), icon: FileJson },
    { path: '/migrate', label: t('nav.migrate'), icon: ArrowLeftRight },
    { path: '/sync', label: t('nav.gitSync'), icon: GitBranch },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  // Only show on mobile
  if (typeof window !== 'undefined' && window.innerWidth >= 640) {
    return null;
  }

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 min-w-[64px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'fill-current')} />
              <span className="text-xs mt-1 truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
