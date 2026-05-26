import { Code2, GitBranch, MessageCircle, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  平台: [
    { label: '开源代码', href: '/opensource' },
    { label: '工具链', href: '/toolchain' },
    { label: '开发板', href: '#' },
    { label: '插件市场', href: '#' },
  ],
  学习: [
    { label: 'AutoSAR 教程', href: '/learning' },
    { label: '视频课程', href: '/learning' },
    { label: '技术博客', href: '/blog' },
    { label: '文档中心', href: '/docs' },
  ],
  合作: [
    { label: '芯片厂商合作', href: '#' },
    { label: '工具开发商', href: '#' },
    { label: '企业客户', href: '#' },
    { label: '渠道代理', href: '#' },
  ],
  关于: [
    { label: '关于我们', href: '#' },
    { label: '加入团队', href: '#' },
    { label: '联系我们', href: '#' },
    { label: '隐私政策', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                Yule<span className="text-[hsl(var(--accent))]">Tech</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              国内领先的汽车基础软件开源社区，为工程师提供 AutoSAR BSW 开源代码和开发工具链。
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <GitBranch className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            上海予乐电子科技有限公司
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 YuleTech. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
}
