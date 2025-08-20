// 导入全局样式
import './assets/main.css'

// 导入Vue核心模块
import { createApp } from 'vue'
// 导入根组件
import App from './App.vue'
// 导入路由配置
import router from './router'
// 导入Element Plus UI库
import ElementPlus from 'element-plus'
// 导入Element Plus样式
import 'element-plus/dist/index.css'
// 导入favicon图标
import faviconUrl from '@/assets/logo.svg'
// 导入PWA注册文件
// 该文件负责处理PWA的安装提示和更新检测
import './registerPWA'

// 创建并设置网站favicon图标
const link = document.createElement('link')
link.rel = 'icon'
link.type = 'image/svg+xml'
link.href = faviconUrl
document.head.appendChild(link)

// 创建Vue应用实例
// 使用路由和Element Plus插件
// 挂载到#app元素
const app = createApp(App).use(router).use(ElementPlus).mount('#app')

// PWA服务工作者由vite-plugin-pwa自动注册
// 因此移除了手动注册代码以避免冲突
// 手动注册代码示例（已移除）：
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
*/