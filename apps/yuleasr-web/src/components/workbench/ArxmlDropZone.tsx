import { Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface ArxmlDropZoneProps {
  onFile: (content: string, fileName: string) => void;
}

/** 桌面端 ARXML 单文件拖拽导入上限 */
const MAX_ARXML_BYTES = 20 * 1024 * 1024;

export function ArxmlDropZone({ onFile }: ArxmlDropZoneProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDesktop = !!window.electronAPI?.isElectron;

  const handleDrop = useCallback(
    async (event: DragEvent) => {
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
      onFile(await file.text(), file.name);
    },
    [onFile]
  );

  // 覆盖层本身 pointer-events-none（不遮挡工作台），拖拽事件在 window 上监听
  useEffect(() => {
    if (!isDesktop) return;

    const onDragOver = (event: DragEvent) => {
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
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[60] flex items-center justify-center border-2 border-dashed border-purple-500 transition-opacity',
        active ? 'bg-purple-500/10 opacity-100' : 'opacity-0'
      )}
      aria-hidden={!active}
    >
      <div className="rounded-lg bg-app-bg-primary px-6 py-4 text-center shadow-xl">
        <Upload className="mx-auto mb-2 h-6 w-6 text-purple-500" />
        <p className="text-sm font-medium">松开以导入 ARXML</p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
