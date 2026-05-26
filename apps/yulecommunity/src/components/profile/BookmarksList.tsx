/**
 * 收藏列表组件
 * @description 可复用的收藏列表展示组件，用于个人中心和独立页面
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Trash2,
  Tag,
  Folder,
  AlertCircle,
  Cloud,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';

interface BookmarksListProps {
  /** 是否显示标题和清空按钮 */
  showHeader?: boolean;
  /** 自定义空状态提示 */
  emptyAction?: {
    text: string;
    onClick: () => void;
  };
}

/**
 * 收藏列表组件
 */
export function BookmarksList({ 
  showHeader = false,
  emptyAction 
}: BookmarksListProps) {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark, clearBookmarks, count, isAuthenticated, syncStatus, syncBookmarks } = useBookmarks();

  // 打开文章
  const handleArticleClick = useCallback((slug: string) => {
    navigate(`/blog/${slug}`);
  }, [navigate]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (count === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Bookmark className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">暂无收藏文章</h3>
        <p className="text-sm text-muted-foreground mb-4">
          浏览博客时点击收藏按钮，将感兴趣的文章保存到这里
        </p>
        {emptyAction && (
          <Button onClick={emptyAction.onClick}>
            {emptyAction.text}
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">我的收藏</span>
            <span className="text-sm text-muted-foreground">({count})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={clearBookmarks}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空
          </Button>
        </div>
      )}

      <div className="grid gap-3">
        {bookmarks.map((bookmark, index) => (
          <motion.article
            key={bookmark.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-card border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleArticleClick(bookmark.slug)}
              >
                {/* 分类和收藏日期 */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    <Folder className="w-3 h-3" />
                    {bookmark.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    收藏于 {formatDate(bookmark.bookmarkedAt)}
                  </span>
                </div>

                {/* 标题 */}
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {bookmark.title}
                </h3>

                {/* 描述 */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {bookmark.description}
                </p>

                {/* 作者 */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <span>作者: {bookmark.author.name}</span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {bookmark.category}
                  </span>
                </div>
              </div>

              {/* 删除按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBookmark(bookmark.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.article>
        ))}
      </div>

      {/* 同步状态提示 */}
      {isAuthenticated ? (
        syncStatus === 'syncing' ? (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-600 dark:text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>正在同步收藏数据...</span>
          </div>
        ) : syncStatus === 'error' ? (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>同步失败，使用本地数据</span>
            <button 
              onClick={syncBookmarks}
              className="underline hover:no-underline ml-2"
            >
              重试
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs text-green-600 dark:text-green-400">
            <Cloud className="w-4 h-4" />
            <span>收藏已同步到云端，多设备可访问</span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span>登录后可将收藏同步到云端，多设备访问</span>
        </div>
      )}
    </div>
  );
}

export default BookmarksList;
