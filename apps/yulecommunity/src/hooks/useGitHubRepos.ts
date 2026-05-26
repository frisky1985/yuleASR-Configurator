import { useState, useEffect, useCallback } from 'react';
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

  // 刷新数据函数
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGitHubRepos();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGitHubRepos();
        if (mounted) {
          setStats(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  const findRepo = useCallback(
    (moduleName: string) => {
      if (!stats) return undefined;
      return findRepoByModuleName(stats.repos, moduleName);
    },
    [stats]
  );

  return { stats, loading, error, refresh, findRepo };
}
