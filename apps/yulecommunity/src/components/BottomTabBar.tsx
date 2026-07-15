import { NavLink } from 'react-router-dom';
import { Home, Code2, GitFork, Users, User } from 'lucide-react';

const tabs = [
  { label: '首页', icon: Home, to: '/' },
  { label: '开发', icon: Code2, to: '/autosar' },
  { label: '开源', icon: GitFork, to: '/opensource' },
  { label: '社区', icon: Users, to: '/community' },
  { label: '我的', icon: User, to: '/profile' },
];

export function BottomTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Icon className={`w-5 h-5`} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
