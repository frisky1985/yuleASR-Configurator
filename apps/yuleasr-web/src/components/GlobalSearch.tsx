/**
 * Global Search Component
 * Search across all parameters, modules, and configurations
 */

import { Search, X, FileJson, Folder, Hash, Type, ToggleLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { cn } from '@/lib/utils';
import { useConfigStore } from '@/stores/configStore';
import type { ConfigFile, ConfigModule, ConfigContainer, ConfigParameter } from '@/types';

interface SearchResult {
  id: string;
  type: 'module' | 'container' | 'parameter';
  title: string;
  subtitle: string;
  path: string;
  icon: React.ReactNode;
  matchedText: string;
}

/**
 * 倒排索引条目（Fix 25: 模块级倒排索引，避免每次击键全量扫描 config）
 */
interface SearchIndexEntry {
  id: string;
  type: 'module' | 'container' | 'parameter';
  title: string;
  subtitle: string;
  path: string;
  icon: React.ReactNode;
  /** 有序搜索候选（小写），按 name → displayName → description → value 优先级排列 */
  candidates: string[];
  /** 与 candidates 对齐的原文，用于 matchedText */
  rawCandidates: string[];
  /** module/container 固定的 matchedText（原逻辑固定为 name） */
  matchedText?: string;
}

function getParameterIcon(type: string): React.ReactNode {
  switch (type) {
    case 'boolean':
      return <ToggleLeft className="w-4 h-4 text-green-500" />;
    case 'number':
    case 'integer':
    case 'float':
      return <Hash className="w-4 h-4 text-blue-500" />;
    case 'enum':
    case 'reference':
      return <FileJson className="w-4 h-4 text-purple-500" />;
    default:
      return <Type className="w-4 h-4 text-app-text-secondary" />;
  }
}

/**
 * 构建模块级倒排索引：把 config 展平为可搜索条目数组。
 * 在 config 变化时通过 useMemo 缓存，搜索时只过滤索引。
 */
function buildSearchIndex(config: ConfigFile): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];

  config.modules.forEach(module => {
    // Module entries
    entries.push({
      id: `module-${module.id}`,
      type: 'module',
      title: module.displayName || module.name,
      subtitle: `${module.layer} Module`,
      path: `layer:${module.layer}/module:${module.id}`,
      icon: <Folder className="w-4 h-4 text-blue-500" />,
      candidates: [module.name.toLowerCase(), (module.displayName || '').toLowerCase()],
      rawCandidates: [module.name, module.displayName || ''],
      matchedText: module.name,
    });

    // Container entries + their parameters
    module.containers.forEach(container => {
      entries.push({
        id: `container-${container.id}`,
        type: 'container',
        title: container.displayName || container.name,
        subtitle: `${module.displayName || module.name} › Container`,
        path: `layer:${module.layer}/module:${module.id}/container:${container.id}`,
        icon: <Folder className="w-4 h-4 text-amber-500" />,
        candidates: [container.name.toLowerCase(), (container.displayName || '').toLowerCase()],
        rawCandidates: [container.name, container.displayName || ''],
        matchedText: container.name,
      });

      // Container-level parameters
      container.parameters.forEach((param: ConfigParameter) => {
        entries.push(buildParameterEntry(param, `param-${param.id}`, module, container));
      });
    });

    // Module-level parameters
    module.parameters.forEach((param: ConfigParameter) => {
      entries.push(buildParameterEntry(param, `param-module-${param.id}`, module, undefined));
    });
  });

  // OS configuration entries
  if (config.os) {
    const os = config.os;
    const osEntries: Array<{ id: string; name: string; subtitle: string }> = [
      ...(os.tasks?.map(t => ({ id: `os-task-${t.id}`, name: t.name, subtitle: 'OS › Task' })) || []),
      ...(os.events?.map(e => ({ id: `os-event-${e.id}`, name: e.name, subtitle: 'OS › Event' })) || []),
      ...(os.alarms?.map(a => ({ id: `os-alarm-${a.id}`, name: a.name, subtitle: 'OS › Alarm' })) || []),
    ];
    for (const oe of osEntries) {
      entries.push({
        id: oe.id,
        type: 'parameter',
        title: oe.name,
        subtitle: oe.subtitle,
        path: 'layer:OS/os:os',
        icon: <FileJson className="w-4 h-4 text-purple-500" />,
        candidates: [oe.name.toLowerCase()],
        rawCandidates: [oe.name],
        matchedText: oe.name,
      });
    }
  }

  return entries;
}

function buildParameterEntry(
  param: ConfigParameter,
  id: string,
  module: ConfigModule,
  container?: ConfigContainer
): SearchIndexEntry {
  const subtitle = container
    ? `${module.displayName || module.name} › ${container.displayName || container.name} › Parameter`
    : `${module.displayName || module.name} › Parameter`;
  const path = container
    ? `layer:${module.layer}/module:${module.id}/container:${container.id}/param:${param.id}`
    : `layer:${module.layer}/module:${module.id}/param:${param.id}`;

  const candidates: string[] = [];
  const rawCandidates: string[] = [];
  const pushCandidate = (text: string | undefined) => {
    if (text && text.trim()) {
      candidates.push(text.toLowerCase());
      rawCandidates.push(text);
    }
  };
  pushCandidate(param.name);
  pushCandidate(param.displayName);
  pushCandidate(param.description);
  if (typeof param.value === 'string') pushCandidate(param.value);

  return {
    id,
    type: 'parameter',
    title: param.displayName || param.name,
    subtitle,
    path,
    icon: getParameterIcon(param.type),
    candidates,
    rawCandidates,
  };
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (path: string) => void;
}

export function GlobalSearch({ isOpen, onClose, onSelectResult }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { currentConfig } = useConfigStore();

  // Fix 25: 模块级倒排索引 — config 变化时重建一次，搜索时只过滤索引
  const index = useMemo(
    () => (currentConfig ? buildSearchIndex(currentConfig) : []),
    [currentConfig]
  );

  const performSearch = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return [];

      const lowerQuery = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      for (const entry of index) {
        let matchIdx = -1;
        for (let i = 0; i < entry.candidates.length; i++) {
          if (entry.candidates[i].includes(lowerQuery)) {
            matchIdx = i;
            break;
          }
        }
        if (matchIdx === -1) continue;

        searchResults.push({
          id: entry.id,
          type: entry.type,
          title: entry.title,
          subtitle: entry.subtitle,
          path: entry.path,
          icon: entry.icon,
          matchedText:
            entry.type === 'parameter'
              ? entry.rawCandidates[matchIdx]
              : entry.matchedText ?? entry.title,
        });

        if (searchResults.length >= 50) break; // Limit to 50 results
      }

      return searchResults;
    },
    [index]
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const debounceTimer = setTimeout(() => {
      const searchResults = performSearch(query);
      setResults(searchResults);
      setSelectedIndex(0);
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [query, isOpen, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelectResult(results[selectedIndex].path);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search Dialog */}
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
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
                    onSelectResult(result.path);
                    onClose();
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
                    <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
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
          <span>{currentConfig?.modules.length || 0} modules indexed</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to highlight matched text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 dark:bg-yellow-900 text-inherit px-0.5 rounded">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}
