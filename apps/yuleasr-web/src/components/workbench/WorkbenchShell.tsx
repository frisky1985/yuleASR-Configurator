import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

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
const MIN_BOTTOM = 120;
const MAX_BOTTOM = 420;

type DragKind = 'tree' | 'inspector' | 'bottom';

interface LiveSize {
  kind: DragKind;
  value: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sizePatch(kind: DragKind, value: number) {
  if (kind === 'tree') return { treeWidth: value };
  if (kind === 'inspector') return { inspectorWidth: value };
  return { bottomHeight: value };
}

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
  const stopDragRef = useRef<(() => void) | null>(null);
  const [liveSize, setLiveSize] = useState<LiveSize | null>(null);

  useEffect(() => () => stopDragRef.current?.(), []);

  const startDrag = useCallback(
    (kind: DragKind) => (event: ReactPointerEvent) => {
      event.preventDefault();
      stopDragRef.current?.();
      setLiveSize(null);

      const startX = event.clientX;
      const startY = event.clientY;
      const startTree = workbench.treeWidth;
      const startInspector = workbench.inspectorWidth;
      const startBottom = workbench.bottomHeight;

      let latest =
        kind === 'tree' ? startTree : kind === 'inspector' ? startInspector : startBottom;

      function stop() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        if (stopDragRef.current === stop) {
          stopDragRef.current = null;
        }
      }

      function onMove(e: PointerEvent) {
        latest =
          kind === 'tree'
            ? clamp(startTree + e.clientX - startX, MIN_SIDE, MAX_SIDE)
            : kind === 'inspector'
              ? clamp(startInspector - (e.clientX - startX), MIN_SIDE, MAX_SIDE)
              : clamp(startBottom - (e.clientY - startY), MIN_BOTTOM, MAX_BOTTOM);
        setLiveSize({ kind, value: latest });
      }

      function onUp() {
        stop();
        setLiveSize(null);
        updateWorkbenchSettings(sizePatch(kind, latest));
      }

      function onCancel() {
        stop();
        setLiveSize(null);
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
      stopDragRef.current = stop;
    },
    [workbench, updateWorkbenchSettings]
  );

  const collapsed = workbench.bottomCollapsed;
  const treeWidth = liveSize?.kind === 'tree' ? liveSize.value : workbench.treeWidth;
  const inspectorWidth = liveSize?.kind === 'inspector' ? liveSize.value : workbench.inspectorWidth;
  const bottomHeight = liveSize?.kind === 'bottom' ? liveSize.value : workbench.bottomHeight;

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
          style={{ width: treeWidth }}
          className="min-h-0 shrink-0 overflow-hidden border-r border-app-border-primary"
        >
          {tree}
        </aside>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调整模块树宽度"
          onPointerDown={startDrag('tree')}
          className="w-1 shrink-0 cursor-col-resize touch-none select-none bg-transparent hover:bg-purple-500/40"
        />

        <main className="min-w-0 flex-1 overflow-hidden">{main}</main>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="调整检查器宽度"
          onPointerDown={startDrag('inspector')}
          className="w-1 shrink-0 cursor-col-resize touch-none select-none bg-transparent hover:bg-purple-500/40"
        />
        <aside
          style={{ width: inspectorWidth }}
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
            className="h-1 shrink-0 cursor-row-resize touch-none select-none bg-transparent hover:bg-purple-500/40"
          />
          <section
            style={{ height: bottomHeight }}
            className="shrink-0 overflow-hidden border-t border-app-border-primary bg-app-bg-primary"
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
