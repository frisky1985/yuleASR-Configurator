import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ── Fix 14: 统一 Drizzle schema（Prisma 模型全量对齐）────────────────────────
// 命名约定: 表名 snake_case，字段名 camelCase，列名 snake_case。
// tags/likedBy/modules 等 Prisma 侧存 JSON 字符串（SQLite 兼容），Drizzle 用 jsonb 表达。

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  avatar: text('avatar'),
  role: varchar('role', { length: 32 }).default('user').notNull(),
  score: integer('score').default(0).notNull(),
  ssoProvider: varchar('sso_provider', { length: 32 }),
  ssoId: varchar('sso_id', { length: 255 }),
  ssoMetadata: text('sso_metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const configs = pgTable('configs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').default(''),
  data: jsonb('data').notNull(), // Full ConfigFile JSON
  version: integer('version').default(1).notNull(),
  shareToken: varchar('share_token', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const configVersions = pgTable('config_versions', {
  id: serial('id').primaryKey(),
  configId: integer('config_id')
    .references(() => configs.id)
    .notNull(),
  version: integer('version').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  configId: integer('config_id').references(() => configs.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // markdown
  tags: text('tags').array(),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // draft | published
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => posts.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  category: varchar('category', { length: 100 }).default('全部').notNull(),
  tags: jsonb('tags').default([]),
  coverImage: text('cover_image'),
  isHot: boolean('is_hot').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const blogComments = pgTable('blog_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id')
    .references(() => blogPosts.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: uuid('parent_id'),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  likes: integer('likes').default(0).notNull(),
  likedBy: jsonb('liked_by').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  postCount: integer('post_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const licenseKeys = pgTable('license_keys', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).unique().notNull(),
  tier: varchar('tier', { length: 32 }).default('free').notNull(), // free | pro
  maxModules: integer('max_modules').default(5).notNull(),
  maxProjects: integer('max_projects').default(1).notNull(),
  expiresAt: timestamp('expires_at'),
  customerEmail: varchar('customer_email', { length: 255 }),
  userId: integer('user_id').references(() => users.id),
  active: boolean('active').default(true).notNull(),
  lemonOrderId: varchar('lemon_order_id', { length: 255 }).unique(),
  lemonCustomerId: varchar('lemon_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bswTemplates = pgTable('bsw_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 64 }).notNull(), // mcal | ecual | service | full | bsw
  tags: jsonb('tags').default([]),
  moduleType: varchar('module_type', { length: 64 }),
  configData: text('config_data'),
  modules: jsonb('modules').default([]),
  version: integer('version').default(1).notNull(),
  downloads: integer('downloads').default(0).notNull(),
  rating: integer('rating').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  status: varchar('status', { length: 32 }).default('published').notNull(), // draft | published | rejected | archived
  visibility: varchar('visibility', { length: 32 }).default('public').notNull(), // public | private | team
  isOfficial: boolean('is_official').default(false).notNull(),
  minTier: varchar('min_tier', { length: 32 }).default('free').notNull(), // free | pro
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  reviewedById: integer('reviewed_by_id').references(() => users.id),
  latestVersionId: integer('latest_version_id'),
  downloadCount: integer('download_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  favoriteCount: integer('favorite_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bswTemplateVersions = pgTable('bsw_template_versions', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id')
    .references(() => bswTemplates.id, { onDelete: 'cascade' })
    .notNull(),
  version: integer('version').notNull(),
  name: varchar('name', { length: 255 }).default('').notNull(),
  description: text('description').default('').notNull(),
  modules: jsonb('modules').default([]),
  configData: text('config_data'),
  changelog: text('changelog'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const paymentEvents = pgTable('payment_events', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 255 }).unique().notNull(),
  type: varchar('type', { length: 64 }).notNull(), // payment.success | payment.failed
  email: varchar('email', { length: 255 }),
  licenseKey: varchar('license_key', { length: 255 }),
  tier: varchar('tier', { length: 32 }),
  rawBody: text('raw_body').notNull(),
  processed: boolean('processed').default(false).notNull(),
  lemonOrderId: varchar('lemon_order_id', { length: 255 }),
  lemonCustomerId: varchar('lemon_customer_id', { length: 255 }),
  lemonProductId: varchar('lemon_product_id', { length: 255 }),
  lemonVariantId: varchar('lemon_variant_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  tags: jsonb('tags').default([]),
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  answerCount: integer('answer_count').default(0).notNull(),
  acceptedAnswerId: integer('accepted_answer_id'),
  status: varchar('status', { length: 32 }).default('open').notNull(), // open | resolved | closed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const answers = pgTable('answers', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  isAccepted: boolean('is_accepted').default(false).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const qaVotes = pgTable(
  'qa_votes',
  {
    id: serial('id').primaryKey(),
    targetType: varchar('target_type', { length: 32 }).notNull(), // question | answer
    targetId: integer('target_id').notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    voteType: varchar('vote_type', { length: 16 }).notNull(), // up | down
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [uniqueIndex('qa_votes_target_user_unique').on(table.targetType, table.targetId, table.userId)]
);

export const bswTemplateReviews = pgTable(
  'bsw_template_reviews',
  {
    id: serial('id').primaryKey(),
    templateId: integer('template_id')
      .references(() => bswTemplates.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    rating: integer('rating').notNull(), // 1-5
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [uniqueIndex('bsw_template_reviews_template_user_unique').on(table.templateId, table.userId)]
);

export const sharedConfigs = pgTable('shared_configs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').default('').notNull(),
  mcuType: varchar('mcu_type', { length: 64 }),
  modules: jsonb('modules').default([]),
  configData: text('config_data'),
  screenshotUrl: text('screenshot_url'),
  tags: jsonb('tags').default([]),
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const configLocks = pgTable('config_locks', {
  id: serial('id').primaryKey(),
  configId: integer('config_id')
    .references(() => configs.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  lockedAt: timestamp('locked_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const brandSettings = pgTable('brand_settings', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#2563EB'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#6366F1'),
  accentColor: varchar('accent_color', { length: 7 }).default('#06B6D4'),
  companyName: varchar('company_name', { length: 255 }),
  supportEmail: varchar('support_email', { length: 255 }),
  termsUrl: text('terms_url'),
  privacyUrl: text('privacy_url'),
  customDomain: varchar('custom_domain', { length: 255 }),
  emailTemplateHeader: text('email_template_header'),
  emailTemplateFooter: text('email_template_footer'),
  allowedDomains: jsonb('allowed_domains').default([]),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Types ─────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Config = typeof configs.$inferSelect;
export type NewConfig = typeof configs.$inferInsert;
export type ConfigVersion = typeof configVersions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type LicenseKey = typeof licenseKeys.$inferSelect;
export type NewLicenseKey = typeof licenseKeys.$inferInsert;
export type BSWTemplate = typeof bswTemplates.$inferSelect;
export type NewBSWTemplate = typeof bswTemplates.$inferInsert;
export type BSWTemplateVersion = typeof bswTemplateVersions.$inferSelect;
export type NewBSWTemplateVersion = typeof bswTemplateVersions.$inferInsert;
export type PaymentEvent = typeof paymentEvents.$inferSelect;
export type NewPaymentEvent = typeof paymentEvents.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type QAVote = typeof qaVotes.$inferSelect;
export type NewQAVote = typeof qaVotes.$inferInsert;
export type BSWTemplateReview = typeof bswTemplateReviews.$inferSelect;
export type NewBSWTemplateReview = typeof bswTemplateReviews.$inferInsert;
export type SharedConfig = typeof sharedConfigs.$inferSelect;
export type NewSharedConfig = typeof sharedConfigs.$inferInsert;
export type ConfigLock = typeof configLocks.$inferSelect;
export type BrandSetting = typeof brandSettings.$inferSelect;
export type NewBrandSetting = typeof brandSettings.$inferInsert;
