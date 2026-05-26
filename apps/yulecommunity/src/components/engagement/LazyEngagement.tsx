/**
 * 懒加载互动组件
 * @description 使用 Intersection Observer 和 React.lazy 实现组件级代码分割
 */

import { Suspense, lazy, useEffect, useState, useRef } from 'react';

// 动态导入互动组件
const WechatCommunity = lazy(() => import('./WechatCommunity').then(m => ({ default: m.WechatCommunity })));
const NewsletterSignup = lazy(() => import('./NewsletterSignup').then(m => ({ default: m.NewsletterSignup })));

interface LazyEngagementProps {
  /** 是否启用微信社群组件 */
  enableWechat?: boolean;
  /** 是否启用 Newsletter 组件 */
  enableNewsletter?: boolean;
  /** 微信社群显示位置 */
  wechatPosition?: 'bottom-right' | 'bottom-left';
  /** 微信社群显示延迟 (ms) */
  wechatDelay?: number;
  /** Newsletter 显示延迟 (ms) */
  newsletterDelay?: number;
  /** 是否启用退出意图检测 */
  enableExitIntent?: boolean;
}

/**
 * 懒加载互动组件包装器
 * 使用 Intersection Observer 检测页面可见性，延迟加载非关键组件
 */
export function LazyEngagement({
  enableWechat = true,
  enableNewsletter = true,
  wechatPosition = 'bottom-right',
  wechatDelay = 8000,
  newsletterDelay = 15000,
  enableExitIntent = true,
}: LazyEngagementProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用 Intersection Observer 延迟加载组件
    // 当页面滚动到 50% 位置时开始加载
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        // 提前在视口外 1000px 开始加载
        rootMargin: '1000px',
        threshold: 0,
      }
    );

    // 观察一个占位元素（页面底部附近）
    const placeholder = document.getElementById('engagement-placeholder');
    if (placeholder) {
      observer.observe(placeholder);
    } else {
      // 如果没有占位符，延迟 3 秒后加载（用户体验与性能平衡）
      const timer = setTimeout(() => setShouldLoad(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => observer.disconnect();
  }, []);

  // 如果组件不应该加载，返回一个占位符
  if (!shouldLoad) {
    return <div id="engagement-placeholder" ref={containerRef} className="h-1" />;
  }

  return (
    <div ref={containerRef}>
      <Suspense fallback={null}>
        {enableWechat && (
          <WechatCommunity 
            position={wechatPosition} 
            delay={wechatDelay} 
          />
        )}
        {enableNewsletter && (
          <NewsletterSignup 
            variant="popup" 
            delay={newsletterDelay} 
            enableExitIntent={enableExitIntent} 
          />
        )}
      </Suspense>
    </div>
  );
}

/**
 * 立即加载的互动组件（用于首屏需要显示的情况）
 */
export function ImmediateEngagement({
  enableWechat = true,
  enableNewsletter = true,
}: Omit<LazyEngagementProps, 'wechatDelay' | 'newsletterDelay' | 'enableExitIntent'>) {
  return (
    <Suspense fallback={null}>
      {enableWechat && (
        <WechatCommunity 
          position="bottom-right" 
          delay={5000}
        />
      )}
      {enableNewsletter && (
        <NewsletterSignup 
          variant="popup" 
          delay={10000}
          enableExitIntent
        />
      )}
    </Suspense>
  );
}

export default LazyEngagement;
