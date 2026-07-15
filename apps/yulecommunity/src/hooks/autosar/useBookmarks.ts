import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'autosar-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = useCallback((apiId: string) => {
    setBookmarks(prev =>
      prev.includes(apiId)
        ? prev.filter(id => id !== apiId)
        : [...prev, apiId]
    );
  }, []);

  const isBookmarked = useCallback((apiId: string) => {
    return bookmarks.includes(apiId);
  }, [bookmarks]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return { bookmarks, toggleBookmark, isBookmarked, clearBookmarks };
}
