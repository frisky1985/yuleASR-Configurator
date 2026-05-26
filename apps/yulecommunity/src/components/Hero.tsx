import { ArrowRight, GitBranch, Users, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="./images/hero-bg.png"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
          <span className="text-sm font-medium text-[hsl(var(--primary))]">
            国内领先的汽车基础软件开源社区
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="block">做工程师的</span>
          <span className="block text-gradient-accent mt-2">合作伙伴</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          YuleTech 开源社区致力于构建汽车基础软件生态，
          为工程师提供 AutoSAR BSW 开源代码、开发工具链和学习成长平台，
          与企业客户共同创造价值。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="group flex items-center gap-2 px-8 py-4 bg-[hsl(var(--primary))] text-primary-foreground rounded-xl font-semibold hover:bg-[hsl(var(--primary-glow))] transition-all shadow-elegant hover:shadow-glow">
            开始探索
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all border border-border">
            <GitBranch className="w-5 h-5" />
            代码仓库
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[hsl(var(--accent))] mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-3xl font-bold">32</span>
            </div>
            <span className="text-sm text-muted-foreground">开源模块</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[hsl(var(--accent))] mb-2">
              <Users className="w-5 h-5" />
              <span className="text-3xl font-bold">2,800+</span>
            </div>
            <span className="text-sm text-muted-foreground">社区工程师</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[hsl(var(--accent))] mb-2">
              <GitBranch className="w-5 h-5" />
              <span className="text-3xl font-bold">15K+</span>
            </div>
            <span className="text-sm text-muted-foreground">代码提交</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
