import { integer, pgTable, serial, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  score: integer('score').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const configs = pgTable('configs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').default(''),
  data: jsonb('data').notNull(), // Full ConfigFile JSON
  version: integer('version').default(1).notNull(),
  shareToken: varchar('share_token', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const configVersions = pgTable('config_versions', {
  id: serial('id').primaryKey(),
  configId: integer('config_id').references(() => configs.id).notNull(),
  version: integer('version').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  configId: integer('config_id').references(() => configs.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // markdown
  tags: text('tags').array(),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // draft | published
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  postCount: integer('post_count').default(0).notNull(),
})

export const configLocks = pgTable('config_locks', {
  id: serial('id').primaryKey(),
  configId: integer('config_id').references(() => configs.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  lockedAt: timestamp('locked_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Config = typeof configs.$inferSelect
export type NewConfig = typeof configs.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
