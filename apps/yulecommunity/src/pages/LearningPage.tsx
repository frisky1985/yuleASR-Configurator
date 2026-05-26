import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Play,
  Code2,
  MessageSquare,
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Lock,
  Award,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';

const categories = ['全部', '教程', '视频课程', '实战项目', '专家问答'];

const courses = [
  {
    category: '教程',
    icon: BookOpen,
    color: 'text-blue-500 bg-blue-500/10',
    items: [
      {
        title: 'AutoSAR Classic Platform 4.x 规范解读',
        desc: '从入门到精通，系统讲解 AutoSAR 方法论、软件架构和配置流程。包含 12 章完整内容。',
        level: '入门',
        duration: '24 课时',
        students: 1840,
        rating: 4.9,
        free: true,
        tags: ['AutoSAR', '规范'],
      },
      {
        title: 'MCAL 驱动开发实战指南',
        desc: '深入讲解 MCAL 层驱动开发原理，基于目标芯片的寄存器配置和代码实现。',
        level: '进阶',
        duration: '18 课时',
        students: 920,
        rating: 4.8,
        free: true,
        tags: ['MCAL', 'i.MX8M'],
      },
      {
        title: '汽车功能安全 ISO 26262 基础',
        desc: '功能安全标准解读，ASIL 等级划分，安全分析方法在汽车基础软件中的应用。',
        level: '中级',
        duration: '12 课时',
        students: 650,
        rating: 4.7,
        free: false,
        tags: ['功能安全', 'ISO 26262'],
      },
    ],
  },
  {
    category: '视频课程',
    icon: Play,
    color: 'text-cyan-500 bg-cyan-500/10',
    items: [
      {
        title: 'AutoSAR BSW 配置工具链实操',
        desc: '手把手演示 YuleConfig 工具的使用，从新建工程到生成代码的完整流程录制。',
        level: '入门',
        duration: '8 课时',
        students: 2100,
        rating: 4.9,
        free: true,
        tags: ['工具链', '实操'],
      },
      {
        title: 'CAN 通信协议栈深度解析',
        desc: '从物理层到应用层，全面解析 CAN/CAN FD 通信协议栈在 AutoSAR 中的实现机制。',
        level: '进阶',
        duration: '15 课时',
        students: 1100,
        rating: 4.8,
        free: true,
        tags: ['CAN', '通信'],
      },
      {
        title: '诊断服务 UDS 开发精讲',
        desc: 'UDS 协议(ISO 14229)详解，Dcm/Dem 模块配置与诊断服务实现。',
        level: '高级',
        duration: '20 课时',
        students: 780,
        rating: 4.9,
        free: false,
        tags: ['UDS', '诊断'],
      },
    ],
  },
  {
    category: '实战项目',
    icon: Code2,
    color: 'text-teal-500 bg-teal-500/10',
    items: [
      {
        title: '开发板入门项目',
        desc: '基于 YuleTech 开源开发板，完成 GPIO 控制、CAN 收发和 ADC 采集的完整项目。',
        level: '入门',
        duration: '10 课时',
        students: 1560,
        rating: 4.8,
        free: true,
        tags: ['开发板', '实战'],
      },
      {
        title: '车身控制器 BSW 全栈开发',
        desc: '从零开始搭建车身控制器的完整 BSW 栈，包含 MCAL/ECUAL/Service 三层实现。',
        level: '进阶',
        duration: '30 课时',
        students: 890,
        rating: 4.9,
        free: false,
        tags: ['BCM', '全栈'],
      },
      {
        title: '电机控制 ASW 组件开发',
        desc: '基于 Simulink 模型自动生成代码，集成到 RTE 层，实现电机控制应用层开发。',
        level: '高级',
        duration: '25 课时',
        students: 560,
        rating: 4.7,
        free: false,
        tags: ['电机控制', 'MBD'],
      },
    ],
  },
  {
    category: '专家问答',
    icon: MessageSquare,
    color: 'text-emerald-500 bg-emerald-500/10',
    items: [
      {
        title: 'AutoSAR 配置常见问题 100 问',
        desc: '汇总社区高频问题，由资深工程师详细解答配置、编译和调试中的常见难题。',
        level: '全阶段',
        duration: '持续更新',
        students: 3200,
        rating: 4.9,
        free: true,
        tags: ['FAQ', '答疑'],
      },
      {
        title: '每周技术直播回放',
        desc: '每周五晚 8 点，YuleTech 技术专家直播答疑，覆盖 AutoSAR 各模块技术要点。',
        level: '全阶段',
        duration: '每周更新',
        students: 4500,
        rating: 4.8,
        free: true,
        tags: ['直播', '答疑'],
      },
      {
        title: '1对1 专家咨询',
        desc: '预约 YuleTech 资深架构师进行一对一技术咨询，解决项目中的具体技术难题。',
        level: '高级',
        duration: '按小时',
        students: 230,
        rating: 5.0,
        free: false,
        tags: ['咨询', '专家'],
      },
    ],
  },
];

const learningPaths = [
  {
    title: 'AutoSAR 入门路线',
    steps: ['规范基础', '工具链使用', 'MCAL 配置', 'ECUAL 开发'],
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'AutoSAR 进阶路线',
    steps: ['通信栈深入', '诊断开发', '存储管理', '功能安全'],
    icon: Award,
    color: 'from-cyan-500 to-teal-500',
  },
  {
    title: 'AutoSAR 专家路线',
    steps: ['架构设计', '性能优化', '多核配置', '工具链定制'],
    icon: Lightbulb,
    color: 'from-teal-500 to-emerald-500',
  },
];

export function LearningPage() {
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredCourses =
    activeCategory === '全部'
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>学习成长 - YuleTech | AutoSAR 教程与认证</title>
        <meta name="description" content="系统化的 AutoSAR 学习路径，从入门到专家。视频课程、实战项目、专家问答，帮助你快速成长为汽车基础软件专家。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              学习成长
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              工程师的
              <span className="text-gradient-accent"> 成长平台</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              系统化的 AutoSAR 学习路径，从入门到专家。
              视频课程、实战项目、专家问答，帮助你快速成长为汽车基础软件专家。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-all">
                开始学习
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all border border-border">
                <Users className="w-4 h-4" />
                加入学习小组
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
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">100+</div>
              <div className="text-sm text-muted-foreground">精品课程</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">12,000+</div>
              <div className="text-sm text-muted-foreground">学习人次</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">45</div>
              <div className="text-sm text-muted-foreground">实战项目</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">320+</div>
              <div className="text-sm text-muted-foreground">问题已解决</div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">系统化学习路径</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              从零基础到专家，我们为不同阶段的学习者设计了清晰的学习路线
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <div
                key={path.title}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4`}>
                  <path.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-4">{path.title}</h3>
                <div className="space-y-3">
                  {path.steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary))] hover:text-primary-foreground transition-all border border-border">
                  查看详情
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {filteredCourses.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">{cat.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((item) => (
                  <div
                    key={item.title}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold leading-snug">{item.title}</h3>
                      {item.free ? (
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                          免费
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                          <Lock className="w-3 h-3 inline mr-0.5" />
                          会员
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{item.desc}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {item.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {item.students}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" /> {item.rating}
                      </span>
                    </div>

                    <button className="w-full py-2.5 bg-[hsl(var(--primary))] text-primary-foreground rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors">
                      {item.free ? '立即学习' : '查看详情'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">成为 YuleTech 讲师</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            如果你是汽车基础软件领域的专家，欢迎加入 YuleTech 讲师团队，
            与 thousands of 工程师分享你的知识和经验，同时获得收益分成。
          </p>
          <button className="px-8 py-3 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
            申请成为讲师
          </button>
        </div>
      </section>
    </div>
  );
}
