import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star,
  GitFork,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Database,
  Radio,
  Code2,
  FileText,
  Zap,
  ChevronRight,
  Package,
  GitCommit,
} from 'lucide-react';
import { getModuleDetail } from '../data/modules';

const layerIcons: Record<string, React.ElementType> = {
  MCAL: Cpu,
  ECUAL: Layers,
  Service: Database,
  'RTE + ASW': Radio,
};

const layerColors: Record<string, string> = {
  MCAL: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  ECUAL: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  Service: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  'RTE + ASW': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
};

export function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const mod = getModuleDetail(moduleId || '');

  if (!mod) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-4">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">模块未找到</h1>
        <p className="text-muted-foreground mb-6">未找到名为 "{moduleId}" 的模块。</p>
        <button
          onClick={() => navigate('/opensource')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回开源代码
        </button>
      </div>
    );
  }

  const LayerIcon = layerIcons[mod.layer] || Cpu;
  const layerColor = layerColors[mod.layer] || layerColors.MCAL;

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>{mod.name} - {mod.layer} 模块详情 | YuleTech</title>
        <meta name="description" content={`${mod.shortDesc}。基于 AutoSAR Classic Platform 4.x 标准实现。`} />
      </Helmet>

      {/* Header */}
      <section className="border-b border-border bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/opensource')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回开源代码
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className={`w-14 h-14 rounded-xl ${layerColor} flex items-center justify-center border shrink-0`}>
              <LayerIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{mod.name}</h1>
                {mod.status === '已完成' ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已完成
                  </span>
                ) : mod.status === '开发中' ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> 开发中
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> 规划中
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{mod.shortDesc}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className="w-4 h-4" /> {mod.stars}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <GitFork className="w-4 h-4" /> {mod.forks}
                </span>
                {mod.version !== '-' && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{mod.version}</span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="w-4 h-4" /> {mod.layer}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <section>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[hsl(var(--accent))]" />
                模块概述
              </h2>
              <p className="text-muted-foreground leading-relaxed">{mod.overview}</p>
            </section>

            {/* Features */}
            {mod.features.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[hsl(var(--accent))]" />
                  功能特性
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mod.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-[hsl(var(--accent))] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* APIs */}
            {mod.apis.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[hsl(var(--accent))]" />
                  核心 API
                </h2>
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="text-left px-4 py-2.5 font-semibold">函数名</th>
                          <th className="text-left px-4 py-2.5 font-semibold">参数</th>
                          <th className="text-left px-4 py-2.5 font-semibold">返回值</th>
                          <th className="text-left px-4 py-2.5 font-semibold">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mod.apis.map((api, i) => (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium whitespace-nowrap">{api.name}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{api.params}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{api.returns}</td>
                            <td className="px-4 py-3 text-muted-foreground">{api.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Code Example */}
            {mod.codeExample && (
              <section>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[hsl(var(--accent))]" />
                  代码示例
                </h2>
                <div className="bg-muted/50 border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground uppercase">{mod.codeLanguage}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                    <code className="font-mono text-foreground">{mod.codeExample}</code>
                  </pre>
                </div>
              </section>
            )}

            {/* Changelog */}
            {mod.changelog.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-[hsl(var(--accent))]" />
                  更新日志
                </h2>
                <div className="space-y-4">
                  {mod.changelog.map((cl, i) => (
                    <div key={i} className="border-l-2 border-border pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold">{cl.version}</span>
                        <span className="text-xs text-muted-foreground">{cl.date}</span>
                      </div>
                      <ul className="space-y-1">
                        {cl.changes.map((c, j) => (
                          <li key={j} className="text-sm text-muted-foreground">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Configs */}
            {mod.configs.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[hsl(var(--accent))]" />
                  配置参数
                </h3>
                <div className="space-y-3">
                  {mod.configs.map((cfg, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-mono font-medium text-foreground">{cfg.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{cfg.desc}</div>
                      {cfg.default && (
                        <div className="text-xs text-[hsl(var(--accent))] mt-0.5">默认: {cfg.default}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {mod.dependencies.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[hsl(var(--accent))]" />
                  依赖模块
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mod.dependencies.map((dep) => (
                    <span key={dep} className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[hsl(var(--primary))] text-primary-foreground rounded-lg font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors text-sm">
                <GitFork className="w-4 h-4" />
                Fork 代码
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors border border-border text-sm">
                <Star className="w-4 h-4" />
                Star 收藏
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
