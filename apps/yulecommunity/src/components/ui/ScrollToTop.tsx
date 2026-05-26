/**
 * 返回顶部组件
 * @description 滚动超过阈值时显示悬浮按钮，点击平滑滚动到顶部
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScrollProgressProps {
  /** 当前进度 (0-100) */
  progress: number;
  /** 圆形进度条大小 */
  size?: number;
  /** 线宽 */
  strokeWidth?: number;
  /** 颜色 */
  color?: string;
}

export interface ScrollToTopProps {
  /** 显示阈值 (px) (默认: 500) */
  threshold?: number;
  /** 滚动行为 (默认: 'smooth') */
  behavior?: ScrollBehavior;
  /** 按钮位置 (默认: 'right') */
  position?: 'left' | 'right';
  /** 距离边缘距离 (px) (默认: 24) */
  offset?: number;
  /** 距离底部距离 (px) (默认: 24) */
  bottomOffset?: number;
  /** 是否显示进度 (默认: true) */
  showProgress?: boolean;
  /** 按钮大小 (默认: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
  /** 滚动完成回调 */
  onScrollComplete?: () => void;
}

/**
 * 圆形进度指示器
 */
export function CircularProgress({
  progress,
  size = 48,
  strokeWidth = 3,
  color = 'currentColor',
}: ScrollProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* 背景圆 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-20"
      />
      {/* 进度圆 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-150 ease-out"
      />
    </svg>
  );
}

/**
 * 返回顶部组件
 */
export function ScrollToTop({
  threshold = 500,
  behavior = 'smooth',
  position = 'right',
  offset = 24,
  bottomOffset = 24,
  showProgress = true,
  size = 'md',
  className,
  onScrollComplete,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const tickingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // 更新可见性和进度
  const updateVisibility = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    setIsVisible(scrollY > threshold);
    setProgress(Math.min(100, (scrollY / docHeight) * 100));
    tickingRef.current = false;
  }, [threshold]);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        rafIdRef.current = requestAnimationFrame(updateVisibility);
        tickingRef.current = true;
      }

      // 检查滚动是否完成
      if (isScrolling && window.scrollY === 0) {
        setIsScrolling(false);
        onScrollComplete?.();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // 初始化
    updateVisibility();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [updateVisibility, isScrolling, onScrollComplete]);

  // 平滑滚动到顶部
  const scrollToTop = useCallback(() => {
    setIsScrolling(true);
    window.scrollTo({
      top: 0,
      behavior,
    });
  }, [behavior]);

  const sizeClasses = {
    sm: {
      button: 'w-10 h-10',
      icon: 'w-4 h-4',
      progress: 40,
    },
    md: {
      button: 'w-12 h-12',
      icon: 'w-5 h-5',
      progress: 48,
    },
    lg: {
      button: 'w-14 h-14',
      icon: 'w-6 h-6',
      progress: 56,
    },
  };

  const positionStyles = {
    left: { left: offset },
    right: { right: offset },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          className={cn(
            'fixed z-40 flex items-center justify-center rounded-full',
            'bg-primary text-primary-foreground shadow-lg',
            'hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'transition-colors',
            sizeClasses[size].button,
            className
          )}
          style={{
            ...positionStyles[position],
            bottom: bottomOffset,
          }}
          aria-label="返回页面顶部"
          aria-describedby="scroll-top-desc"
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          data-testid="scroll-to-top"
        >
          {/* 进度指示器 */}
          {showProgress && (
            <div className="absolute inset-0">
              <CircularProgress
                progress={progress}
                size={sizeClasses[size].progress}
                strokeWidth={2}
                color="currentColor"
              />
            </div>
          )}

          {/* 图标 */}
          <ArrowUp className={cn(sizeClasses[size].icon, 'relative z-10')} aria-hidden="true" />

          {/* 说明文本 */}
          <span id="scroll-top-desc" className="sr-only">
            点击返回页面顶部，当前阅读进度 {Math.round(progress)}%
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTop;
