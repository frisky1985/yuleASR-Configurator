/**
 * 博客服务层
 * @description 实现 IArticleService 接口，提供文章相关操作
 */

import type {
  BlogArticle,
  BlogTag,
  BlogComment,
  IArticleService,
  ITagService,
  ICommentService,
  ArticleQueryParams,
  PaginatedResult,
  CommentAuthor,
} from '@/types/blog';
import {
  articles,
  comments,
  getArticleById as getArticleByIdFromData,
  getArticleBySlug as getArticleBySlugFromData,
  getHotArticles as getHotArticlesFromData,
  getRelatedArticles as getRelatedArticlesFromData,
  searchArticles as searchArticlesFromData,
  getAllTags as getAllTagsFromData,
  getHotTags as getHotTagsFromData,
  getArticlesByTag as getArticlesByTagFromData,
  getCommentsByArticleId as getCommentsByArticleIdFromData,
} from '@/data/blog/articles';

/**
 * 文章服务实现
 */
class ArticleService implements IArticleService {
  /**
   * 获取文章列表（支持分页和过滤）
   */
  async getArticles(params: ArticleQueryParams = {}): Promise<PaginatedResult<BlogArticle>> {
    const {
      category,
      tag,
      search,
      page = 1,
      pageSize = 10,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    // 过滤文章
    let filteredArticles = [...articles];

    if (category && category !== '全部') {
      filteredArticles = filteredArticles.filter(
        article => article.category === category
      );
    }

    if (tag) {
      filteredArticles = filteredArticles.filter(article =>
        article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }

    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filteredArticles = filteredArticles.filter(
        article =>
          article.title.toLowerCase().includes(lowercaseSearch) ||
          article.description.toLowerCase().includes(lowercaseSearch) ||
          article.tags.some(t => t.toLowerCase().includes(lowercaseSearch))
      );
    }

    // 排序
    filteredArticles.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison =
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
          break;
        case 'views':
          comparison = b.viewCount - a.viewCount;
          break;
        case 'likes':
          comparison = b.likeCount - a.likeCount;
          break;
        default:
          comparison =
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    // 分页
    const total = filteredArticles.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredArticles.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * 根据 ID 获取单篇文章
   */
  async getArticleById(id: string): Promise<BlogArticle | null> {
    const article = getArticleByIdFromData(id);
    return article || null;
  }

  /**
   * 根据 slug 获取单篇文章
   */
  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    const article = getArticleBySlugFromData(slug);
    if (article) {
      // 自动增加阅读量
      await this.incrementViewCount(article.id);
    }
    return article || null;
  }

  /**
   * 获取热门文章
   */
  async getHotArticles(limit: number = 5): Promise<BlogArticle[]> {
    return getHotArticlesFromData(limit);
  }

  /**
   * 获取相关文章
   */
  async getRelatedArticles(articleId: string, limit: number = 3): Promise<BlogArticle[]> {
    return getRelatedArticlesFromData(articleId, limit);
  }

  /**
   * 搜索文章
   */
  async searchArticles(query: string): Promise<BlogArticle[]> {
    return searchArticlesFromData(query);
  }

  /**
   * 增加文章阅读量
   */
  async incrementViewCount(articleId: string): Promise<void> {
    const article = getArticleByIdFromData(articleId);
    if (article) {
      article.viewCount++;
    }
  }

  /**
   * 点赞/取消点赞文章
   */
  async toggleLike(articleId: string): Promise<boolean> {
    const article = getArticleByIdFromData(articleId);
    if (!article) return false;

    // 这里可以集成后端 API 或本地存储
    // 目前使用简单的模拟实现
    const likedArticles = JSON.parse(
      localStorage.getItem('yuletech:blog:liked') || '[]'
    ) as string[];

    const index = likedArticles.indexOf(articleId);
    if (index > -1) {
      // 取消点赞
      likedArticles.splice(index, 1);
      article.likeCount = Math.max(0, article.likeCount - 1);
    } else {
      // 添加点赞
      likedArticles.push(articleId);
      article.likeCount++;
    }

    localStorage.setItem('yuletech:blog:liked', JSON.stringify(likedArticles));
    return index === -1; // 返回 true 如果是新增点赞
  }

  /**
   * 检查用户是否点赞了文章
   */
  isArticleLiked(articleId: string): boolean {
    const likedArticles = JSON.parse(
      localStorage.getItem('yuletech:blog:liked') || '[]'
    ) as string[];
    return likedArticles.includes(articleId);
  }
}

/**
 * 标签服务实现
 */
class TagService implements ITagService {
  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<BlogTag[]> {
    return getAllTagsFromData();
  }

  /**
   * 获取热门标签
   */
  async getHotTags(limit: number = 10): Promise<BlogTag[]> {
    return getHotTagsFromData(limit);
  }

  /**
   * 获取标签下的文章
   */
  async getArticlesByTag(tagName: string): Promise<BlogArticle[]> {
    return getArticlesByTagFromData(tagName);
  }
}

/**
 * 评论服务实现
 */
class CommentService implements ICommentService {
  /**
   * 获取文章评论
   */
  async getComments(articleId: string): Promise<BlogComment[]> {
    return getCommentsByArticleIdFromData(articleId);
  }

  /**
   * 添加评论
   */
  async addComment(
    articleId: string,
    content: string,
    author: CommentAuthor
  ): Promise<BlogComment> {
    const newComment: BlogComment = {
      id: `comment_${Date.now()}`,
      articleId,
      content,
      author,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    // 添加到数据源
    comments.push(newComment);

    // 更新文章评论数
    const article = getArticleByIdFromData(articleId);
    if (article) {
      article.commentCount++;
    }

    return newComment;
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId: string): Promise<boolean> {
    const index = comments.findIndex(c => c.id === commentId);
    if (index > -1) {
      const comment = comments[index];
      comments.splice(index, 1);

      // 更新文章评论数
      const article = getArticleByIdFromData(comment.articleId);
      if (article) {
        article.commentCount = Math.max(0, article.commentCount - 1);
      }

      return true;
    }
    return false;
  }

  /**
   * 点赞/取消点赞评论
   */
  async toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;

    const index = comment.likedBy.indexOf(userId);
    if (index > -1) {
      // 取消点赞
      comment.likedBy.splice(index, 1);
      comment.likes = Math.max(0, comment.likes - 1);
      return false;
    } else {
      // 添加点赞
      comment.likedBy.push(userId);
      comment.likes++;
      return true;
    }
  }
}

// 导出单例实例
export const articleService = new ArticleService();
export const tagService = new TagService();
export const commentService = new CommentService();

// 便捷导出
export {
  getArticleByIdFromData as getArticleById,
  getArticleBySlugFromData as getArticleBySlug,
  getHotArticlesFromData as getHotArticles,
  getRelatedArticlesFromData as getRelatedArticles,
  searchArticlesFromData as searchArticles,
  getAllTagsFromData as getAllTags,
  getHotTagsFromData as getHotTags,
  getArticlesByTagFromData as getArticlesByTag,
  getCommentsByArticleIdFromData as getCommentsByArticleId,
};
