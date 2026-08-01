import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '../lib/cn';

export interface TreeNode<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  data?: T;
  children?: TreeNode<T>[];
  defaultExpanded?: boolean;
}

export interface TreeProps<T> {
  nodes: TreeNode<T>[];
  selectedId?: string;
  onSelect?: (node: TreeNode<T>) => void;
  defaultExpandAll?: boolean;
  className?: string;
}

/** 通用树组件: 递归渲染 + 展开/收起 + 选中态 */
export function Tree<T>({
  nodes,
  selectedId,
  onSelect,
  defaultExpandAll = false,
  className,
}: TreeProps<T>) {
  return (
    <div className={cn('space-y-0.5', className)} role="tree">
      {nodes.map(node => (
        <TreeBranch
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
          defaultExpandAll={defaultExpandAll}
        />
      ))}
    </div>
  );
}

interface TreeBranchProps<T> {
  node: TreeNode<T>;
  depth: number;
  selectedId?: string;
  onSelect?: (node: TreeNode<T>) => void;
  defaultExpandAll: boolean;
}

function TreeBranch<T>({ node, depth, selectedId, onSelect, defaultExpandAll }: TreeBranchProps<T>) {
  const [expanded, setExpanded] = React.useState(
    defaultExpandAll ? true : (node.defaultExpanded ?? false)
  );
  const hasChildren = !!node.children && node.children.length > 0;
  const selected = node.id === selectedId;

  return (
    <div role="treeitem" aria-selected={selected}>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm cursor-pointer select-none transition-colors',
          selected
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
            : 'text-app-text-primary hover:bg-app-bg-secondary'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          onSelect?.(node);
          if (hasChildren) setExpanded(!expanded);
        }}
      >
        <span className="flex-shrink-0 w-4 text-app-text-tertiary">
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : null}
        </span>
        {node.icon && <span className="flex-shrink-0">{node.icon}</span>}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultExpandAll={defaultExpandAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}
