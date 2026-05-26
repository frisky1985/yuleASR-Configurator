/**
 * 阅读进度条组件
 * @description 显示文章阅读进度，固定在页面顶部
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ReadingProgressProps {
  /** 目标容器选择器 (默认: 'article') */
  targetSelector?: string;
  /**
   * 进度计算模式
   * - 'viewport': 基于视口滚动位置
   * - 'element': 基于目标元素滚动位置
   * @default 'element'
   */
  mode?: 'viewport' | 'element';
  /** 进度条颜色 (默认: hsl(var(--primary))) */
  color?: string;
  /** 进度条高度 (默认: 3px) */
  height?: number;
  /** 进度变化回调 */
  onProgressChange?: (progress: number) => void;
  /** 自定义类名 */
  className?: string;
  /** 是否显示百分比文字 (默认: false) */
  showPercentage?: boolean;
  /** 百分比位置 (默认: 'right') */
  percentagePosition?: 'left' | 'right';
}

/**
 * 阅读进度条组件
 */
export function ReadingProgress({
  targetSelector = 'article',
  mode = 'element',
  color,
  height = 3,
  onProgressChange,
  className,
  showPercentage = false,
  percentagePosition = 'right',
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const tickingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // 查找目标元素
  useEffect(() => {
    const target = document.querySelector(targetSelector) as HTMLElement;
    if (target) {
      targetRef.current = target;
      setIsVisible(true);
    } else {
      targetRef.current = null;
      setIsVisible(false);
    }
  }, [targetSelector]);

  // 计算进度
  const calculateProgress = useCallback(() => {
    if (mode === 'element' && targetRef.current) {
      const target = targetRef.current;
      const rect = target.getBoundingClientRect();
      const elementHeight = target.offsetHeight;
      const windowHeight = window.innerHeight;

      // 计算可滚动距离
      const scrollableDistance = elementHeight - windowHeight + rect.top;
      const scrolled = -rect.top;

      // 计算进度
      const rawProgress = (scrolled / scrollableDistance) * 100;
      return Math.max(0, Math.min(100, rawProgress));
    } else {
      // viewport 模式
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      return Math.min(100, (scrollTop / docHeight) * 100);
    }
  }, [mode]);

  // 更新进度
  const updateProgress = useCallback(() => {
    const newProgress = calculateProgress();
    setProgress(newProgress);
    onProgressChange?.(newProgress);
    tickingRef.current = false;
  }, [calculateProgress, onProgressChange]);

  // 处理滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        rafIdRef.current = requestAnimationFrame(updateProgress);
        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // 初始化
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [updateProgress]);

  // 如果没有目标元素，不渲染
  if (!isVisible) {
    return null;
  }

  const progressColor = color || 'hsl(var(--primary))';

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="阅读进度"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-transparent pointer-events-none',
        className
      )}
      style={{ height }}
      data-testid="reading-progress"
    >
      {/* 进度条 */}
      <motion.div
        className="h-full origin-left"
        style={{
          backgroundColor: progressColor,
          willChange: 'transform',
        }}
        animate={{
          scaleX: progress / 100,
        }}
        transition={{
          duration: 0.15,
          ease: 'easeOut',
        }}
      />

      {/* 百分比显示 */}
      {showPercentage && (
        <span
          className={cn(
            'absolute top-1 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded backdrop-blur-sm',
            percentagePosition === 'left' ? 'left-2' : 'right-2'
          )}
          aria-hidden="true"
        >
          {Math.round(progress)}%
        </span>
      )}

      {/* 屏幕阅读器文本 */}
      <span className="sr-only">
        已阅读 {Math.round(progress)}%
      </span>
    </div>
  );
}

export default ReadingProgress;
