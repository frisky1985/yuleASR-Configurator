/**
 * 博客详情页
 * @description 展示单篇博客文章的详细内容，包含Markdown渲染、目录、相关文章等
 * 集成阅读进度条和返回顶部功能
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  ChevronLeft,
  Share2,
  Tag,
  Folder,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { BlogDetailSidebar } from '@/components/blog/BlogSidebar';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BlogArticle, TocItem } from '@/types/blog';
import { articleService } from '@/services/blogService';
import { BlogArticleSEOWrapper } from '@/components/seo';
import { BookmarkButton, NewsletterSignup, RelatedArticles } from '@/components/engagement';

/**
 * 博客详情页组件
 */
export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // 状态
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // 加载文章数据
  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError('文章不存在');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [articleData, relatedData] = await Promise.all([
          articleService.getArticleBySlug(slug),
          articleService.getRelatedArticles(slug, 4),
        ]);

        if (!articleData) {
          setError('文章不存在或已被删除');
        } else {
          setArticle(articleData);
          setRelatedArticles(relatedData);
          // 检查是否已点赞
          setIsLiked(articleService.isArticleLiked(articleData.id));
        }
      } catch (err) {
        setError('加载文章失败，请稍后重试');
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // 监听滚动更新当前目录项
  useEffect(() => {
    if (!article || toc.length === 0) return;

    const handleScroll = () => {
      const headings = toc.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading && heading.offsetTop <= scrollPosition) {
          setActiveTocId(toc[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化

    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, toc]);

  // 目录生成回调
  const handleTocGenerated = useCallback((generatedToc: TocItem[]) => {
    setToc(generatedToc);
  }, []);

  // 点击目录项
  const handleTocClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTocId(id);
    }
  }, []);

  // 点赞/取消点赞
  const handleLike = useCallback(async () => {
    if (!article) return;

    try {
      const newLiked = await articleService.toggleLike(article.id);
      setIsLiked(newLiked);
      // 更新本地点赞数
      setArticle(prev => prev ? {
        ...prev,
        likeCount: newLiked ? prev.likeCount + 1 : prev.likeCount - 1
      } : null);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  }, [article]);

  // 分享
  const handleShare = useCallback(async () => {
    if (!article) return;

    const shareData = {
      title: article.title,
      text: article.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 用户取消分享
      }
    } else {
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(window.location.href);
        // 可以添加 toast 提示
        alert('链接已复制到剪贴板');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [article]);

  // 返回列表
  const handleBack = useCallback(() => {
    navigate('#/blog');
  }, [navigate]);

  // 打开相关文章
  const handleArticleClick = useCallback((slug: string) => {
    navigate(`#/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  // 格式化日期
  const formatDate = useMemo(() => (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !article) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
          <p className="text-muted-foreground mb-6">{error || '无法找到请求的文章'}</p>
          <Button onClick={handleBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            返回博客列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <BlogArticleSEOWrapper
      title={article.title}
      description={article.description}
      slug={article.slug}
      coverImage={article.coverImage || '/images/hero-bg.png'}
      author={{
        name: article.author.name,
        url: `https://frisky1985.github.io/yuleCommunity/blog?author=${article.author.id}`,
      }}
      publishDate={article.publishDate}
      updatedAt={article.updatedAt}
      tags={article.tags}
      category={article.category}
    >
      {/* 阅读进度条 */}
      <ReadingProgress
        targetSelector="article"
        showPercentage
        percentagePosition="right"
      />

      {/* 返回顶部按钮 */}
      <ScrollToTop
        threshold={500}
        showProgress
        position="right"
        bottomOffset={80}
      />

      <div className="min-h-screen bg-background">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className={cn(isLiked && 'text-red-500')}
                >
                  <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                
                {/* 收藏按钮 */}
                {article && <BookmarkButton article={article} variant="icon" />}
              </div>
            </div>
          </div>
        </div>

        {/* 文章头部 */}
        <header className="py-12 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* 分类和标签 */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  <Folder className="w-3.5 h-3.5" />
                  {article.category}
                </span>
                {article.isHot && (
                  <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full">
                    热门
                  </span>
                )}
              </div>

              {/* 标题 */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {article.title}
              </h1>

              {/* 摘要 */}
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {article.description}
              </p>

              {/* 作者信息和统计 */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full border-2 border-border"
                  />
                  <div>
                    <div className="font-medium">{article.author.name}</div>
                    <div className="text-sm text-muted-foreground">{article.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.publishDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime} 分钟阅读</span>
                  </div>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span>{article.viewCount.toLocaleString()} 阅读</span>
                </div>
                <button
                  onClick={handleLike}
                  className={cn(
                    'flex items-center gap-2 transition-colors',
                    isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                  <span>{article.likeCount} 点赞</span>
                </button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>{article.commentCount} 评论</span>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* 文章主体 */}
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* 文章内容 */}
              <div className="lg:col-span-3">
                <motion.article
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-card border border-border rounded-2xl p-6 md:p-10"
                >
                  {article.coverImage && (
                    <div className="mb-8 -mx-6 -mt-6 md:-mx-10 md:-mt-10">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-64 md:h-80 object-cover rounded-t-2xl"
                      />
                    </div>
                  )}

                  <MarkdownRenderer
                    content={article.content}
                    enableToc
                    onTocGenerated={handleTocGenerated}
                  />
                </motion.article>

                {/* 标签 */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {article.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => navigate(`#/blog?tag=${encodeURIComponent(tag)}`)}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full hover:bg-secondary/80 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* 作者卡片 */}
                <div className="mt-8 bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-16 h-16 rounded-full border-2 border-border"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{article.author.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{article.author.role}</p>
                      {article.author.bio && (
                        <p className="text-sm text-muted-foreground">{article.author.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Newsletter 订阅 */}
                <NewsletterSignup 
                  variant="article-end" 
                  articleTitle={article.title}
                  className="mt-8"
                />

                {/* 相关文章推荐 */}
                <RelatedArticles
                  currentArticle={article}
                  articles={relatedArticles}
                  maxCount={4}
                />
              </div>

              {/* 侧边栏 */}
              <div className="lg:col-span-1 hidden lg:block">
                <BlogDetailSidebar
                  toc={toc}
                  relatedArticles={relatedArticles}
                  activeTocId={activeTocId}
                  onTocClick={handleTocClick}
                  onArticleClick={handleArticleClick}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </BlogArticleSEOWrapper>
  );
}

export default BlogDetailPage;
