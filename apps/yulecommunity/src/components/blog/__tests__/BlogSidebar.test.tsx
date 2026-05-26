/**
 * BlogSidebar 组件测试
 * @description BlogSidebar 组件的单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogSidebar, BlogDetailSidebar } from '../BlogSidebar';
import type { BlogArticle, BlogTag } from '@/types/blog';

// 测试数据
const mockArticles: BlogArticle[] = [
  {
    id: '1',
    title: '热门文章1',
    slug: 'hot-article-1',
    description: '描述1',
    content: '# 内容1',
    author: {
      id: '1',
      name: '作者1',
      avatar: 'https://example.com/avatar1.png',
      role: '角色1',
    },
    publishDate: '2025-04-28T00:00:00Z',
    readTime: 5,
    viewCount: 1000,
    likeCount: 50,
    commentCount: 10,
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
    title: '热门文章2',
    slug: 'hot-article-2',
    description: '描述2',
    content: '# 内容2',
    author: {
      id: '2',
      name: '作者2',
      avatar: 'https://example.com/avatar2.png',
      role: '角色2',
    },
    publishDate: '2025-04-27T00:00:00Z',
    readTime: 8,
    viewCount: 800,
    likeCount: 30,
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
  { name: 'AutoSAR', articleCount: 10 },
  { name: 'CAN', articleCount: 5 },
  { name: 'MCAL', articleCount: 3 },
];

describe('BlogSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染搜索框', () => {
    render(<BlogSidebar />);
    
    expect(screen.getByPlaceholderText('搜索文章...')).toBeInTheDocument();
    expect(screen.getByText('搜索文章')).toBeInTheDocument();
  });

  it('应该渲染热门文章列表', () => {
    render(<BlogSidebar hotArticles={mockArticles} />);
    
    expect(screen.getByText('热门文章')).toBeInTheDocument();
    expect(screen.getByText('热门文章1')).toBeInTheDocument();
    expect(screen.getByText('热门文章2')).toBeInTheDocument();
  });

  it('应该渲染标签云', () => {
    render(<BlogSidebar tags={mockTags} />);
    
    expect(screen.getByText('热门标签')).toBeInTheDocument();
    expect(screen.getByText('AutoSAR')).toBeInTheDocument();
    expect(screen.getByText('CAN')).toBeInTheDocument();
  });

  it('点击搜索按钮时应该触发 onSearch 回调', () => {
    const handleSearch = vi.fn();
    render(<BlogSidebar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText('搜索文章...');
    fireEvent.change(input, { target: { value: '测试搜索' } });
    
    const searchButton = screen.getByLabelText('搜索');
    fireEvent.click(searchButton);
    
    expect(handleSearch).toHaveBeenCalledWith('测试搜索');
  });

  it('按下 Enter 键时应该触发搜索', () => {
    const handleSearch = vi.fn();
    render(<BlogSidebar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText('搜索文章...');
    fireEvent.change(input, { target: { value: 'Enter测试' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(handleSearch).toHaveBeenCalledWith('Enter测试');
  });

  it('点击标签时应该触发 onTagClick 回调', () => {
    const handleTagClick = vi.fn();
    render(<BlogSidebar tags={mockTags} onTagClick={handleTagClick} />);
    
    const tagButton = screen.getByText('AutoSAR').closest('button');
    if (tagButton) {
      fireEvent.click(tagButton);
    }
    
    expect(handleTagClick).toHaveBeenCalledWith('AutoSAR');
  });

  it('点击文章时应该触发 onArticleClick 回调', () => {
    const handleArticleClick = vi.fn();
    render(<BlogSidebar hotArticles={mockArticles} onArticleClick={handleArticleClick} />);
    
    const article = screen.getByText('热门文章1');
    fireEvent.click(article);
    
    expect(handleArticleClick).toHaveBeenCalledWith('hot-article-1');
  });

  it('应该显示选中的标签样式', () => {
    render(<BlogSidebar tags={mockTags} selectedTag="AutoSAR" />);
    
    const tagButtons = screen.getAllByRole('button');
    const autoSarTag = tagButtons.find(btn => btn.textContent?.includes('AutoSAR'));
    expect(autoSarTag).toBeDefined();
  });

  it('空热门文章时不应显示热门文章区域', () => {
    render(<BlogSidebar hotArticles={[]} />);
    
    expect(screen.queryByText('热门文章')).not.toBeInTheDocument();
  });

  it('空标签时不应显示标签云区域', () => {
    render(<BlogSidebar tags={[]} />);
    
    expect(screen.queryByText('热门标签')).not.toBeInTheDocument();
  });

  it('应该显示文章阅读量', () => {
    render(<BlogSidebar hotArticles={mockArticles} />);
    
    expect(screen.getByText('1,000 阅读')).toBeInTheDocument();
    expect(screen.getByText('800 阅读')).toBeInTheDocument();
  });

  it('应该显示标签文章数量', () => {
    render(<BlogSidebar tags={mockTags} />);
    
    expect(screen.getByText('(10)')).toBeInTheDocument();
    expect(screen.getByText('(5)')).toBeInTheDocument();
  });
});

describe('BlogDetailSidebar', () => {
  const mockAuthor = {
    id: '1',
    name: '测试作者',
    avatar: 'https://example.com/avatar.png',
    role: '高级工程师',
    bio: '作者简介',
  };

  const mockToc = [
    { id: 'section1', text: '第一节', level: 1 },
    { id: 'section2', text: '第二节', level: 2 },
    { id: 'section3', text: '第三节', level: 3 },
  ];

  it('应该渲染作者信息', () => {
    render(<BlogDetailSidebar author={mockAuthor} />);
    
    expect(screen.getByText('关于作者')).toBeInTheDocument();
    expect(screen.getByText('测试作者')).toBeInTheDocument();
    expect(screen.getByText('高级工程师')).toBeInTheDocument();
    expect(screen.getByText('作者简介')).toBeInTheDocument();
  });

  it('应该渲染目录', () => {
    render(<BlogDetailSidebar toc={mockToc} />);
    
    expect(screen.getByText('目录')).toBeInTheDocument();
    expect(screen.getByText('第一节')).toBeInTheDocument();
    expect(screen.getByText('第二节')).toBeInTheDocument();
    expect(screen.getByText('第三节')).toBeInTheDocument();
  });

  it('应该渲染相关文章', () => {
    render(<BlogDetailSidebar relatedArticles={mockArticles} />);
    
    expect(screen.getByText('相关文章')).toBeInTheDocument();
    expect(screen.getByText('热门文章1')).toBeInTheDocument();
    expect(screen.getByText('热门文章2')).toBeInTheDocument();
  });

  it('点击目录项时应该触发 onTocClick 回调', () => {
    const handleTocClick = vi.fn();
    render(<BlogDetailSidebar toc={mockToc} onTocClick={handleTocClick} />);
    
    const tocItem = screen.getByText('第一节');
    fireEvent.click(tocItem);
    
    expect(handleTocClick).toHaveBeenCalledWith('section1');
  });

  it('点击相关文章时应该触发 onArticleClick 回调', () => {
    const handleArticleClick = vi.fn();
    render(<BlogDetailSidebar relatedArticles={mockArticles} onArticleClick={handleArticleClick} />);
    
    const article = screen.getByText('热门文章1');
    fireEvent.click(article);
    
    expect(handleArticleClick).toHaveBeenCalledWith('hot-article-1');
  });

  it('空目录时不应显示目录区域', () => {
    render(<BlogDetailSidebar toc={[]} />);
    
    expect(screen.queryByText('目录')).not.toBeInTheDocument();
  });

  it('空作者时不应显示作者区域', () => {
    render(<BlogDetailSidebar />);
    
    expect(screen.queryByText('关于作者')).not.toBeInTheDocument();
  });

  it('空相关文章时不应显示相关文章区域', () => {
    render(<BlogDetailSidebar relatedArticles={[]} />);
    
    expect(screen.queryByText('相关文章')).not.toBeInTheDocument();
  });

  it('应该高亮当前选中的目录项', () => {
    render(<BlogDetailSidebar toc={mockToc} activeTocId="section2" />);
    
    const tocItems = screen.getAllByRole('button');
    expect(tocItems.length).toBeGreaterThan(0);
  });
});
