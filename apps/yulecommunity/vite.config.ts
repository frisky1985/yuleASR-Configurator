import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/yuleCommunity/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // 使用 public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        // 离线回退配置
        navigateFallback: '/yuleCommunity/offline.html',
        navigateFallbackDenylist: [
          /^\/yuleCommunity\/admin/, // 管理后台不缓存离线页面
          /^\/yuleCommunity\/api/,   // API 请求不缓存
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { 
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            // API 请求缓存策略 - NetworkFirst 确保是新数据
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5分钟
              },
              networkTimeoutSeconds: 3
            }
          },
          {
            // 图片缓存策略
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          }
        ]
      },
      // 开发环境配置
      devOptions: {
        enabled: false // 开发时禁用 Service Worker
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 图表库
          'recharts': ['recharts'],
          // 动画库
          'framer-motion': ['framer-motion'],
          // 代码高亮
          'syntax-highlight': ['react-syntax-highlighter'],
          // UI 工具
          'ui-utils': ['lucide-react', 'clsx', 'class-variance-authority', 'tailwind-merge'],
        }
      }
    },
    chunkSizeWarningLimit: 500, // 500KB 警告阈值
    // 预加载配置
    modulePreload: {
      polyfill: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
