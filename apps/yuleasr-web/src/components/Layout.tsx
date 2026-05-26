import { Home, Settings, FileJson, GitBranch, Moon, Sun, Keyboard, Globe, ArrowLeftRight, MessageSquare, BookOpen, FileText, GitFork } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'
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

  const communityItems = [
    { path: '/community/#/', label: t('nav.communityHome', '社区首页'), icon: Home },
    { path: '/community/#/forum', label: t('nav.forum', '论坛'), icon: MessageSquare },
    { path: '/community/#/blog', label: t('nav.blog', '博客'), icon: BookOpen },
    { path: '/community/#/docs', label: t('nav.docs', '文档'), icon: FileText },
    { path: '/community/#/opensource', label: t('nav.opensource', '开源'), icon: GitFork },
  ]

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/templates', label: t('nav.templates'), icon: FileJson },
    { path: '/migrate', label: 'Migrate', icon: ArrowLeftRight },
    { path: '/sync', label: t('nav.gitSync'), icon: GitBranch },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">YL</span>
                </div>
                <span className="text-xl font-semibold text-foreground">{t('app.name')}</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              {/* Community Links */}
              {communityItems.map((item) => {
                const Icon = item.icon
                const currentUrl = window.location.pathname + window.location.hash
                const isActive = currentUrl.startsWith(item.path)
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </a>
                )
              })}

              {/* Divider between community and configurator */}
              <div className="w-px h-6 bg-border" />

              {/* Configurator Nav Items */}
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Divider */}
              <div className="w-px h-6 bg-border" />

              {/* Language Toggle Button */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Toggle Language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">{i18n.language === 'zh' ? '中' : 'EN'}</span>
              </button>

              {/* Keyboard Shortcuts Button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title={t('shortcuts.title') + ' (Ctrl+/)'}
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* Theme Toggle Button */}
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
