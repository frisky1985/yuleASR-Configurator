// @vitest-environment jsdom
import { renderHook, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { useWorkbenchShortcuts } from '@/hooks/useWorkbenchShortcuts';

afterEach(() => {
  cleanup();
  delete (window as any).electronAPI;
});

function press(key: string, init: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }));
}

describe('useWorkbenchShortcuts', () => {
  it('非桌面环境不启用', () => {
    const onSave = vi.fn();
    renderHook(() => useWorkbenchShortcuts({ onSave, onSearch: vi.fn() }));
    press('s', { ctrlKey: true });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('桌面环境触发保存与搜索', () => {
    (window as any).electronAPI = { isElectron: true };
    const onSave = vi.fn();
    const onSearch = vi.fn();
    renderHook(() => useWorkbenchShortcuts({ onSave, onSearch }));

    press('s', { ctrlKey: true });
    press('f', { ctrlKey: true });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('焦点在输入框内不触发保存', () => {
    (window as any).electronAPI = { isElectron: true };
    const onSave = vi.fn();
    renderHook(() => useWorkbenchShortcuts({ onSave, onSearch: vi.fn() }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));

    expect(onSave).not.toHaveBeenCalled();
    input.remove();
  });
});
