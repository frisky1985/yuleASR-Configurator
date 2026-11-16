// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { ProblemsPanel } from '@/components/workbench/ProblemsPanel';
import type { ValidationIssue } from '@/types';

afterEach(cleanup);

const issues: ValidationIssue[] = [
  { id: 'e1', path: 'Can.BaudRate', message: '超出范围', severity: 'error', module: 'Can' },
  { id: 'w1', path: 'Com.ComIPdu', message: '缺少引用', severity: 'warning', module: 'Com' },
];

describe('ProblemsPanel', () => {
  it('只显示未确认的问题', () => {
    render(
      <ProblemsPanel
        issues={issues}
        filter="all"
        acknowledgedIds={['w1']}
        selectedId={null}
        onSelect={vi.fn()}
        onAcknowledge={vi.fn()}
      />
    );
    expect(screen.getByText('超出范围')).toBeTruthy();
    expect(screen.queryByText('缺少引用')).toBeNull();
  });

  it('按严重级过滤', () => {
    render(
      <ProblemsPanel
        issues={issues}
        filter="warning"
        acknowledgedIds={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onAcknowledge={vi.fn()}
      />
    );
    expect(screen.queryByText('超出范围')).toBeNull();
    expect(screen.getByText('缺少引用')).toBeTruthy();
  });

  it('点击条目触发定位，点击确认触发确认', () => {
    const onSelect = vi.fn();
    const onAcknowledge = vi.fn();
    render(
      <ProblemsPanel
        issues={issues}
        filter="all"
        acknowledgedIds={[]}
        selectedId={null}
        onSelect={onSelect}
        onAcknowledge={onAcknowledge}
      />
    );
    fireEvent.click(screen.getByText('超出范围'));
    expect(onSelect).toHaveBeenCalledWith('e1');

    fireEvent.click(screen.getAllByLabelText('确认此问题')[0]);
    expect(onAcknowledge).toHaveBeenCalledWith('e1');
  });

  it('点击过滤标签触发 onFilterChange', () => {
    const onFilterChange = vi.fn();
    render(
      <ProblemsPanel
        issues={issues}
        filter="all"
        acknowledgedIds={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onAcknowledge={vi.fn()}
        onFilterChange={onFilterChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '错误' }));
    expect(onFilterChange).toHaveBeenCalledWith('error');
  });
});
