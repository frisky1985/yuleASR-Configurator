import { Home, Settings, FileJson, GitBranch, Moon, Sun, Keyboard, Globe, ArrowLeftRight, MessageSquare, BookOpen, FileText, GitFork, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'
import { LicenseBadge } from '@/components/LicenseBadge'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { effectiveTheme, toggleTheme } = useTheme()
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + D to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        toggleTheme()
      }
      // Ctrl/Cmd + / to show shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleTheme])

  const toggleLanguage = () => {
    const currentLang = i18n.language
    const newLang = currentLang === 'zh' ? 'en' : 'zh'
    console.log(`[i18n] Switching language from ${currentLang} to ${newLang}`)
    i18n.changeLanguage(newLang)
  }

  // ── Top banner community links ──
  const communityLinks = [
    { href: '/community/#/', label: '社区首页', icon: Home },
    { href: '/community/#/forum', label: '论坛', icon: MessageSquare },
    { href: '/community/#/blog', label: '博客', icon: BookOpen },
    { href: '/community/#/docs', label: '文档', icon: FileText },
    { href: '/community/#/opensource', label: '开源', icon: GitFork },
  ]

  // ── Main nav items ──
  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/templates', label: t('nav.templates'), icon: FileJson },
    { path: '/migrate', label: 'Migrate', icon: ArrowLeftRight },
    { path: '/sync', label: t('nav.gitSync'), icon: GitBranch },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* ──── Top Banner: Community Navigation ──── */}
      <header className="sticky top-0 z-50">
        <div className="bg-muted/60 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-9">
              <div className="flex items-center gap-1">
                {communityLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                    >
                      <Icon className="w-3 h-3" />
                      {link.label}
                    </a>
                  )
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
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.path)
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
                  )
                })}

                {/* Divider */}
                <div className="w-px h-5 bg-border mx-1" />

                {/* Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title={t('language.switch', 'Toggle Language')}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">{i18n.language === 'zh' ? '中' : 'EN'}</span>
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
                  title={effectiveTheme === 'dark' ? 'Switch to light mode (Ctrl+D)' : 'Switch to dark mode (Ctrl+D)'}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}
