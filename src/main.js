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

// 注册PWA服务工作者
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}