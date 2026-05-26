/**
 * 代码块组件
 * @description 增强型代码块，支持复制功能和语法高亮
 */

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export interface CodeBlockProps {
  /** 代码内容 */
  code: string;
  /** 编程语言 */
  language?: string;
  /** 是否显示行号 (默认: true) */
  showLineNumbers?: boolean;
  /** 是否可折叠 (默认: false) */
  collapsible?: boolean;
  /** 默认折叠状态 (默认: false) */
  defaultCollapsed?: boolean;
  /** 代码块标题 */
  filename?: string;
  /** 复制成功回调 */
  onCopy?: () => void;
  /** 自定义类名 */
  className?: string;
}

export interface CopyButtonProps {
  /** 要复制的文本 */
  text: string;
  /** 复制成功显示时长 (ms) (默认: 2000) */
  successDuration?: number;
  /** 复制成功回调 */
  onCopy?: () => void;
  /** 按钮大小 (默认: 'sm') */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

/**
 * 复制按钮组件
 */
export function CopyButton({
  text,
  successDuration = 2000,
  onCopy,
  size = 'sm',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();

      // 重置复制状态
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (err) {
      console.error('Failed to copy:', err);
      // 降级方案
      fallbackCopy(text);
    }
  }, [text, onCopy, successDuration]);

  const fallbackCopy = (copyText: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = copyText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        'hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        sizeClasses[size],
        className
      )}
      aria-label={copied ? '代码已复制' : '复制代码到剪贴板'}
      aria-live="polite"
      aria-atomic="true"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="copy-button"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check className={cn(iconSizes[size], 'text-green-400')} aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Copy className={cn(iconSizes[size], 'text-muted-foreground')} aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">
        {copied ? '复制成功' : '复制代码'}
      </span>
    </motion.button>
  );
}

/**
 * 代码块组件
 */
export function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = true,
  collapsible = false,
  defaultCollapsed = false,
  filename,
  onCopy,
  className,
}: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 确定语言显示名称
  const displayLanguage = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div
      className={cn(
        'my-4 rounded-lg overflow-hidden border border-border',
        className
      )}
      data-testid="code-block"
    >
      {/* 标题栏 */}
      <div className="bg-muted-foreground/10 px-4 py-2 text-xs text-muted-foreground font-mono flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          {filename ? (
            <span className="font-medium">{filename}</span>
          ) : (
            <span>{displayLanguage}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {collapsible && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/10 transition-colors"
              aria-label={isExpanded ? '折叠代码块' : '展开代码块'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
          <CopyButton text={code} onCopy={onCopy} size="sm" />
        </div>
      </div>

      {/* 代码内容 */}
      <AnimatePresence initial={false}>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SyntaxHighlighter
              style={isDark ? vscDarkPlus : vs}
              language={language || 'text'}
              PreTag="div"
              className="!m-0 !rounded-none"
              showLineNumbers={showLineNumbers}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: isDark ? '#6e7681' : '#a0a0a0',
                fontSize: '0.875em',
              }}
            >
              {code}
            </SyntaxHighlighter>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 折叠状态提示 */}
      {collapsible && !isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-3 text-sm text-muted-foreground text-center bg-muted/30"
        >
          代码已折叠，点击展开
        </motion.div>
      )}
    </div>
  );
}

export default CodeBlock;
