/**
 * Open Graph 和 Twitter Card Meta 标签组件
 * @description 生成社交媒体分享卡片所需的 meta 标签
 * @see https://ogp.me/
 */

import { useEffect } from 'react';

// OG 类型
export type OGType = 'website' | 'article' | 'profile';

// Twitter 卡片类型
export type TwitterCardType = 'summary' | 'summary_large_image' | 'app';

// 组件 Props
export interface SocialMetaProps {
  // 基本信息
  title: string;
  description: string;
  url: string;
  
  // OG 图片
  image: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  
  // OG 类型
  type?: OGType;
  siteName?: string;
  locale?: string;
  
  // 文章特有
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  section?: string;
  
  // Twitter 特定
  twitterCard?: TwitterCardType;
  twitterSite?: string; // @username
  twitterCreator?: string; // @username
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  type: 'website' as OGType,
  siteName: 'YuleTech 汽车基础软件社区',
  locale: 'zh_CN',
  twitterCard: 'summary_large_image' as TwitterCardType,
  twitterSite: '@yuletech',
  imageWidth: 1200,
  imageHeight: 630,
};

/**
 * 设置 Meta 标签
 */
function setMetaTag(property: string, content: string, isProperty = true) {
  const selector = isProperty 
    ? `meta[property="${property}"]` 
    : `meta[name="${property}"]`;
  
  let meta = document.querySelector(selector) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    if (isProperty) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    document.head.appendChild(meta);
  }
  
  meta.content = content;
  return meta;
}

/**
 * 社交元数据组件
 */
export function SocialMeta({
  title,
  description,
  url,
  image,
  imageAlt,
  imageWidth = DEFAULT_CONFIG.imageWidth,
  imageHeight = DEFAULT_CONFIG.imageHeight,
  type = DEFAULT_CONFIG.type,
  siteName = DEFAULT_CONFIG.siteName,
  locale = DEFAULT_CONFIG.locale,
  author,
  publishedTime,
  modifiedTime,
  tags,
  section,
  twitterCard = DEFAULT_CONFIG.twitterCard,
  twitterSite = DEFAULT_CONFIG.twitterSite,
  twitterCreator,
}: SocialMetaProps) {
  useEffect(() => {
    // 确保是完整 URL
    const ensureFullUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      const baseUrl = window.location.origin;
      return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const fullImageUrl = ensureFullUrl(image);
    const fullPageUrl = ensureFullUrl(url);

    // 基础 OG 标签
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:url', fullPageUrl);
    setMetaTag('og:image', fullImageUrl);
    setMetaTag('og:type', type);
    setMetaTag('og:site_name', siteName);
    setMetaTag('og:locale', locale);

    // 图片维度
    setMetaTag('og:image:width', imageWidth.toString());
    setMetaTag('og:image:height', imageHeight.toString());
    if (imageAlt) {
      setMetaTag('og:image:alt', imageAlt);
    }

    // 文章特有 OG 标签
    if (type === 'article') {
      if (author) setMetaTag('article:author', author);
      if (publishedTime) setMetaTag('article:published_time', publishedTime);
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime);
      if (section) setMetaTag('article:section', section);
      tags?.forEach((tag, index) => {
        // 只添加前 5 个标签
        if (index < 5) {
          setMetaTag('article:tag', tag);
        }
      });
    }

    // Twitter Card 标签
    setMetaTag('twitter:card', twitterCard, false);
    setMetaTag('twitter:site', twitterSite, false);
    if (twitterCreator) {
      setMetaTag('twitter:creator', twitterCreator, false);
    }
    setMetaTag('twitter:title', title, false);
    setMetaTag('twitter:description', description, false);
    setMetaTag('twitter:image', fullImageUrl, false);
    if (imageAlt) {
      setMetaTag('twitter:image:alt', imageAlt, false);
    }

    // 更新页面标题
    document.title = title;

    // 清理函数
    return () => {
      // 选择性清理 - 只清除本组件添加的标签
      // 实际生产环境中通常不需要清理，因为页面切换时会覆盖
    };
  }, [
    title,
    description,
    url,
    image,
    imageAlt,
    imageWidth,
    imageHeight,
    type,
    siteName,
    locale,
    author,
    publishedTime,
    modifiedTime,
    tags,
    section,
    twitterCard,
    twitterSite,
    twitterCreator,
  ]);

  return null;
}

/**
 * 预设的首页社交元数据
 */
export function HomeSocialMeta() {
  return (
    <SocialMeta
      title="YuleTech - 汽车基础软件开源社区 | AutoSAR BSW"
      description="YuleTech 是国内领先的汽车基础软件开源社区，提供 AutoSAR BSW 开源代码、开发工具链、学习成长平台和硬件开发板，做工程师的合作伙伴。"
      url="/"
      image="/images/hero-bg.png"
      type="website"
    />
  );
}

/**
 * 预设的博客文章社交元数据
 */
export function ArticleSocialMeta({
  title,
  description,
  slug,
  image,
  author,
  publishedTime,
  modifiedTime,
  tags,
}: {
  title: string;
  description: string;
  slug: string;
  image: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
}) {
  return (
    <SocialMeta
      title={`${title} - YuleTech 技术博客`}
      description={description}
      url={`/blog/${slug}`}
      image={image}
      type="article"
      author={author}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      tags={tags}
      section="技术博客"
    />
  );
}

export default SocialMeta;
