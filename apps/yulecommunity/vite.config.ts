import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/community/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // 使用 public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        // 离线回退配置
        navigateFallback: '/community/offline.html',
        navigateFallbackDenylist: [/^\/community\/admin/, /^\/community\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            // API 请求缓存策略 - NetworkFirst 确保是新数据
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5分钟
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // 图片缓存策略
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30天
              },
            },
          },
        ],
      },
      // 开发环境配置
      devOptions: {
        enabled: false, // 开发时禁用 Service Worker
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Rolldown（vite 8）不支持 manualChunks 对象形式，改为函数形式（YAC-CI-004）
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('react'))
            return 'react-vendor';
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('framer-motion')) return 'framer-motion';
          if (id.includes('react-syntax-highlighter')) return 'syntax-highlight';
          if (
            id.includes('lucide-react') ||
            id.includes('clsx') ||
            id.includes('class-variance-authority') ||
            id.includes('tailwind-merge')
          )
            return 'ui-utils';
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 500, // 500KB 警告阈值
    // 预加载配置
    modulePreload: {
      polyfill: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
