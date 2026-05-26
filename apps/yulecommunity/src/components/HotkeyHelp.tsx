import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

let isListening = false;

export function useHotkeys() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      if (e.key !== 'Escape') return;
    }

    if (e.key.toLowerCase() === 'g') {
      const handleGKey = (ev: KeyboardEvent) => {
        if (ev.target instanceof HTMLInputElement) return;
        
        const key = ev.key.toLowerCase();
        const goKeys: Record<string, string> = {
          'o': '/opensource',
          't': '/toolchain',
          'l': '/learning',
          'b': '/blog',
          'd': '/docs',
          'h': '/hardware',
        };

        if (goKeys[key]) {
          ev.preventDefault();
          navigate(goKeys[key]);
          document.removeEventListener('keydown', handleGKey);
        } else if (ev.key !== 'Shift') {
          document.removeEventListener('keydown', handleGKey);
        }
      };

      document.addEventListener('keydown', handleGKey, { once: true });
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('open-search'));
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      setShowHelp(true);
      return;
    }

    if (e.key === 'Escape') {
      document.dispatchEvent(new CustomEvent('close-modal'));
      setShowHelp(false);
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!isListening) {
      document.addEventListener('keydown', handleKeyDown);
      isListening = true;
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      isListening = false;
    };
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

interface HotkeyHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotkeyHelp({ isOpen, onClose }: HotkeyHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Cmd', 'K'], desc: 'Global Search' },
    { keys: ['G', 'O'], desc: 'Open Source' },
    { keys: ['G', 'T'], desc: 'Toolchain' },
    { keys: ['G', 'L'], desc: 'Learning' },
    { keys: ['G', 'B'], desc: 'Blog' },
    { keys: ['G', 'D'], desc: 'Docs' },
    { keys: ['G', 'H'], desc: 'Hardware' },
    { keys: ['?'], desc: 'Show Help' },
    { keys: ['Esc'], desc: 'Close Modal' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border border-border shadow-2xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            x
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map(({ keys, desc }) => (
            <div
              key={desc}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <span className="text-muted-foreground">{desc}</span>
              <div className="flex items-center gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 bg-muted rounded">?</kbd> to show help
        </p>
      </div>
    </div>
  );
}
