import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, ChevronRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  searchCode, 
  getTypeIcon, 
  getTypeName,
  codeSearchData,
  type SearchResult 
} from '../data/codeSearch';
import { useTheme } from '../contexts/ThemeContext';

export function CodeSearch() {
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = resolvedTheme === 'dark';

  // 搜索逻辑
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchCode(query);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // ESC 关闭
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 焦点输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (results.length === 0) return;

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
          setSelectedResult(results[selectedIndex]);
        }
        break;
    }
  }, [results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
  };

  const closePreview = () => {
    setSelectedResult(null);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-primary/30 text-primary font-semibold rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
        title="搜索代码 (Cmd+K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">搜索代码...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-xs font-mono border border-border">
          ⌘K
        </kbd>
      </button>

      {/* 搜索面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm">
          <div 
            ref={containerRef}
            className="w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* 搜索栏 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索函数、变量、模块..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground border border-border"
              >
                ESC
              </button>
            </div>

            {/* 搜索结果 */}
            <div className="max-h-[50vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-xs text-muted-foreground">
                    找到 {results.length} 个结果
                  </div>
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                        index === selectedIndex 
                          ? 'bg-primary/10' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-lg shrink-0" title={getTypeName(result.type)}>
                        {getTypeIcon(result.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {highlightMatch(result.name, query)}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {result.module}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {result.description}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {result.filePath}:{result.lineNumber}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-opacity ${
                        index === selectedIndex ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>未找到结果</p>
                  <p className="text-xs mt-1">尝试搜索其他关键词</p>
                </div>
              ) : (
                <div className="py-8 px-4">
                  <div className="text-xs text-muted-foreground mb-3">推荐搜索
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Can_Init', 'Com_SendSignal', 'PduR', 'Dio', 'NvM', 'RTE'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↑↓</kbd>
                  选择
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">→</kbd>
                  查看
                </span>
              </div>
              <span>{codeSearchData.length} 个代码片段</span>
            </div>
          </div>
        </div>
      )}

      {/* 代码预览面板 */}
      {selectedResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(selectedResult.type)}</span>
                <div>
                  <h3 className="font-semibold">{selectedResult.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedResult.filePath}:{selectedResult.lineNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-muted">
                  {selectedResult.module}
                </span>
                <button
                  onClick={closePreview}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 描述 */}
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <p className="text-sm">{selectedResult.description}</p>
              {selectedResult.signature && (
                <code className="mt-2 block text-xs bg-muted px-2 py-1 rounded font-mono">
                  {selectedResult.signature}
                </code>
              )}
            </div>

            {/* 代码 */}
            <div className="max-h-[50vh] overflow-auto">
              <SyntaxHighlighter
                language="c"
                style={isDark ? vscDarkPlus : prism}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  background: isDark ? '#1e1e1e' : '#fafafa',
                }}
                showLineNumbers
                startingLineNumber={selectedResult.lineNumber}
                lineNumberStyle={{
                  minWidth: '3em',
                  paddingRight: '1em',
                  color: isDark ? '#6e7681' : '#a0a0a0',
                  fontSize: '12px',
                }}
              >
                {selectedResult.code}
              </SyntaxHighlighter>
            </div>

            {/* 底部 */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
              <a
                href={`#/opensource/${selectedResult.module.toLowerCase()}`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                查看 {selectedResult.module} 模块详情
              </a>
              <button
                onClick={closePreview}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
