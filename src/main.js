import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import faviconUrl from '@/assets/logo.svg'

const link = document.createElement('link')
link.rel = 'icon'
link.type = 'image/svg+xml'
link.href = faviconUrl
document.head.appendChild(link)

createApp(App).use(router).use(ElementPlus).mount('#app')
