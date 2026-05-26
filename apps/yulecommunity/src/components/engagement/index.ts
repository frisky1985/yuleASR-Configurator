/**
 * Engagement 组件库
 * @description 用户互动与转化相关组件
 */

// 微信社群组件
export { WechatCommunity } from './WechatCommunity';

// Newsletter 订阅组件
export { NewsletterSignup } from './NewsletterSignup';

// 收藏按钮组件
export { BookmarkButton } from './BookmarkButton';

// 相关文章推荐组件 (从 blog 目录导入)
export { RelatedArticles } from '../blog/RelatedArticles';

// 懒加载互动组件（带 Intersection Observer 优化）
export { LazyEngagement, ImmediateEngagement } from './LazyEngagement';
