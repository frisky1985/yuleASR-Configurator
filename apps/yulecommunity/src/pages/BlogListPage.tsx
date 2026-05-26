/**
 * 博客列表页
 * @description 展示所有博客文章的列表页面，支持分类筛选、标签筛选和搜索
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BookOpen, Filter, X } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BlogArticle, BlogTag, PaginatedResult, BlogCategory } from '@/types/blog';
import { articleService, tagService } from '@/services/blogService';
import { categories } from '@/data/blog/articles';

const PAGE_SIZE = 9;

/**
 * 博客列表页组件
 */
export function BlogListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 获取 URL 参数
  const categoryParam = searchParams.get('category') || '全部';
  const tagParam = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // 状态
  const [articles, setArticles] = useState<PaginatedResult<BlogArticle> | null>(null);
  const [hotArticles, setHotArticles] = useState<BlogArticle[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 并行加载数据
        const [articlesResult, hotResult, tagsResult] = await Promise.all([
          articleService.getArticles({
            category: categoryParam as BlogCategory,
            tag: tagParam || undefined,
            search: searchQuery || undefined,
            page: pageParam,
            pageSize: PAGE_SIZE,
            sortBy: 'date',
            sortOrder: 'desc',
          }),
          articleService.getHotArticles(5),
          tagService.getHotTags(15),
        ]);

        setArticles(articlesResult);
        setHotArticles(hotResult);
        setTags(tagsResult);
      } catch (err) {
        setError('加载文章失败，请稍后重试');
        console.error('Failed to load blog data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryParam, tagParam, searchQuery, pageParam]);

  // 更新 URL 参数
  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // 如果更改了筛选条件，重置到第一页
    if ('category' in updates || 'tag' in updates || 'search' in updates) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // 分类选择
  const handleCategoryChange = useCallback((category: string) => {
    updateParams({ category: category === '全部' ? undefined : category });
  }, [updateParams]);

  // 标签选择
  const handleTagClick = useCallback((tag: string) => {
    const newTag = tag === tagParam ? undefined : tag;
    updateParams({ tag: newTag });
  }, [tagParam, updateParams]);

  // 搜索
  const handleSearch = useCallback((query: string) => {
    updateParams({ search: query || undefined });
  }, [updateParams]);

  // 清除筛选
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // 分页
  const handlePageChange = useCallback((page: number) => {
    updateParams({ page: String(page) });
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateParams]);

  // 打开文章详情
  const handleArticleClick = useCallback((slug: string) => {
    navigate(`#/blog/${slug}`);
  }, [navigate]);

  // 是否有活动筛选
  const hasActiveFilters = categoryParam !== '全部' || tagParam || searchQuery;

  // SEO 元信息
  const seoTitle = useMemo(() => {
    if (searchQuery) return `搜索: ${searchQuery} - 技术博客`;
    if (tagParam) return `标签: ${tagParam} - 技术博客`;
    if (categoryParam !== '全部') return `${categoryParam} - 技术博客`;
    return '技术博客 - YuleCommunity';
  }, [searchQuery, tagParam, categoryParam]);

  const seoDescription = useMemo(() => {
    if (searchQuery) return `搜索 "${searchQuery}" 的博客文章结果`;
    if (tagParam) return `查看标签 "${tagParam}" 下的所有文章`;
    if (categoryParam !== '全部') return `查看 ${categoryParam} 分类下的技术文章`;
    return '深度技术博客，分享 AutoSAR、汽车软件开发、功能安全等领域的专业知识';
  }, [searchQuery, tagParam, categoryParam]);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content="AutoSAR, 汽车软件, MCAL, BSW, 技术博客" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* 页面头部 */}
        <section className="relative bg-gradient-hero py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                技术博客
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto text-lg">
                深度探讨 AutoSAR、汽车软件开发和功能安全等技术领域
              </p>
            </motion.div>
          </div>
        </section>

        {/* 主内容区 */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 分类筛选 */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-full transition-all',
                      categoryParam === category || (category === '全部' && categoryParam === '全部')
                        ? 'bg-[hsl(var(--accent))] text-accent-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 活动筛选标签 */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex flex-wrap items-center gap-2"
              >
                <span className="text-sm text-muted-foreground">当前筛选:</span>
                {categoryParam !== '全部' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    分类: {categoryParam}
                    <button onClick={() => handleCategoryChange('全部')} className="hover:text-primary/70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {tagParam && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">
                    标签: {tagParam}
                    <button onClick={() => handleTagClick(tagParam)} className="hover:text-accent/70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                    搜索: {searchQuery}
                    <button onClick={() => handleSearch('')} className="hover:text-foreground/70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  清除全部
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 文章列表 */}
              <div className="lg:col-span-2">
                {loading ? (
                  // 加载状态
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                        <div className="h-48 bg-muted rounded-lg mb-4" />
                        <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  // 错误状态
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>重试</Button>
                  </div>
                ) : articles?.data.length === 0 ? (
                  // 空状态
                  <div className="text-center py-12 bg-card border border-border rounded-2xl">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">暂无文章</h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? '没有找到符合条件的文章'
                        : '该分类下暂无文章'}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" className="mt-4" onClick={clearFilters}>
                        清除筛选
                      </Button>
                    )}
                  </div>
                ) : (
                  // 文章列表
                  <>
                    <div className="space-y-6">
                      {articles?.data.map((article) => (
                        <BlogCard
                          key={article.id}
                          article={article}
                          onClick={() => handleArticleClick(article.slug)}
                          onTagClick={handleTagClick}
                        />
                      ))}
                    </div>

                    {/* 分页 */}
                    {articles && articles.totalPages > 1 && (
                      <div className="mt-8 flex justify-center items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={articles.page === 1}
                          onClick={() => handlePageChange(articles.page - 1)}
                        >
                          上一页
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(articles.totalPages)].map((_, i) => {
                            const page = i + 1;
                            const isActive = page === articles.page;
                            const isNearCurrent = Math.abs(page - articles.page) <= 1;
                            const isBoundary = page === 1 || page === articles.totalPages;
                            
                            if (!isNearCurrent && !isBoundary) {
                              if (page === 2 || page === articles.totalPages - 1) {
                                return <span key={page} className="px-2 text-muted-foreground">…</span>;
                              }
                              return null;
                            }

                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={cn(
                                  'w-8 h-8 text-sm font-medium rounded transition-colors',
                                  isActive
                                    ? 'bg-[hsl(var(--accent))] text-accent-foreground'
                                    : 'hover:bg-muted'
                                )}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={articles.page === articles.totalPages}
                          onClick={() => handlePageChange(articles.page + 1)}
                        >
                          下一页
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 侧边栏 */}
              <div className="lg:col-span-1">
                <BlogSidebar
                  hotArticles={hotArticles}
                  tags={tags}
                  selectedTag={tagParam}
                  onSearch={handleSearch}
                  onTagClick={handleTagClick}
                  onArticleClick={handleArticleClick}
                  className="sticky top-20"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default BlogListPage;
