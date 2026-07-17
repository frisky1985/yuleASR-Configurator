import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Cpu, Layers, Settings, Box, Code, Power, PowerOff } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@/lib/utils';
import type { ModuleLayer } from '@/types';

export interface ModuleNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  label?: string;
  layer: ModuleLayer;
  version: string;
  enabled: boolean;
  description?: string;
  parameterCount: number;
  dependencyCount: number;
  onClick?: (moduleId: string) => void;
}

const layerConfig: Record<
  ModuleLayer,
  {
    icon: typeof Cpu;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  MCAL: {
    icon: Cpu,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  ECUAL: {
    icon: Layers,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  Service: {
    icon: Settings,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  RTE: {
    icon: Code,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  ASW: {
    icon: Box,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  OS: {
    icon: Power,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
};

function ModuleNodeComponent(props: NodeProps<Node<ModuleNodeData>>) {
  const { data, selected } = props;
  const nodeData = data as unknown as ModuleNodeData;
  const config = layerConfig[nodeData.layer];
  const Icon = config.icon;
  const StatusIcon = nodeData.enabled ? Power : PowerOff;

  const handleClick = () => {
    nodeData.onClick?.(nodeData.id);
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 transition-all duration-200 cursor-pointer',
        'min-w-[200px] max-w-[280px]',
        config.bgColor,
        config.borderColor,
        selected && 'ring-2 ring-primary-500 ring-offset-2',
        !nodeData.enabled && 'opacity-60 grayscale',
        'hover:shadow-lg hover:scale-[1.02]'
      )}
      onClick={handleClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          '!w-3 !h-3 !border-2',
          config.borderColor.replace('border-', 'bg-').replace('-200', '-400')
        )}
      />

      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-b',
          'bg-app-bg-primary/80 backdrop-blur-sm rounded-t-xl',
          config.borderColor.replace('border-', 'border-')
        )}
      >
        <div
          className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}
        >
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-app-text-primary truncate">
            {nodeData.label || nodeData.name}
          </h3>
          <p className={cn('text-xs font-medium', config.color)}>{nodeData.layer}</p>
        </div>
        <StatusIcon
          className={cn(
            'w-4 h-4 flex-shrink-0',
            nodeData.enabled ? 'text-green-500' : 'text-app-text-tertiary'
          )}
        />
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        {nodeData.description && (
          <p className="text-xs text-app-text-secondary line-clamp-2">{nodeData.description}</p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-app-text-secondary">Version</span>
          <span className="font-medium text-app-text-primary">{nodeData.version}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-app-text-secondary">Parameters</span>
          <span
            className={cn(
              'font-medium px-2 py-0.5 rounded-full',
              nodeData.parameterCount > 0
                ? 'bg-primary-100 text-primary-700'
                : 'bg-app-bg-tertiary text-app-text-secondary'
            )}
          >
            {nodeData.parameterCount}
          </span>
        </div>

        {nodeData.dependencyCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-text-secondary">Dependencies</span>
            <span className="font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              {nodeData.dependencyCount}
            </span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          '!w-3 !h-3 !border-2',
          config.borderColor.replace('border-', 'bg-').replace('-200', '-400')
        )}
      />
    </div>
  );
}

export const ModuleNode = memo(ModuleNodeComponent);
ModuleNode.displayName = 'ModuleNode';
