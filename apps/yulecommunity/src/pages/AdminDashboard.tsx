import { useMemo } from 'react';
import {
  Users,
  MessageSquare,
  HelpCircle,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  PieChart,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getLevelInfo } from '../hooks/useUserSystem';
import {
  initialForumPosts,
  initialQuestions,
  initialEvents,
  type ForumPost,
  type Question,
  type CommunityEvent,
} from '../data/communityData';
import { UserGrowthChart } from '../components/admin/UserGrowthChart';
import { ContentDistributionChart } from '../components/admin/ContentDistributionChart';
import { PointsSourceChart } from '../components/admin/PointsSourceChart';
import { ActivityTrendChart } from '../components/admin/ActivityTrendChart';

interface RecentActivity {
  id: string;
  type: 'forum' | 'qa' | 'event';
  title: string;
  timestamp: string;
  author: string;
}

function getStorageSize(): string {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += localStorage.getItem(key)?.length ?? 0;
    }
  }
  const bytes = total * 2; // UTF-16
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return d.toLocaleDateString('zh-CN');
}

export function AdminDashboard() {
  const [posts] = useLocalStorage<ForumPost[]>('yuletech-forum-posts', initialForumPosts);
  const [questions] = useLocalStorage<Question[]>('yuletech-qa-questions', initialQuestions);
  const [events] = useLocalStorage<CommunityEvent[]>('yuletech-events', initialEvents);

  // Generate user stats from all available data
  const userStats = useMemo(() => {
    const authors = new Set<string>();
    posts.forEach((p) => authors.add(p.author));
    questions.forEach((q) => authors.add(q.author));
    events.forEach((e) => authors.add(e.speaker));
    // Add mock users
    const mockCount = 12;
    return authors.size + mockCount;
  }, [posts, questions, events]);

  const levelDistribution = useMemo(() => {
    const levels = [
      { label: '初级工程师', min: 0, max: 100, count: 0 },
      { label: '中级工程师', min: 101, max: 500, count: 0 },
      { label: '高级工程师', min: 501, max: 2000, count: 0 },
      { label: '技术专家', min: 2001, max: Infinity, count: 0 },
    ];
    // Simulate point distribution based on content authors
    const allAuthors = new Map<string, number>();
    posts.forEach((p) => {
      allAuthors.set(p.author, (allAuthors.get(p.author) || 0) + p.likes * 2 + p.views * 0.1);
    });
    questions.forEach((q) => {
      allAuthors.set(q.author, (allAuthors.get(q.author) || 0) + q.bounty + q.views * 0.1);
    });
    events.forEach((e) => {
      allAuthors.set(e.speaker, (allAuthors.get(e.speaker) || 0) + 50);
    });

    allAuthors.forEach((points) => {
      const info = getLevelInfo(Math.floor(points));
      const level = levels.find((l) => l.label === info.title);
      if (level) level.count++;
    });

    // Add mock distribution
    levels[0].count += 8;
    levels[1].count += 5;
    levels[2].count += 3;
    levels[3].count += 1;

    const maxCount = Math.max(...levels.map((l) => l.count), 1);
    return levels.map((l) => ({ ...l, percent: Math.round((l.count / maxCount) * 100) }));
  }, [posts, questions, events]);

  const recentActivity = useMemo(() => {
    const activities: RecentActivity[] = [
      ...posts.map((p) => ({
        id: p.id,
        type: 'forum' as const,
        title: p.title,
        timestamp: p.createdAt,
        author: p.author,
      })),
      ...questions.map((q) => ({
        id: q.id,
        type: 'qa' as const,
        title: q.title,
        timestamp: q.createdAt,
        author: q.author,
      })),
      ...events.map((e) => ({
        id: e.id,
        type: 'event' as const,
        title: e.title,
        timestamp: `${e.date}T00:00:00`,
        author: e.speaker,
      })),
    ];
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [posts, questions, events]);

  const pwaStatus = 'serviceWorker' in navigator ? '已注册' : '未支持';
  const storageSize = getStorageSize();

  const stats = [
    { label: '总用户数', value: userStats, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: '论坛帖子', value: posts.length, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: '问答问题', value: questions.length, icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: '活动数', value: events.length, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">仪表盘</h2>
        <p className="text-sm text-muted-foreground">社区概览与系统状态</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth - spans 2 columns */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--accent))]" />
            <h3 className="font-semibold">用户增长趋势（近30天）</h3>
          </div>
          <UserGrowthChart />
        </div>

        {/* Content Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-[hsl(var(--accent))]" />
            <h3 className="font-semibold">内容分布</h3>
          </div>
          <ContentDistributionChart />
        </div>

        {/* Points Source */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[hsl(var(--accent))]" />
            <h3 className="font-semibold">积分来源</h3>
          </div>
          <PointsSourceChart />
        </div>

        {/* Activity Trend - spans 2 columns */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[hsl(var(--accent))]" />
            <h3 className="font-semibold">社区活跃度（近14天）</h3>
          </div>
          <ActivityTrendChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[hsl(var(--accent))]" />
            <h3 className="font-semibold">最近动态</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">
                  {item.type === 'forum' && <MessageSquare className="w-4 h-4 text-green-500" />}
                  {item.type === 'qa' && <HelpCircle className="w-4 h-4 text-amber-500" />}
                  {item.type === 'event' && <Calendar className="w-4 h-4 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.author} · {formatTimeAgo(item.timestamp)}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                  {item.type === 'forum' ? '论坛' : item.type === 'qa' ? '问答' : '活动'}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">暂无动态</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Points Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--accent))]" />
              <h3 className="font-semibold">积分分布</h3>
            </div>
            <div className="space-y-4">
              {levelDistribution.map((level) => (
                <div key={level.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{level.label}</span>
                    <span className="font-medium">{level.count} 人</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full transition-all"
                      style={{ width: `${level.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold">系统状态</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">PWA 状态</span>
                <span className="flex items-center gap-1 font-medium">
                  {pwaStatus === '已注册' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  {pwaStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">localStorage</span>
                <span className="flex items-center gap-1 font-medium">
                  <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                  {storageSize}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">置顶帖子</span>
                <span className="font-medium">{posts.filter((p) => p.isPinned).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">即将开始活动</span>
                <span className="font-medium">{events.filter((e) => e.status === 'upcoming').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
