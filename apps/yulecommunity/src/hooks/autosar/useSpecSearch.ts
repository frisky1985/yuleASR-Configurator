import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { ApiIndexEntry } from '../../data/autosar/types';

export function useSpecSearch(apiIndex: ApiIndexEntry[]) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(apiIndex, {
        keys: [
          { name: 'name', weight: 0.5 },
          { name: 'brief', weight: 0.3 },
          { name: 'moduleId', weight: 0.15 },
          { name: 'signature', weight: 0.05 },
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 1,
      }),
    [apiIndex],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map(r => r.item);
  }, [query, fuse]);

  return {
    query,
    setQuery,
    results,
    open,
    setOpen,
  };
}
