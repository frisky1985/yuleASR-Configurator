import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  defaultExpanded?: boolean
  children: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultExpanded = true,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={cn('border border-primary rounded-lg overflow-hidden', className)}>
      {/* Clickable Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors',
          isExpanded
            ? 'bg-secondary border-b border-primary'
            : 'bg-primary hover:bg-secondary'
        )}
      >
        <span className="flex-shrink-0 text-tertiary">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-900">{title}</span>
        {subtitle && (
          <span className="text-xs text-secondary">{subtitle}</span>
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-primary">
          {children}
        </div>
      )}
    </div>
  )
}
