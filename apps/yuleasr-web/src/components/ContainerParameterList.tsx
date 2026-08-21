import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useMemo, type ReactNode } from 'react';

import { ConditionEvaluator, parseCondition } from '@yuletech/core/conditions';
import type { ModuleConfig } from '@yuletech/core/types';

import { ParameterEditor } from '@/components/ParameterEditor';
import { cn } from '@/lib/utils';
import type { ConfigContainer } from '@/types/config';

interface ContainerParameterListProps {
  container: ConfigContainer;
  level?: number;
  onParamChange: (name: string, value: unknown) => void;
  /** Fix 17: 条件引擎求值用的 ModuleConfig[]（core 约定 module.param 寻址）。缺省时 condition 不生效（向后兼容） */
  moduleConfigs?: ModuleConfig[];
}

/** Fix 17: 用 core 条件引擎求值容器 condition，fails-closed（解析失败按隐藏处理）。 */
function useConditionVisible(
  condition: string | undefined,
  moduleConfigs: ModuleConfig[] | undefined
): boolean {
  const evaluator = useMemo(() => new ConditionEvaluator(), []);
  return useMemo(() => {
    if (!condition) return true;
    try {
      const ast = parseCondition(condition);
      return evaluator.evaluate(ast, moduleConfigs ?? []);
    } catch (err) {
      console.warn(`[ContainerParameterList] 条件表达式解析失败，按不可见处理: ${condition}`, err);
      return false;
    }
  }, [condition, moduleConfigs, evaluator]);
}

export function ContainerParameterList({
  container,
  level = 0,
  onParamChange,
  moduleConfigs,
}: ContainerParameterListProps) {
  const visible = useConditionVisible(container.condition, moduleConfigs);
  const hasSubContainers = (container.subContainers?.length ?? 0) > 0;
  const hasParams = container.parameters.length > 0;

  if (!visible) {
    // 容器整体隐藏（含直接参数与子容器）
    return null;
  }

  if (!hasParams && !hasSubContainers) {
    return (
      <p className="text-xs text-app-text-tertiary italic px-2 py-1">
        No parameters in {container.displayName || container.name}
      </p>
    );
  }

  return (
    <div className={cn(level > 0 && 'ml-4 border-l-2 border-app-border-primary pl-3')}>
      {/* Direct parameters of this container */}
      {container.parameters.map(param => (
        <div key={param.id} className="py-1.5">
          <ParameterEditor
            parameter={param}
            onChange={value => onParamChange(param.name, value)}
            moduleConfigs={moduleConfigs}
          />
        </div>
      ))}

      {/* Sub-containers - recursively render */}
      {container.subContainers?.map(sub => (
        <SubContainerGroup
          key={sub.id}
          container={sub}
          level={level + 1}
          onParamChange={onParamChange}
          moduleConfigs={moduleConfigs}
        />
      ))}
    </div>
  );
}

interface SubContainerGroupProps {
  container: ConfigContainer;
  level: number;
  onParamChange: (name: string, value: unknown) => void;
  moduleConfigs?: ModuleConfig[];
}

function SubContainerGroup({
  container,
  level,
  onParamChange,
  moduleConfigs,
}: SubContainerGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const visible = useConditionVisible(container.condition, moduleConfigs);

  if (!visible) {
    // 子容器整体隐藏（含头部与内容）
    return null;
  }

  return (
    <div className="mt-2">
      {/* Clickable sub-container header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 w-full text-left py-1.5 px-2 rounded hover:bg-app-bg-secondary transition-colors text-xs font-medium text-app-text-primary"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-app-text-tertiary flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-app-text-tertiary flex-shrink-0" />
        )}
        <span>{container.displayName || container.name}</span>
        <span className="text-app-text-tertiary font-normal">
          ({container.parameters.length} params)
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-4 border-l-2 border-app-border-primary pl-3 mt-1">
          {container.parameters.length > 0 ? (
            container.parameters.map(param => (
              <div key={param.id} className="py-1.5">
                <ParameterEditor
                  parameter={param}
                  onChange={value => onParamChange(param.name, value)}
                  moduleConfigs={moduleConfigs}
                />
              </div>
            ))
          ) : (
            <p className="text-xs text-app-text-tertiary italic px-2 py-1">No parameters</p>
          )}

          {/* Nested sub-containers */}
          {container.subContainers?.map(sub => (
            <SubContainerGroup
              key={sub.id}
              container={sub}
              level={level + 1}
              onParamChange={onParamChange}
              moduleConfigs={moduleConfigs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
