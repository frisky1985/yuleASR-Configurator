import { useEffect } from 'react';

interface Handlers {
  onSave: () => void;
  onSearch: () => void;
  onValidate?: () => void;
  onGenerate?: () => void;
}

export function useWorkbenchShortcuts({ onSave, onSearch, onValidate, onGenerate }: Handlers) {
  useEffect(() => {
    if (!window.electronAPI?.isElectron) return;

    const handler = (event: KeyboardEvent) => {
      if (
        event.isComposing ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;

      const key = event.key.toLowerCase();
      if (key === 's' && !event.shiftKey) {
        event.preventDefault();
        onSave();
      } else if (key === 'f' && !event.shiftKey) {
        event.preventDefault();
        onSearch();
      } else if (key === 'v' && event.shiftKey && onValidate) {
        event.preventDefault();
        onValidate();
      } else if (key === 'g' && event.shiftKey && onGenerate) {
        event.preventDefault();
        onGenerate();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, onSearch, onValidate, onGenerate]);
}
