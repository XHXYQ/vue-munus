let deferredPrompt;

// 添加Service Worker更新检测
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // 当新的Service Worker接管时，显示更新提示
    showUpdatePrompt();
  });
}

function showUpdatePrompt() {
  // 创建更新提示
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.innerHTML = `
    <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #886417; color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 9999; display: flex; align-items: center; gap: 10px;">
      <span>发现新版本，是否立即更新？</span>
      <button id="update-button" style="background: white; color: #886417; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">更新</button>
      <button id="update-close-button" style="background: transparent; color: white; border: none; padding: 8px; cursor: pointer;">×</button>
    </div>
  `;
  
  document.body.appendChild(updateBanner);
  
  // 添加更新按钮事件
  document.getElementById('update-button').addEventListener('click', () => {
    // 强制刷新页面以使用新的Service Worker
    window.location.reload();
  });
  
  // 添加关闭按钮事件
  document.getElementById('update-close-button').addEventListener('click', () => {
    updateBanner.remove();
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止默认的安装提示
  e.preventDefault();
  // 保存事件以便稍后触发
  deferredPrompt = e;
  // 显示自定义安装按钮或提示
  showInstallPromotion();
});

function showInstallPromotion() {
  // 这里可以显示一个自定义的安装提示
  // 比如在页面上显示一个横幅或按钮
  console.log('PWA可安装');
  
  // 创建一个简单的安装提示
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; background: #886417; color: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 9999; display: flex; align-items: center; gap: 10px;">
      <span>安装应用到桌面</span>
      <button id="install-button" style="background: white; color: #886417; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">安装</button>
      <button id="close-button" style="background: transparent; color: white; border: none; padding: 8px; cursor: pointer;">×</button>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // 添加安装按钮事件
  document.getElementById('install-button').addEventListener('click', installPWA);
  
  // 添加关闭按钮事件
  document.getElementById('close-button').addEventListener('click', () => {
    installBanner.remove();
  });
}

function installPWA() {
  // 隐藏安装提示
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
  
  // 显示安装提示
  if (deferredPrompt) {
    deferredPrompt.prompt();
    
    // 等待用户响应
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('用户接受了安装提示');
      } else {
        console.log('用户拒绝了安装提示');
      }
      deferredPrompt = null;
    });
  }
}

// 监听应用安装成功事件
window.addEventListener('appinstalled', () => {
  console.log('PWA已成功安装');
  // 隐藏安装提示
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
  deferredPrompt = null;
});