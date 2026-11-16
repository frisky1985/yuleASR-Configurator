// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { InspectorPane } from '@/components/workbench/InspectorPane';

afterEach(cleanup);

describe('InspectorPane', () => {
  it('无问题时显示占位', () => {
    render(<InspectorPane issue={null} parameter={null} onApplyFix={vi.fn()} onLocate={vi.fn()} />);
    expect(screen.getByText('在左侧选择模块或参数')).toBeTruthy();
  });

  it('有 fix 时显示应用按钮并可点击', () => {
    const onApplyFix = vi.fn();
    render(
      <InspectorPane
        issue={{
          id: 'e1',
          path: 'Can.BaudRate',
          message: '超出最大值 1000000',
          severity: 'error',
          module: 'Can',
          parameter: 'BaudRate',
          suggestion: 'Set value to at most 1000000',
          fix: { kind: 'clamp-max', module: 'Can', parameter: 'BaudRate', value: 1000000 },
        }}
        parameter={{
          id: 'baud',
          name: 'BaudRate',
          type: 'integer',
          value: 5000000,
          min: 1000,
          max: 1000000,
          defaultValue: 500000,
        }}
        onApplyFix={onApplyFix}
        onLocate={vi.fn()}
      />
    );

    expect(screen.getByText('超出最大值 1000000')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '应用修复' }));
    expect(onApplyFix).toHaveBeenCalledTimes(1);
  });

  it('无 fix 时不显示应用按钮', () => {
    render(
      <InspectorPane
        issue={{
          id: 'e2',
          path: 'Com.ComIPdu',
          message: '缺少引用',
          severity: 'warning',
          module: 'Com',
        }}
        parameter={null}
        onApplyFix={vi.fn()}
        onLocate={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: '应用修复' })).toBeNull();
  });
});
