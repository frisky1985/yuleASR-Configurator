export default {
  plugins: {
    // Tailwind CSS v4：PostCSS 插件独立为 @tailwindcss/postcss（v3 直接引用 tailwindcss 的方式已废弃）
    // YAC-CI-004：与 yuleasr-web 同模式（v4 迁移），修复 `pnpm -r build` 全绿
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
