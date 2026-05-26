/**
 * 图片灯箱组件
 * @description 点击图片打开模态框预览，支持 ESC 关闭、背景模糊、移动端手势缩放
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface ImageLightboxProps {
  /** 图片源地址 */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 图片标题 */
  caption?: string;
  /** 图片列表 (用于多图切换) */
  images?: LightboxImage[];
  /** 当前图片索引 */
  currentIndex?: number;
  /** 是否可见 (受控模式) */
  isOpen?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 图片切换回调 */
  onIndexChange?: (index: number) => void;
  /** 是否显示导航箭头 (默认: true) */
  showNavigation?: boolean;
  /** 是否显示计数器 (默认: true) */
  showCounter?: boolean;
  /** 背景模糊程度 (默认: 'lg') */
  backdropBlur?: 'sm' | 'md' | 'lg' | 'xl';
  /** 自定义类名 */
  className?: string;
}

const backdropBlurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

/**
 * 图片灯箱组件
 */
export function ImageLightbox({
  src,
  alt = '',
  caption,
  images,
  currentIndex: propIndex,
  isOpen: controlledOpen,
  onClose,
  onIndexChange,
  showNavigation = true,
  showCounter = true,
  backdropBlur = 'lg',
  className,
}: ImageLightboxProps) {
  // 支持受控和非受控模式
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [internalIndex, setInternalIndex] = useState(propIndex || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const currentIndex = propIndex !== undefined ? propIndex : internalIndex;
  const imageList = images || [{ src, alt, caption }];
  const currentImage = imageList[currentIndex] || imageList[0];

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // 手势状态
  const gestureState = useRef({
    isPinching: false,
    startScale: 1,
    startPosition: { x: 0, y: 0 },
  });

  // 关闭灯箱
  const handleClose = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onClose?.();
  }, [isControlled, onClose]);

  // 导航到上一张/下一张
  const navigateImage = useCallback((direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < imageList.length) {
      if (propIndex === undefined) {
        setInternalIndex(newIndex);
      }
      setScale(1);
      setPosition({ x: 0, y: 0 });
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, imageList.length, propIndex, onIndexChange]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(4, prev + 0.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(1, prev - 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 键盘事件处理
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'ArrowLeft':
          if (imageList.length > 1) {
            navigateImage(-1);
          }
          break;
        case 'ArrowRight':
          if (imageList.length > 1) {
            navigateImage(1);
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, imageList.length, handleClose, navigateImage, handleZoomIn, handleZoomOut, handleReset]);

  // 焦点管理
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      (previousActiveElement.current as HTMLElement)?.focus?.();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 图片预加载
  useEffect(() => {
    if (isOpen && currentImage?.src) {
      setIsLoading(true);
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.onerror = () => setIsLoading(false);
      img.src = currentImage.src;
    }
  }, [isOpen, currentImage?.src]);

  // 双击缩放
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
      const rect = imageRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - rect.width / 2) / 2;
        const y = (e.clientY - rect.top - rect.height / 2) / 2;
        setPosition({ x: -x, y: -y });
      }
    }
  }, [scale]);

  // 拖拽处理
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  }, [isDragging, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      setLastTouchDistance(distance);
      gestureState.current.isPinching = true;
      gestureState.current.startScale = scale;
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }

      // 双击检测
      const now = Date.now();
      if (now - lastTapTime < 300) {
        if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          setScale(2);
        }
      }
      setLastTapTime(now);
    }
  }, [scale, position, lastTapTime]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && gestureState.current.isPinching) {
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const delta = distance - lastTouchDistance;
      const newScale = Math.max(1, Math.min(4, gestureState.current.startScale + delta * 0.01));
      setScale(newScale);
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      });
    }
  }, [isDragging, scale, lastTouchDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    gestureState.current.isPinching = false;
    setLastTouchDistance(0);
  }, []);

  // 禁用背景滚动
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(1, Math.min(4, prev + delta)));
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        tabIndex={-1}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-black/80',
          backdropBlurClasses[backdropBlur],
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        data-testid="image-lightbox"
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="关闭预览"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* 工具栏 */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="缩小"
          >
            <ZoomOut className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="放大"
          >
            <ZoomIn className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleReset(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="重置缩放"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* 计数器 */}
        {showCounter && imageList.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-black/50 text-white text-sm">
            {currentIndex + 1} / {imageList.length}
          </div>
        )}

        {/* 左箭头 */}
        {showNavigation && currentIndex > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="上一张图片"
          >
            <ChevronLeft className="w-8 h-8" aria-hidden="true" />
          </button>
        )}

        {/* 图片容器 */}
        <motion.div
          className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleDoubleClick}
        >
          {isLoading ? (
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <img
              ref={imageRef}
              src={currentImage?.src}
              alt={currentImage?.alt || ''}
              className={cn(
                'max-w-full max-h-[85vh] object-contain cursor-grab select-none',
                isDragging && 'cursor-grabbing',
                scale > 1 && 'cursor-grab'
              )}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              draggable={false}
            />
          )}
        </motion.div>

        {/* 图片标题 */}
        {currentImage?.caption && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-6 py-2 rounded-lg bg-black/50 text-white text-center max-w-lg">
            {currentImage.caption}
          </div>
        )}

        {/* 右箭头 */}
        {showNavigation && currentIndex < imageList.length - 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="下一张图片"
          >
            <ChevronRight className="w-8 h-8" aria-hidden="true" />
          </button>
        )}

        {/* 操作说明 */}
        <span className="sr-only">
          按 ESC 关闭，方向键切换图片，Ctrl+滚轮缩放
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

export default ImageLightbox;
