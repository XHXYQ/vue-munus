import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import faviconUrl from '@/assets/logo.svg'
import './registerPWA' // 导入PWA注册文件

const link = document.createElement('link')
link.rel = 'icon'
link.type = 'image/svg+xml'
link.href = faviconUrl
document.head.appendChild(link)

const app = createApp(App).use(router).use(ElementPlus).mount('#app');

// PWA服务工作者由vite-plugin-pwa自动注册
// 移除手动注册代码以避免冲突