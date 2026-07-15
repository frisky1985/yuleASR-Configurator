import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MessageCircle,
  Calendar,
  Users,
  Lightbulb,
  ArrowRight,
  MapPin,
  Clock,
  Flame,
  ChevronRight,
  Heart,
  MessageSquare,
  Star,
  Award,
  HelpCircle,
  Video,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  CommunityContentDistribution,
  CommunityActivityTrend,
} from '../components/admin/CommunityStatsCharts';

const forumTopics = [
  {
    title: 'CAN FD 的波特率配置问题',
    author: '张明',
    avatar: 'ZM',
    role: '嵌入式工程师',
    replies: 24,
    likes: 18,
    tags: ['MCAL', 'CAN'],
    time: '2小时前',
    hot: true,
  },
  {
    title: 'AutoSAR Com 模块的信号路由配置最佳实践',
    author: '李华',
    avatar: 'LH',
    role: '软件架构师',
    replies: 36,
    likes: 42,
    tags: ['Service', 'Com', '配置'],
    time: '5小时前',
    hot: true,
  },
  {
    title: '求助：Pwm 模块在 i.MX8M 上的占空比精度问题',
    author: '王强',
    avatar: 'WQ',
    role: '初级工程师',
    replies: 12,
    likes: 8,
    tags: ['MCAL', 'Pwm'],
    time: '昨天',
    hot: false,
  },
  {
    title: '分享：我们团队基于 YuleTech BSW 的量产经验',
    author: '陈工',
    avatar: 'CG',
    role: '技术负责人',
    replies: 58,
    likes: 89,
    tags: ['经验分享', '量产'],
    time: '2天前',
    hot: true,
  },
  {
    title: 'YuleConfig 工具链的 Docker 环境搭建踩坑记录',
    author: '刘洋',
    avatar: 'LY',
    role: 'DevOps工程师',
    replies: 15,
    likes: 22,
    tags: ['工具链', 'Docker'],
    time: '3天前',
    hot: false,
  },
];

const events = [
  {
    title: 'AutoSAR BSW 开源社区线上技术沙龙',
    date: '2026-04-25',
    time: '20:00 - 21:30',
    type: '线上',
    location: '腾讯会议',
    attendees: 156,
    status: '报名中',
  },
  {
    title: 'YuleTech 首届汽车基础软件黑客马拉松',
    date: '2026-05-10',
    time: '09:00 - 18:00',
    type: '线下',
    location: '上海张江高科',
    attendees: 80,
    status: '报名中',
  },
  {
    title: '驱动开发实战工作坊',
    date: '2026-05-18',
    time: '14:00 - 17:00',
    type: '线上',
    location: 'B站直播',
    attendees: 320,
    status: '即将开始',
  },
  {
    title: 'AutoSAR 功能安全与 ISO 26262 研讨会',
    date: '2026-06-05',
    time: '09:30 - 16:30',
    type: '线下',
    location: '深圳南山科技园',
    attendees: 120,
    status: '报名中',
  },
];

const circles = [
  {
    name: 'MCAL 驱动开发圈',
    members: 480,
    posts: 1200,
    desc: '专注微控制器驱动层开发技术交流',
    icon: CpuIcon,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'ECUAL 抽象层圈',
    members: 360,
    posts: 890,
    desc: 'ECU硬件抽象层配置与开发讨论',
    icon: LayersIcon,
    color: 'from-cyan-500 to-teal-500',
  },
  {
    name: '开发者圈',
    members: 620,
    posts: 2100,
    desc: '芯片开发技术交流',
    icon: ChipIcon,
    color: 'from-teal-500 to-emerald-500',
  },
  {
    name: '功能安全圈',
    members: 210,
    posts: 560,
    desc: 'ISO 26262 功能安全标准实践交流',
    icon: ShieldIcon,
    color: 'from-emerald-500 to-green-500',
  },
];

const tasks = [
  {
    title: '为 CanIf 模块补充完整的 Doxygen 文档',
    reward: '500 积分',
    difficulty: '简单',
    deadline: '2026-05-01',
    applicants: 3,
    tags: ['文档', 'ECUAL'],
  },
  {
    title: '实现 Adc 模块 DMA 传输支持',
    reward: '2000 积分',
    difficulty: '困难',
    deadline: '2026-05-15',
    applicants: 1,
    tags: ['MCAL', 'Adc', 'DMA'],
  },
  {
    title: '开发 YuleConfig 的 DBC 文件导入插件',
    reward: '3000 积分 + 现金奖励',
    difficulty: '中等',
    deadline: '2026-05-20',
    applicants: 5,
    tags: ['工具链', '插件'],
  },
  {
    title: '编写 AutoSAR 入门系列博客文章（5篇）',
    reward: '1500 积分',
    difficulty: '简单',
    deadline: '2026-04-30',
    applicants: 8,
    tags: ['内容创作', '入门'],
  },
];

function CpuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" /><path d="M15 20v2" />
      <path d="M2 15h2" /><path d="M2 9h2" />
      <path d="M20 15h2" /><path d="M20 9h2" />
      <path d="M9 2v2" /><path d="M9 20v2" />
    </svg>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ChipIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 12h2" /><path d="M4 12h2" />
      <path d="M12 18v2" /><path d="M12 4v2" />
      <path d="M8 8l-2-2" /><path d="M16 16l2 2" />
      <path d="M8 16l-2 2" /><path d="M16 8l2-2" />
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const tabs = [
  { id: 'forum', label: '技术论坛', icon: MessageCircle },
  { id: 'events', label: '活动日历', icon: Calendar },
  { id: 'circles', label: '工程师圈子', icon: Users },
  { id: 'tasks', label: '众包任务', icon: Lightbulb },
];

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState('forum');

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>社区互动 - YuleTech | 论坛、问答、活动</title>
        <meta name="description" content="加入 YuleTech 社区，与 2,800+ 汽车软件工程师一起交流学习、协作开发。技术论坛、活动沙龙、工程师圈子、众包任务。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              工程师社区
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              与工程师
              <span className="text-gradient-accent"> 共同成长</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              加入 YuleTech 社区，与 2,800+ 汽车软件工程师一起交流学习、协作开发。
              技术论坛、活动沙龙、工程师圈子、众包任务，这里是你技术成长的沃土。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-all">
                免费加入社区
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all border border-border">
                <MessageCircle className="w-4 h-4" />
                浏览讨论
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">2,800+</div>
              <div className="text-sm text-muted-foreground">注册工程师</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">4,500+</div>
              <div className="text-sm text-muted-foreground">技术讨论</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">12</div>
              <div className="text-sm text-muted-foreground">活跃圈子</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">50+</div>
              <div className="text-sm text-muted-foreground">开放任务</div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Stats Charts */}
      <section className="py-10 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-[hsl(var(--accent))]" />
            <h2 className="text-xl font-bold">社区数据概览</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-[hsl(var(--accent))]" />
                <h3 className="font-semibold">内容类型分布</h3>
              </div>
              <CommunityContentDistribution />
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-[hsl(var(--accent))]" />
                <h3 className="font-semibold">近14天活跃度</h3>
              </div>
              <CommunityActivityTrend />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/forum"
              className="group bg-card border border-border rounded-xl p-6 hover:border-[hsl(var(--accent))]/30 hover:shadow-elegant transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-[hsl(var(--accent))] transition-colors">技术论坛</h3>
                  <p className="text-sm text-muted-foreground">发帖讨论、分享经验、求助答疑</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(var(--accent))] transition-colors" />
              </div>
            </Link>
            <Link
              to="/qa"
              className="group bg-card border border-border rounded-xl p-6 hover:border-[hsl(var(--accent))]/30 hover:shadow-elegant transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-[hsl(var(--accent))] transition-colors">技术问答</h3>
                  <p className="text-sm text-muted-foreground">悬赏提问、专家解答、积累知识</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(var(--accent))] transition-colors" />
              </div>
            </Link>
            <Link
              to="/events"
              className="group bg-card border border-border rounded-xl p-6 hover:border-[hsl(var(--accent))]/30 hover:shadow-elegant transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-[hsl(var(--accent))] transition-colors">社区活动</h3>
                  <p className="text-sm text-muted-foreground">线上沙龙、线下研讨、实战训练营</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(var(--accent))] transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
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
      <section className="py-12 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Forum */}
          {activeTab === 'forum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">热门讨论</h2>
                <button className="text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] font-medium flex items-center gap-1">
                  发起讨论 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {forumTopics.map((topic) => (
                <div
                  key={topic.title}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {topic.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold group-hover:text-[hsl(var(--accent))] transition-colors truncate">
                          {topic.title}
                        </h3>
                        {topic.hot && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            <Flame className="w-3 h-3" /> 热门
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span className="font-medium text-foreground">{topic.author}</span>
                        <span>·</span>
                        <span>{topic.role}</span>
                        <span>·</span>
                        <span>{topic.time}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {topic.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {topic.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" /> {topic.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Events */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">近期活动</h2>
                <button className="text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] font-medium flex items-center gap-1">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div
                    key={event.title}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          event.type === '线上'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {event.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          event.status === '报名中'
                            ? 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-3 group-hover:text-[hsl(var(--accent))] transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>已报名 {event.attendees} 人</span>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-[hsl(var(--primary))] text-primary-foreground rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors">
                      立即报名
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Circles */}
          {activeTab === 'circles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">工程师圈子</h2>
                <button className="text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] font-medium flex items-center gap-1">
                  创建圈子 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {circles.map((circle) => (
                  <div
                    key={circle.name}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${circle.color} flex items-center justify-center flex-shrink-0`}>
                        <circle.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{circle.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{circle.desc}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {circle.members} 成员
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> {circle.posts} 帖子
                          </span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-[hsl(var(--primary))] hover:text-primary-foreground transition-colors border border-border flex-shrink-0">
                        加入
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">众包任务</h2>
                <button className="text-sm text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] font-medium flex items-center gap-1">
                  发布任务 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.title}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold group-hover:text-[hsl(var(--accent))] transition-colors">
                        {task.title}
                      </h3>
                      <span className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                        <Award className="w-3 h-3" /> {task.reward}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span
                          className={`flex items-center gap-1 ${
                            task.difficulty === '简单'
                              ? 'text-emerald-500'
                              : task.difficulty === '中等'
                              ? 'text-amber-500'
                              : 'text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" /> {task.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {task.deadline} 截止
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {task.applicants} 人申请
                      </span>
                    </div>
                    <button className="w-full mt-4 py-2.5 bg-[hsl(var(--primary))] text-primary-foreground rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors">
                      申请任务
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">加入 YuleTech 社区</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            无论你是刚入门的爱好者，还是经验丰富的专家，YuleTech 社区都为你准备了合适的位置。
            与 2,800+ 工程师一起，为中国汽车基础软件开源生态贡献力量。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
              免费注册
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
              了解社区规则
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
