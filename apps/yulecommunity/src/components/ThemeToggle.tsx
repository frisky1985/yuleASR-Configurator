import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '系统', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentIcon = themes.find(t => t.value === theme)?.icon || Sun;
  const Icon = currentIcon;

  // Simple toggle for quick switch (cycles through themes)
  const handleQuickToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const order: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = order.indexOf(theme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
    
    // Reset animation after transition
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quick Toggle Button */}
      <button
        onClick={handleQuickToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title={`当前主题: ${themes.find(t => t.value === theme)?.label} (右键选择)`}
        aria-label="切换主题"
      >
        <Icon 
          className={`w-5 h-5 transition-all duration-500 ease-out ${
            isAnimating ? 'rotate-180 scale-75' : 'rotate-0 scale-100'
          }`} 
        />
        {resolvedTheme === 'dark' && (
          <span className="sr-only">深色模式</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 py-2 w-40 bg-card border border-border rounded-xl shadow-elegant z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
            选择主题
          </div>
          {themes.map(({ value, label, icon: ThemeIcon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 flex items-center gap-3 text-sm transition-colors ${
                theme === value
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <ThemeIcon className="w-4 h-4" />
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Alternative: Simple toggle button (just light/dark)
export function ThemeToggleSimple() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={resolvedTheme === 'dark' ? '切换到浅色' : '切换到深色'}
      aria-label={resolvedTheme === 'dark' ? '切换到浅色' : '切换到深色'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
