/**
 * Markdown 渲染器组件
 * @description 支持代码高亮的 Markdown 渲染器，集成 CodeBlock 和 ImageLightbox
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { CodeBlock } from './CodeBlock';
import { ImageLightbox } from './ImageLightbox';
import type { TocItem } from '@/types/blog';

export interface MarkdownRendererProps {
  /** Markdown 内容 */
  content: string;
  /** 是否启用目录生成 */
  enableToc?: boolean;
  /** 目录生成回调 */
  onTocGenerated?: (toc: TocItem[]) => void;
  /** 自定义组件 */
  components?: Record<string, React.ComponentType>;
  /** 自定义类名 */
  className?: string;
}

/**
 * 提取标题生成目录
 * 处理重复 ID 添加数字后缀
 */
function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  const idCount = new Map<string, number>();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    let id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // 处理重复 ID
    if (idCount.has(id)) {
      const count = idCount.get(id)! + 1;
      idCount.set(id, count);
      id = `${id}-${count}`;
    } else {
      idCount.set(id, 0);
    }

    toc.push({ id, text, level });
  }

  return toc;
}

/**
 * Markdown 渲染器组件
 */
export function MarkdownRenderer({
  content,
  enableToc = false,
  onTocGenerated,
  className,
}: MarkdownRendererProps) {
  // 灯箱状态
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | undefined>(undefined);

  // 打开灯箱
  const openLightbox = useCallback((src: string, alt?: string) => {
    setLightboxImage(src);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  }, []);

  // 生成目录
  useEffect(() => {
    if (enableToc && onTocGenerated) {
      const toc = extractToc(content);
      onTocGenerated(toc);
    }
  }, [content, enableToc, onTocGenerated]);

  // 定义 Markdown 组件
  const components = useMemo(() => ({
    // 标题组件
    h1: ({ children }: { children?: React.ReactNode }) => {
      const id = String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return (
        <h1
          id={id}
          className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-border scroll-mt-20"
        >
          {children}
        </h1>
      );
    },
    h2: ({ children }: { children?: React.ReactNode }) => {
      const id = String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return (
        <h2
          id={id}
          className="text-2xl font-semibold mt-8 mb-4 scroll-mt-20"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
      const id = String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return (
        <h3
          id={id}
          className="text-xl font-semibold mt-6 mb-3 scroll-mt-20"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }: { children?: React.ReactNode }) => {
      const id = String(children)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return (
        <h4
          id={id}
          className="text-lg font-semibold mt-4 mb-2 scroll-mt-20"
        >
          {children}
        </h4>
      );
    },

    // 段落
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 leading-relaxed text-foreground/90">
        {children}
      </p>
    ),

    // 列表
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mb-4 pl-6 space-y-1 list-disc">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mb-4 pl-6 space-y-1 list-decimal">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-foreground/90">
        {children}
      </li>
    ),

    // 引用
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote
        className="border-l-4 border-[hsl(var(--accent))] pl-4 py-1 my-4 italic text-muted-foreground bg-muted/50 rounded-r"
      >
        {children}
      </blockquote>
    ),

    // 代码块 - 增强版本
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !className;

      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-[hsl(var(--accent))]">
            {children}
          </code>
        );
      }

      return (
        <CodeBlock
          code={String(children).replace(/\n$/, '')}
          language={language}
          showLineNumbers
        />
      );
    },

    // 预格式文本
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="overflow-x-auto">
        {children}
      </pre>
    ),

    // 表格
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-muted">
        {children}
      </thead>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th
        className="border border-border px-4 py-2 text-left font-semibold"
      >
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border border-border px-4 py-2">
        {children}
      </td>
    ),

    // 链接
    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
      <a
        href={href}
        className="text-[hsl(var(--accent))] hover:underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // 水平线
    hr: () => (
      <hr className="my-8 border-border" />
    ),

    // 图片 - 增强版本支持灯箱
    img: ({ src, alt }: { src?: string; alt?: string }) => {
      const [isHovered, setIsHovered] = useState(false);

      return (
        <>
          <div
            className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg my-4 cursor-zoom-in transition-all duration-200"
              loading="lazy"
              onClick={() => src && openLightbox(src, alt)}
            />
            {isHovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg pointer-events-none transition-opacity duration-200">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </>
      );
    },
  }), []);

  // 使用 DOMPurify 清理内容，防止 XSS
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'img', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'sup', 'sub'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel',
        'src', 'alt', 'loading',
        'class', 'id'
      ],
    });
  }, [content]);

  return (
    <>
      <div className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </div>

      {/* 图片灯箱 */}
      <ImageLightbox
        src={lightboxImage || ''}
        alt={lightboxAlt}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

export default MarkdownRenderer;
