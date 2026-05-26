import { Star, GitFork, ExternalLink, Layers, Database, Radio, FileCode } from 'lucide-react';

const modules = [
  {
    category: 'MCAL 层',
    icon: CpuIcon,
    color: 'text-blue-500 bg-blue-500/10',
    items: ['Mcu', 'Port', 'Dio', 'Can', 'Spi', 'Gpt', 'Pwm', 'Adc', 'Wdg'],
    desc: '微控制器驱动层',
  },
  {
    category: 'ECUAL 层',
    icon: Layers,
    color: 'text-cyan-500 bg-cyan-500/10',
    items: ['CanIf', 'IoHwAb', 'CanTp', 'EthIf', 'MemIf', 'Fee', 'Ea', 'FrIf', 'LinIf'],
    desc: 'ECU 抽象层',
  },
  {
    category: 'Service 层',
    icon: Database,
    color: 'text-teal-500 bg-teal-500/10',
    items: ['Com', 'PduR', 'NvM', 'Dcm', 'Dem'],
    desc: '服务层',
  },
  {
    category: 'RTE + ASW',
    icon: Radio,
    color: 'text-emerald-500 bg-emerald-500/10',
    items: ['Rte', 'EngineControl', 'VehicleDynamics', 'DiagnosticManager', 'IOControl'],
    desc: '运行时环境 + 应用层',
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

export function OpenSource() {
  return (
    <section id="toolchain" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-4">
            开源项目
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            完整的 AutoSAR BSW
            <span className="text-gradient"> 开源实现</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            从底层驱动到应用组件，32 个模块全部开源，基于 AutoSAR Classic Platform 4.x 标准
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.category}
              className="bg-card border border-border rounded-2xl p-6 hover:border-[hsl(var(--accent))]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{mod.category}</h3>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" /> 128
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" /> 45
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {mod.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-mono font-medium text-muted-foreground hover:bg-[hsl(var(--accent))]/10 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">基于 AutoSAR 4.x</span>
                <button className="text-xs font-medium text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-glow))] transition-colors flex items-center gap-1">
                  查看源码 <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors">
            <FileCode className="w-4 h-4" />
            浏览全部开源代码
          </button>
        </div>
      </div>
    </section>
  );
}
