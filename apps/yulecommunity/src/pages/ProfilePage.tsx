import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Star,
  GitBranch,
  FileText,
  Clock,
  Trophy,
  Zap,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Bookmark,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { UserPoints } from '../components/UserPoints';
import { PointsHistoryChart } from '../components/admin/PointsHistoryChart';
import { BookmarksList } from '../components/profile/BookmarksList';

const tabs = [
  { id: 'contributions', label: '我的贡献', icon: GitBranch },
  { id: 'learning', label: '学习进度', icon: BookOpen },
  { id: 'bookmarks', label: '我的收藏', icon: Bookmark },
  { id: 'points', label: '积分等级', icon: Star },
];

const userProfile = {
  name: '陈工程师',
  role: '高级嵌入式工程师',
  company: '某 Tier1 供应商',
  avatar: '陈工',
  level: 'Lv.8',
  levelTitle: '架构师',
  points: 12850,
  nextLevel: 15000,
  joinDate: '2025-03-15',
  bio: '专注于 AutoSAR BSW 开发 6 年，擅长 MCAL/ECUAL 层驱动开发与配置。热衷于开源社区贡献，致力于推动国内汽车基础软件生态发展。',
};

const stats = [
  { label: '代码贡献', value: 47, icon: GitBranch, color: 'text-blue-500' },
  { label: '技术文章', value: 12, icon: FileText, color: 'text-cyan-500' },
  { label: '学习课时', value: 86, icon: Clock, color: 'text-teal-500' },
  { label: '获得赞数', value: 324, icon: ThumbsUp, color: 'text-emerald-500' },
];

const achievements = [
  { name: '开源先锋', desc: '提交首个 PR 并被合并', icon: Star, color: 'from-amber-500 to-orange-500', earned: true },
  { name: '技术作家', desc: '发布 10 篇技术文章', icon: FileText, color: 'from-blue-500 to-cyan-500', earned: true },
  { name: '学习达人', desc: '累计学习超过 80 课时', icon: BookOpen, color: 'from-teal-500 to-emerald-500', earned: true },
  { name: '社区之星', desc: '获得 300+ 点赞', icon: Trophy, color: 'from-purple-500 to-pink-500', earned: true },
  { name: 'Bug猎手', desc: '发现并报告 5 个有效 Bug', icon: Zap, color: 'from-red-500 to-rose-500', earned: false },
  { name: '架构大师', desc: '达到 Lv.10 等级', icon: TrendingUp, color: 'from-indigo-500 to-violet-500', earned: false },
];

const contributions = [
  { type: 'pr', title: '修复 CanIf 模块在轮询模式下的状态机问题', project: 'CanIf', status: '已合并', date: '2026-04-18', points: 200 },
  { type: 'pr', title: '为 Mcu 模块补充 Doxygen 注释', project: 'Mcu', status: '已合并', date: '2026-04-10', points: 150 },
  { type: 'article', title: 'AutoSAR CAN 通信栈配置实战指南', status: '已发布', date: '2026-04-05', views: 1200, likes: 56 },
  { type: 'pr', title: '优化 Spi 模块的 DMA 传输效率', project: 'Spi', status: '审核中', date: '2026-04-02', points: 300 },
  { type: 'issue', title: 'Gpt 模块在睡眠唤醒后计数器不递增', project: 'Gpt', status: '已关闭', date: '2026-03-28', points: 100 },
  { type: 'article', title: '看门狗驱动开发笔记', status: '已发布', date: '2026-03-20', views: 890, likes: 42 },
];

const learningProgress = [
  { title: 'AutoSAR Classic Platform 4.x 规范解读', progress: 100, total: 24, unit: '课时', completed: true, lastActive: '2026-04-15' },
  { title: 'MCAL 驱动开发实战指南', progress: 75, total: 18, unit: '课时', completed: false, lastActive: '2026-04-19' },
  { title: 'CAN 通信协议栈深度解析', progress: 40, total: 15, unit: '课时', completed: false, lastActive: '2026-04-20' },
  { title: '车身控制器 BSW 全栈开发', progress: 10, total: 30, unit: '课时', completed: false, lastActive: '2026-04-21' },
  { title: '汽车功能安全 ISO 26262 基础', progress: 0, total: 12, unit: '课时', completed: false, lastActive: '-' },
];

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('contributions');
  const navigate = useNavigate();

  const handleGoToBlog = useCallback(() => {
    navigate('/blog');
  }, [navigate]);

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>个人中心 - YuleTech | 积分等级与通知</title>
        <meta name="description" content="查看你的贡献记录、学习进度、收藏内容和积分等级。管理个人资料，追踪在 YuleTech 社区的成长轨迹。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-2xl font-bold shadow-elegant">
                {userProfile.avatar}
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{userProfile.name}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-sm font-medium">
                  <Award className="w-3.5 h-3.5" />
                  {userProfile.level} · {userProfile.levelTitle}
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{userProfile.role} · {userProfile.company}</p>
              <p className="text-sm text-muted-foreground max-w-2xl mb-4">{userProfile.bio}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 加入于 {userProfile.joinDate}
                </span>
              </div>
              <div className="mt-4 max-w-md mx-auto md:mx-0">
                <UserPoints />
              </div>
            </div>
            {/* Actions */}
            <div className="flex-shrink-0 flex flex-col gap-3">
              <button className="px-5 py-2.5 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl text-sm font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors">
                编辑资料
              </button>
              <button className="px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors border border-border">
                分享主页
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-2 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold mb-4">成就徽章</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {achievements.map((a) => (
              <div
                key={a.name}
                className={`text-center p-4 rounded-xl border transition-all ${
                  a.earned
                    ? 'border-border bg-card hover:shadow-elegant'
                    : 'border-border/50 bg-muted/30 opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center mx-auto mb-2`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-6 sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8 min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contributions */}
          {activeTab === 'contributions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">贡献记录</h2>
                <button className="text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] font-medium flex items-center gap-1">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {contributions.map((item, i) => (
                  <div
                    key={i}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'pr' && (
                            <span className="flex items-center gap-1 text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                              <GitBranch className="w-3 h-3" /> PR
                            </span>
                          )}
                          {item.type === 'article' && (
                            <span className="flex items-center gap-1 text-xs font-medium text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                              <FileText className="w-3 h-3" /> 文章
                            </span>
                          )}
                          {item.type === 'issue' && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              <MessageSquare className="w-3 h-3" /> Issue
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                        <h3 className="font-semibold group-hover:text-[hsl(var(--accent))] transition-colors">
                          {item.title}
                        </h3>
                        {'project' in item && (
                          <p className="text-sm text-muted-foreground mt-1">项目：{item.project}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.status === '已合并' || item.status === '已发布' || item.status === '已关闭'
                            ? 'text-emerald-500 bg-emerald-500/10'
                            : 'text-amber-500 bg-amber-500/10'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" /> {item.status}
                        </span>
                        {'points' in item && (
                          <span className="text-xs text-muted-foreground">+{item.points} 积分</span>
                        )}
                        {'views' in item && (
                          <span className="text-xs text-muted-foreground">{item.views} 阅读 · {item.likes} 点赞</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning */}
          {activeTab === 'learning' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">学习进度</h2>
                <div className="text-sm text-muted-foreground">
                  已完成 {learningProgress.filter((l) => l.completed).length} / {learningProgress.length} 门课程
                </div>
              </div>
              <div className="space-y-4">
                {learningProgress.map((course) => (
                  <div
                    key={course.title}
                    className="bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 最近学习：{course.lastActive}
                          </span>
                          {course.completed && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 已完成
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium flex-shrink-0">
                        {course.progress} / {course.total} {course.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          course.completed
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]'
                        }`}
                        style={{ width: `${(course.progress / course.total) * 100}%` }}
                      />
                    </div>
                    {!course.completed && (
                      <button className="mt-3 text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] font-medium">
                        继续学习
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks */}
          {activeTab === 'bookmarks' && (
            <BookmarksList 
              showHeader={true}
              emptyAction={{
                text: '去看看文章',
                onClick: handleGoToBlog
              }}
            />
          )}

          {/* Points */}
          {activeTab === 'points' && (
            <div className="max-w-2xl space-y-6">
              <UserPoints showHistory={true} />
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">积分变动趋势（近14天）</h3>
                <PointsHistoryChart />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
