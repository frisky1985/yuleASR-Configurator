import { integer, pgTable, serial, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  passwordHash: text('password_hash').notNull(),
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

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Config = typeof configs.$inferSelect
export type NewConfig = typeof configs.$inferInsert
