export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
}

export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  repos: GitHubRepo[];
}

const GITHUB_USERNAME = 'frisky1985';

import { githubFetch, cacheGet, cacheSet, CACHE_KEYS } from './gitHubClient';

export async function fetchGitHubRepos(): Promise<GitHubStats> {
  const cached = cacheGet<GitHubStats>(CACHE_KEYS.USER_REPOS);
  if (cached) return cached;

  const response = await githubFetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=public`
  );

  const repos: GitHubRepo[] = await response.json();

  const stats: GitHubStats = {
    totalRepos: repos.length,
    totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
    repos,
  };

  cacheSet(CACHE_KEYS.USER_REPOS, stats);
  return stats;
}

export function findRepoByModuleName(
  repos: GitHubRepo[],
  moduleName: string
): GitHubRepo | undefined {
  const candidates = [
    moduleName.toLowerCase(),
    `yuletech-${moduleName.toLowerCase()}`,
    `autosar-${moduleName.toLowerCase()}`,
    `bsw-${moduleName.toLowerCase()}`,
  ];

  return repos.find((repo) =>
    candidates.includes(repo.name.toLowerCase())
  );
}
