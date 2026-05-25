/**
 * Global Search Component
 * Search across all parameters, modules, and configurations
 */

import { Search, X, FileJson, Folder, Hash, Type, ToggleLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'

import { cn } from '@/lib/utils'
import { useConfigStore } from '@/stores/configStore'
import type { ConfigParameter } from '@/types'

interface SearchResult {
  id: string
  type: 'module' | 'container' | 'parameter'
  title: string
  subtitle: string
  path: string
  icon: React.ReactNode
  matchedText: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult: (path: string) => void
}

export function GlobalSearch({ isOpen, onClose, onSelectResult }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { currentConfig } = useConfigStore()

  const performSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!currentConfig || !searchQuery.trim()) return []

    const searchResults: SearchResult[] = []
    const lowerQuery = searchQuery.toLowerCase()

    // Search through modules
    currentConfig.modules.forEach((module) => {
      // Check module name
      if (module.name.toLowerCase().includes(lowerQuery) || 
          (module.displayName && module.displayName.toLowerCase().includes(lowerQuery))) {
        searchResults.push({
          id: `module-${module.id}`,
          type: 'module',
          title: module.displayName || module.name,
          subtitle: `${module.layer} Module`,
          path: `layer:${module.layer}/module:${module.id}`,
          icon: <Folder className="w-4 h-4 text-blue-500" />,
          matchedText: module.name,
        })
      }

      // Search through containers
      module.containers.forEach((container) => {
        if (container.name.toLowerCase().includes(lowerQuery) ||
            (container.displayName && container.displayName.toLowerCase().includes(lowerQuery))) {
          searchResults.push({
            id: `container-${container.id}`,
            type: 'container',
            title: container.displayName || container.name,
            subtitle: `${module.displayName || module.name} › Container`,
            path: `layer:${module.layer}/module:${module.id}/container:${container.id}`,
            icon: <Folder className="w-4 h-4 text-amber-500" />,
            matchedText: container.name,
          })
        }

        // Search through container parameters
        container.parameters.forEach((param: ConfigParameter) => {
          if (paramMatches(param, lowerQuery)) {
            searchResults.push({
              id: `param-${param.id}`,
              type: 'parameter',
              title: param.displayName || param.name,
              subtitle: `${module.displayName || module.name} › ${container.displayName || container.name} › Parameter`,
              path: `layer:${module.layer}/module:${module.id}/container:${container.id}/param:${param.id}`,
              icon: getParameterIcon(param.type),
              matchedText: paramMatchesText(param, lowerQuery),
            })
          }
        })
      })

      // Search through module-level parameters
      module.parameters.forEach((param: ConfigParameter) => {
        if (paramMatches(param, lowerQuery)) {
          searchResults.push({
            id: `param-module-${param.id}`,
            type: 'parameter',
            title: param.displayName || param.name,
            subtitle: `${module.displayName || module.name} › Parameter`,
            path: `layer:${module.layer}/module:${module.id}/param:${param.id}`,
            icon: getParameterIcon(param.type),
            matchedText: paramMatchesText(param, lowerQuery),
          })
        }
      })
    })

    // Search OS configuration
    if (currentConfig.os) {
      const os = currentConfig.os
      
      // Search tasks
      os.tasks?.forEach((task) => {
        if (task.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: `os-task-${task.id}`,
            type: 'parameter',
            title: task.name,
            subtitle: 'OS › Task',
            path: 'layer:OS/os:os',
            icon: <FileJson className="w-4 h-4 text-purple-500" />,
            matchedText: task.name,
          })
        }
      })

      // Search events
      os.events?.forEach((event) => {
        if (event.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: `os-event-${event.id}`,
            type: 'parameter',
            title: event.name,
            subtitle: 'OS › Event',
            path: 'layer:OS/os:os',
            icon: <FileJson className="w-4 h-4 text-purple-500" />,
            matchedText: event.name,
          })
        }
      })

      // Search alarms
      os.alarms?.forEach((alarm) => {
        if (alarm.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: `os-alarm-${alarm.id}`,
            type: 'parameter',
            title: alarm.name,
            subtitle: 'OS › Alarm',
            path: 'layer:OS/os:os',
            icon: <FileJson className="w-4 h-4 text-purple-500" />,
            matchedText: alarm.name,
          })
        }
      })
    }

    return searchResults.slice(0, 50) // Limit to 50 results
  }, [currentConfig])

  const paramMatches = (param: ConfigParameter, query: string): boolean => {
    if (param.name.toLowerCase().includes(query)) return true
    if (param.displayName?.toLowerCase().includes(query)) return true
    if (param.description?.toLowerCase().includes(query)) return true
    if (typeof param.value === 'string' && param.value.toLowerCase().includes(query)) return true
    return false
  }

  const paramMatchesText = (param: ConfigParameter, query: string): string => {
    if (param.name.toLowerCase().includes(query)) return param.name
    if (param.displayName?.toLowerCase().includes(query)) return param.displayName
    if (param.description?.toLowerCase().includes(query)) return param.description || ''
    if (typeof param.value === 'string' && param.value.toLowerCase().includes(query)) return String(param.value)
    return param.name
  }

  const getParameterIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'boolean':
        return <ToggleLeft className="w-4 h-4 text-green-500" />
      case 'number':
      case 'integer':
      case 'float':
        return <Hash className="w-4 h-4 text-blue-500" />
      case 'enum':
      case 'reference':
        return <FileJson className="w-4 h-4 text-purple-500" />
      default:
        return <Type className="w-4 h-4 text-app-text-secondary" />
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      return
    }

    const debounceTimer = setTimeout(() => {
      const searchResults = performSearch(query)
      setResults(searchResults)
      setSelectedIndex(0)
    }, 150)

    return () => clearTimeout(debounceTimer)
  }, [query, isOpen, performSearch])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % results.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            onSelectResult(results[selectedIndex].path)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, onSelectResult])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Dialog */}
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules, containers, parameters..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-accent text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelectResult(result.path)
                    onClose()
                  }}
                  className={cn(
                    'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
                    index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                  )}
                >
                  <div className="mt-0.5">{result.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {highlightMatch(result.title, query)}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {result.subtitle}
                    </div>
                    {result.matchedText !== result.title && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        Matched: {highlightMatch(result.matchedText, query)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching for module names, parameter names, or values
              </p>
            </div>
          ) : (
            <div className="py-8 px-4">
              <div className="text-sm text-muted-foreground mb-4">Recent searches</div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground italic">
                  Type to search across all configuration items...
                </div>
              </div>
              <div className="mt-6 text-xs text-muted-foreground">
                <div className="font-medium mb-2">Search tips:</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Search by module name (e.g., "Mcu", "Can")</li>
                  <li>Search by parameter name (e.g., "Clock", "Baudrate")</li>
                  <li>Search by parameter value</li>
                  <li>Use arrow keys to navigate, Enter to select</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card rounded">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-card rounded">↵</kbd>
              to select
            </span>
          </div>
          <span>
            {currentConfig?.modules.length || 0} modules indexed
          </span>
        </div>
      </div>
    </div>
  )
}

// Helper function to highlight matched text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)
  
  if (index === -1) return text
  
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 dark:bg-yellow-900 text-inherit px-0.5 rounded">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  )
}
