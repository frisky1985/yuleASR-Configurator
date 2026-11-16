// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, it, expect, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
  configList: [] as Array<Record<string, unknown>>,
  loadConfigList: vi.fn(),
  isLoading: false,
}));

vi.mock('@/stores/configStore', () => ({
  useConfigStore: () => ({
    configList: mockState.configList,
    loadConfigList: mockState.loadConfigList,
    isLoading: mockState.isLoading,
  }),
}));

import { StartPage } from '@/pages/StartPage';

afterEach(cleanup);

function renderPage() {
  render(
    <MemoryRouter>
      <StartPage />
    </MemoryRouter>
  );
}

describe('StartPage', () => {
  it('列出最近工程并提供新建/导入入口', () => {
    mockState.configList = [
      {
        id: 'c1',
        name: 'ECU_A',
        description: '',
        moduleCount: 12,
        lastModified: '2026-11-01T00:00:00.000Z',
      },
      {
        id: 'c2',
        name: 'ECU_B',
        description: '',
        moduleCount: 8,
        lastModified: '2026-10-01T00:00:00.000Z',
      },
    ];
    renderPage();
    expect(screen.getByText('ECU_A')).toBeTruthy();
    expect(screen.getByText('新建工程')).toBeTruthy();
    expect(screen.getByText('导入 ARXML')).toBeTruthy();
  });

  it('服务端列表项缺少 moduleCount/lastModified 时不崩溃', () => {
    // 服务端 /v1/api/configs 只返回 id/name/description/updatedAt
    mockState.configList = [
      { id: 's1', name: 'Server_ECU', description: '', updatedAt: '2026-11-10T00:00:00.000Z' },
    ];
    renderPage();
    expect(screen.getByText('Server_ECU')).toBeTruthy();
    expect(screen.getByText(/0 模块/)).toBeTruthy();
    expect(screen.getByText(/—/)).toBeTruthy();
  });
});
