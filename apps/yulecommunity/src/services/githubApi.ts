/**
 * GitHub API 服务
 * 用于获取开源项目的实时数据
 */

export interface RepoStats {
  name: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  lastUpdated: string;
  language: string;
}

export interface ContributionData {
  date: string;
  count: number;
}

// 开源项目列表
const REPOS = [
  'frisky1985/yuletech-mcu',
  'frisky1985/yuletech-can',
  'frisky1985/yuletech-pdur',
  'frisky1985/yuletech-com',
  'frisky1985/yuletech-rte',
];

/**
 * 获取单个仓库统计数据
 */
async function fetchRepoStats(repo: string): Promise<RepoStats | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${repo}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return {
      name: data.name,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      watchers: data.watchers_count,
      lastUpdated: data.updated_at,
      language: data.language || 'C',
    };
  } catch (error) {
    console.error(`Error fetching ${repo}:`, error);
    return null;
  }
}

/**
 * 获取所有开源项目统计
 */
export async function fetchAllRepoStats(): Promise<RepoStats[]> {
  const stats = await Promise.all(
    REPOS.map(repo => fetchRepoStats(repo))
  );
  return stats.filter((s): s is RepoStats => s !== null);
}

/**
 * 计算总计数据
 */
export function calculateTotals(stats: RepoStats[]) {
  return stats.reduce(
    (acc, repo) => ({
      totalStars: acc.totalStars + repo.stars,
      totalForks: acc.totalForks + repo.forks,
      totalIssues: acc.totalIssues + repo.openIssues,
      totalWatchers: acc.totalWatchers + repo.watchers,
    }),
    { totalStars: 0, totalForks: 0, totalIssues: 0, totalWatchers: 0 }
  );
}

/**
 * 模拟贡献者数据（因为 GitHub API 需要认证才能获取详细贡献数据）
 */
export function generateMockContributions(days: number = 30): ContributionData[] {
  const data: ContributionData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 模拟周末贡献较少
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCount = isWeekend ? 2 : 8;
    const randomVariation = Math.floor(Math.random() * 10);
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: baseCount + randomVariation,
    });
  }
  
  return data;
}

/**
 * 获取模块完成度数据
 */
export function getModuleProgress() {
  return [
    { name: 'Mcu', progress: 100, total: 9, completed: 9 },
    { name: 'Port', progress: 100, total: 1, completed: 1 },
    { name: 'Dio', progress: 100, total: 1, completed: 1 },
    { name: 'Can', progress: 95, total: 1, completed: 0.95 },
    { name: 'CanIf', progress: 90, total: 1, completed: 0.9 },
    { name: 'PduR', progress: 75, total: 1, completed: 0.75 },
    { name: 'Com', progress: 60, total: 1, completed: 0.6 },
    { name: 'Rte', progress: 45, total: 1, completed: 0.45 },
    { name: 'NvM', progress: 30, total: 1, completed: 0.3 },
    { name: 'Dcm', progress: 20, total: 1, completed: 0.2 },
  ];
}

// 缓存机制
let cachedStats: RepoStats[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

/**
 * 获取缓存的仓库统计
 */
export async function getCachedRepoStats(): Promise<RepoStats[]> {
  const now = Date.now();
  
  if (cachedStats && now - cacheTime < CACHE_DURATION) {
    return cachedStats;
  }
  
  cachedStats = await fetchAllRepoStats();
  cacheTime = now;
  return cachedStats;
}
