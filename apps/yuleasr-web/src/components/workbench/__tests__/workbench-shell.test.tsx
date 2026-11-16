// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';

import { WorkbenchShell } from '@/components/workbench/WorkbenchShell';
import { useSettingsStore } from '@/stores/settingsStore';

afterEach(cleanup);

beforeEach(() => {
  useSettingsStore.getState().resetAllSettings();
});

function renderShell(segments?: ReactNode) {
  return render(
    <WorkbenchShell
      topBar={<div>TOPBAR</div>}
      segments={segments}
      breadcrumb={<span>BREADCRUMB</span>}
      toolbar={<button>校验</button>}
      tree={<div>TREE</div>}
      main={<div>MAIN</div>}
      inspector={<div>INSPECTOR</div>}
      problems={<div>PROBLEMS</div>}
      statusBar={<div>STATUS</div>}
    />
  );
}

describe('WorkbenchShell', () => {
  it('渲染六个区域', () => {
    renderShell();
    ['TOPBAR', 'BREADCRUMB', 'TREE', 'MAIN', 'INSPECTOR', 'PROBLEMS', 'STATUS'].forEach(text =>
      expect(screen.getByText(text)).toBeTruthy()
    );
  });

  it('点击折叠按钮隐藏问题面板', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: '折叠问题面板' }));
    expect(screen.queryByText('PROBLEMS')).toBeNull();
  });

  it('折叠后再次点击可展开问题面板', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: '折叠问题面板' }));
    expect(screen.queryByText('PROBLEMS')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '展开问题面板' }));
    expect(screen.getByText('PROBLEMS')).toBeTruthy();
  });

  it('渲染 segments 插槽内容', () => {
    renderShell(<span>SEGMENTS</span>);
    expect(screen.getByText('SEGMENTS')).toBeTruthy();
  });
});
