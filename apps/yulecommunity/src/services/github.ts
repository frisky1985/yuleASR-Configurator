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
const CACHE_KEY = 'yuletech_github_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: GitHubStats;
  timestamp: number;
}

function getCache(): GitHubStats | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(data: GitHubStats): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export async function fetchGitHubRepos(): Promise<GitHubStats> {
  const cached = getCache();
  if (cached) return cached;

  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=public`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const repos: GitHubRepo[] = await response.json();

  const stats: GitHubStats = {
    totalRepos: repos.length,
    totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
    repos,
  };

  setCache(stats);
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
