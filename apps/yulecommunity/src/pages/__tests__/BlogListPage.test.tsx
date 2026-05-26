/**
 * BlogListPage 组件测试
 * @description 博客列表页的单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BlogListPage } from '../BlogListPage';
import * as blogService from '@/services/blogService';
import type { BlogArticle, BlogTag, PaginatedResult } from '@/types/blog';

// 模拟 react-router-dom 的 useSearchParams
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
    useNavigate: () => vi.fn(),
  };
});

// 测试数据
const mockArticles: BlogArticle[] = [
  {
    id: '1',
    title: '测试文章1',
    slug: 'test-article-1',
    description: '测试摘要1',
    content: '# 内容1',
    author: {
      id: '1',
      name: '作者1',
      avatar: 'https://example.com/avatar1.png',
      role: '角色1',
    },
    publishDate: '2025-04-28T00:00:00Z',
    readTime: 5,
    viewCount: 100,
    likeCount: 10,
    commentCount: 2,
    tags: ['AutoSAR'],
    category: 'MCAL',
    isHot: true,
    seo: {
      title: 'SEO1',
      description: 'Desc1',
      keywords: ['kw1'],
    },
  },
  {
    id: '2',
    title: '测试文章2',
    slug: 'test-article-2',
    description: '测试摘要2',
    content: '# 内容2',
    author: {
      id: '2',
      name: '作者2',
      avatar: 'https://example.com/avatar2.png',
      role: '角色2',
    },
    publishDate: '2025-04-27T00:00:00Z',
    readTime: 8,
    viewCount: 200,
    likeCount: 20,
    commentCount: 5,
    tags: ['CAN'],
    category: 'ECUAL',
    isHot: false,
    seo: {
      title: 'SEO2',
      description: 'Desc2',
      keywords: ['kw2'],
    },
  },
];

const mockTags: BlogTag[] = [
  { name: 'AutoSAR', articleCount: 5 },
  { name: 'CAN', articleCount: 3 },
];

const mockPaginatedResult: PaginatedResult<BlogArticle> = {
  data: mockArticles,
  total: 2,
  page: 1,
  pageSize: 9,
  totalPages: 1,
};

describe('BlogListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 模拟服务调用
    vi.spyOn(blogService.articleService, 'getArticles').mockResolvedValue(mockPaginatedResult);
    vi.spyOn(blogService.articleService, 'getHotArticles').mockResolvedValue([mockArticles[0]]);
    vi.spyOn(blogService.tagService, 'getHotTags').mockResolvedValue(mockTags);
  });

  it('应该渲染页面标题', async () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('技术博客')).toBeInTheDocument();
    });
  });

  it('应该渲染文章列表', async () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // 使用 getAllByText 因为文本可能出现在多个地方
      const article1Titles = screen.getAllByText('测试文章1');
      const article2Titles = screen.getAllByText('测试文章2');
      expect(article1Titles.length).toBeGreaterThan(0);
      expect(article2Titles.length).toBeGreaterThan(0);
    });
  });

  it('应该渲染分类筛选按钮', async () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('MCAL')).toBeInTheDocument();
      expect(screen.getByText('ECUAL')).toBeInTheDocument();
    });
  });

  it('应该渲染热门文章区域', async () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('热门文章')).toBeInTheDocument();
    });
  });

  it('应该渲染标签云', async () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // 使用 container 查询来查找侧边栏中的标签
      const tagElements = screen.getAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && content.includes('AutoSAR');
      });
      expect(tagElements.length).toBeGreaterThan(0);
    });
  });

  it('应该显示搜索框', async () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('搜索文章...')).toBeInTheDocument();
    });
  });

  it('加载状态应该显示加载动画', () => {
    vi.spyOn(blogService.articleService, 'getArticles').mockImplementation(
      () => new Promise(() => {}) // 永不解析
    );

    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    // 检查加载状态是否显示
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('错误状态应该显示错误信息', async () => {
    vi.spyOn(blogService.articleService, 'getArticles').mockRejectedValue(new Error('加载失败'));

    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('加载文章失败，请稍后重试')).toBeInTheDocument();
    });
  });
});
