import { useEffect, useState } from 'react';
import { 
  GitBranch, 
  Star, 
  GitFork, 
  CircleDot, 
  Eye,
  TrendingUp,
  Activity,
  Code2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { 
  getCachedRepoStats, 
  calculateTotals, 
  generateMockContributions,
  getModuleProgress,
  type RepoStats 
} from '../services/githubApi';

export function GitHubDashboard() {
  const [stats, setStats] = useState<RepoStats[]>([]);
  const [totals, setTotals] = useState({
    totalStars: 0,
    totalForks: 0,
    totalIssues: 0,
    totalWatchers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [contributions] = useState(() => generateMockContributions(14));
  const [moduleProgress] = useState(() => getModuleProgress());

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getCachedRepoStats();
        setStats(data);
        setTotals(calculateTotals(data));
      } catch (error) {
        console.error('Failed to load GitHub stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 30) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">加载中...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">实时数据</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            开源项目
            <span className="text-gradient-accent"> 活跃度</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            从 GitHub 实时获取的项目数据，跟踪开源生态的健康状况
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-elegant transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 mx-auto mb-3">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-3xl font-bold">{formatNumber(totals.totalStars)}</div>
            <div className="text-sm text-muted-foreground">Stars</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-elegant transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mx-auto mb-3">
              <GitFork className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{formatNumber(totals.totalForks)}</div>
            <div className="text-sm text-muted-foreground">Forks</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-elegant transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 mx-auto mb-3">
              <Eye className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold">{formatNumber(totals.totalWatchers)}</div>
            <div className="text-sm text-muted-foreground">Watchers</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-elegant transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 mx-auto mb-3">
              <CircleDot className="w-6 h-6 text-rose-500" />
            </div>
            <div className="text-3xl font-bold">{formatNumber(totals.totalIssues)}</div>
            <div className="text-sm text-muted-foreground">Open Issues</div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 模块完成度 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Code2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">模块开发进度</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={60}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, '完成度']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                    {moduleProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getProgressColor(entry.progress)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 贡献活跃度 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">近期贡献活跃度</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={contributions}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [value, '贡献次数']}
                    labelFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('zh-CN');
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 仓库列表 */}
        {stats.length > 0 && (
          <div className="mt-8 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <GitBranch className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">热门仓库</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.slice(0, 6).map((repo) => (
                <a
                  key={repo.name}
                  href={`https://github.com/frisky1985/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GitBranch className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm group-hover:text-primary transition-colors">
                        {repo.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {repo.language}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {formatNumber(repo.stars)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {formatNumber(repo.forks)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 底部链接 */}
        <div className="text-center mt-8">
          <a
            href="https://github.com/frisky1985"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            在 GitHub 上查看全部项目 →
          </a>
        </div>
      </div>
    </section>
  );
}
