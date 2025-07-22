<template>
  <div
    class="landing-page"
    :class="{ 'bg-loaded': bgLoaded }"
  >
    <!-- Logo 图标 -->
    <div class="logo-container">
      <img src="@/assets/logo.svg" alt="Club Logo" class="logo" />
    </div>

    <!-- 标题区 -->
    <div class="title-group">
      <h1 class="main-title">克来姆国际商务会所</h1>
      <h2 class="subtitle">Clement International Business Club</h2>
    </div>

    <!-- 底部滑动提示 -->
    <div class="swipe-tip" @click="goToMenu">
      <div class="arrow">&#x25B2;</div>
      <div class="text">点击屏幕开始点餐</div>
      <div class="text-en">Swipe the screen to start ordering</div>
    </div>

    <!-- 清除数据按钮 -->
    <div class="clear-btn" @click="clearStorage">清除数据</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const bgLoaded = ref(false)

function goToMenu() {
  router.push('/menu')
}

function clearStorage() {
  localStorage.clear()
  sessionStorage.clear()
  alert('已清除本地数据')
}

onMounted(() => {
  const img = new Image()
  img.src = new URL('@/assets/bg.svg', import.meta.url).href
  img.onload = () => {
    bgLoaded.value = true
  }
})
</script>

<style scoped>
.landing-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  text-align: center;
  font-family: "Noto Serif SC", serif;
  color: #b68d41;
  padding: 10vh 5vw 6vh;
  box-sizing: border-box;

  background-color: #fdf9f1; /* 初始底色 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.6s ease-in-out;
}

.landing-page.bg-loaded {
  background-image: url('@/assets/bg.svg');
}

/* 标题 */
.title-group {
  text-align: center;
  margin-top: 10vh;
}

.main-title {
  font-size: 10vw;
  font-weight: 600;
  color: #a07417;
  letter-spacing: 0.4vw;
}

.subtitle {
  font-size: 3.6vw;
  margin-top: 2vh;
  color: #c5a768;
  letter-spacing: 0.2vw;
}

/* 滑动提示 */
.swipe-tip {
  text-align: center;
  font-size: 5vw;
  color: #b68d41;
  animation: fadeInUp 1.2s ease-in-out;
  margin-bottom: 2vh;
  margin-top: 20vh;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.swipe-tip:hover {
  transform: scale(1.05);
}

.arrow {
  font-size: 4vw;
  margin-bottom: 1vh;
  animation: bounce 1.5s infinite;
}

.text {
  margin-bottom: 0.5vh;
  font-size: 5vw;
}

.text-en {
  font-size: 3.4vw;
}

/* 清除数据按钮 */
.clear-btn {
  position: fixed;
  bottom: 12px;
  right: 16px;
  font-size: 14px;
  color: #a07417;
  cursor: pointer;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: transform 0.2s ease;
}
.clear-btn:hover {
  transform: scale(1.05);
}

/* 动画 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 大屏适配 */
@media (min-width: 768px) {
  .main-title {
    font-size: 66px;
  }
  .subtitle {
    font-size: 18px;
  }
  .text {
    font-size: 14px;
  }
  .text-en {
    font-size: 12px;
  }
  .arrow {
    font-size: 20px;
  }
}
</style>
