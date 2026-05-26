/**
 * 收藏列表页面
 * @description 独立的收藏页面，提供完整的收藏管理功能
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';
import { HomeSEOWrapper } from '@/components/seo';
import { BookmarksList } from '@/components/profile/BookmarksList';

/**
 * 收藏列表页面
 */
export function BookmarksPage() {
  const navigate = useNavigate();
  const { count } = useBookmarks();

  // 返回上一页
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 去博客页面
  const handleGoToBlog = useCallback(() => {
    navigate('/blog');
  }, [navigate]);

  return (
    <HomeSEOWrapper>
      <div className="min-h-screen bg-background">
        {/* 页面头部 */}
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Bookmark className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    我的收藏
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    共 {count} 篇文章
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 收藏列表 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookmarksList 
              showHeader={false}
              emptyAction={{
                text: '去看看文章',
                onClick: handleGoToBlog
              }}
            />
          </motion.div>
        </div>
      </div>
    </HomeSEOWrapper>
  );
}

export default BookmarksPage;
