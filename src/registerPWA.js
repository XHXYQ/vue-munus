let deferredPrompt;

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