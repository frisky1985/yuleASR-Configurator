import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Wrench,
  Download,
  ExternalLink,
  CheckCircle2,
  Settings,
  FileCode,
  Bug,
  TestTube,
  ArrowRight,
  Zap,
  Shield,
  Monitor,
} from 'lucide-react';
import { ConfigGenerator } from '../components/ConfigGenerator';
import { BSWConfigurator } from '../components/BSWConfigurator';
import { ReadmeGenerator } from '../components/ReadmeGenerator';

const categories = ['全部', '配置工具', '编译脚本', '调试工具', '测试验证'];

const tools = [
  {
    category: '配置工具',
    icon: Settings,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    items: [
      {
        name: 'YuleConfig',
        desc: '可视化 AutoSAR BSW 配置工具，支持 MCAL/ECUAL/Service 全栈配置，一键生成标准 ARXML 文件',
        version: 'v2.1.0',
        platform: 'Windows / Linux',
        free: true,
        status: '已发布',
        downloads: 1240,
      },
      {
        name: 'ARXML Generator',
        desc: '命令行 ARXML 代码生成器，支持模板自定义和批量生成，CI/CD 集成友好',
        version: 'v1.3.0',
        platform: '跨平台',
        free: true,
        status: '已发布',
        downloads: 856,
      },
      {
        name: 'ECU Extractor',
        desc: '从现有项目中提取 ECU 配置并生成可复用的配置模板',
        version: 'v1.0.0',
        platform: 'Windows',
        free: true,
        status: '已发布',
        downloads: 432,
      },
    ],
  },
  {
    category: '编译脚本',
    icon: FileCode,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    items: [
      {
        name: 'YuleBuild',
        desc: '基于 CMake 的跨平台编译系统，内置完整工具链配置，支持多核编译',
        version: 'v1.5.0',
        platform: '跨平台',
        free: true,
        status: '已发布',
        downloads: 2103,
      },
      {
        name: 'MemMap Generator',
        desc: 'AutoSAR MemMap.h 自动生成工具，根据链接器脚本生成标准内存分区头文件',
        version: 'v1.2.0',
        platform: '跨平台',
        free: true,
        status: '已发布',
        downloads: 678,
      },
      {
        name: 'Docker DevEnv',
        desc: '一键搭建开发环境的 Docker 镜像，包含交叉编译器、调试器和静态分析工具',
        version: 'v1.0.0',
        platform: 'Linux / macOS',
        free: true,
        status: '已发布',
        downloads: 920,
      },
    ],
  },
  {
    category: '调试工具',
    icon: Bug,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    items: [
      {
        name: 'YuleTrace',
        desc: '实时 Trace 日志分析工具，支持 Multi-Core 核间通信监控和时序分析',
        version: 'v1.1.0',
        platform: 'Windows / Linux',
        free: true,
        status: '已发布',
        downloads: 756,
      },
      {
        name: 'CanAnalyzer',
        desc: 'CAN/LIN 总线分析工具，支持 DBC 解析、信号监控和报文回放',
        version: 'v2.0.0',
        platform: 'Windows',
        free: true,
        status: '已发布',
        downloads: 1567,
      },
      {
        name: 'UDS Diagnostic',
        desc: 'UDS 诊断服务测试工具，支持 ISO 14229 标准服务测试和故障码读取',
        version: 'v1.0.0',
        platform: 'Windows',
        free: false,
        status: '已发布',
        downloads: 340,
      },
    ],
  },
  {
    category: '测试验证',
    icon: TestTube,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    items: [
      {
        name: 'YuleTest',
        desc: 'AutoSAR BSW 单元测试框架，基于 GoogleTest 定制，支持模块级覆盖率分析',
        version: 'v1.2.0',
        platform: '跨平台',
        free: true,
        status: '已发布',
        downloads: 890,
      },
      {
        name: 'SIL Simulator',
        desc: '软件在环仿真平台，模拟目标处理器外设行为，无需硬件即可验证驱动逻辑',
        version: 'v0.9.0',
        platform: 'Linux / Windows',
        free: true,
        status: 'Beta',
        downloads: 456,
      },
      {
        name: 'MISRA Checker',
        desc: '静态代码分析工具，内置 MISRA C:2012 规则集和 AutoSAR 编码规范检查',
        version: 'v1.0.0',
        platform: '跨平台',
        free: false,
        status: '已发布',
        downloads: 234,
      },
    ],
  },
];

const highlights = [
  {
    icon: Zap,
    title: '开箱即用',
    desc: '内置完整工具链配置，下载后 5 分钟即可开始开发',
  },
  {
    icon: Shield,
    title: '企业级安全',
    desc: '通过 MISRA C:2012 和 ISO 26262 工具认证支持，满足功能安全开发要求',
  },
  {
    icon: Monitor,
    title: '全平台支持',
    desc: 'Windows、Linux、macOS 全平台覆盖，支持 Docker 容器化部署',
  },
];

export function ToolchainPage() {
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredTools =
    activeCategory === '全部'
      ? tools
      : tools.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>开发工具链 - YuleTech | AutoSAR 配置与编译工具</title>
        <meta name="description" content="从可视化配置到编译构建，从调试诊断到测试验证，YuleTech 提供完整的 AutoSAR BSW 开发工具链。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <Wrench className="w-4 h-4" />
              开发工具链
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              一站式汽车软件
              <span className="text-gradient-accent"> 开发工具</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              从可视化配置到编译构建，从调试诊断到测试验证，
              YuleTech 提供完整的 AutoSAR BSW 开发工具链，
              帮助工程师高效完成从配置到产品的全流程开发。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-all">
                <Download className="w-4 h-4" />
                下载工具集
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all border border-border">
                <ExternalLink className="w-4 h-4" />
                查看文档
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
                  <h.icon className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{h.title}</h3>
                  <p className="text-sm text-muted-foreground">{h.desc}</p>
                </div>
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

      {/* Tools Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {filteredTools.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center border`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">{cat.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((tool) => (
                  <div
                    key={tool.name}
                    className="group bg-card border border-border rounded-xl p-6 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      {tool.status === '已发布' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> {tool.status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3" /> {tool.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
                      {tool.desc}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">版本</span>
                        <span className="font-mono font-medium">{tool.version}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">平台</span>
                        <span>{tool.platform}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">许可</span>
                        <span className={tool.free ? 'text-emerald-500' : 'text-[hsl(var(--accent))]'}>
                          {tool.free ? '永久免费' : '企业版'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-primary-foreground rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        下载
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors border border-border">
                        <ExternalLink className="w-3.5 h-3.5" />
                        文档
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Config Generator */}
      <ConfigGenerator />

      {/* BSW Configurator */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">BSW 可视化配置器</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              通过拖拽方式快速配置 AutoSAR BSW 模块，支持 MCAL、ECUAL、Service 和 RTE 层的参数配置，
              实时预览并导出标准配置文件。
            </p>
          </div>
          <BSWConfigurator />
        </div>
      </section>

      {/* README Generator */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">README 生成器</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              专为汽车软件开发优化的 README 模板生成器，支持 AutoSAR 模块、开源项目和企业级模板，
              快速生成专业的项目文档。
            </p>
          </div>
          <ReadmeGenerator />
        </div>
      </section>

      {/* Integration CTA */}
      <section className="py-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">工具链插件生态</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            欢迎第三方开发者和工具厂商为 YuleTech 工具链开发插件。
            安全加密工具、诊断插件、代码格式化工具等，都可以通过插件形式集成到我们的平台。
          </p>
          <button className="px-8 py-3 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
            开发插件
          </button>
        </div>
      </section>
    </div>
  );
}
