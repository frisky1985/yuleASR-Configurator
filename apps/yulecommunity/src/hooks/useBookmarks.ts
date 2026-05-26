/**
 * 收藏功能 Hook - 云端同步版
 * @description 支持 localStorage 本地存储和 API 云端同步
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { userApi, type BookmarkItem } from '@/services/userApi';
import type { BlogArticle } from '@/types/blog';

// 收藏文章数据结构 (保持与之前兼容)
export interface BookmarkedArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  author: {
    id: string;
    name: string;
  };
  bookmarkedAt: string;
}

const BOOKMARKS_KEY = 'yuletech:bookmarks';
// 收藏状态 key
const MAX_BOOKMARKS = 100;

type SyncStatus = 'idle' | 'syncing' | 'error';

/**
 * 收藏管理 Hook - 支持本地存储和云端同步
 */
export function useBookmarks() {
  const { isAuthenticated, token } = useAuth();
  const [localBookmarks, setLocalBookmarks] = useLocalStorage<BookmarkedArticle[]>(BOOKMARKS_KEY, []);
  const [cloudBookmarks, setCloudBookmarks] = useState<BookmarkItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSyncDone = useRef(false);

  // 设置 API token
  useEffect(() => {
    userApi.setToken(token);
  }, [token]);

  // 初始化：登录后同步收藏
  useEffect(() => {
    if (!isAuthenticated || initialSyncDone.current) return;

    const syncBookmarks = async () => {
      setSyncStatus('syncing');
      setIsLoading(true);
      try {
        // 1. 获取云端收藏
        const response = await userApi.getBookmarks({ limit: 100 });
        const remoteBookmarks = response.data;

          // 合并本地收藏到云端
        if (localBookmarks.length > 0) {
          const remoteIds = new Set(remoteBookmarks.map(b => b.content.contentId));
          const localToSync = localBookmarks.filter(b => !remoteIds.has(b.slug));

          // 批量同步本地收藏
          for (const local of localToSync) {
            try {
              await userApi.addBookmark({
                id: local.id,
                slug: local.slug,
                title: local.title,
                description: local.description,
                category: local.category as any,
                author: local.author as any,
                tags: [],
                content: '',
                publishDate: local.bookmarkedAt,
                updatedAt: local.bookmarkedAt,
                readTime: 0,
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                isHot: false,
                seo: {
                  title: local.title,
                  description: local.description,
                  keywords: [],
                },
              });
            } catch (e) {
              console.warn('同步收藏失败:', local.slug, e);
            }
          }

          // 重新获取合并后的收藏
          const refreshed = await userApi.getBookmarks({ limit: 100 });
          setCloudBookmarks(refreshed.data);
        } else {
          setCloudBookmarks(remoteBookmarks);
        }

        setSyncStatus('idle');
      } catch (err) {
        console.error('同步收藏失败:', err);
        setSyncStatus('error');
        setError('同步收藏失败，使用本地模式');
      } finally {
        setIsLoading(false);
      }
    };

    syncBookmarks();
    initialSyncDone.current = true;
  }, [isAuthenticated, localBookmarks]);

  // 获取当前使用的收藏列表
  const bookmarks = useMemo<BookmarkedArticle[]>(() => {
    if (isAuthenticated && cloudBookmarks.length > 0) {
      return cloudBookmarks.map(b => ({
        id: b.content.contentId,
        title: b.content.title,
        slug: b.content.slug || b.content.contentId,
        description: b.content.description || '',
        category: b.content.category || '其他',
        author: b.content.author || { id: '', name: '' },
        bookmarkedAt: b.bookmarkedAt,
      }));
    }
    return localBookmarks;
  }, [isAuthenticated, cloudBookmarks, localBookmarks]);

  /**
   * 添加收藏
   */
  const addBookmark = useCallback(async (article: BlogArticle) => {
    // 先更新本地
    setLocalBookmarks(prev => {
      if (prev.some(b => b.id === article.id)) return prev;
      const newBookmark: BookmarkedArticle = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        description: article.description,
        category: article.category,
        author: {
          id: article.author.id,
          name: article.author.name,
        },
        bookmarkedAt: new Date().toISOString(),
      };
      return [newBookmark, ...prev].slice(0, MAX_BOOKMARKS);
    });

    // 如果已登录，同步到云端
    if (isAuthenticated) {
      try {
        const result = await userApi.addBookmark(article);
        if (result.success) {
          setCloudBookmarks(prev => [result.bookmark, ...prev]);
        }
      } catch (err) {
        console.error('同步收藏到云端失败:', err);
      }
    }
  }, [isAuthenticated, setLocalBookmarks]);

  /**
   * 移除收藏
   */
  const removeBookmark = useCallback(async (articleId: string) => {
    // 更新本地
    setLocalBookmarks(prev => prev.filter(b => b.id !== articleId));

    // 如果已登录，同步到云端
    if (isAuthenticated) {
      try {
        // 找到对应的云端收藏
        const cloudItem = cloudBookmarks.find(b => b.content.contentId === articleId);
        if (cloudItem) {
          await userApi.removeBookmark(articleId);
          setCloudBookmarks(prev => prev.filter(b => b.content.contentId !== articleId));
        }
      } catch (err) {
        console.error('从云端移除收藏失败:', err);
      }
    }
  }, [isAuthenticated, cloudBookmarks, setLocalBookmarks]);

  /**
   * 切换收藏状态
   */
  const toggleBookmark = useCallback(async (article: BlogArticle): Promise<boolean> => {
    const isCurrentlyBookmarked = bookmarks.some(b => b.id === article.id);

    if (isCurrentlyBookmarked) {
      await removeBookmark(article.id);
      return false;
    } else {
      await addBookmark(article);
      return true;
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  /**
   * 检查是否已收藏
   */
  const isBookmarked = useCallback((articleId: string) => {
    return bookmarks.some(b => b.id === articleId);
  }, [bookmarks]);

  /**
   * 清空所有收藏
   */
  const clearBookmarks = useCallback(async () => {
    setLocalBookmarks([]);

    if (isAuthenticated) {
      try {
        // 批量删除云端收藏
        for (const item of cloudBookmarks) {
          await userApi.removeBookmark(item.content.contentId);
        }
        setCloudBookmarks([]);
      } catch (err) {
        console.error('清空云端收藏失败:', err);
      }
    }
  }, [isAuthenticated, cloudBookmarks, setLocalBookmarks]);

  /**
   * 手动同步收藏
   */
  const syncBookmarks = useCallback(async () => {
    if (!isAuthenticated) return;

    setSyncStatus('syncing');
    setIsLoading(true);
    try {
      const response = await userApi.getBookmarks({ limit: 100 });
      setCloudBookmarks(response.data);
      setSyncStatus('idle');
    } catch (err) {
      console.error('同步收藏失败:', err);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 收藏数量
   */
  const count = useMemo(() => bookmarks.length, [bookmarks]);

  return {
    bookmarks,
    count,
    isLoading,
    syncStatus,
    error,
    isAuthenticated,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    syncBookmarks,
    // 原始数据访问（用于调试）
    localBookmarks,
    cloudBookmarks,
  };
}

export default useBookmarks;
