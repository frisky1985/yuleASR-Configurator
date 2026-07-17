import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultExpanded = true,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('border border-app-border-primary rounded-lg overflow-hidden', className)}>
      {/* Clickable Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors',
          isExpanded
            ? 'bg-app-bg-secondary border-b border-app-border-primary'
            : 'bg-app-bg-primary hover:bg-app-bg-secondary'
        )}
      >
        <span className="flex-shrink-0 text-app-text-tertiary">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <span className="flex-1 text-sm font-medium text-app-text-primary">{title}</span>
        {subtitle && <span className="text-xs text-app-text-secondary">{subtitle}</span>}
      </button>
      {isExpanded && <div className="p-3 space-y-3 bg-app-bg-primary">{children}</div>}
    </div>
  );
}
