import { ParameterEditor } from '@/components/ParameterEditor'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { cn } from '@/lib/utils'
import type { ConfigContainer } from '@/types/config'

interface ContainerConfigSectionProps {
  container: ConfigContainer
  level: number
  defaultExpanded?: boolean
  onParamChange: (name: string, value: unknown) => void
}

export function ContainerConfigSection({
  container,
  level,
  defaultExpanded = true,
  onParamChange,
}: ContainerConfigSectionProps) {
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 8)} border-l-2 border-gray-100 pl-3` : ''

  return (
    <div className={cn('space-y-3', indentClass)}>
      {/* Direct parameters */}
      {container.parameters.map((param) => (
        <ParameterEditor
          key={param.id}
          parameter={param}
          onChange={(value) => onParamChange(param.name, value)}
        />
      ))}

      {/* Sub-containers */}
      {container.subContainers?.map((sub) => (
        <CollapsibleSection
          key={sub.id}
          title={sub.displayName || sub.name}
          subtitle={`${sub.parameters.length} parameters`}
          defaultExpanded={defaultExpanded}
        >
          <ContainerConfigSection
            container={sub}
            level={level + 1}
            defaultExpanded={defaultExpanded}
            onParamChange={onParamChange}
          />
        </CollapsibleSection>
      ))}
    </div>
  )
}
