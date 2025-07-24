import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

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
