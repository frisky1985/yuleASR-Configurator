import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/yuleasr',
  // Fix 6: 无默认值（index.ts 已 fail-fast），此处仅透传
  jwtSecret: process.env.JWT_SECRET ?? '',
  staticDir: process.env.STATIC_DIR || './public',
};
