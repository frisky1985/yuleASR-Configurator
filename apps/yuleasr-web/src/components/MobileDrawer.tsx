/**
 * Mobile Drawer Component
 * Slide-out drawer for mobile navigation
 */

import { X } from 'lucide-react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'left',
}: MobileDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity sm:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 bottom-0 w-[85vw] max-w-[320px] bg-card z-50 sm:hidden transition-transform duration-300 ease-out',
          position === 'left' ? 'left-0' : 'right-0',
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-60px)]">{children}</div>
      </div>
    </>
  );
}
