import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigationType } from 'react-router-dom';
import { Menu, Trophy } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from './ThemeToggle';
import { MoreDropdown } from './MoreDropdown';
import { ProductDropdown } from './ProductDropdown';
import { MobileDrawer } from './MobileDrawer';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change, but preserve scroll on browser back/forward
  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);

  const navLinks = [
    { label: '开发者中心', to: '/autosar' },
    { label: '开源代码', to: '/opensource' },
    { label: '学习成长', to: '/learning' },
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
              <span className="text-xs font-bold text-white tracking-tight">YL</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Yule<span className="text-gradient-accent">Tech</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <ProductDropdown />
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
            <NavLink
              to="/points"
              className={({ isActive }) =>
                `flex items-center gap-1 text-sm font-medium transition-colors ${
                  isActive ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'
                }`
              }
            >
              <Trophy className="w-4 h-4" />
              积分
            </NavLink>
            <MoreDropdown />
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            <GlobalSearch />
            <ThemeToggle />
            <Link
              to="/join"
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary-glow))] transition-colors whitespace-nowrap shrink-0"
            >
              免费加入
            </Link>
          </div>

          {/* Mobile: Search + Hamburger */}
          <div className="flex lg:hidden items-center gap-1">
            <GlobalSearch />
            <button
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="打开导航"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
    </nav>
  );
}
