import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     },
//   },
// })

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      // 注册类型：autoUpdate表示Service Worker会自动更新
      registerType: 'autoUpdate',
      // 开发环境配置
      devOptions: {
        // 在开发环境中启用PWA
        enabled: true,
        // 使用ES模块类型
        type: 'module',
        // 当无法找到资源时回退到index.html
        navigateFallback: '/index.html',
        // 抑制开发环境中的警告
        suppressWarnings: true,
      },
      // Workbox配置（用于Service Worker生成）
      workbox: {
        // 需要预缓存的文件模式
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // 清理过时的缓存
        cleanupOutdatedCaches: true,
        // 立即接管客户端，无需等待
        clientsClaim: true,
        // 立即跳过等待状态，激活新的Service Worker
        skipWaiting: true,
        // 最大缓存文件大小（20MB）
        maximumFileSizeToCacheInBytes: 20000000,
        // 运行时缓存策略
        runtimeCaching: [
          {
            // 匹配API请求的URL模式
            urlPattern: /^https:\/\/api\..*/i,
            // 处理方式：网络优先策略
            handler: 'NetworkFirst',
            options: {
              // 缓存名称
              cacheName: 'api-cache',
              // 缓存过期配置
              expiration: {
                // 最大缓存条目数
                maxEntries: 100,
                // 最大缓存时间（24小时）
                maxAgeSeconds: 60 * 60 * 24
              },
              // 可缓存的响应状态码
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      // Web App Manifest配置
      manifest: {
        // 应用名称
        name: 'CIBC点餐系统',
        // 短名称（用于主屏幕）
        short_name: '点餐系统',
        // 应用描述
        description: 'CIBC点餐系统',
        // 主题颜色
        theme_color: '#886417',
        // 背景颜色
        background_color: '#f5e3c6',
        // 显示模式（standalone表示独立应用模式）
        display: 'standalone',
        // 应用图标路径
        icon: 'public/icons/logo.png',
        // 启动URL
        start_url: "/",
        // 作用域
        scope: "/",
      },
      // 自动注入注册代码
      injectRegister: 'auto',
      // PWA资产配置
      pwaAssets: {
        // 启用PWA资产生成
        disabled: false,
        // 使用配置生成资产
        config: true,
      },
      // 使用generateSW策略生成Service Worker
      strategies: 'generateSW'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 以 /api 开头的请求将被代理到目标地址
      '/api': {
        // target: 'http://120.77.169.224:9088',
        target: 'https://api.supply.erp.corporate-advisory.cn',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')  // 去掉 /api 前缀
      }
    },
  }
})