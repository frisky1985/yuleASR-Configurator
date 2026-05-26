/**
 * blogService 测试
 * @description 博客服务层的单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  articleService,
  tagService,
  commentService,
} from '../blogService';
import { comments } from '@/data/blog/articles';
import type { BlogCategory } from '@/types/blog';

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('articleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  describe('getArticles', () => {
    it('应该返回分页的文章列表', async () => {
      const result = await articleService.getArticles({ page: 1, pageSize: 5 });
      
      expect(result.data).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(5);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeGreaterThan(0);
    });

    it('应该按分类过滤文章', async () => {
      const result = await articleService.getArticles({ 
        category: 'MCAL' as BlogCategory,
        page: 1,
        pageSize: 10,
      });
      
      expect(result.data.every(article => article.category === 'MCAL')).toBe(true);
    });

    it('应该按标签过滤文章', async () => {
      const result = await articleService.getArticles({ 
        tag: 'AutoSAR',
        page: 1,
        pageSize: 10,
      });
      
      expect(result.data.every(article => 
        article.tags.some(t => t.toLowerCase() === 'autosar')
      )).toBe(true);
    });

    it('应该按搜索词过滤文章', async () => {
      const result = await articleService.getArticles({ 
        search: 'AutoSAR',
        page: 1,
        pageSize: 10,
      });
      
      expect(result.data.length).toBeGreaterThanOrEqual(0);
    });

    it('应该按日期排序', async () => {
      const result = await articleService.getArticles({ 
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 5,
      });
      
      // 检查是否按日期降序排序
      for (let i = 0; i < result.data.length - 1; i++) {
        const current = new Date(result.data[i].publishDate).getTime();
        const next = new Date(result.data[i + 1].publishDate).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('应该按阅读量排序', async () => {
      const result = await articleService.getArticles({ 
        sortBy: 'views',
        sortOrder: 'desc',
        page: 1,
        pageSize: 5,
      });
      
      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].viewCount).toBeGreaterThanOrEqual(result.data[i + 1].viewCount);
      }
    });

    it('应该按点赞数排序', async () => {
      const result = await articleService.getArticles({ 
        sortBy: 'likes',
        sortOrder: 'desc',
        page: 1,
        pageSize: 5,
      });
      
      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].likeCount).toBeGreaterThanOrEqual(result.data[i + 1].likeCount);
      }
    });

    it('应该支持升序排序', async () => {
      const result = await articleService.getArticles({ 
        sortBy: 'date',
        sortOrder: 'asc',
        page: 1,
        pageSize: 5,
      });
      
      for (let i = 0; i < result.data.length - 1; i++) {
        const current = new Date(result.data[i].publishDate).getTime();
        const next = new Date(result.data[i + 1].publishDate).getTime();
        expect(current).toBeLessThanOrEqual(next);
      }
    });
  });

  describe('getArticleById', () => {
    it('应该通过 ID 获取文章', async () => {
      const article = await articleService.getArticleById('1');
      
      expect(article).not.toBeNull();
      expect(article?.id).toBe('1');
    });

    it('不存在的 ID 应返回 null', async () => {
      const article = await articleService.getArticleById('non-existent');
      
      expect(article).toBeNull();
    });
  });

  describe('getArticleBySlug', () => {
    it('应该通过 slug 获取文章并增加阅读量', async () => {
      const article = await articleService.getArticleBySlug('autosar-bsw-layered-architecture');
      
      expect(article).not.toBeNull();
      expect(article?.slug).toBe('autosar-bsw-layered-architecture');
    });

    it('不存在的 slug 应返回 null', async () => {
      const article = await articleService.getArticleBySlug('non-existent');
      
      expect(article).toBeNull();
    });
  });

  describe('getHotArticles', () => {
    it('应该返回指定数量的热门文章', async () => {
      const articles = await articleService.getHotArticles(3);
      
      expect(articles.length).toBeLessThanOrEqual(3);
    });

    it('默认返回 5 篇热门文章', async () => {
      const articles = await articleService.getHotArticles();
      
      expect(articles.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getRelatedArticles', () => {
    it('应该返回相关文章', async () => {
      const articles = await articleService.getRelatedArticles('1', 3);
      
      expect(articles.length).toBeLessThanOrEqual(3);
      // 相关文章不应包含当前文章
      expect(articles.every(a => a.id !== '1')).toBe(true);
    });
  });

  describe('searchArticles', () => {
    it('应该返回匹配搜索词的文章', async () => {
      const articles = await articleService.searchArticles('AutoSAR');
      
      expect(articles.length).toBeGreaterThanOrEqual(0);
    });

    it('空搜索词应返回所有文章', async () => {
      const allArticles = await articleService.searchArticles('');
      expect(allArticles.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('incrementViewCount', () => {
    it('应该增加文章阅读量', async () => {
      const article = await articleService.getArticleById('1');
      const initialCount = article?.viewCount || 0;
      
      await articleService.incrementViewCount('1');
      
      const updatedArticle = await articleService.getArticleById('1');
      expect(updatedArticle?.viewCount).toBe(initialCount + 1);
    });
  });

  describe('toggleLike', () => {
    it('点赞文章应增加点赞数', async () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const result = await articleService.toggleLike('1');
      
      expect(result).toBe(true); // 表示新增点赞
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('取消点赞应减少点赞数', async () => {
      localStorageMock.getItem.mockReturnValue('["1"]');
      
      const result = await articleService.toggleLike('1');
      
      expect(result).toBe(false); // 表示取消点赞
    });

    it('不存在的文章应返回 false', async () => {
      const result = await articleService.toggleLike('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('isArticleLiked', () => {
    it('已点赞的文章应返回 true', () => {
      localStorageMock.getItem.mockReturnValue('["1", "2"]');
      
      const result = articleService.isArticleLiked('1');
      
      expect(result).toBe(true);
    });

    it('未点赞的文章应返回 false', () => {
      localStorageMock.getItem.mockReturnValue('["1"]');
      
      const result = articleService.isArticleLiked('2');
      
      expect(result).toBe(false);
    });

    it('localStorage 为空时应返回 false', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = articleService.isArticleLiked('1');
      
      expect(result).toBe(false);
    });
  });
});

describe('tagService', () => {
  describe('getAllTags', () => {
    it('应该返回所有标签', async () => {
      const tags = await tagService.getAllTags();
      
      expect(tags.length).toBeGreaterThan(0);
      expect(tags[0]).toHaveProperty('name');
      expect(tags[0]).toHaveProperty('articleCount');
    });
  });

  describe('getHotTags', () => {
    it('应该返回指定数量的热门标签', async () => {
      const tags = await tagService.getHotTags(5);
      
      expect(tags.length).toBeLessThanOrEqual(5);
    });

    it('标签应按文章数量排序', async () => {
      const tags = await tagService.getHotTags(10);
      
      for (let i = 0; i < tags.length - 1; i++) {
        expect(tags[i].articleCount).toBeGreaterThanOrEqual(tags[i + 1].articleCount);
      }
    });
  });

  describe('getArticlesByTag', () => {
    it('应该返回指定标签的文章', async () => {
      const articles = await tagService.getArticlesByTag('AutoSAR');
      
      expect(articles.every(article => 
        article.tags.some(t => t.toLowerCase() === 'autosar')
      )).toBe(true);
    });

    it('不存在的标签应返回空数组', async () => {
      const articles = await tagService.getArticlesByTag('non-existent-tag');
      
      expect(articles).toEqual([]);
    });
  });
});

describe('commentService', () => {
  // 保存初始评论数据以便重置
  const initialComments = JSON.stringify(comments);
  
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 comments 数组到初始状态
    comments.length = 0;
    comments.push(...JSON.parse(initialComments));
  });

  describe('getComments', () => {
    it('应该返回文章的评论', async () => {
      const comments = await commentService.getComments('1');
      
      expect(Array.isArray(comments)).toBe(true);
    });
  });

  describe('addComment', () => {
    it('应该添加新评论', async () => {
      const author = {
        id: 'user1',
        name: '测试用户',
        avatar: 'https://example.com/avatar.png',
      };
      
      const comment = await commentService.addComment('1', '测试评论', author);
      
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('articleId', '1');
      expect(comment).toHaveProperty('content', '测试评论');
      expect(comment).toHaveProperty('author');
      expect(comment).toHaveProperty('likes', 0);
      expect(comment).toHaveProperty('likedBy', []);
      expect(comment).toHaveProperty('createdAt');
    });

    it('添加评论应增加文章评论数', async () => {
      const article = await articleService.getArticleById('1');
      const initialCount = article?.commentCount || 0;
      
      const author = {
        id: 'user1',
        name: '测试用户',
        avatar: 'https://example.com/avatar.png',
      };
      
      await commentService.addComment('1', '测试评论', author);
      
      const updatedArticle = await articleService.getArticleById('1');
      expect(updatedArticle?.commentCount).toBe(initialCount + 1);
    });
  });

  describe('deleteComment', () => {
    it('应该删除存在的评论', async () => {
      const author = {
        id: 'user1',
        name: '测试用户',
        avatar: 'https://example.com/avatar.png',
      };
      
      const comment = await commentService.addComment('1', '待删除评论', author);
      const result = await commentService.deleteComment(comment.id);
      
      expect(result).toBe(true);
    });

    it('删除不存在的评论应返回 false', async () => {
      const result = await commentService.deleteComment('non-existent-comment');
      
      expect(result).toBe(false);
    });

    it('删除评论应减少文章评论数', async () => {
      const author = {
        id: 'user1',
        name: '测试用户',
        avatar: 'https://example.com/avatar.png',
      };
      
      const comment = await commentService.addComment('1', '待删除评论', author);
      const article = await articleService.getArticleById('1');
      const countAfterAdd = article?.commentCount || 0;
      
      await commentService.deleteComment(comment.id);
      const articleAfterDelete = await articleService.getArticleById('1');
      
      expect(articleAfterDelete?.commentCount).toBe(countAfterAdd - 1);
    });
  });

  describe('toggleCommentLike', () => {
    it('点赞评论应增加点赞数', async () => {
      const author = {
        id: 'user1',
        name: '测试用户',
        avatar: 'https://example.com/avatar.png',
      };
      
      const comment = await commentService.addComment('1', '测试点赞', author);
      const result = await commentService.toggleCommentLike(comment.id, 'user2');
      
      expect(result).toBe(true);
    });

    it('取消点赞应减少点赞数', async () => {
      const author = {
        id: 'user1',
        name: '测试用户',
        avatar: 'https://example.com/avatar.png',
      };
      
      // 先创建评论
      const comment = await commentService.addComment('1', '测试取消点赞', author);
      const commentId = comment.id;
      // 点赞
      const result1 = await commentService.toggleCommentLike(commentId, 'user1');
      expect(result1).toBe(true);

      let comments = await commentService.getComments('1');
      let likedComment = comments.find(c => c.id === commentId);
      expect(likedComment?.likes).toBe(1);
      
      // 取消点赞
      await commentService.toggleCommentLike(commentId, 'user1');
      
      // 检查点赞数是否变回0
      comments = await commentService.getComments('1');
      const updatedComment = comments.find(c => c.id === commentId);
      expect(updatedComment?.likes).toBe(0);
    });

    it('不存在的评论应返回 false', async () => {
      const result = await commentService.toggleCommentLike('non-existent', 'user1');
      
      expect(result).toBe(false);
    });
  });
});
