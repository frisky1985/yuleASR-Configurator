import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  tags?: string[];
}

const BASE_URL = 'https://frisky1985.github.io';
const DEFAULT_DESC = 'yuleCommunity - AutoSAR BSW 开发者社区，规范引擎、在线编译、模块仓库一站式平台';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  publishedTime,
  author,
  tags,
}: SEOProps) {
  const fullTitle = `${title} | yuleCommunity`;
  const fullUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`AutoSAR,BSW,MCAL,${tags?.join(',') || 'yuleCommunity,嵌入式,汽车电子'}`} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image || DEFAULT_IMAGE} />
      {fullUrl && <meta property="og:url" content={fullUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || DEFAULT_IMAGE} />

      {/* Article */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {tags?.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {fullUrl && <link rel="canonical" href={fullUrl} />}
    </Helmet>
  );
}

export default SEO;
