/**
 * 收藏按钮组件
 * @description 文章收藏功能，支持图标和按钮两种变体，支持云端同步
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import type { BlogArticle } from '@/types/blog';

interface BookmarkButtonProps {
  /** 文章数据 */
  article: BlogArticle;
  /** 变体类型 */
  variant?: 'icon' | 'button';
  /** 是否显示收藏数量 */
  showCount?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 收藏回调 */
  onBookmark?: (bookmarked: boolean) => void;
}

/**
 * 收藏按钮组件
 */
export function BookmarkButton({
  article,
  variant = 'icon',
  showCount = false,
  className,
  onBookmark,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, count, isLoading } = useBookmarks();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const bookmarked = isBookmarked(article.id);

  const handleClick = useCallback(async () => {
    if (isProcessing || isLoading) return;
    
    setIsProcessing(true);
    try {
      const newState = await toggleBookmark(article);
      
      // 显示提示
      setToastMessage(newState ? '已添加到收藏' : '已取消收藏');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);

      // 触发回调
      onBookmark?.(newState);
    } catch (error) {
      setToastMessage('操作失败，请重试');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setIsProcessing(false);
    }
  }, [article, toggleBookmark, onBookmark, isProcessing, isLoading]);

  const isDisabled = isProcessing || isLoading;

  if (variant === 'button') {
    return (
      <div className="relative">
        <Button
          variant={bookmarked ? 'default' : 'outline'}
          size="sm"
          onClick={handleClick}
          disabled={isDisabled}
          className={cn(
            'gap-2 transition-all duration-200',
            bookmarked && 'bg-yellow-500 hover:bg-yellow-600 text-white',
            isDisabled && 'opacity-60 cursor-not-allowed',
            className
          )}
          aria-label={bookmarked ? '取消收藏' : '添加收藏'}
          aria-pressed={bookmarked}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isProcessing ? 'processing' : bookmarked ? 'bookmarked' : 'not-bookmarked'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : bookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </motion.span>
          </AnimatePresence>
          <span>{bookmarked ? '已收藏' : '收藏'}</span>
          {showCount && count > 0 && (
            <span className="ml-1 text-xs opacity-70">({count})</span>
          )}
        </Button>

        {/* Toast 提示 */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-full whitespace-nowrap"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Icon 变体
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: isDisabled ? 1 : 1.1 }}
        whileTap={{ scale: isDisabled ? 1 : 0.9 }}
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          'p-2 rounded-full transition-colors duration-200',
          bookmarked
            ? 'text-yellow-500 bg-yellow-500/10'
            : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10',
          isDisabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        aria-label={bookmarked ? '取消收藏' : '添加收藏'}
        aria-pressed={bookmarked}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={isProcessing ? 'processing' : bookmarked ? 'bookmarked' : 'not-bookmarked'}
            initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : bookmarked ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Toast 提示 */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-full whitespace-nowrap z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookmarkButton;
