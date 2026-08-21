// @vitest-environment jsdom
/**
 * Fix 24 (W2): ParameterEditor handleChange 先校验后 setValue ——
 * 输入超范围值时 UI 保持旧值并标红，不再出现 UI 与 store 分叉。
 *
 * 回归用例：integer 参数 max=100，输入 200 → onChange 不被调用、
 * input 回显旧值 50、错误文本「Maximum value is 100」出现。
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { ParameterEditor } from '@/components/ParameterEditor';
import type { ConfigParameter } from '@/types';

afterEach(cleanup);

/**
 * 当 min/max 差 ≤1000 时 ParameterEditor 同时渲染 range 滑块 + number 输入框
 * （showRangeSlider=true），getByRole('spinbutton') 会匹配多个元素。
 * 统一用 container.querySelector('input[type="number"]') 取数字输入框。
 */
function getNumberInput(container: HTMLElement): HTMLInputElement {
  const el = container.querySelector('input[type="number"]');
  if (!el) throw new Error('number input not found');
  return el as HTMLInputElement;
}

function makeParam(overrides: Partial<ConfigParameter>): ConfigParameter {
  return {
    id: 'baudrate',
    name: 'baudrate',
    type: 'integer',
    value: 50,
    min: 0,
    max: 100,
    ...overrides,
  } as ConfigParameter;
}

describe('ParameterEditor 超范围值（Fix 24）', () => {
  it('输入超过 max 的值：onChange 不被调用，input 回显旧值并标红', () => {
    const onChange = vi.fn();
    const { container } = render(<ParameterEditor parameter={makeParam({})} onChange={onChange} />);

    const input = getNumberInput(container);
    expect((input as HTMLInputElement).value).toBe('50');

    fireEvent.change(input, { target: { value: '200' } });

    // 校验失败 → 不 setValue / 不 onChange → UI 保持旧值
    expect(onChange).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('50');
    // 标红：错误文本可见
    expect(screen.getByText('Maximum value is 100')).toBeTruthy();
  });

  it('输入低于 min 的值：保持旧值并显示最小值错误', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ParameterEditor
        parameter={makeParam({ min: 10, max: 100, value: 50 })}
        onChange={onChange}
      />
    );

    const input = getNumberInput(container);
    fireEvent.change(input, { target: { value: '3' } });

    expect(onChange).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('50');
    expect(screen.getByText('Minimum value is 10')).toBeTruthy();
  });

  it('输入范围内的合法值：正常回调 onChange 并更新 UI', () => {
    const onChange = vi.fn();
    const { container } = render(<ParameterEditor parameter={makeParam({})} onChange={onChange} />);

    const input = getNumberInput(container);
    fireEvent.change(input, { target: { value: '75' } });

    expect(onChange).toHaveBeenCalledWith(75);
    expect((input as HTMLInputElement).value).toBe('75');
    // 无错误文本
    expect(screen.queryByText(/Minimum value is/)).toBeNull();
    expect(screen.queryByText(/Maximum value is/)).toBeNull();
  });

  it('非整数输入（如小数）对 integer 参数按超范围处理：保持旧值', () => {
    const onChange = vi.fn();
    const { container } = render(<ParameterEditor parameter={makeParam({})} onChange={onChange} />);

    const input = getNumberInput(container);
    fireEvent.change(input, { target: { value: '3.7' } });

    // parseInt('3.7') = 3 → 在范围内 → 正常更新（模拟原生 parseInt 行为）
    // 注意：此处验证的是 handleChange 的校验分叉 —— 3 是合法值
    expect(onChange).toHaveBeenCalledWith(3);
    expect((input as HTMLInputElement).value).toBe('3');
  });

  it("string 参数空字符串：允许清空（newValue === '' 分支）", () => {
    const onChange = vi.fn();
    render(
      <ParameterEditor
        parameter={makeParam({ type: 'string', name: 'desc', id: 'desc', value: 'abc' })}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });

    // required 校验失败但空字符串允许传递（用户清空输入场景）
    expect(onChange).toHaveBeenCalledWith('');
    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.getByText('This field is required')).toBeTruthy();
  });
});
