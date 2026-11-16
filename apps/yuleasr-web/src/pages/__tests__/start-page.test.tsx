// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('@/stores/configStore', () => ({
  useConfigStore: () => ({
    configList: [
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
    ],
    loadConfigList: vi.fn(),
  }),
}));

import { StartPage } from '@/pages/StartPage';

afterEach(cleanup);

describe('StartPage', () => {
  it('列出最近工程并提供新建/导入入口', () => {
    render(
      <MemoryRouter>
        <StartPage />
      </MemoryRouter>
    );
    expect(screen.getByText('ECU_A')).toBeTruthy();
    expect(screen.getByText('新建工程')).toBeTruthy();
    expect(screen.getByText('导入 ARXML')).toBeTruthy();
  });
});
