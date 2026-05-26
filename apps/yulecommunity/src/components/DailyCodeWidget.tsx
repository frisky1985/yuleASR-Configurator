import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Code2, Lightbulb, BookOpen } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getTodaySnippet, getNextSnippet, getPrevSnippet, type DailyCodeSnippet } from '../data/dailyCode';
import { useTheme } from '../contexts/ThemeContext';

export function DailyCodeWidget() {
  const { resolvedTheme } = useTheme();
  const [snippet, setSnippet] = useState<DailyCodeSnippet | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setSnippet(getTodaySnippet());
  }, []);

  const handlePrev = useCallback(() => {
    if (!snippet || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSnippet(getPrevSnippet(snippet.id));
      setIsAnimating(false);
    }, 150);
  }, [snippet, isAnimating]);

  const handleNext = useCallback(() => {
    if (!snippet || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSnippet(getNextSnippet(snippet.id));
      setIsAnimating(false);
    }, 150);
  }, [snippet, isAnimating]);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { text: '入门', color: 'bg-emerald-500/10 text-emerald-500' };
      case 'intermediate':
        return { text: '中级', color: 'bg-amber-500/10 text-amber-500' };
      case 'advanced':
        return { text: '进阶', color: 'bg-rose-500/10 text-rose-500' };
      default:
        return { text: '入门', color: 'bg-emerald-500/10 text-emerald-500' };
    }
  };

  if (!snippet) return null;

  const difficulty = getDifficultyLabel(snippet.difficulty);
  const isDark = resolvedTheme === 'dark';

  return (
    <section className="py-12 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* 标题区 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">每日一行 AutoSAR</h2>
              <p className="text-sm text-muted-foreground">每天学习一个关键代码片段</p>
            </div>
          </div>
          
          {/* 切换按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              aria-label="上一个"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              aria-label="下一个"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 代码卡片 */}
        <div 
          className={`
            bg-card border border-border rounded-2xl overflow-hidden
            transition-all duration-150
            ${isAnimating ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}
          `}
        >
          {/* 卡片头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{snippet.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${difficulty.color}`}>
                {difficulty.text}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">
                {snippet.module}
              </span>
              <span className="w-2 h-2 rounded-full bg-primary/50" />
              <span className="w-2 h-2 rounded-full bg-primary/30" />
              <span className="w-2 h-2 rounded-full bg-primary/10" />
            </div>
          </div>

          {/* 代码区域 */}
          <div className="relative">
            <SyntaxHighlighter
              language={snippet.language}
              style={isDark ? vscDarkPlus : prism}
              customStyle={{
                margin: 0,
                padding: '1.25rem',
                fontSize: '13px',
                lineHeight: '1.6',
                background: isDark ? '#1e1e1e' : '#fafafa',
                maxHeight: '200px',
                overflow: 'auto',
              }}
              showLineNumbers
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: isDark ? '#6e7681' : '#a0a0a0',
                fontSize: '12px',
              }}
            >
              {snippet.code.trim()}
            </SyntaxHighlighter>
          </div>

          {/* 解释区域 */}
          <div className="px-4 py-3 bg-muted/20 border-t border-border">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {snippet.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <a
            href={`#/opensource/${snippet.module.toLowerCase()}`}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            查看 {snippet.module} 模块详情
          </a>
          <span className="text-border">|</span>
          <a
            href="#/learning"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            更多学习资源 →
          </a>
        </div>
      </div>
    </section>
  );
}
