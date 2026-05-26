import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  HelpCircle,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

const navItems = [
  { label: '仪表盘', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: '用户管理', to: '/admin/users', icon: Users },
  { label: '内容管理', to: '/admin/content', icon: MessageSquare },
  { label: '问答管理', to: '/admin/content?tab=qa', icon: HelpCircle },
  { label: '活动管理', to: '/admin/content?tab=events', icon: Calendar },
  { label: '系统设置', to: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { isAdmin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  const isActive = (to: string) => {
    if (to.includes('?')) {
      return location.pathname === to.split('?')[0] && location.search === to.slice(to.indexOf('?'));
    }
    return location.pathname === to;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarExpanded ? 'w-60' : 'w-16'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {sidebarExpanded && (
            <span className="ml-3 font-bold text-sm tracking-tight whitespace-nowrap">
              管理后台
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center mx-2 rounded-lg transition-colors ${
                  sidebarExpanded ? 'px-3 py-2 gap-3' : 'px-2 py-2 justify-center'
                } ${
                  active
                    ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle / Logout */}
        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`hidden md:flex items-center mx-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
              sidebarExpanded ? 'gap-3' : 'justify-center px-2'
            }`}
            title={sidebarExpanded ? '收起侧边栏' : '展开侧边栏'}
          >
            {sidebarExpanded ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">收起</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={logout}
            className={`flex items-center mx-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${
              sidebarExpanded ? 'gap-3' : 'justify-center px-2'
            }`}
            title="退出登录"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-muted-foreground">
              YuleTech 社区管理后台
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <span className="text-sm font-medium hidden sm:inline">管理员</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              title="退出登录"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
