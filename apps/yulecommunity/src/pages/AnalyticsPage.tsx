import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart3,
  Users,
  Download,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  FileText,
  Table,
} from 'lucide-react';
import {
  mockContributors,
  mockModuleUsage,
  mockTeamMetrics,
  mockActivityData,
  mockCategoryData,
  getDashboardSummary,
  generateReport,
  type Contributor,
  type ModuleUsage,
  type TeamMetric,
} from '../data/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: any;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-sm mt-2 ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

function ContributorRow({ contributor, rank }: { contributor: Contributor; rank: number }) {
  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="py-3 px-4">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
          rank <= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          {rank}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center text-sm font-bold text-white">
            {contributor.avatar}
          </div>
          <span className="font-medium">{contributor.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right">{contributor.commits}</td>
      <td className="py-3 px-4 text-right text-green-500">+{contributor.additions.toLocaleString()}</td>
      <td className="py-3 px-4 text-right text-red-500">-{contributor.deletions.toLocaleString()}</td>
      <td className="py-3 px-4 text-right">{contributor.modules}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{contributor.lastActive}</td>
    </tr>
  );
}

function ModuleUsageRow({ module }: { module: ModuleUsage }) {
  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="py-3 px-4 font-medium">{module.moduleName}</td>
      <td className="py-3 px-4 text-right">{module.downloads.toLocaleString()}</td>
      <td className="py-3 px-4 text-right">{module.uniqueProjects}</td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          {module.stars}
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={`inline-flex items-center gap-1 text-sm ${
          module.trend === 'up' ? 'text-green-500' :
          module.trend === 'down' ? 'text-red-500' :
          'text-muted-foreground'
        }`}>
          {module.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
           module.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
           <Minus className="w-4 h-4" />}
          {module.trendValue > 0 ? '+' : ''}{module.trendValue}%
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{module.lastDownload}</td>
    </tr>
  );
}

function TeamMetricCard({ team }: { team: TeamMetric }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">{team.teamName}</h3>
        <span className="text-sm text-muted-foreground">{team.members} 人</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold">{team.commits}</p>
          <p className="text-xs text-muted-foreground">提交</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{team.prs}</p>
          <p className="text-xs text-muted-foreground">PR</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{team.velocity}</p>
          <p className="text-xs text-muted-foreground">速度</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{team.sprintCompletion}%</p>
          <p className="text-xs text-muted-foreground">完成率</p>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'contributors' | 'modules' | 'teams'>('overview');

  const summary = getDashboardSummary();

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>分析仪表板 - 数据统计 | YuleTech</title>
      </Helmet>

      {/* Header */}
      <section className="bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                分析仪表板
              </h1>
              <p className="text-muted-foreground mt-2">数据驱动决策，洞察团队效能</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">迗去 7 天</option>
                <option value="30d">迗去 30 天</option>
                <option value="90d">迗去 90 天</option>
                <option value="1y">迗去 1 年</option>
              </select>
              <button
                onClick={() => generateReport('usage', 'pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <FileText className="w-4 h-4" />
                导出报告
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: '概览', icon: BarChart3 },
              { id: 'contributors', label: '贡献者', icon: Users },
              { id: 'modules', label: '模块使用', icon: Download },
              { id: 'teams', label: '团队效能', icon: Table },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="总模块数"
                value={summary.totalModules}
                trend={{ value: summary.trend.modules, isPositive: true }}
                icon={BarChart3}
              />
              <StatCard
                title="总下载量"
                value={summary.totalDownloads.toLocaleString()}
                trend={{ value: summary.trend.downloads, isPositive: true }}
                icon={Download}
              />
              <StatCard
                title="活跃贡献者"
                value={summary.activeContributors}
                icon={Users}
              />
              <StatCard
                title="代码提交"
                value={summary.codeCommits}
                trend={{ value: summary.trend.commits, isPositive: true }}
                icon={Calendar}
              />
              <StatCard
                title="平均质量分"
                value={summary.avgQualityScore}
                trend={{ value: 3, isPositive: true }}
                icon={Star}
              />
            </div>

            {/* Activity Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">活动趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockActivityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).getDate().toString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">按类别统计</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).getDate().toString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'contributors' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">排名</th>
                  <th className="text-left py-3 px-4 font-medium">贡献者</th>
                  <th className="text-right py-3 px-4 font-medium">提交</th>
                  <th className="text-right py-3 px-4 font-medium">增量</th>
                  <th className="text-right py-3 px-4 font-medium">删除</th>
                  <th className="text-right py-3 px-4 font-medium">模块</th>
                  <th className="text-left py-3 px-4 font-medium">最后活跃</th>
                </tr>
              </thead>
              <tbody>
                {mockContributors.map((contributor, index) => (
                  <ContributorRow
                    key={contributor.id}
                    contributor={contributor}
                    rank={index + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">模块名称</th>
                  <th className="text-right py-3 px-4 font-medium">下载量</th>
                  <th className="text-right py-3 px-4 font-medium">项目数</th>
                  <th className="text-right py-3 px-4 font-medium">收藏</th>
                  <th className="text-right py-3 px-4 font-medium">趋势</th>
                  <th className="text-left py-3 px-4 font-medium">最近下载</th>
                </tr>
              </thead>
              <tbody>
                {mockModuleUsage.map(module => (
                  <ModuleUsageRow key={module.moduleId} module={module} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTeamMetrics.map(team => (
              <TeamMetricCard key={team.teamId} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
