/**
 * BlogDetailPage 组件测试
 * @description 博客详情页的单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BlogDetailPage } from '../BlogDetailPage';
import * as blogService from '@/services/blogService';
import type { BlogArticle } from '@/types/blog';

// 模拟 react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ slug: 'test-article' }),
  };
});

// 模拟 react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// 测试数据
const mockArticle: BlogArticle = {
  id: '1',
  title: '测试文章标题',
  slug: 'test-article',
  description: '这是一个测试文章的描述',
  content: '# 测试内容\n\n这是正文内容。',
  author: {
    id: '1',
    name: '测试作者',
    avatar: 'https://example.com/avatar.png',
    role: '高级工程师',
    bio: '作者简介信息',
  },
  publishDate: '2025-04-28T00:00:00Z',
  updatedAt: '2025-04-28T12:00:00Z',
  readTime: 10,
  viewCount: 1000,
  likeCount: 50,
  commentCount: 10,
  tags: ['AutoSAR', '测试'],
  category: 'MCAL',
  isHot: true,
  coverImage: 'https://example.com/cover.png',
  seo: {
    title: '测试SEO标题',
    description: 'SEO描述',
    keywords: ['测试', '关键词'],
  },
};

const mockRelatedArticles: BlogArticle[] = [
  {
    id: '2',
    title: '相关文章1',
    slug: 'related-1',
    description: '相关文章描述',
    content: '# 内容',
    author: {
      id: '2',
      name: '作者2',
      avatar: 'https://example.com/avatar2.png',
      role: '角色2',
    },
    publishDate: '2025-04-27T00:00:00Z',
    readTime: 5,
    viewCount: 500,
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

describe('BlogDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 默认模拟服务调用
    vi.spyOn(blogService.articleService, 'getArticleBySlug').mockResolvedValue(mockArticle);
    vi.spyOn(blogService.articleService, 'getRelatedArticles').mockResolvedValue(mockRelatedArticles);
    vi.spyOn(blogService.articleService, 'isArticleLiked').mockReturnValue(false);
  });

  it('应该显示加载状态', () => {
    vi.spyOn(blogService.articleService, 'getArticleBySlug').mockImplementation(
      () => new Promise(() => {})
    );
    
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    // 检查加载状态是否显示
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('应该渲染文章详情', async () => {
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('测试文章标题')).toBeInTheDocument();
    });
    
    expect(screen.getByText('这是一个测试文章的描述')).toBeInTheDocument();
    // 作者名称在页面中出现多次，检查是否存在
    expect(screen.getAllByText('测试作者').length).toBeGreaterThan(0);
  });

  it('应该渲染作者信息', async () => {
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      // 作者名称和角色应该存在
      expect(screen.getAllByText('测试作者').length).toBeGreaterThan(0);
      // 角色也出现多次
      expect(screen.getAllByText('高级工程师').length).toBeGreaterThan(0);
      expect(screen.getByText('作者简介信息')).toBeInTheDocument();
    });
  });

  it('应该渲染分类和标签', async () => {
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('MCAL')).toBeInTheDocument();
      expect(screen.getByText('热门')).toBeInTheDocument();
    });
  });

  it('应该显示统计数据', async () => {
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('1,000 阅读')).toBeInTheDocument();
      expect(screen.getByText('50 点赞')).toBeInTheDocument();
      expect(screen.getByText('10 评论')).toBeInTheDocument();
    });
  });

  it('应该渲染相关文章', async () => {
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('相关文章')).toBeInTheDocument();
      expect(screen.getByText('相关文章1')).toBeInTheDocument();
    });
  });

  it('文章不存在时应显示错误信息', async () => {
    vi.spyOn(blogService.articleService, 'getArticleBySlug').mockResolvedValue(null);
    
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('文章不存在')).toBeInTheDocument();
    });
  });

  it('应该格式化发布日期', async () => {
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      // 检查日期格式化显示
      const dateRegex = /2025年/;
      const dateElement = screen.getByText((content) => dateRegex.test(content));
      expect(dateElement).toBeInTheDocument();
    });
  });

  it('应该显示阅读时间', async () => {
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('10 分钟阅读')).toBeInTheDocument();
    });
  });
});

describe('BlogDetailPage - 加载错误', () => {
  it('加载失败时应显示错误信息', async () => {
    vi.spyOn(blogService.articleService, 'getArticleBySlug').mockRejectedValue(new Error('Network error'));
    
    render(
      <MemoryRouter>
        <BlogDetailPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('文章不存在')).toBeInTheDocument();
    });
  });
});
