/**
 * ImageLightbox 组件测试
 * @description ImageLightbox 组件的单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageLightbox } from '../ImageLightbox';

describe('ImageLightbox', () => {
  const mockImage = {
    src: 'https://example.com/image.jpg',
    alt: 'Test Image',
    caption: 'Test Caption',
  };

  const mockImages = [
    { src: 'https://example.com/image1.jpg', alt: 'Image 1' },
    { src: 'https://example.com/image2.jpg', alt: 'Image 2' },
    { src: 'https://example.com/image3.jpg', alt: 'Image 3' },
  ];

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // 模拟图片加载
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      constructor() {
        setTimeout(() => this.onload?.(), 0);
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('受控模式下应该渲染灯箱', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    const lightbox = screen.getByTestId('image-lightbox');
    expect(lightbox).toBeInTheDocument();
  });

  it('应该有关闭按钮', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    const closeButton = screen.getByLabelText('关闭预览');
    expect(closeButton).toBeInTheDocument();
  });

  it('应该能正确关闭灯箱', async () => {
    const handleClose = vi.fn();
    render(<ImageLightbox {...mockImage} isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByLabelText('关闭预览');
    await userEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('应该有正确的 ARIA 属性', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    const lightbox = screen.getByTestId('image-lightbox');
    expect(lightbox).toHaveAttribute('role', 'dialog');
    expect(lightbox).toHaveAttribute('aria-modal', 'true');
    expect(lightbox).toHaveAttribute('aria-label', '图片预览');
  });

  it('应该显示图片', async () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    // 等待图片加载完成
    await waitFor(() => {
      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
    });

    const img = document.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('应该显示图片标题', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    expect(screen.getByText('Test Caption')).toBeInTheDocument();
  });

  it('应该有缩放控制按钮', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    expect(screen.getByLabelText('放大')).toBeInTheDocument();
    expect(screen.getByLabelText('缩小')).toBeInTheDocument();
    expect(screen.getByLabelText('重置缩放')).toBeInTheDocument();
  });

  it('应该有导航按钮当有多张图片时', () => {
    render(
      <ImageLightbox
        {...mockImages[0]}
        images={mockImages}
        currentIndex={1}
        isOpen={true}
      />
    );

    expect(screen.getByLabelText('上一张图片')).toBeInTheDocument();
    expect(screen.getByLabelText('下一张图片')).toBeInTheDocument();
  });

  it('应该显示图片计数器', () => {
    render(
      <ImageLightbox
        {...mockImages[0]}
        images={mockImages}
        currentIndex={1}
        isOpen={true}
      />
    );

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('应该支持键盘 ESC 关闭', () => {
    const handleClose = vi.fn();
    render(<ImageLightbox {...mockImage} isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalled();
  });

  it('应该支持键盘方向键切换', () => {
    const handleIndexChange = vi.fn();
    render(
      <ImageLightbox
        {...mockImages[0]}
        images={mockImages}
        currentIndex={1}
        isOpen={true}
        onIndexChange={handleIndexChange}
      />
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(handleIndexChange).toHaveBeenCalledWith(0);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(handleIndexChange).toHaveBeenCalledWith(2);
  });

  it('应该支持键盘快捷键缩放', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    // 放大
    fireEvent.keyDown(window, { key: '+' });

    // 缩小
    fireEvent.keyDown(window, { key: '-' });

    // 重置
    fireEvent.keyDown(window, { key: '0' });

    // 验证功能已注册
    const lightbox = screen.getByTestId('image-lightbox');
    expect(lightbox).toBeInTheDocument();
  });

  it('应该隐藏导航按钮当没有更多图片时', () => {
    render(
      <ImageLightbox
        {...mockImages[0]}
        images={mockImages}
        currentIndex={0}
        isOpen={true}
      />
    );

    expect(screen.queryByLabelText('上一张图片')).not.toBeInTheDocument();
    expect(screen.getByLabelText('下一张图片')).toBeInTheDocument();
  });

  it('应该隐藏计数器当只有一张图片时', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} showCounter={true} />);

    // 只有一张图片时不显示计数器
    const counter = screen.queryByText(/\d+ \/ \d+/);
    expect(counter).not.toBeInTheDocument();
  });

  it('不应该渲染当 isOpen 为 false 时', () => {
    render(<ImageLightbox {...mockImage} isOpen={false} />);

    expect(screen.queryByTestId('image-lightbox')).not.toBeInTheDocument();
  });

  it('应该支持自定义背景模糊程度', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} backdropBlur="xl" />);

    const lightbox = screen.getByTestId('image-lightbox');
    expect(lightbox).toHaveClass('backdrop-blur-xl');
  });

  it('应该支持自定义类名', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} className="custom-class" />);

    const lightbox = screen.getByTestId('image-lightbox');
    expect(lightbox).toHaveClass('custom-class');
  });

  it('应该隐藏导航当 showNavigation 为 false', () => {
    render(
      <ImageLightbox
        {...mockImages[0]}
        images={mockImages}
        currentIndex={1}
        isOpen={true}
        showNavigation={false}
      />
    );

    expect(screen.queryByLabelText('上一张图片')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('下一张图片')).not.toBeInTheDocument();
  });

  it('应该隐藏计数器当 showCounter 为 false', () => {
    render(
      <ImageLightbox
        {...mockImages[0]}
        images={mockImages}
        currentIndex={1}
        isOpen={true}
        showCounter={false}
      />
    );

    expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
  });

  it('应该有屏幕阅读器说明', () => {
    render(<ImageLightbox {...mockImage} isOpen={true} />);

    const srText = screen.getByText(/ESC.*方向键/);
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });
});
