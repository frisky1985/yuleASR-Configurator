import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Code2, Package, Search, ArrowRight } from 'lucide-react';
import { getModuleIndex } from '../../data/autosar/spec-index';

const cards = [
  {
    icon: BookOpen,
    title: '规范引擎',
    description: '浏览 AutoSAR 标准 API 规范，支持层级导航、全文搜索和多版本对比。',
    link: '/autosar/spec',
    linkText: '开始浏览',
    color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    iconBg: 'bg-blue-500/10 text-blue-500',
    status: '已上线' as const,
  },
  {
    icon: Code2,
    title: '在线编译',
    description: '浏览器端 C 代码编译和 AutoSAR 运行时仿真，CAN/Gpio/Spi 可视化。',
    link: '/autosar/sandbox',
    linkText: '开始使用',
    color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
    iconBg: 'bg-cyan-500/10 text-cyan-500',
    status: '已上线' as const,
  },
  {
    icon: Package,
    title: '模块仓库',
    description: '社区共建的 BSW 模块模板，支持一键导入 yuleASR 配置器。',
    link: '/autosar/registry',
    linkText: '开始浏览',
    color: 'from-teal-500/20 to-teal-600/5 border-teal-500/20',
    iconBg: 'bg-teal-500/10 text-teal-500',
    status: '已上线' as const,
  },
];

export function DevHubPage() {
  const modules = getModuleIndex();
  const totalApis = modules.reduce((s: number, m: { apiCount: number }) => s + m.apiCount, 0);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Helmet>
        <title>AutoSAR 开发者中心 - YuleTech</title>
        <meta name="description" content="一站式 AutoSAR 开发资源平台，包含规范查询、在线调试和模块管理。" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Code2 className="w-4 h-4" />
            AutoSAR Developer Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            AutoSAR <span className="text-gradient-accent">开发者中心</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            一站式规范查询、在线调试、模块管理 —— 加速你的 AutoSAR BSW 开发
          </p>
        </motion.div>

        {/* Quick Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-16"
        >
          <Link
            to="/autosar/spec"
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-elegant transition-all group"
          >
            <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              搜索 AutoSAR API，如 Can_Init、Dio_ReadChannel...
            </span>
            <kbd className="ml-auto px-2 py-0.5 text-[10px] rounded border border-border bg-muted/50 text-muted-foreground">
              Cmd+K
            </kbd>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className={`relative group rounded-xl border bg-gradient-to-br ${card.color} p-6 hover:shadow-elegant transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  card.status === '已上线'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {card.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
              {card.status === '已上线' ? (
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {card.linkText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">{card.linkText}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: '规范 API', value: totalApis.toString() + '+', desc: 'AutoSAR 标准函数' },
            { label: 'BSW 模块', value: modules.length.toString(), desc: 'MCAL / ECUAL / Service' },
            { label: '规范版本', value: '3', desc: '4.4 / 4.6 / R21-11' },
            { label: '代码示例', value: `${totalApis}+`, desc: '可直接运行的示例' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
