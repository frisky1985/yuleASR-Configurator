/**
 * SEO 组件库
 * @description 提供结构化数据、社交元标签和 SEO 包装器组件
 */

// 结构化数据组件
export {
  StructuredData,
  MultipleStructuredData,
  type StructuredDataProps,
  type OrganizationData,
  type WebSiteData,
  type ArticleData,
  type BreadcrumbListData,
} from './StructuredData';

// 社交元标签组件
export {
  SocialMeta,
  HomeSocialMeta,
  ArticleSocialMeta,
  type SocialMetaProps,
  type OGType,
  type TwitterCardType,
} from './SocialMeta';

// SEO 包装器组件
export {
  SEOWrapper,
  HomeSEOWrapper,
  BlogArticleSEOWrapper,
  BlogListSEOWrapper,
  type SEOWrapperProps,
  type BlogArticleSEOWrapperProps,
} from './SEOWrapper';
