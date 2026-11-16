import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

interface WorkbenchShellProps {
  topBar?: ReactNode;
  segments?: ReactNode;
  breadcrumb: ReactNode;
  toolbar: ReactNode;
  tree: ReactNode;
  main: ReactNode;
  inspector: ReactNode;
  problems: ReactNode;
  statusBar: ReactNode;
}

const MIN_SIDE = 200;
const MAX_SIDE = 560;

export function WorkbenchShell({
  topBar,
  segments,
  breadcrumb,
  toolbar,
  tree,
  main,
  inspector,
  problems,
  statusBar,
}: WorkbenchShellProps) {
  const { workbench, updateWorkbenchSettings } = useSettingsStore();
  const dragging = useRef<'tree' | 'inspector' | 'bottom' | null>(null);

  const startDrag = useCallback(
    (kind: 'tree' | 'inspector' | 'bottom') => (event: ReactPointerEvent) => {
      event.preventDefault();
      dragging.current = kind;
      const startX = event.clientX;
      const startY = event.clientY;
      const startTree = workbench.treeWidth;
      const startInspector = workbench.inspectorWidth;
      const startBottom = workbench.bottomHeight;

      const onMove = (e: PointerEvent) => {
        if (dragging.current === 'tree') {
          const next = Math.min(MAX_SIDE, Math.max(MIN_SIDE, startTree + e.clientX - startX));
          updateWorkbenchSettings({ treeWidth: next });
        } else if (dragging.current === 'inspector') {
          const next = Math.min(
            MAX_SIDE,
            Math.max(MIN_SIDE, startInspector - (e.clientX - startX))
          );
          updateWorkbenchSettings({ inspectorWidth: next });
        } else if (dragging.current === 'bottom') {
          const next = Math.min(420, Math.max(120, startBottom - (e.clientY - startY)));
          updateWorkbenchSettings({ bottomHeight: next });
        }
      };

      const onUp = () => {
        dragging.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [workbench, updateWorkbenchSettings]
  );

  const collapsed = workbench.bottomCollapsed;

  return (
    <div className="flex h-full min-h-0 flex-col bg-app-bg-primary text-app-text-primary">
      {topBar && <div className="shrink-0">{topBar}</div>}

      <div className="flex shrink-0 items-center gap-3 border-y border-app-border-primary bg-app-bg-secondary px-3 py-1.5">
        {segments}
        <div className="ml-auto min-w-0 truncate text-xs text-app-text-secondary">{breadcrumb}</div>
        <div className="flex items-center gap-1">{toolbar}</div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside
          style={{ width: workbench.treeWidth }}
          className="min-h-0 shrink-0 overflow-hidden border-r border-app-border-primary"
        >
          {tree}
        </aside>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调整模块树宽度"
          onPointerDown={startDrag('tree')}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-purple-500/40"
        />

        <main className="min-w-0 flex-1 overflow-hidden">{main}</main>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调整检查器宽度"
          onPointerDown={startDrag('inspector')}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-purple-500/40"
        />
        <aside
          style={{ width: workbench.inspectorWidth }}
          className="min-h-0 shrink-0 overflow-hidden border-l border-app-border-primary"
        >
          {inspector}
        </aside>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-app-border-primary bg-app-bg-secondary px-3 py-1">
        <span className="text-[11px] font-medium text-app-text-secondary">问题</span>
        <button
          type="button"
          aria-label={collapsed ? '展开问题面板' : '折叠问题面板'}
          onClick={() => updateWorkbenchSettings({ bottomCollapsed: !collapsed })}
          className="rounded p-0.5 text-app-text-secondary hover:bg-app-bg-tertiary"
        >
          {collapsed ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="调整问题面板高度"
            onPointerDown={startDrag('bottom')}
            className="h-1 shrink-0 cursor-row-resize bg-transparent hover:bg-purple-500/40"
          />
          <section
            style={{ height: workbench.bottomHeight }}
            className={cn(
              'shrink-0 overflow-hidden border-t border-app-border-primary bg-app-bg-primary'
            )}
          >
            {problems}
          </section>
        </>
      )}

      <div className="shrink-0 border-t border-app-border-primary bg-app-bg-secondary">
        {statusBar}
      </div>
    </div>
  );
}
