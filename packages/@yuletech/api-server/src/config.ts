import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/yuleasr',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  staticDir: process.env.STATIC_DIR || './public',
};
