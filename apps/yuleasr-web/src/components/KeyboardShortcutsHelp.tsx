/**
 * Keyboard Shortcuts Help Component
 * Display available keyboard shortcuts in a modal
 */

import { X, Command, Keyboard, Save, Search, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'

import { cn } from '@/lib/utils'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
  icon?: React.ReactNode
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Ctrl', 'K'],
    description: 'Open global search',
    icon: <Search className="w-4 h-4" />,
  },
  {
    keys: ['Ctrl', 'S'],
    description: 'Save configuration',
    icon: <Save className="w-4 h-4" />,
  },
  {
    keys: ['Ctrl', 'D'],
    description: 'Toggle dark/light mode',
    icon: <Command className="w-4 h-4" />,
  },
  {
    keys: ['Esc'],
    description: 'Close dialogs / Clear selection',
    icon: <X className="w-4 h-4" />,
  },
  {
    keys: ['↑', '↓'],
    description: 'Navigate search results',
    icon: <ArrowLeft className="w-4 h-4 rotate-90" />,
  },
  {
    keys: ['Enter'],
    description: 'Select highlighted item',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    keys: ['Tab'],
    description: 'Navigate between fields',
    icon: <ArrowRight className="w-4 h-4" />,
  },
]

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {shortcut.icon && (
                    <span className="text-muted-foreground">{shortcut.icon}</span>
                  )}
                  <span className="text-foreground">{shortcut.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex} className="flex items-center">
                      <kbd className="px-2 py-1 bg-muted border border-border rounded text-sm font-mono text-foreground min-w-[28px] text-center">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> On macOS, use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd</kbd> instead of <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
