import { ChevronRight, ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { ParameterEditor } from '@/components/ParameterEditor'
import { cn } from '@/lib/utils'
import type { ConfigContainer } from '@/types/config'

interface ContainerParameterListProps {
  container: ConfigContainer
  level?: number
  onParamChange: (name: string, value: unknown) => void
}

export function ContainerParameterList({
  container,
  level = 0,
  onParamChange,
}: ContainerParameterListProps) {
  const hasSubContainers = (container.subContainers?.length ?? 0) > 0
  const hasParams = container.parameters.length > 0

  if (!hasParams && !hasSubContainers) {
    return (
      <p className="text-xs text-app-text-app-text-tertiary italic px-2 py-1">
        No parameters in {container.displayName || container.name}
      </p>
    )
  }

  return (
    <div className={cn(level > 0 && 'ml-4 border-l-2 border-app-border-primary pl-3')}>
      {/* Direct parameters of this container */}
      {container.parameters.map((param) => (
        <div key={param.id} className="py-1.5">
          <ParameterEditor
            parameter={param}
            onChange={(value) => onParamChange(param.name, value)}
          />
        </div>
      ))}

      {/* Sub-containers - recursively render */}
      {container.subContainers?.map((sub) => (
        <SubContainerGroup
          key={sub.id}
          container={sub}
          level={level + 1}
          onParamChange={onParamChange}
        />
      ))}
    </div>
  )
}

interface SubContainerGroupProps {
  container: ConfigContainer
  level: number
  onParamChange: (name: string, value: unknown) => void
}

function SubContainerGroup({
  container,
  level,
  onParamChange,
}: SubContainerGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mt-2">
      {/* Clickable sub-container header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 w-full text-left py-1.5 px-2 rounded hover:bg-app-bg-secondary transition-colors text-xs font-medium text-app-text-primary"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-app-text-app-text-tertiary flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-app-text-app-text-tertiary flex-shrink-0" />
        )}
        <span>{container.displayName || container.name}</span>
        <span className="text-app-text-app-text-tertiary font-normal">
          ({container.parameters.length} params)
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-4 border-l-2 border-app-border-primary pl-3 mt-1">
          {container.parameters.length > 0 ? (
            container.parameters.map((param) => (
              <div key={param.id} className="py-1.5">
                <ParameterEditor
                  parameter={param}
                  onChange={(value) => onParamChange(param.name, value)}
                />
              </div>
            ))
          ) : (
            <p className="text-xs text-app-text-app-text-tertiary italic px-2 py-1">
              No parameters
            </p>
          )}

          {/* Nested sub-containers */}
          {container.subContainers?.map((sub) => (
            <SubContainerGroup
              key={sub.id}
              container={sub}
              level={level + 1}
              onParamChange={onParamChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
