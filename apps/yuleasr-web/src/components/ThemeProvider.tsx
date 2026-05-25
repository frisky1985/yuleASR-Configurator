/**
 * Theme Provider Component
 * Manages dark/light mode switching with system preference support
 */

import { useEffect, useState } from 'react'

import { useSettingsStore } from '@/stores/settingsStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { editor } = useSettingsStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove old classes
    root.classList.remove('light', 'dark')
    
    // Determine theme
    let theme = editor.theme
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    
    // Apply theme
    root.classList.add(theme)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (editor.theme === 'system') {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [editor.theme])

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

// Hook to get current effective theme
export function useTheme() {
  const { editor, updateEditorSettings } = useSettingsStore()
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (editor.theme === 'system') {
        setEffectiveTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      } else {
        setEffectiveTheme(editor.theme)
      }
    }

    updateEffectiveTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateEffectiveTheme)
    return () => mediaQuery.removeEventListener('change', updateEffectiveTheme)
  }, [editor.theme])

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateEditorSettings({ theme })
  }

  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light'
    updateEditorSettings({ theme: newTheme })
  }

  return {
    theme: editor.theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  }
}
