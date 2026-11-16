// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';

import { WorkbenchShell } from '@/components/workbench/WorkbenchShell';

afterEach(cleanup);

function renderShell() {
  return render(
    <WorkbenchShell
      topBar={<div>TOPBAR</div>}
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
});
