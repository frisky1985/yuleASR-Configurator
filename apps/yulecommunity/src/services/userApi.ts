/**
 * 用户相关 API 服务
 */

import type { BlogArticle } from '@/types/blog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 收藏文章格式
export interface BookmarkItem {
  bookmarkId: string;
  userId: string;
  content: {
    type: 'article' | 'module' | 'tool' | 'document';
    contentId: string;
    title: string;
    slug?: string;
    description?: string;
    category?: string;
    tags?: string[];
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
    coverImage?: string;
    url?: string;
  };
  collection: string;
  note?: string;
  bookmarkedAt: string;
  isPinned: boolean;
  sortOrder: number;
}

// 积分历史
export interface PointsHistoryItem {
  historyId: string;
  action: string;
  points: number;
  balance: number;
  description: string;
  reference?: {
    type: string;
    id: string;
    title: string;
    url?: string;
  };
  createdAt: string;
}

// 积分信息
export interface PointsInfo {
  total: number;
  level: {
    current: number;
    title: string;
    nextLevelPoints: number | null;
    progress: number;
  };
  today: {
    date: string;
    count: number;
    points: number;
    actions: Record<string, number>;
  };
  statistics: {
    totalEarned: number;
    totalSpent: number;
    favoriteAction: string | null;
    lastActionAt: string | null;
  };
}

class UserApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // ========== 收藏 API ==========

  async getBookmarks(params?: {
    collection?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: BookmarkItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    collections: string[];
  }> {
    const query = new URLSearchParams();
    if (params?.collection) query.set('collection', params.collection);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    return this.request(`/user/bookmarks?${query.toString()}`);
  }

  async addBookmark(
    article: BlogArticle,
    collection: string = '默认收藏',
    note?: string
  ): Promise<{ success: boolean; bookmark: BookmarkItem }> {
    return this.request('/user/bookmarks', {
      method: 'POST',
      body: JSON.stringify({
        content: {
          type: 'article',
          contentId: article.slug,
          title: article.title,
          slug: article.slug,
          description: article.description,
          category: article.category,
          tags: article.tags,
          author: article.author,
          url: `/blog/${article.slug}`,
        },
        collection,
        note,
      }),
    });
  }

  async removeBookmark(contentId: string): Promise<{ success: boolean }> {
    return this.request(`/user/bookmarks/${contentId}`, {
      method: 'DELETE',
    });
  }

  async toggleBookmark(article: BlogArticle): Promise<{
    success: boolean;
    action: 'added' | 'removed';
    bookmark?: BookmarkItem;
  }> {
    return this.request('/user/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({
        content: {
          type: 'article',
          contentId: article.slug,
          title: article.title,
          description: article.description,
          category: article.category,
          url: `/blog/${article.slug}`,
        },
      }),
    });
  }

  async checkBookmarks(contentIds: string[]): Promise<{
    success: boolean;
    bookmarkedIds: string[];
  }> {
    return this.request('/user/bookmarks/check', {
      method: 'POST',
      body: JSON.stringify({ contentIds }),
    });
  }

  // ========== 积分 API ==========

  async getPoints(): Promise<{ success: boolean; data: PointsInfo }> {
    return this.request('/user/points');
  }

  async getPointsHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: PointsHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    return this.request(`/user/points/history?${query.toString()}`);
  }

  async earnPoints(
    action: string,
    reference?: { type: string; id: string; title: string }
  ): Promise<{ success: boolean; data: any }> {
    return this.request('/user/points/earn', {
      method: 'POST',
      body: JSON.stringify({ action, reference }),
    });
  }

  async getPointsRules(): Promise<{ success: boolean; data: Record<string, { points: number; dailyLimit?: number }> }> {
    return this.request('/user/points/rules');
  }

  async getLeaderboard(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: any[] }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    return this.request(`/user/points/leaderboard?${query.toString()}`);
  }
}

export const userApi = new UserApiService();
export default userApi;
