import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface DevHubLayoutProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  children: ReactNode;
  headerExtra?: ReactNode;
}

export function DevHubLayout({ title, subtitle, backTo, children, headerExtra }: DevHubLayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="border-b border-border bg-muted/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backTo && (
              <button onClick={() => navigate(backTo)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">AutoSAR 开发者中心</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{title}</span>
              </div>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerExtra && <div className="flex items-center gap-2">{headerExtra}</div>}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
