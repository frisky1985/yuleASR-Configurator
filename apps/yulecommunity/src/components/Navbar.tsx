import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Code2, Menu, X, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { useAdminAuth } from '../hooks/useAdminAuth';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const navLinks = [
    { label: '开源代码', to: '/opensource' },
    { label: '工具链', to: '/toolchain' },
    { label: 'ASR配置', to: '/yuleasr' },
    { label: '学习成长', to: '/learning' },
    { label: '技术博客', to: '/blog' },
    { label: '文档中心', to: '/docs' },
    { label: '论坛', to: '/forum' },
    { label: '问答', to: '/qa' },
    { label: '活动', to: '/events' },
    { label: '开发板', to: '/hardware' },
    { label: '下载中心', to: '/downloads' },
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
          <Link to="/" className="flex items-center gap-2 group">
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
