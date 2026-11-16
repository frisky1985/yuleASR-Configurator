import { useEffect, useRef } from 'react';

/**
 * 草稿文件名：仅保留 [A-Za-z0-9_-]，其余字符替换为 _。
 * 与主进程 `isSafeDraftName`（只允许 [A-Za-z0-9._-] 且不含 ..）保持一致。
 */
export function draftFileName(configId: string | undefined): string | null {
  if (!configId) return null;
  const safe = configId.replace(/[^A-Za-z0-9_-]/g, '_');
  return `${safe || 'draft'}.json`;
}

/**
 * 编辑中静默保存草稿（仅桌面端），脏数据停止输入 2s 后写入 userData/drafts。
 * 保存成功后由调用方清理草稿，避免下次打开误报“有未保存草稿”。
 */
export function useDraftAutosave(configId: string | undefined, payload: unknown, dirty: boolean) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const api = window.electronAPI;
    const name = draftFileName(configId);
    if (!api?.isElectron || !name || !dirty || payload == null) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      void api.writeDraft(name, JSON.stringify(payload)).catch(() => {});
    }, 2000);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [configId, payload, dirty]);
}
