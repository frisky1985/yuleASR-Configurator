/**
 * BlogCard 组件测试
 * @description BlogCard 组件的单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogCard } from '../BlogCard';
import type { BlogArticle } from '@/types/blog';

// 测试数据
const mockArticle: BlogArticle = {
  id: '1',
  title: '测试文章标题',
  slug: 'test-article',
  description: '这是一个测试文章的摘要描述',
  content: '# 测试内容',
  author: {
    id: '1',
    name: '测试作者',
    avatar: 'https://example.com/avatar.png',
    role: '测试角色',
  },
  publishDate: '2025-04-28T00:00:00Z',
  readTime: 10,
  viewCount: 1000,
  likeCount: 50,
  commentCount: 10,
  tags: ['测试', 'AutoSAR'],
  category: 'MCAL',
  isHot: true,
  coverImage: 'https://example.com/cover.png',
  seo: {
    title: '测试SEO标题',
    description: 'SEO描述',
    keywords: ['测试', '关键词'],
  },
};

describe('BlogCard', () => {
  it('应该正确渲染文章标题和摘要', () => {
    render(<BlogCard article={mockArticle} />);
    
    expect(screen.getByText('测试文章标题')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试文章的摘要描述')).toBeInTheDocument();
  });

  it('应该正确显示作者信息', () => {
    render(<BlogCard article={mockArticle} />);
    
    expect(screen.getByText('测试作者')).toBeInTheDocument();
  });

  it('应该正确显示统计数据', () => {
    render(<BlogCard article={mockArticle} />);
    
    expect(screen.getByText('1,000')).toBeInTheDocument(); // 阅读量
    expect(screen.getByText('50')).toBeInTheDocument(); // 点赞数
    expect(screen.getByText('10')).toBeInTheDocument(); // 评论数
  });

  it('应该正确显示阅读时间', () => {
    render(<BlogCard article={mockArticle} />);
    
    expect(screen.getByText('10 分钟')).toBeInTheDocument();
  });

  it('应该显示分类标签', () => {
    render(<BlogCard article={mockArticle} />);
    
    expect(screen.getByText('MCAL')).toBeInTheDocument();
  });

  it('应该显示热门标识当文章是热门文章', () => {
    render(<BlogCard article={mockArticle} />);
    
    expect(screen.getByText('热门')).toBeInTheDocument();
  });

  it('点击卡片时应该触发 onClick 回调', () => {
    const handleClick = vi.fn();
    render(<BlogCard article={mockArticle} onClick={handleClick} />);
    
    const card = screen.getByTestId('blog-card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('点击标签时应该触发 onTagClick 回调', () => {
    const handleTagClick = vi.fn();
    render(<BlogCard article={mockArticle} onTagClick={handleTagClick} />);
    
    const tag = screen.getByText('测试');
    fireEvent.click(tag);
    
    expect(handleTagClick).toHaveBeenCalledWith('测试');
  });

  it('compact 模式不应显示摘要', () => {
    render(<BlogCard article={mockArticle} variant="compact" />);
    
    expect(screen.queryByText('这是一个测试文章的摘要描述')).not.toBeInTheDocument();
  });

  it('compact 模式不应显示评论数', () => {
    render(<BlogCard article={mockArticle} variant="compact" />);
    
    expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

  it('隐藏作者时不应显示作者信息', () => {
    render(<BlogCard article={mockArticle} showAuthor={false} />);
    
    expect(screen.queryByText('测试作者')).not.toBeInTheDocument();
  });

  it('隐藏统计数据时不应显示阅读量等数据', () => {
    render(<BlogCard article={mockArticle} showStats={false} />);
    
    expect(screen.queryByText('1,000')).not.toBeInTheDocument();
  });

  it('featured 模式应显示阅读全文按钮', () => {
    render(<BlogCard article={mockArticle} variant="featured" />);
    
    expect(screen.getByText('阅读全文')).toBeInTheDocument();
  });

  it('应正确格式化发布日期', () => {
    render(<BlogCard article={mockArticle} />);
    
    // 检查日期格式化显示（格式可能因地区而异）
    const dateElement = screen.getByText(/2025年/);
    expect(dateElement).toBeInTheDocument();
  });
});
