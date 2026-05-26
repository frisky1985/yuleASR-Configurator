/**
 * 博客系统类型定义
 * @description YuleCommunity 技术博客系统类型定义
 */

/** 作者信息 */
export interface Author {
  /** 作者唯一标识 */
  id: string;
  /** 作者名称 */
  name: string;
  /** 作者头像 */
  avatar: string;
  /** 作者角色 */
  role: string;
  /** 作者简介 */
  bio?: string;
}

/** SEO 元信息 */
export interface SEOInfo {
  /** SEO 标题 */
  title: string;
  /** SEO 描述 */
  description: string;
  /** SEO 关键词 */
  keywords: string[];
  /** Open Graph 图片 */
  ogImage?: string;
}

/** 博客分类 */
export type BlogCategory = 
  | 'MCAL' 
  | 'ECUAL' 
  | 'Service' 
  | '工具链' 
  | '功能安全' 
  | '架构设计' 
  | '全部';

/** 博客文章 */
export interface BlogArticle {
  /** 文章唯一标识 */
  id: string;
  /** 文章标题 */
  title: string;
  /** 文章 slug (URL 标识) */
  slug: string;
  /** 文章摘要 */
  description: string;
  /** 完整内容 (Markdown 格式) */
  content: string;
  /** 作者信息 */
  author: Author;
  /** 发布日期 (ISO 8601) */
  publishDate: string;
  /** 最后更新日期 */
  updatedAt?: string;
  /** 阅读时长 (分钟) */
  readTime: number;
  /** 阅读量 */
  viewCount: number;
  /** 点赞数 */
  likeCount: number;
  /** 评论数 */
  commentCount: number;
  /** 标签列表 */
  tags: string[];
  /** 分类 */
  category: BlogCategory;
  /** 是否热门 */
  isHot: boolean;
  /** 封面图片 URL */
  coverImage?: string;
  /** SEO 元信息 */
  seo: SEOInfo;
}

/** 评论作者 */
export interface CommentAuthor {
  /** 用户唯一标识 */
  id: string;
  /** 用户名称 */
  name: string;
  /** 用户头像 */
  avatar: string;
}

/** 博客评论 */
export interface BlogComment {
  /** 评论唯一标识 */
  id: string;
  /** 所属文章 ID */
  articleId: string;
  /** 评论内容 */
  content: string;
  /** 评论作者 */
  author: CommentAuthor;
  /** 点赞数 */
  likes: number;
  /** 点赞用户列表 */
  likedBy: string[];
  /** 父评论 ID (用于回复) */
  parentId?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt?: string;
}

/** 博客标签 */
export interface BlogTag {
  /** 标签名称 */
  name: string;
  /** 文章数量 */
  articleCount: number;
  /** 标签颜色 */
  color?: string;
}

/** 文章查询参数 */
export interface ArticleQueryParams {
  /** 分类过滤 */
  category?: BlogCategory;
  /** 标签过滤 */
  tag?: string;
  /** 作者过滤 */
  authorId?: string;
  /** 搜索关键词 */
  search?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 排序方式 */
  sortBy?: 'date' | 'views' | 'likes';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/** 分页结果 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  data: T[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/** 文章服务接口 */
export interface IArticleService {
  /** 获取文章列表 */
  getArticles(params: ArticleQueryParams): Promise<PaginatedResult<BlogArticle>>;
  
  /** 获取单篇文章 */
  getArticleById(id: string): Promise<BlogArticle | null>;
  
  /** 根据 slug 获取文章 */
  getArticleBySlug(slug: string): Promise<BlogArticle | null>;
  
  /** 获取热门文章 */
  getHotArticles(limit?: number): Promise<BlogArticle[]>;
  
  /** 获取相关文章 */
  getRelatedArticles(articleId: string, limit?: number): Promise<BlogArticle[]>;
  
  /** 搜索文章 */
  searchArticles(query: string): Promise<BlogArticle[]>;
  
  /** 增加阅读量 */
  incrementViewCount(articleId: string): Promise<void>;
  
  /** 点赞文章 */
  toggleLike(articleId: string): Promise<boolean>;
}

/** 评论服务接口 */
export interface ICommentService {
  /** 获取文章评论 */
  getComments(articleId: string): Promise<BlogComment[]>;
  
  /** 添加评论 */
  addComment(articleId: string, content: string, author: CommentAuthor): Promise<BlogComment>;
  
  /** 删除评论 */
  deleteComment(commentId: string): Promise<boolean>;
  
  /** 点赞评论 */
  toggleCommentLike(commentId: string, userId: string): Promise<boolean>;
}

/** 标签服务接口 */
export interface ITagService {
  /** 获取所有标签 */
  getAllTags(): Promise<BlogTag[]>;
  
  /** 获取热门标签 */
  getHotTags(limit?: number): Promise<BlogTag[]>;
  
  /** 获取标签下的文章 */
  getArticlesByTag(tagName: string): Promise<BlogArticle[]>;
}

/** 目录项 */
export interface TocItem {
  /** 目录项 ID */
  id: string;
  /** 目录文本 */
  text: string;
  /** 标题级别 */
  level: number;
}

/** 存储键名 */
export const STORAGE_KEYS = {
  /** 已点赞文章 */
  LIKED_ARTICLES: 'yuletech:blog:liked',
  /** 评论数据 */
  COMMENTS: 'yuletech:blog:comments',
  /** 阅读历史 */
  READING_HISTORY: 'yuletech:blog:history',
  /** 搜索历史 */
  SEARCH_HISTORY: 'yuletech:blog:search-history',
} as const;
