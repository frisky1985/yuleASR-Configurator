import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

const navLinks = [
  { label: '开发者中心', to: '/autosar' },
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

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Close on route change
  useEffect(() => { onClose(); }, [location.pathname]);

  const filtered = navLinks.filter(l =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold">导航</span>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" placeholder="搜索页面..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filtered.map(link => (
                <NavLink
                  key={link.to} to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <Link to="/profile" onClick={onClose}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                个人中心 →
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
