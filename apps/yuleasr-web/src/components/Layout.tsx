import {
  Home,
  Settings,
  FileJson,
  GitBranch,
  Moon,
  Sun,
  Keyboard,
  Globe,
  ArrowLeftRight,
  MessageSquare,
  BookOpen,
  FileText,
  GitFork,
  ExternalLink,
  Palette,
  Puzzle,
  Power,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { LicenseBadge } from '@/components/LicenseBadge';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPluginStatus, setShowPluginStatus] = useState(false);
  const [enabledPlugins, setEnabledPlugins] = useState<
    { id: string; name: string; type: string }[]
  >([]);

  // Poll plugin status periodically
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch('/v1/api/plugins');
        if (!cancelled && res.ok) {
          const plugins: { id: string; name: string; type: string; enabled: boolean }[] =
            await res.json();
          setEnabledPlugins(
            plugins.filter(p => p.enabled).map(p => ({ id: p.id, name: p.name, type: p.type }))
          );
        }
      } catch {
        // API not available — silently ignore
      }
    }
    poll();
    const interval = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + D to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
      // Ctrl/Cmd + / to show shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    console.log(`[i18n] Switching language from ${currentLang} to ${newLang}`);
    i18n.changeLanguage(newLang);
  };

  // Open community links — web: relative navigate, desktop: external browser
  const openCommunityLink = (href: string) => (e: React.MouseEvent) => {
    if (window.electronAPI?.isElectron) {
      e.preventDefault();
      const isGitHubPages = window.location.hostname.includes('github.io');
      const baseUrl = isGitHubPages
        ? 'https://frisky1985.github.io/yuleASR-Configurator'
        : `${window.location.protocol}//${window.location.host}`;
      window.electronAPI.openExternal(`${baseUrl}${href}`);
    }
  };

  const communityLinks = [
    { href: '/community/#/', label: '社区首页', icon: Home },
    { href: '/community/#/forum', label: '论坛', icon: MessageSquare },
    { href: '/community/#/blog', label: '博客', icon: BookOpen },
    { href: '/community/#/docs', label: '文档', icon: FileText },
    { href: '/community/#/opensource', label: '开源', icon: GitFork },
  ];

  // ── Main nav items ──
  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/plugins', label: t('nav.plugins'), icon: Puzzle },
    { path: '/templates', label: t('nav.templates'), icon: FileJson },
    { path: '/migrate', label: t('nav.migrate'), icon: ArrowLeftRight },
    { path: '/sync', label: t('nav.gitSync'), icon: GitBranch },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* ──── Top Banner: Community Navigation ──── */}
      <header className="sticky top-0 z-50">
        <div className="bg-muted/60 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-9">
              <div className="flex items-center gap-1">
                {communityLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={openCommunityLink(link.href)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                    >
                      <Icon className="w-3 h-3" />
                      {link.label}
                    </a>
                  );
                })}

                {/* Divider */}
                <div className="w-px h-4 bg-border mx-1" />

                {/* Current location indicator */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                  <ExternalLink className="w-3 h-3" />
                  配置器
                </span>
              </div>

              {/* Right side of banner (optional: show current path) */}
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
                <LicenseBadge />
                yuleASR BSW Configurator
              </div>
            </div>
          </div>
        </div>

        {/* ──── Main Header: Logo + Nav ──── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">YL</span>
                  </div>
                  <span className="text-xl font-semibold text-foreground">{t('app.name')}</span>
                </Link>
              </div>

              {/* Nav items + Utilities */}
              <nav className="flex items-center space-x-1 sm:space-x-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Admin link — only for admin users */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/branding"
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors',
                      location.pathname.startsWith('/admin')
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">品牌</span>
                  </Link>
                )}

                {/* Plugin status indicator */}
                <div className="relative">
                  <button
                    onClick={() => setShowPluginStatus(!showPluginStatus)}
                    className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title={`已启用 ${enabledPlugins.length} 个插件`}
                  >
                    <Power className="w-4 h-4" />
                    {enabledPlugins.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-green-500 rounded-full">
                        {enabledPlugins.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown: enabled plugins list */}
                  {showPluginStatus && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPluginStatus(false)}
                      />
                      <div className="absolute right-0 mt-1 z-50 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border bg-muted/30">
                          已启用的插件 ({enabledPlugins.length})
                        </div>
                        {enabledPlugins.length === 0 ? (
                          <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                            暂无已启用的插件
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto">
                            {enabledPlugins.map(p => (
                              <Link
                                key={p.id}
                                to="/plugins"
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                                onClick={() => setShowPluginStatus(false)}
                              >
                                <Puzzle className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                <span className="truncate flex-1">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">
                                  {p.type}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-border mx-1" />

                {/* Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title={t('language.switch', 'Toggle Language')}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">
                    {i18n.language === 'zh' ? '中' : 'EN'}
                  </span>
                </button>

                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title={t('shortcuts.title') + ' (Ctrl+/)'}
                >
                  <Keyboard className="w-4 h-4" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title={
                    effectiveTheme === 'dark'
                      ? 'Switch to light mode (Ctrl+D)'
                      : 'Switch to dark mode (Ctrl+D)'
                  }
                >
                  {effectiveTheme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
