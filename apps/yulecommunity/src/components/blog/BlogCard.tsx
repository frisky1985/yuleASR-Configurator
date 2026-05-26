/**
 * 博客卡片组件
 * @description 展示博客文章概要的卡片组件
 */

import { Calendar, Clock, Eye, Heart, MessageSquare, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlogArticle } from '@/types/blog';
import { cn } from '@/lib/utils';

export interface BlogCardProps {
  /** 文章数据 */
  article: BlogArticle;
  /** 卡片变体样式 */
  variant?: 'default' | 'compact' | 'featured';
  /** 是否显示摘要 */
  showExcerpt?: boolean;
  /** 是否显示作者 */
  showAuthor?: boolean;
  /** 是否显示统计数据 */
  showStats?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 标签点击回调 */
  onTagClick?: (tag: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 格式化日期
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 博客卡片组件
 */
export function BlogCard({
  article,
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showStats = true,
  onClick,
  onTagClick,
  className,
}: BlogCardProps) {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative bg-card border border-border rounded-2xl overflow-hidden',
        'hover:shadow-elegant transition-shadow duration-300',
        'cursor-pointer',
        isCompact && 'flex flex-row items-stretch',
        isFeatured && 'md:flex-row',
        className
      )}
      onClick={onClick}
      data-testid="blog-card"
    >
      {/* 封面图片 */}
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          isCompact ? 'w-32 sm:w-48 shrink-0' : 'h-48',
          isFeatured && 'md:w-2/5 md:h-auto h-56'
        )}
      >
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-4xl font-bold text-primary/20">
              {article.title.charAt(0)}
            </span>
          </div>
        )}

        {/* 热门标识 */}
        {article.isHot && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
              热门
            </span>
          </div>
        )}

        {/* 分类标签 */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
            {article.category}
          </span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className={cn(
        'flex flex-col',
        isCompact ? 'p-4 flex-1' : 'p-5',
        isFeatured && 'md:p-6'
      )}>
        {/* 标题 */}
        <h3
          className={cn(
            'font-semibold text-foreground group-hover:text-[hsl(var(--accent))] transition-colors line-clamp-2',
            isCompact ? 'text-base mb-2' : 'text-lg mb-3',
            isFeatured && 'md:text-xl'
          )}
        >
          {article.title}
        </h3>

        {/* 摘要 */}
        {showExcerpt && !isCompact && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
            {article.description}
          </p>
        )}

        {/* 标签 */}
        {!isCompact && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80 transition-colors"
              >
                {tag}
              </button>
            ))}
            {article.tags.length > 4 && (
              <span className="px-2 py-0.5 text-muted-foreground text-xs">
                +{article.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* 元信息 */}
        <div className={cn(
          'mt-auto flex items-center gap-3 text-xs text-muted-foreground',
          isCompact ? 'flex-wrap' : 'justify-between'
        )}>
          {/* 左侧：作者和日期 */}
          <div className="flex items-center gap-3">
            {showAuthor && (
              <div className="flex items-center gap-1.5">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-5 h-5 rounded-full"
                />
                <span className="font-medium">{article.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(article.publishDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime} 分钟</span>
            </div>
          </div>

          {/* 统计数据 */}
          {showStats && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>{article.likeCount}</span>
              </div>
              {!isCompact && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{article.commentCount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 阅读更多（特色卡片） */}
        {isFeatured && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--accent))] group-hover:gap-2 transition-all">
              阅读全文
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default BlogCard;
