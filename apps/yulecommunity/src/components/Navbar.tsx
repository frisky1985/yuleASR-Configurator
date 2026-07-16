import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Code2, Menu, X, Shield, ChevronDown, LayoutDashboard, FileEdit, FileJson, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { useAdminAuth } from '../hooks/useAdminAuth';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const configuratorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAdmin } = useAdminAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 路由变化时滚动到顶部 (移除 setState)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 路由变化时关闭移动菜单 (使用 ref 追踪)
  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      setIsMobileMenuOpen(false);
      prevPathname.current = location.pathname;
    }
  }, [location.pathname]);

  // 点击外部关闭配置器下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (configuratorRef.current && !configuratorRef.current.contains(e.target as Node)) {
        setConfiguratorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: '开源代码', to: '/opensource' },
    { label: '工具链', to: '/toolchain' },
    { label: '学习成长', to: '/learning' },
    { label: '技术博客', to: '/blog' },
    { label: '文档中心', to: '/docs' },
    { label: '论坛', to: '/forum' },
    { label: '问答', to: '/qa' },
    { label: '活动', to: '/events' },
    { label: '开发板', to: '/hardware' },
    { label: '模板市场', to: '/templates-market' },
    { label: '下载中心', to: '/downloads' },
  ];

  const configuratorLinks = [
    { label: '仪表盘', href: '/configurator/', icon: LayoutDashboard, desc: '配置列表和快速操作' },
    { label: '编辑器', href: '/configurator/dashboard', icon: FileEdit, desc: '打开配置编辑器' },
    { label: '模板', href: '/configurator/templates', icon: FileJson, desc: '配置模板管理' },
    { label: 'ASR配置', href: '/community/#/yuleasr', icon: Settings, desc: '关于 yuleASR 配置器' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-elegant border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group mr-10 lg:mr-16 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Yule<span className="text-gradient-accent">Tech</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors relative group whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-[hsl(var(--accent))] transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Configurator Dropdown */}
            <div className="relative" ref={configuratorRef}>
              <button
                onClick={() => setConfiguratorOpen(!configuratorOpen)}
                className="flex items-center gap-1 text-sm font-medium transition-colors relative group whitespace-nowrap shrink-0 text-muted-foreground hover:text-foreground"
              >
                配置器
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${configuratorOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[hsl(var(--accent))] transition-all duration-300 ${configuratorOpen ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </button>

              {configuratorOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Configurator app links */}
                  {configuratorLinks.slice(0, 3).map((link) => {
                    const Icon = link.icon
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setConfiguratorOpen(false)}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group/link"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover/link:text-primary transition-colors">
                            {link.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {link.desc}
                          </div>
                        </div>
                      </a>
                    )
                  })}

                  {/* Divider */}
                  <div className="mx-2 my-1.5 h-px bg-border" />

                  {/* ASR配置 link */}
                  {(() => {
                    const link = configuratorLinks[3]
                    const Icon = link.icon
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setConfiguratorOpen(false)}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group/link"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover/link:text-primary transition-colors">
                            {link.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {link.desc}
                          </div>
                        </div>
                      </a>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <GlobalSearch />
            <NotificationCenter />
            <ThemeToggle />
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="p-2 text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors rounded-lg hover:bg-muted"
                title="管理后台"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/profile"
              className={`text-sm font-medium transition-colors px-3 py-2 whitespace-nowrap shrink-0 ${
                location.pathname === '/profile'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              个人中心
            </Link>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 whitespace-nowrap shrink-0">
              登录
            </button>
            <button className="text-sm font-medium bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors px-4 py-2 rounded-lg whitespace-nowrap shrink-0">
              免费加入
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            <GlobalSearch />
            <NotificationCenter />
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="p-2 text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors"
                title="管理后台"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <Link
              to="/"
              className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              首页
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Configurator section */}
            <div className="px-4 pt-3 pb-1">
              <div className="w-full h-px bg-border mb-3" />
              <button
                onClick={() => setMobileConfigOpen(!mobileConfigOpen)}
                className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                配置器
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileConfigOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                mobileConfigOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {/* Configurator app links */}
              {configuratorLinks.slice(0, 3).map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => { setConfiguratorOpen(false); setIsMobileMenuOpen(false) }}
                    className="flex items-center gap-3 px-8 py-2.5 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {link.label}
                  </a>
                )
              })}

              {/* Divider */}
              <div className="mx-8 my-1.5 h-px bg-border" />

              {/* ASR配置 link */}
              {(() => {
                const link = configuratorLinks[3]
                const Icon = link.icon
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => { setConfiguratorOpen(false); setIsMobileMenuOpen(false) }}
                    className="flex items-center gap-3 px-8 py-2.5 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {link.label}
                  </a>
                )
              })()}
            </div>
            <div className="pt-2 flex flex-col gap-2 px-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">主题</span>
                <ThemeToggle />
              </div>
              <Link
                to="/profile"
                className={`text-sm font-medium py-2 transition-colors ${
                  location.pathname === '/profile'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                个人中心
              </Link>

              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 text-left">
                登录
              </button>
              <button className="text-sm font-medium bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors px-4 py-2 rounded-lg">
                免费加入
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
