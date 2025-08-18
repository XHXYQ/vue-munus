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
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/',
        suppressWarnings: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 20000000 // 20MB
      },
      manifest: {
        name: 'CIBC点餐系统',
        short_name: '点餐系统',
        description: 'CIBC点餐系统',
        theme_color: '#886417',
        background_color: '#f5e3c6',
        display: 'standalone',
        icon: 'public/icons/logo.png',
        start_url: "/",
        scope: "/",
      },
      injectRegister: 'auto',
      pwaAssets: {
        disabled: false,
        config: true,
      },
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
    }
  }
})
