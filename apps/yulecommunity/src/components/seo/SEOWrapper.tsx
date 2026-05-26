/**
 * SEO 统一包装组件
 * @description 组合 StructuredData 和 SocialMeta，提供统一的 SEO 配置接口
 */

import { type ReactNode } from 'react';
import { StructuredData, type StructuredDataProps } from './StructuredData';
import { SocialMeta, type SocialMetaProps } from './SocialMeta';

/**
 * SEO 包装器 Props
 */
export interface SEOWrapperProps {
  // 基础信息
  title: string;
  description: string;
  keywords?: string[];
  
  // 页面 URL
  url: string;
  
  // OG 图片
  ogImage: string;
  ogType?: SocialMetaProps['type'];
  ogImageAlt?: string;
  
  // 结构化数据
  structuredData?: StructuredDataProps[];
  
  // 文章特有
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  section?: string;
  
  // Twitter
  twitterCard?: SocialMetaProps['twitterCard'];
  twitterCreator?: string;
  
  // 子元素
  children: ReactNode;
}

/**
 * SEO 统一包装组件
 * 
 * 使用示例:
 * ```tsx
 * <SEOWrapper
 *   title="页面标题"
 *   description="页面描述"
 *   url="/path"
 *   ogImage="/images/og.png"
 *   structuredData={[{
 *     type: 'Article',
 *     data: { headline: '...', author: '...' }
 *   }]}
 * >
 *   <PageContent />
 * </SEOWrapper>
 * ```
 */
export function SEOWrapper({
  title,
  description,
  url,
  ogImage,
  ogType = 'website',
  ogImageAlt,
  structuredData = [],
  author,
  publishedTime,
  modifiedTime,
  tags,
  section,
  twitterCard = 'summary_large_image',
  twitterCreator,
  children,
}: SEOWrapperProps) {
  return (
    <>
      {/* 社交元数据 */}
      <SocialMeta
        title={title}
        description={description}
        url={url}
        image={ogImage}
        type={ogType}
        imageAlt={ogImageAlt}
        author={author}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        tags={tags}
        section={section}
        twitterCard={twitterCard}
        twitterCreator={twitterCreator}
      />
      
      {/* 结构化数据 */}
      {structuredData.map((data, index) => (
        <StructuredData key={index} type={data.type} data={data.data} />
      ))}
      
      {/* 页面内容 */}
      {children}
    </>
  );
}

/**
 * 首页 SEO 配置
 */
export function HomeSEOWrapper({ children }: { children: ReactNode }) {
  return (
    <SEOWrapper
      title="YuleTech - 汽车基础软件开源社区 | AutoSAR BSW"
      description="YuleTech 是国内领先的汽车基础软件开源社区，提供 AutoSAR BSW 开源代码、开发工具链、学习成长平台和硬件开发板。"
      keywords={[
        '汽车基础软件',
        'AutoSAR',
        'BSW',
        '开源社区',
        '汽车软件',
        '嵌入式开发',
        'MCAL',
        'ECUAL',
      ]}
      url="/"
      ogImage="/images/hero-bg.png"
      ogType="website"
      structuredData={[
        {
          type: 'Organization',
          data: {
            name: 'YuleTech',
            url: 'https://frisky1985.github.io/yuleCommunity',
            logo: 'https://frisky1985.github.io/yuleCommunity/icon-192x192.svg',
            description: '国内领先的汽车基础软件开源社区',
            sameAs: [
              'https://github.com/frisky1985/yuleCommunity',
            ],
          },
        },
        {
          type: 'WebSite',
          data: {
            name: 'YuleTech 汽车基础软件社区',
            url: 'https://frisky1985.github.io/yuleCommunity',
            description: '提供 AutoSAR BSW 开源代码、开发工具链、学习成长平台',
          },
        },
      ]}
    >
      {children}
    </SEOWrapper>
  );
}

/**
 * 博客文章 SEO 配置
 */
export interface BlogArticleSEOWrapperProps {
  title: string;
  description: string;
  slug: string;
  coverImage: string;
  author: {
    name: string;
    url?: string;
  };
  publishDate: string;
  updatedAt?: string;
  tags: string[];
  category: string;
  children: ReactNode;
}

export function BlogArticleSEOWrapper({
  title,
  description,
  slug,
  coverImage,
  author,
  publishDate,
  updatedAt,
  tags,
  category,
  children,
}: BlogArticleSEOWrapperProps) {
  // 生成 OG 图片路径
  const ogImage = `/images/og/${slug}.png`;
  
  return (
    <SEOWrapper
      title={`${title} - YuleTech 技术博客`}
      description={description}
      keywords={tags}
      url={`/blog/${slug}`}
      ogImage={ogImage}
      ogImageAlt={title}
      ogType="article"
      author={author.name}
      publishedTime={publishDate}
      modifiedTime={updatedAt || publishDate}
      tags={tags}
      section={category}
      structuredData={[
        {
          type: 'Article',
          data: {
            headline: title,
            description: description,
            image: coverImage,
            author: {
              name: author.name,
              url: author.url,
            },
            datePublished: publishDate,
            dateModified: updatedAt || publishDate,
            publisher: {
              name: 'YuleTech',
              url: 'https://frisky1985.github.io/yuleCommunity',
              logo: 'https://frisky1985.github.io/yuleCommunity/icon-192x192.svg',
            },
            keywords: tags,
            articleSection: category,
          },
        },
        {
          type: 'BreadcrumbList',
          data: {
            items: [
              { name: '首页', url: 'https://frisky1985.github.io/yuleCommunity/' },
              { name: '技术博客', url: 'https://frisky1985.github.io/yuleCommunity/blog' },
              { name: title, url: `https://frisky1985.github.io/yuleCommunity/blog/${slug}` },
            ],
          },
        },
      ]}
    >
      {children}
    </SEOWrapper>
  );
}

/**
 * 博客列表页 SEO 配置
 */
export function BlogListSEOWrapper({ children }: { children: ReactNode }) {
  return (
    <SEOWrapper
      title="技术博客 - YuleTech 汽车基础软件社区"
      description="深度技术文章分享，涵盖 AutoSAR、MCAL、ECUAL、工具链等汽车软件开发核心领域。"
      keywords={['技术博客', 'AutoSAR', '汽车软件', '教程']}
      url="/blog"
      ogImage="/images/hero-bg.png"
      ogType="website"
      structuredData={[
        {
          type: 'WebSite',
          data: {
            name: 'YuleTech 技术博客',
            url: 'https://frisky1985.github.io/yuleCommunity/blog',
            description: '深度技术文章分享，涵盖 AutoSAR 等汽车软件开发领域',
          },
        },
      ]}
    >
      {children}
    </SEOWrapper>
  );
}

export default SEOWrapper;
