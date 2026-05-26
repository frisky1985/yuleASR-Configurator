export interface Contributor {
  id: string;
  name: string;
  avatar: string;
  commits: number;
  additions: number;
  deletions: number;
  modules: number;
  lastActive: string;
}

export interface ModuleUsage {
  moduleId: string;
  moduleName: string;
  downloads: number;
  uniqueProjects: number;
  stars: number;
  lastDownload: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export interface TeamMetric {
  teamId: string;
  teamName: string;
  members: number;
  commits: number;
  issues: number;
  prs: number;
  velocity: number; // story points per sprint
  sprintCompletion: number; // percentage
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export const mockContributors: Contributor[] = [
  { id: 'u1', name: '张工', avatar: 'Z', commits: 245, additions: 12500, deletions: 3200, modules: 8, lastActive: '2024-01-20' },
  { id: 'u2', name: '李研发', avatar: 'L', commits: 198, additions: 9800, deletions: 2100, modules: 6, lastActive: '2024-01-20' },
  { id: 'u3', name: '王工程师', avatar: 'W', commits: 156, additions: 7600, deletions: 1800, modules: 5, lastActive: '2024-01-19' },
  { id: 'u4', name: '赵测试', avatar: 'Z', commits: 89, additions: 3200, deletions: 900, modules: 3, lastActive: '2024-01-18' },
];

export const mockModuleUsage: ModuleUsage[] = [
  { moduleId: 'can', moduleName: 'CAN Driver', downloads: 3420, uniqueProjects: 45, stars: 128, lastDownload: '2024-01-20', trend: 'up', trendValue: 15 },
  { moduleId: 'adc', moduleName: 'ADC Driver', downloads: 2890, uniqueProjects: 38, stars: 96, lastDownload: '2024-01-20', trend: 'up', trendValue: 8 },
  { moduleId: 'spi', moduleName: 'SPI Driver', downloads: 2150, uniqueProjects: 28, stars: 72, lastDownload: '2024-01-19', trend: 'stable', trendValue: 0 },
  { moduleId: 'gpio', moduleName: 'GPIO Driver', downloads: 4120, uniqueProjects: 52, stars: 156, lastDownload: '2024-01-20', trend: 'up', trendValue: 22 },
  { moduleId: 'uart', moduleName: 'UART Driver', downloads: 1980, uniqueProjects: 25, stars: 64, lastDownload: '2024-01-18', trend: 'down', trendValue: -5 },
];

export const mockTeamMetrics: TeamMetric[] = [
  { teamId: 't1', teamName: 'MCAL 团队', members: 3, commits: 156, issues: 23, prs: 45, velocity: 32, sprintCompletion: 92 },
  { teamId: 't2', teamName: '网络通信', members: 2, commits: 89, issues: 15, prs: 28, velocity: 24, sprintCompletion: 88 },
  { teamId: 't3', teamName: '功能安全', members: 2, commits: 67, issues: 12, prs: 19, velocity: 18, sprintCompletion: 95 },
];

export const mockActivityData: TimeSeriesData[] = [
  { date: '2024-01-01', value: 12 },
  { date: '2024-01-02', value: 18 },
  { date: '2024-01-03', value: 25 },
  { date: '2024-01-04', value: 22 },
  { date: '2024-01-05', value: 30 },
  { date: '2024-01-06', value: 15 },
  { date: '2024-01-07', value: 10 },
  { date: '2024-01-08', value: 28 },
  { date: '2024-01-09', value: 32 },
  { date: '2024-01-10', value: 35 },
  { date: '2024-01-11', value: 29 },
  { date: '2024-01-12', value: 24 },
  { date: '2024-01-13', value: 18 },
  { date: '2024-01-14', value: 22 },
  { date: '2024-01-15', value: 26 },
  { date: '2024-01-16', value: 31 },
  { date: '2024-01-17', value: 38 },
  { date: '2024-01-18', value: 42 },
  { date: '2024-01-19', value: 35 },
  { date: '2024-01-20', value: 28 },
];

export const mockCategoryData: TimeSeriesData[] = [
  { date: '2024-01-15', value: 8, category: 'MCAL' },
  { date: '2024-01-16', value: 12, category: 'MCAL' },
  { date: '2024-01-17', value: 15, category: 'MCAL' },
  { date: '2024-01-18', value: 10, category: 'MCAL' },
  { date: '2024-01-19', value: 14, category: 'MCAL' },
  { date: '2024-01-20', value: 11, category: 'MCAL' },
  { date: '2024-01-15', value: 5, category: '通信' },
  { date: '2024-01-16', value: 7, category: '通信' },
  { date: '2024-01-17', value: 6, category: '通信' },
  { date: '2024-01-18', value: 9, category: '通信' },
  { date: '2024-01-19', value: 8, category: '通信' },
  { date: '2024-01-20', value: 7, category: '通信' },
  { date: '2024-01-15', value: 3, category: '安全' },
  { date: '2024-01-16', value: 4, category: '安全' },
  { date: '2024-01-17', value: 5, category: '安全' },
  { date: '2024-01-18', value: 4, category: '安全' },
  { date: '2024-01-19', value: 6, category: '安全' },
  { date: '2024-01-20', value: 5, category: '安全' },
];

export interface DashboardSummary {
  totalModules: number;
  totalDownloads: number;
  activeContributors: number;
  codeCommits: number;
  avgQualityScore: number;
  trend: {
    modules: number;
    downloads: number;
    contributors: number;
    commits: number;
  };
}

export function getDashboardSummary(): DashboardSummary {
  return {
    totalModules: 24,
    totalDownloads: 15420,
    activeContributors: 4,
    codeCommits: 688,
    avgQualityScore: 85,
    trend: {
      modules: 12,
      downloads: 28,
      contributors: 0,
      commits: 15,
    },
  };
}

export function generateReport(type: 'usage' | 'quality' | 'team', format: 'pdf' | 'excel'): string {
  // 演示函数，实际实现需要后端支持
  return `report_${type}_${new Date().toISOString().split('T')[0]}.${format}`;
}
