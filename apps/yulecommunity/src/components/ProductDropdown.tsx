import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Settings, Package, Code2, Building2, DollarSign } from 'lucide-react';

const productItems = [
  { label: 'ASR 配置器', to: '/yuleasr', icon: Settings, desc: '在线 AutoSAR 配置工具' },
  { label: 'BSW 模块仓库', to: '/autosar/registry', icon: Package, desc: '社区 BSW 模块模板' },
  { label: '在线编译', to: '/autosar/sandbox', icon: Code2, desc: '浏览器端 C 代码仿真' },
  { label: '企业版', to: '/enterprise', icon: Building2, desc: '私有部署 · 团队协作' },
  { label: '定价', to: '/pricing', icon: DollarSign, desc: '选择适合你的方案' },
];

export function ProductDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        产品 <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl p-2 z-50">
          {productItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
