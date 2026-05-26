/**
 * CodeBlock 组件测试
 * @description CodeBlock 组件的单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlock, CopyButton } from '../CodeBlock';

describe('CodeBlock', () => {
  const sampleCode = `const greeting = "Hello World";
console.log(greeting);`;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染代码块', () => {
    render(<CodeBlock code={sampleCode} />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
  });

  it('应该显示代码内容', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);

    // 由于 react-syntax-highlighter 渲染，代码可能被分割成多个节点
    // 我们检查容器内容
    expect(container.textContent).toContain('const greeting');
    expect(container.textContent).toContain('Hello World');
  });

  it('应该显示语言标签', () => {
    render(<CodeBlock code={sampleCode} language="javascript" />);

    expect(screen.getByText('Javascript')).toBeInTheDocument();
  });

  it('应该显示文件名标签', () => {
    render(<CodeBlock code={sampleCode} filename="example.js" language="javascript" />);

    expect(screen.getByText('example.js')).toBeInTheDocument();
  });

  it('应该有复制按钮', () => {
    render(<CodeBlock code={sampleCode} />);

    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toBeInTheDocument();
  });

  it('应该支持折叠功能', () => {
    render(<CodeBlock code={sampleCode} collapsible />);

    const toggleButton = screen.getByLabelText('折叠代码块');
    expect(toggleButton).toBeInTheDocument();
  });

  it('应该支持默认折叠', () => {
    render(<CodeBlock code={sampleCode} collapsible defaultCollapsed />);

    expect(screen.getByText('代码已折叠，点击展开')).toBeInTheDocument();
  });

  it('应该支持自定义类名', () => {
    render(<CodeBlock code={sampleCode} className="custom-class" />);

    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveClass('custom-class');
  });

  it('复制按钮应该有正确的 ARIA 属性', () => {
    render(<CodeBlock code={sampleCode} />);

    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toHaveAttribute('aria-label', '复制代码到剪贴板');
    expect(copyButton).toHaveAttribute('aria-live', 'polite');
    expect(copyButton).toHaveAttribute('aria-atomic', 'true');
  });
});

describe('CopyButton', () => {
  const sampleText = 'const x = 1';

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // 模拟 clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染复制按钮', () => {
    render(<CopyButton text={sampleText} />);

    const button = screen.getByTestId('copy-button');
    expect(button).toBeInTheDocument();
  });

  it('复制成功后应该显示对勾图标', async () => {
    render(<CopyButton text={sampleText} />);

    const button = screen.getByTestId('copy-button');
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', '代码已复制');
    });
  });

  it('复制失败时应该回退到 execCommand', async () => {
    // 模拟 clipboard API 失败
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Failed')),
      },
      writable: true,
    });

    // 模拟 document.execCommand - 在 jsdom 中需要先定义
    const originalExecCommand = document.execCommand;
    const execCommandMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', {
      value: execCommandMock,
      writable: true,
    });

    render(<CopyButton text={sampleText} />);

    const button = screen.getByTestId('copy-button');
    await userEvent.click(button);

    // 等待 fallback 执行
    await waitFor(() => {
      expect(execCommandMock).toHaveBeenCalledWith('copy');
    });

    // 恢复原始值
    Object.defineProperty(document, 'execCommand', {
      value: originalExecCommand,
      writable: true,
    });
  });

  it('复制成功后应该触发 onCopy 回调', async () => {
    const handleCopy = vi.fn();
    render(<CopyButton text={sampleText} onCopy={handleCopy} />);

    const button = screen.getByTestId('copy-button');
    await userEvent.click(button);

    await waitFor(() => {
      expect(handleCopy).toHaveBeenCalled();
    });
  });

  it('应该支持不同尺寸', () => {
    const { rerender } = render(<CopyButton text={sampleText} size="sm" />);
    let button = screen.getByTestId('copy-button');
    expect(button).toHaveClass('w-8', 'h-8');

    rerender(<CopyButton text={sampleText} size="md" />);
    button = screen.getByTestId('copy-button');
    expect(button).toHaveClass('w-10', 'h-10');

    rerender(<CopyButton text={sampleText} size="lg" />);
    button = screen.getByTestId('copy-button');
    expect(button).toHaveClass('w-12', 'h-12');
  });

  it('应该支持自定义类名', () => {
    render(<CopyButton text={sampleText} className="custom-class" />);

    const button = screen.getByTestId('copy-button');
    expect(button).toHaveClass('custom-class');
  });

  it('应该在指定时间后重置复制状态', async () => {
    const successDuration = 1000;
    render(<CopyButton text={sampleText} successDuration={successDuration} />);

    const button = screen.getByTestId('copy-button');
    await userEvent.click(button);

    // 确认复制成功
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', '代码已复制');
    });

    // 快进时间
    await act(async () => {
      vi.advanceTimersByTime(successDuration + 100);
    });

    // 确认重置
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', '复制代码到剪贴板');
    });
  });
});
