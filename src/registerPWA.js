// PWA安装提示和更新管理模块
// 用于处理PWA的安装提示和新版本更新检测

// 保存beforeinstallprompt事件，用于稍后触发安装
let deferredPrompt;
// 防止重复刷新的标志
let refreshing = false;

// Service Worker更新检测
if ('serviceWorker' in navigator) {
  // 监听controllerchange事件，当新的Service Worker接管时触发
  // 这通常发生在用户点击更新按钮后，新的Service Worker激活时
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // 防止重复刷新页面
    if (!refreshing) {
      refreshing = true;
      // 显示更新提示，让用户知道新版本已激活
      showUpdatePrompt();
    }
  });
  
  // 检查现有的Service Worker注册状态
  // 如果已经有等待激活的Service Worker，立即显示更新提示
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration && registration.waiting) {
      // 如果已经有等待激活的Service Worker，显示更新提示
      showUpdatePrompt();
    }
  });
}

/**
 * 显示PWA更新提示
 * 当检测到新版本可用时调用此函数
 */
function showUpdatePrompt() {
  // 隐藏可能已存在的安装提示，避免同时显示安装和更新提示
  const installBanner = document.getElementById('pwa-install-banner');
  if (installBanner) installBanner.remove();
  
  // 创建更新提示横幅
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.innerHTML = `
    <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #886417; color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 9999; display: flex; align-items: center; gap: 10px; text-align: center;">
      <span>发现新版本，是否立即更新？</span>
      <button id="update-button" style="background: white; color: #886417; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">更新</button>
      <button id="update-later-button" style="background: transparent; color: white; border: 1px solid white; padding: 8px 12px; border-radius: 4px; cursor: pointer;">稍后提醒</button>
    </div>
  `;
  
  // 移除已存在的更新提示，防止重复显示
  const existingBanner = document.getElementById('pwa-update-banner');
  if (existingBanner) existingBanner.remove();
  
  // 将更新提示添加到页面中
  document.body.appendChild(updateBanner);
  
  // 添加更新按钮事件处理程序
  document.getElementById('update-button').addEventListener('click', () => {
    updateBanner.remove();
    // 发送消息给等待中的Service Worker让它激活
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration && registration.waiting) {
        // 发送SKIP_WAITING消息给等待中的Service Worker
        // 这会让新的Service Worker立即激活，无需等待所有标签页关闭
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  });
  
  // 添加稍后提醒按钮事件处理程序
  document.getElementById('update-later-button').addEventListener('click', () => {
    updateBanner.remove();
  });
}

// 监听来自Service Worker的消息
// 可以用于接收Service Worker发送的特定消息
navigator.serviceWorker.addEventListener('message', event => {
  if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
    // 当Service Worker检测到新版本时显示更新提示
    showUpdatePrompt();
  }
});

// 监听beforeinstallprompt事件，这是PWA安装的入口点
window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止浏览器默认的安装提示
  e.preventDefault();
  // 保存事件以便稍后触发
  deferredPrompt = e;
  // 显示自定义安装提示
  showInstallPromotion();
});

/**
 * 显示PWA安装提示
 * 当用户可以安装PWA时调用此函数
 */
function showInstallPromotion() {
  // 检查是否已有更新提示，如果有则不显示安装提示
  // 避免同时显示安装和更新提示造成混淆
  const updateBanner = document.getElementById('pwa-update-banner');
  if (updateBanner) return;
  
  // 控制台日志，用于调试
  console.log('PWA可安装');
  
  // 创建一个简单的安装提示横幅
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; background: #886417; color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 9999; display: flex; align-items: center; gap: 10px;">
      <span>安装应用到桌面</span>
      <button id="install-button" style="background: white; color: #886417; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">安装</button>
      <button id="close-button" style="background: transparent; color: white; border: none; padding: 8px; cursor: pointer;">×</button>
    </div>
  `;
  
  // 将安装提示添加到页面中
  document.body.appendChild(installBanner);
  
  // 添加安装按钮事件处理程序
  document.getElementById('install-button').addEventListener('click', installPWA);
  
  // 添加关闭按钮事件处理程序
  document.getElementById('close-button').addEventListener('click', () => {
    installBanner.remove();
  });
}

/**
 * 触发PWA安装流程
 * 当用户点击安装按钮时调用此函数
 */
function installPWA() {
  // 隐藏安装提示
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
  
  // 触发之前保存的安装提示
  if (deferredPrompt) {
    deferredPrompt.prompt();
    
    // 等待用户响应安装提示
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        // 用户接受了安装提示
        console.log('用户接受了安装提示');
      } else {
        // 用户拒绝了安装提示
        console.log('用户拒绝了安装提示');
      }
      // 清空deferredPrompt引用
      deferredPrompt = null;
    });
  }
}

// 监听应用安装成功事件
window.addEventListener('appinstalled', () => {
  // 控制台日志，用于调试
  console.log('PWA已成功安装');
  // 隐藏安装提示
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
  // 清空deferredPrompt引用
  deferredPrompt = null;
});

// 页面可见性变化时检查更新
// 当用户切换回标签页时检查是否有新版本
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // 页面变为可见时检查Service Worker更新
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          // 强制检查更新
          registration.update();
        }
      });
    }
  }
});