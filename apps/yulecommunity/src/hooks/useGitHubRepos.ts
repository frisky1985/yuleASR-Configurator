import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchGitHubRepos, findRepoByModuleName } from '../services/github';
import type { GitHubStats, GitHubRepo } from '../services/github';

interface UseGitHubReposReturn {
  stats: GitHubStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  findRepo: (moduleName: string) => GitHubRepo | undefined;
}

export function useGitHubRepos(): UseGitHubReposReturn {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchGitHubRepos();
      if (!controller.signal.aborted) setStats(data);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const findRepo = useCallback(
    (moduleName: string) => {
      if (!stats) return undefined;
      return findRepoByModuleName(stats.repos, moduleName);
    },
    [stats]
  );

  return { stats, loading, error, refresh: load, findRepo };
}
