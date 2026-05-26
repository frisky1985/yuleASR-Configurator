import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'color' | 'none';
  priority?: boolean;
  sizes?: string; // 响应式图片尺寸
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'blur',
  priority = false,
  sizes = '100vw',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // 懒加载：只有图片进入视口才加载
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // 生成 WebP 路径
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // 生成响应式 srcset（如果服务器支持多尺寸图片）
  const generateSrcSet = (baseSrc: string) => {
    // 检查是否是本地图片路径
    if (baseSrc.startsWith('http') || baseSrc.startsWith('//')) {
      return undefined;
    }
    // 对于本地图片，返回原图地址
    return baseSrc;
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <AnimatePresence>
        {!isLoaded && placeholder !== 'none' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50"
          >
            {/* 模糊动画占位 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </motion.div>
        )}
      </AnimatePresence>

      {isInView && (
        <picture>
          <source 
            srcSet={generateSrcSet(webpSrc)} 
            type="image/webp" 
            sizes={sizes}
          />
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>
      )}
    </div>
  );
}

// 图片卡片组件
export function ImageCard({
  src,
  alt,
  title,
  description,
}: {
  src: string;
  alt: string;
  title: string;
  description?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-card border border-border"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="aspect-video relative overflow-hidden">
        <OptimizedImage
          src={src}
          alt={alt}
          className="w-full h-full"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

// 模糊渐清组件
export function ProgressiveImage({
  src,
  alt,
  className = '',
  blurDataUrl,
}: {
  src: string;
  alt: string;
  className?: string;
  blurDataUrl?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 模糊占位图 */}
      {blurDataUrl && (
        <img
          src={blurDataUrl}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ filter: 'blur(20px)' }}
        />
      )}

      {/* 主图 */}
      <picture>
        <source srcSet={src.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp" />
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      </picture>
    </div>
  );
}
