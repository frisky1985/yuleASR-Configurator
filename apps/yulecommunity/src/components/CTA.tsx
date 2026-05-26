import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] opacity-90" />
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] opacity-10 mix-blend-overlay" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          立即加入，开启汽车软件之旅
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          成为 YuleTech 社区的
          <br />
          首批贡献者
        </h2>

        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
          免费获取 AutoSAR BSW 开源代码、开发工具链和学习资源，
          与行业专家和企业客户建立连接
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="group flex items-center gap-2 px-8 py-4 bg-white text-[hsl(var(--primary))] rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
            免费注册
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
            了解会员权益
          </button>
        </div>

        <p className="text-white/60 text-sm mt-6">
          已有 2,800+ 工程师加入 · 永久免费基础版
        </p>
      </div>
    </section>
  );
}
