import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Code2,
  Layers,
  Cpu,
  Database,
  Radio,
  ChevronRight,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const layerFilters = ['全部', 'MCAL', 'ECUAL', 'Service', 'RTE'];

const docModules = [
  {
    layer: 'MCAL',
    icon: Cpu,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    badgeColor: 'bg-blue-500/10 text-blue-500',
    desc: '微控制器驱动层 API 文档',
    items: [
      { name: 'Mcu', version: 'v1.2.0', apis: 24, coverage: 100, status: '已完成', desc: '微控制器驱动 API，包含时钟、复位和功耗管理接口' },
      { name: 'Port', version: 'v1.1.0', apis: 18, coverage: 100, status: '已完成', desc: '端口驱动 API，引脚配置和方向控制' },
      { name: 'Dio', version: 'v1.1.0', apis: 12, coverage: 100, status: '已完成', desc: '数字 IO 驱动 API，读写引脚电平' },
      { name: 'Can', version: 'v1.3.0', apis: 32, coverage: 100, status: '已完成', desc: 'CAN 控制器驱动 API，支持 CAN FD 协议' },
      { name: 'Spi', version: 'v1.2.0', apis: 28, coverage: 100, status: '已完成', desc: 'SPI 串行外设接口驱动 API' },
      { name: 'Gpt', version: 'v1.1.0', apis: 16, coverage: 100, status: '已完成', desc: '通用定时器驱动 API' },
      { name: 'Pwm', version: 'v1.1.0', apis: 14, coverage: 100, status: '已完成', desc: '脉宽调制驱动 API' },
      { name: 'Adc', version: 'v1.2.0', apis: 22, coverage: 100, status: '已完成', desc: '模数转换驱动 API' },
      { name: 'Wdg', version: 'v1.0.0', apis: 10, coverage: 100, status: '已完成', desc: '看门狗驱动 API' },
    ],
  },
  {
    layer: 'ECUAL',
    icon: Layers,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    badgeColor: 'bg-cyan-500/10 text-cyan-500',
    desc: 'ECU 抽象层 API 文档',
    items: [
      { name: 'CanIf', version: 'v1.2.0', apis: 28, coverage: 100, status: '已完成', desc: 'CAN 接口层 API，统一管理 CAN 通信' },
      { name: 'IoHwAb', version: 'v1.1.0', apis: 20, coverage: 100, status: '已完成', desc: 'IO 硬件抽象层 API' },
      { name: 'CanTp', version: 'v1.1.0', apis: 18, coverage: 100, status: '已完成', desc: 'CAN 传输协议层 API (ISO 15765-2)' },
      { name: 'EthIf', version: 'v1.0.0', apis: 24, coverage: 100, status: '已完成', desc: '以太网接口层 API' },
      { name: 'MemIf', version: 'v1.1.0', apis: 14, coverage: 100, status: '已完成', desc: '存储器接口层 API' },
      { name: 'Fee', version: 'v1.1.0', apis: 16, coverage: 100, status: '已完成', desc: 'Flash EEPROM 仿真层 API' },
      { name: 'Ea', version: 'v1.0.0', apis: 14, coverage: 100, status: '已完成', desc: 'EEPROM 抽象层 API' },
      { name: 'FrIf', version: 'v1.0.0', apis: 22, coverage: 100, status: '已完成', desc: 'FlexRay 接口层 API' },
      { name: 'LinIf', version: 'v1.0.0', apis: 18, coverage: 100, status: '已完成', desc: 'LIN 接口层 API' },
    ],
  },
  {
    layer: 'Service',
    icon: Database,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    badgeColor: 'bg-teal-500/10 text-teal-500',
    desc: '服务层 API 文档',
    items: [
      { name: 'Com', version: 'v0.8.0', apis: 36, coverage: 80, status: '开发中', desc: '通信服务层 API，信号路由与打包' },
      { name: 'PduR', version: 'v0.7.0', apis: 24, coverage: 75, status: '开发中', desc: 'PDU 路由器 API，协议数据单元路由' },
      { name: 'NvM', version: '-', apis: 0, coverage: 0, status: '规划中', desc: '非易失性存储管理器 API' },
      { name: 'Dcm', version: '-', apis: 0, coverage: 0, status: '规划中', desc: '诊断通信管理器 API (UDS)' },
      { name: 'Dem', version: '-', apis: 0, coverage: 0, status: '规划中', desc: '诊断事件管理器 API' },
    ],
  },
  {
    layer: 'RTE',
    icon: Radio,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badgeColor: 'bg-emerald-500/10 text-emerald-500',
    desc: '运行时环境 API 文档',
    items: [
      { name: 'Rte', version: 'v0.5.0', apis: 20, coverage: 60, status: '头文件完成', desc: '运行时环境，组件间通信接口' },
    ],
  },
];

const quickLinks = [
  { title: '快速入门指南', desc: '5 分钟了解 YuleTech BSW 项目结构', icon: BookOpen, color: 'text-blue-500' },
  { title: 'API 参考手册', desc: '完整的 C 语言 API 接口说明', icon: Code2, color: 'text-cyan-500' },
  { title: '配置参数手册', desc: 'ARXML 配置参数详细说明', icon: FileText, color: 'text-teal-500' },
  { title: '错误码参考', desc: 'DET 错误码和运行时错误说明', icon: AlertCircle, color: 'text-amber-500' },
];

export function DocsPage() {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = docModules
    .filter((m) => activeFilter === '全部' || m.layer === activeFilter)
    .map((m) => ({
      ...m,
      items: m.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.includes(searchQuery)
      ),
    }))
    .filter((m) => m.items.length > 0);

  const totalApis = docModules.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.apis, 0), 0);
  const totalModules = docModules.reduce((sum, m) => sum + m.items.length, 0);
  const completedModules = docModules.reduce(
    (sum, m) => sum + m.items.filter((i) => i.status === '已完成').length,
    0
  );

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>文档中心 - YuleTech | AutoSAR 规范与API文档</title>
        <meta name="description" content="完整的 AutoSAR BSW 模块 API 文档、配置指南和开发手册。从 MCAL 驱动到 RTE 接口，帮助你快速上手项目开发。" />
      </Helmet>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              文档中心
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              YuleTech BSW
              <span className="text-gradient-accent"> 开发文档</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              完整的 AutoSAR BSW 模块 API 文档、配置指南和开发手册。
              从 MCAL 驱动到 RTE 接口，帮助你快速上手项目开发。
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索模块、API、配置参数..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/50 shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">{totalModules}</div>
              <div className="text-sm text-muted-foreground">文档模块</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">{totalApis}</div>
              <div className="text-sm text-muted-foreground">API 接口</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">{completedModules}</div>
              <div className="text-sm text-muted-foreground">已完成文档</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--accent))]">92%</div>
              <div className="text-sm text-muted-foreground">整体覆盖率</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      {!searchQuery && activeFilter === '全部' && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold mb-6">快速入口</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <div
                  key={link.title}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <link.icon className={`w-5 h-5 ${link.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-[hsl(var(--accent))] transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(var(--accent))] transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="py-8 sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {layerFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-[hsl(var(--primary))] text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Module Docs */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {filteredModules.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>没有找到相关文档</p>
            </div>
          )}
          {filteredModules.map((mod) => (
            <div key={mod.layer}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center border`}>
                  <mod.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{mod.layer}</h2>
                  <p className="text-sm text-muted-foreground">{mod.desc}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${mod.badgeColor}`}>
                  {mod.items.length} 模块
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mod.items.map((item) => (
                  <div
                    key={item.name}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-[hsl(var(--accent))]/30 transition-all hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-lg">{item.name}</span>
                        {item.status === '已完成' ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> {item.status}
                          </span>
                        ) : item.status === '开发中' || item.status === '头文件完成' ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {item.status}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[2.5rem]">{item.desc}</p>

                    {/* API & Coverage */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">API 数量</span>
                        <span className="font-mono font-medium">{item.apis}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">文档覆盖率</span>
                        <span className="font-medium">{item.coverage}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.coverage === 100
                              ? 'bg-emerald-500'
                              : item.coverage >= 60
                              ? 'bg-amber-500'
                              : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${item.coverage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{item.version}</span>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-[hsl(var(--primary))] hover:text-primary-foreground transition-colors border border-border">
                          <FileText className="w-3.5 h-3.5" />
                          API 文档
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-[hsl(var(--accent))]">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contribution CTA */}
      <section className="py-20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">完善文档，帮助更多开发者</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            YuleTech 的文档质量离不开社区贡献。无论是补充 API 说明、修正错误，还是翻译内容，
            每一份贡献都能让文档更加完善，帮助更多工程师快速上手。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              参与文档贡献
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              查看文档规范
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
