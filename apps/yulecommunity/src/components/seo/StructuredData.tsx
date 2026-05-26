/**
 * 结构化数据组件
 * @description 生成 Schema.org JSON-LD 格式的结构化数据
 * @see https://schema.org
 */

import { useEffect } from 'react';

// Schema.org 类型
export type SchemaType = 'Article' | 'Organization' | 'WebSite' | 'BreadcrumbList';

// 组织信息
export interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[]; // 社交媒体链接
}

// 网站信息
export interface WebSiteData {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string; // 搜索 URL 模板
}

// 文章信息
export interface ArticleData {
  headline: string;
  description?: string;
  image?: string | string[];
  author: {
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified?: string;
  publisher?: OrganizationData;
  keywords?: string[];
  articleSection?: string;
}

// 面包屑导航
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListData {
  items: BreadcrumbItem[];
}

// 组件 Props
export interface StructuredDataProps {
  type: SchemaType;
  data: OrganizationData | WebSiteData | ArticleData | BreadcrumbListData;
}

/**
 * 组织结构化数据
 */
function generateOrganizationSchema(data: OrganizationData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: data.sameAs,
  };
}

/**
 * 网站结构化数据
 */
function generateWebSiteSchema(data: WebSiteData): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    description: data.description,
  };

  if (data.searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: data.searchUrl,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
}

/**
 * 文章结构化数据
 */
function generateArticleSchema(data: ArticleData): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    image: data.image,
    author: {
      '@type': 'Person',
      name: data.author.name,
      url: data.author.url,
    },
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    keywords: data.keywords?.join(', '),
    articleSection: data.articleSection,
  };

  if (data.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: data.publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: data.publisher.logo,
      },
    };
  }

  return schema;
}

/**
 * 面包屑导航结构化数据
 */
function generateBreadcrumbListSchema(data: BreadcrumbListData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 生成结构化数据
 */
function generateSchema(type: SchemaType, data: any): object | null {
  switch (type) {
    case 'Organization':
      return generateOrganizationSchema(data as OrganizationData);
    case 'WebSite':
      return generateWebSiteSchema(data as WebSiteData);
    case 'Article':
      return generateArticleSchema(data as ArticleData);
    case 'BreadcrumbList':
      return generateBreadcrumbListSchema(data as BreadcrumbListData);
    default:
      console.warn(`未知的 Schema 类型: ${type}`);
      return null;
  }
}

/**
 * 结构化数据组件
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const schema = generateSchema(type, data);
    if (!schema) return;

    const scriptId = `structured-data-${type}`;
    
    // 检查是否已存在
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(schema);

    return () => {
      // 清理
      const existing = document.getElementById(scriptId);
      if (existing) {
        document.head.removeChild(existing);
      }
    };
  }, [type, data]);

  return null; // 渲染空，只操作 DOM
}

/**
 * 多个结构化数据组合
 */
export function MultipleStructuredData({ 
  items 
}: { 
  items: Array<{ type: SchemaType; data: any }> 
}) {
  return (
    <>
      {items.map((item, index) => (
        <StructuredData key={index} type={item.type} data={item.data} />
      ))}
    </>
  );
}

export default StructuredData;
