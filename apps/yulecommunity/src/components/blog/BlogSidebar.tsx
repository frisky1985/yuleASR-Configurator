/**
 * 博客侧边栏组件
 * @description 博客页面的侧边栏，包含搜索、标签云、热门文章和作者信息
 */

import { useState, useCallback } from 'react';
import { Search, TrendingUp, Tag, User, Flame, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlogArticle, BlogTag } from '@/types/blog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface BlogSidebarProps {
  /** 热门文章 */
  hotArticles?: BlogArticle[];
  /** 标签列表 */
  tags?: BlogTag[];
  /** 当前选中的标签 */
  selectedTag?: string;
  /** 搜索回调 */
  onSearch?: (query: string) => void;
  /** 标签点击回调 */
  onTagClick?: (tag: string) => void;
  /** 文章点击回调 */
  onArticleClick?: (slug: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 博客侧边栏组件
 */
export function BlogSidebar({
  hotArticles = [],
  tags = [],
  selectedTag,
  onSearch,
  onTagClick,
  onArticleClick,
  className,
}: BlogSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  }, [searchQuery, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <aside className={cn('space-y-6', className)}>
      {/* 搜索框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-[hsl(var(--accent))]" />
          搜索文章
        </h3>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={handleSearch}
            aria-label="搜索"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* 热门文章 */}
      {hotArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            热门文章
          </h3>
          <div className="space-y-3">
            {hotArticles.map((article, index) => (
              <div
                key={article.id}
                onClick={() => onArticleClick?.(article.slug)}
                className="group flex gap-3 cursor-pointer"
              >
                <span className={cn(
                  'flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded',
                  index < 3
                    ? 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-[hsl(var(--accent))] transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>{article.viewCount.toLocaleString()} 阅读</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 标签云 */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[hsl(var(--primary))]" />
            热门标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => onTagClick?.(tag.name)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full transition-all duration-200',
                  selectedTag === tag.name
                    ? 'bg-[hsl(var(--accent))] text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3 h-3" />
                  {tag.name}
                  <span className="text-xs opacity-60">({tag.articleCount})</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </aside>
  );
}

/**
 * 博客详情页侧边栏
 */
export interface BlogDetailSidebarProps {
  /** 作者信息 */
  author?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    bio?: string;
  };
  /** 目录项 */
  toc?: Array<{ id: string; text: string; level: number }>;
  /** 相关文章 */
  relatedArticles?: BlogArticle[];
  /** 当前目录项 */
  activeTocId?: string;
  /** 目录项点击回调 */
  onTocClick?: (id: string) => void;
  /** 文章点击回调 */
  onArticleClick?: (slug: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 博客详情页侧边栏组件
 */
export function BlogDetailSidebar({
  author,
  toc = [],
  relatedArticles = [],
  activeTocId,
  onTocClick,
  onArticleClick,
  className,
}: BlogDetailSidebarProps) {
  return (
    <aside className={cn('space-y-6', className)}>
      {/* 作者信息 */}
      {author && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[hsl(var(--accent))]" />
            关于作者
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-12 h-12 rounded-full border-2 border-border"
            />
            <div>
              <h4 className="font-medium">{author.name}</h4>
              <p className="text-xs text-muted-foreground">{author.role}</p>
            </div>
          </div>
          {author.bio && (
            <p className="text-sm text-muted-foreground">{author.bio}</p>
          )}
        </motion.div>
      )}

      {/* 目录 */}
      {toc.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4 sticky top-4"
        >
          <h3 className="text-sm font-semibold mb-4">目录</h3>
          <nav className="space-y-1">
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => onTocClick?.(item.id)}
                className={cn(
                  'block w-full text-left text-sm py-1 px-2 rounded transition-colors',
                  item.level === 1 && 'font-medium',
                  item.level === 2 && 'pl-4',
                  item.level === 3 && 'pl-6 text-xs',
                  activeTocId === item.id
                    ? 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </motion.div>
      )}

      {/* 相关文章 */}
      {relatedArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-4">相关文章</h3>
          <div className="space-y-3">
            {relatedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onArticleClick?.(article.slug)}
                className="group cursor-pointer"
              >
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-[hsl(var(--accent))] transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{article.category}</span>
                  <span>·</span>
                  <span>{article.readTime} 分钟</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </aside>
  );
}

export default BlogSidebar;
