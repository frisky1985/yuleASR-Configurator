import { Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ArxmlDropZoneProps {
  onFile: (content: string, fileName: string) => void;
}

/** 桌面端 ARXML 单文件拖拽导入上限 */
const MAX_ARXML_BYTES = 20 * 1024 * 1024;
/** 错误提示展示时长 */
const ERROR_TOAST_MS = 4000;

/** 仅处理文件拖拽，忽略文本/链接等其它 drag 载荷 */
function hasFilePayload(event: DragEvent): boolean {
  return !!event.dataTransfer?.types?.includes('Files');
}

export function ArxmlDropZone({ onFile }: ArxmlDropZoneProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDesktop = !!window.electronAPI?.isElectron;

  const handleDrop = useCallback(
    async (event: DragEvent) => {
      if (!hasFilePayload(event)) return;
      event.preventDefault();
      setActive(false);
      setError(null);

      const file = event.dataTransfer?.files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.arxml')) {
        setError('仅支持 .arxml 文件');
        return;
      }
      if (file.size > MAX_ARXML_BYTES) {
        setError('文件超过 20MB');
        return;
      }
      try {
        onFile(await file.text(), file.name);
      } catch {
        setError('读取文件失败');
      }
    },
    [onFile]
  );

  // 错误提示 4s 后自动消失
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), ERROR_TOAST_MS);
    return () => clearTimeout(timer);
  }, [error]);

  // 覆盖层本身 pointer-events-none（不遮挡工作台），拖拽事件在 window 上监听
  useEffect(() => {
    if (!isDesktop) return;

    const onDragOver = (event: DragEvent) => {
      if (!hasFilePayload(event)) return;
      event.preventDefault();
      setActive(true);
    };
    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) setActive(false);
    };
    const onDrop = (event: DragEvent) => {
      void handleDrop(event);
    };

    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [isDesktop, handleDrop]);

  if (!isDesktop) return null;

  return (
    <>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center border-2 border-dashed border-purple-500 bg-purple-500/10">
          <div className="rounded-lg bg-app-bg-primary px-6 py-4 text-center shadow-xl">
            <Upload className="mx-auto mb-2 h-6 w-6 text-purple-500" />
            <p className="text-sm font-medium">松开以导入 ARXML</p>
          </div>
        </div>
      )}
      {error && (
        <div
          className="fixed bottom-6 left-1/2 z-[61] -translate-x-1/2 rounded-md bg-red-600 px-3 py-2 text-xs text-white shadow-lg"
          role="alert"
        >
          {error}
        </div>
      )}
    </>
  );
}
