/**
 * 相关文章推荐组件
 * @description 基于标签相似度算法推荐相关文章
 */

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { BlogArticle } from '@/types/blog';

interface RelatedArticlesProps {
  /** 当前文章 */
  currentArticle: BlogArticle;
  /** 所有文章列表 */
  articles: BlogArticle[];
  /** 最大推荐数量 */
  maxCount?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 计算文章相似度分数
 */
function calculateSimilarity(articleA: BlogArticle, articleB: BlogArticle): number {
  let score = 0;

  // 相同分类 +3
  if (articleA.category === articleB.category) {
    score += 3;
  }

  // 相同标签，每个 +1
  const commonTags = articleA.tags.filter(tag => articleB.tags.includes(tag));
  score += commonTags.length;

  // 相同作者 +1
  if (articleA.author.id === articleB.author.id) {
    score += 1;
  }

  // 都是热门文章 +1
  if (articleA.isHot && articleB.isHot) {
    score += 1;
  }

  return score;
}

/**
 * 相关文章推荐组件
 */
export function RelatedArticles({
  currentArticle,
  articles,
  maxCount = 4,
  className,
}: RelatedArticlesProps) {
  const navigate = useNavigate();

  // 计算相关文章
  const relatedArticles = useMemo(() => {
    // 排除当前文章
    const otherArticles = articles.filter(a => a.id !== currentArticle.id);

    // 计算相似度并排序
    const scored = otherArticles.map(article => ({
      article,
      score: calculateSimilarity(currentArticle, article),
    }));

    // 按分数降序，同分按阅读量排序
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.article.viewCount - a.article.viewCount;
    });

    // 只返回有相似度的文章
    return scored
      .filter(item => item.score > 0)
      .slice(0, maxCount)
      .map(item => item.article);
  }, [currentArticle, articles, maxCount]);

  // 点击跳转
  const handleClick = useCallback((slug: string) => {
    navigate(`#/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  // 如果没有相关文章，不显示
  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-12 pt-8 border-t', className)}>
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        相关文章推荐
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {relatedArticles.map((article, index) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            onClick={() => handleClick(article.slug)}
            className="group cursor-pointer p-4 bg-card border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(article.slug)}
          >
            {/* 分类和标签 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {article.category}
              </span>
              {article.isHot && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                  热门
                </span>
              )}
            </div>

            {/* 标题 */}
            <h4 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h4>

            {/* 描述 */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {article.description}
            </p>

            {/* 元信息 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime} 分钟
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {article.tags.slice(0, 2).join(', ')}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export default RelatedArticles;
