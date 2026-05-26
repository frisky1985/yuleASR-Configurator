/**
 * ReadingProgress 组件测试
 * @description ReadingProgress 组件的单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReadingProgress } from '../ReadingProgress';

// 模拟页面结构
describe('ReadingProgress', () => {
  let container: HTMLElement;
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // 创建模拟目标元素
    const targetElement = document.createElement('article');
    targetElement.style.height = '2000px';
    document.body.appendChild(targetElement);

    // 模拟 requestAnimationFrame
    rafCallbacks = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return ++rafId;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    // 模拟窗口尺寸和滚动
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, writable: true });
  });

  afterEach(() => {
    container.remove();
    document.querySelectorAll('article').forEach(el => el.remove());
    vi.unstubAllGlobals();
  });

  it('应该渲染进度条元素', () => {
    render(<ReadingProgress />, { container });

    const progressBar = screen.getByTestId('reading-progress');
    expect(progressBar).toBeInTheDocument();
  });

  it('应该有正确的 ARIA 属性', () => {
    render(<ReadingProgress />, { container });

    const progressBar = screen.getByTestId('reading-progress');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label', '阅读进度');
    expect(progressBar).toHaveAttribute('aria-live', 'polite');
    expect(progressBar).toHaveAttribute('aria-atomic', 'true');
  });

  it('应该显示屏幕阅读器文本', () => {
    render(<ReadingProgress />, { container });

    const srText = screen.getByText(/已阅读/);
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('应该根据滚动更新进度', () => {
    render(<ReadingProgress />, { container });

    // 触发滚动事件
    fireEvent.scroll(window);

    // 执行 raf 回调
    rafCallbacks.forEach(cb => cb(performance.now()));

    const progressBar = screen.getByTestId('reading-progress');
    expect(progressBar).toHaveAttribute('aria-valuenow');
  });

  it('应该支持显示百分比文字', async () => {
    render(<ReadingProgress showPercentage />, { container });

    // 触发滚动
    await act(async () => {
      fireEvent.scroll(window);
      rafCallbacks.forEach(cb => cb(performance.now()));
    });

    // 使用 aria-hidden 属性来区分可见的百分比文本
    const percentage = document.querySelector('[aria-hidden="true"]');
    expect(percentage).toBeInTheDocument();
    expect(percentage).toHaveTextContent(/\d+%/);
  });

  it('应该支持左侧百分比位置', async () => {
    render(<ReadingProgress showPercentage percentagePosition="left" />, { container });

    await act(async () => {
      fireEvent.scroll(window);
      rafCallbacks.forEach(cb => cb(performance.now()));
    });

    const percentage = document.querySelector('span.left-2');
    expect(percentage).toBeInTheDocument();
    expect(percentage).toHaveTextContent(/\d+%/);
  });

  it('应该支持右侧百分比位置', async () => {
    render(<ReadingProgress showPercentage percentagePosition="right" />, { container });

    await act(async () => {
      fireEvent.scroll(window);
      rafCallbacks.forEach(cb => cb(performance.now()));
    });

    const percentage = document.querySelector('span.right-2');
    expect(percentage).toBeInTheDocument();
    expect(percentage).toHaveTextContent(/\d+%/);
  });

  it('应该支持自定义高度', () => {
    render(<ReadingProgress height={5} />, { container });

    const progressBar = screen.getByTestId('reading-progress');
    expect(progressBar).toHaveStyle({ height: '5px' });
  });

  it('应该支持自定义类名', () => {
    render(<ReadingProgress className="custom-class" />, { container });

    const progressBar = screen.getByTestId('reading-progress');
    expect(progressBar).toHaveClass('custom-class');
  });

  it('应该在没有目标元素时不渲染', () => {
    // 移除目标元素
    document.querySelectorAll('article').forEach(el => el.remove());

    render(<ReadingProgress />, { container });

    const progressBar = screen.queryByTestId('reading-progress');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('应该触发 onProgressChange 回调', () => {
    const handleProgressChange = vi.fn();
    render(<ReadingProgress onProgressChange={handleProgressChange} />, { container });

    // 触发滚动
    fireEvent.scroll(window);
    rafCallbacks.forEach(cb => cb(performance.now()));

    expect(handleProgressChange).toHaveBeenCalled();
    expect(typeof handleProgressChange.mock.calls[0][0]).toBe('number');
  });

  it('应该支持 viewport 模式', () => {
    render(<ReadingProgress mode="viewport" />, { container });

    const progressBar = screen.getByTestId('reading-progress');
    expect(progressBar).toBeInTheDocument();
  });

  it('应该支持自定义目标选择器', () => {
    const customElement = document.createElement('main');
    customElement.className = 'content';
    customElement.style.height = '2000px';
    document.body.appendChild(customElement);

    render(<ReadingProgress targetSelector=".content" />, { container });

    const progressBar = screen.getByTestId('reading-progress');
    expect(progressBar).toBeInTheDocument();

    customElement.remove();
  });
});
