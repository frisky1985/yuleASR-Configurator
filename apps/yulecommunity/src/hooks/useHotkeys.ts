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
