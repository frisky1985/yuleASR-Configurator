import { MessageCircle, Calendar, Users, Lightbulb, ArrowRight } from 'lucide-react';

const activities = [
  {
    icon: MessageCircle,
    title: '技术问答',
    description: '遇到 AutoSAR 开发难题？在社区提问，专家和资深工程师为你解答',
    count: '320+ 问题已解决',
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    icon: Calendar,
    title: '线上线下活动',
    description: '定期举办技术研讨会、黑客马拉松和行业 Meetup，与同行深度交流',
    count: '每月 2-3 场活动',
    color: 'text-cyan-500 bg-cyan-500/10',
  },
  {
    icon: Users,
    title: '工程师圈子',
    description: '按技术领域、芯片平台、地区组建圈子，找到志同道合的伙伴',
    count: '12 个活跃圈子',
    color: 'text-teal-500 bg-teal-500/10',
  },
  {
    icon: Lightbulb,
    title: '众包开发',
    description: '参与开源项目贡献、插件开发，获取积分奖励和佣金分成',
    count: '50+ 开放任务',
    color: 'text-emerald-500 bg-emerald-500/10',
  },
];

const testimonials = [
  {
    name: '张明',
    role: '嵌入式工程师 @ 某Tier1',
    content: 'YuleTech 的开源 BSW 帮我节省了大量开发时间，社区里的技术讨论也非常有深度。',
    avatar: 'ZM',
  },
  {
    name: '李华',
    role: '汽车软件架构师',
    content: '作为国内少有的 AutoSAR 开源社区，YuleTech 为工程师提供了宝贵的学习和实践平台。',
    avatar: 'LH',
  },
  {
    name: '王强',
    role: '创业公司 CTO',
    content: '我们团队使用 YuleTech 的基础软件包，配合工具链，开发效率提升了 3 倍。',
    avatar: 'WQ',
  },
];

export function Community() {
  return (
    <section id="community" className="py-24 bg-gradient-to-b from-transparent via-[hsl(var(--accent))]/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-sm font-medium mb-4">
            社区生态
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            与工程师
            <span className="text-gradient-accent"> 共同成长</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            加入 YuleTech 社区，与 2800+ 汽车软件工程师一起交流学习、协作开发
          </p>
        </div>

        {/* Activities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-elegant transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center mb-4`}>
                <activity.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{activity.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[hsl(var(--accent))]">{activity.count}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(var(--accent))] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
