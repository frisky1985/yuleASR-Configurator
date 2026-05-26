/**
 * ScrollToTop 组件测试
 * @description ScrollToTop 组件的单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollToTop, CircularProgress } from '../ScrollToTop';

describe('ScrollToTop', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafId = 0;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

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

    // 模拟 scrollTo
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const triggerScroll = async (scrollY: number) => {
    Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true });
    await act(async () => {
      fireEvent.scroll(window);
      rafCallbacks.forEach(cb => cb(performance.now()));
    });
  };

  it('初始状态下不应该显示按钮', () => {
    render(<ScrollToTop />);

    expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument();
  });

  it('滚动超过阈值后应该显示按钮', async () => {
    render(<ScrollToTop threshold={500} />);

    await triggerScroll(600);

    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
  });

  it('应该能点击滚动到顶部', async () => {
    render(<ScrollToTop threshold={500} />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    await userEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('应该有正确的 ARIA 属性', async () => {
    render(<ScrollToTop threshold={500} />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveAttribute('aria-label', '返回页面顶部');
    expect(button).toHaveAttribute('aria-describedby', 'scroll-top-desc');
  });

  it('应该显示进度指示器', async () => {
    render(<ScrollToTop threshold={500} showProgress={true} />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    expect(button).toBeInTheDocument();
    // SVG 圆形进度条应该在按钮内
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('应该支持左侧位置', async () => {
    render(<ScrollToTop threshold={500} position="left" />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveStyle({ left: '24px' });
  });

  it('应该支持右侧位置', async () => {
    render(<ScrollToTop threshold={500} position="right" />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveStyle({ right: '24px' });
  });

  it('应该支持自定义偏移量', async () => {
    render(<ScrollToTop threshold={500} offset={50} position="left" />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveStyle({ left: '50px' });
  });

  it('应该支持自定义底部偏移量', async () => {
    render(<ScrollToTop threshold={500} bottomOffset={50} />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveStyle({ bottom: '50px' });
  });

  it('应该支持不同尺寸', async () => {
    const { rerender } = render(<ScrollToTop threshold={500} size="sm" />);

    await triggerScroll(600);

    let button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveClass('w-10', 'h-10');

    rerender(<ScrollToTop threshold={500} size="md" />);
    button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveClass('w-12', 'h-12');

    rerender(<ScrollToTop threshold={500} size="lg" />);
    button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveClass('w-14', 'h-14');
  });

  it('应该支持自定义类名', async () => {
    render(<ScrollToTop threshold={500} className="custom-class" />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    expect(button).toHaveClass('custom-class');
  });

  it('滚动完成后应该触发回调', async () => {
    const handleScrollComplete = vi.fn();
    render(<ScrollToTop threshold={500} onScrollComplete={handleScrollComplete} />);

    await triggerScroll(600);

    const button = screen.getByTestId('scroll-to-top');
    await userEvent.click(button);

    // 模拟滚动到顶部完成
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
      fireEvent.scroll(window);
    });

    expect(handleScrollComplete).toHaveBeenCalled();
  });

  it('应该有屏幕阅读器文本', async () => {
    render(<ScrollToTop threshold={500} />);

    await triggerScroll(600);

    const srText = screen.getByText(/点击返回页面顶部/);
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });
});

describe('CircularProgress', () => {
  it('应该渲染 SVG 元素', () => {
    const { container } = render(<CircularProgress progress={50} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('应该根据进度显示正确的外环', () => {
    const { container } = render(<CircularProgress progress={50} />);

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);

    // 背景圆
    expect(circles[0]).toHaveAttribute('stroke', 'currentColor');
    // 进度圆
    expect(circles[1]).toHaveAttribute('stroke-dasharray');
    expect(circles[1]).toHaveAttribute('stroke-linecap', 'round');
  });

  it('应该支持自定义尺寸', () => {
    const { container } = render(<CircularProgress progress={50} size={60} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '60');
  });

  it('应该支持自定义线宽', () => {
    const { container } = render(<CircularProgress progress={50} strokeWidth={4} />);

    const circles = container.querySelectorAll('circle');
    expect(circles[0]).toHaveAttribute('stroke-width', '4');
    expect(circles[1]).toHaveAttribute('stroke-width', '4');
  });
});
