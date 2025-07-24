<template>
  <div class="landing-wrapper">
    <!-- 背景图淡入层 -->
    <div class="background" :class="{ 'bg-loaded': bgLoaded }"></div>

    <!-- 页面主体内容 -->
    <div class="landing-page">
      <div class="content-wrapper">
        <!-- Logo 图标 -->
        <div class="logo-container">
          <img src="@/assets/logo.svg" alt="Club Logo" class="logo" />
        </div>

        <!-- 标题区 -->
        <div class="title-group">
          <h1 class="main-title">克来姆国际商务会所</h1>
          <h2 class="subtitle">Clement International Business Club</h2>
        </div>
      </div>

      <!-- 滑动提示 -->
      <div class="swipe-tip" @click="goToMenu">
        <div class="arrow">&#x25B2;</div>
        <div class="text">点击屏幕开始点餐</div>
        <div class="text-en">Click on the screen to start ordering</div>
      </div>

      <!-- 清除数据按钮 -->
      <div class="clear-btn" @click="clearStorage">清除数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const bgLoaded = ref(false)

function goToMenu() {
  router.push('/menu')
}

function clearStorage() {
  localStorage.clear()
  sessionStorage.clear()
  ElMessage.success('已清除本地数据')
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
.landing-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fdf9f1;
  z-index: 0;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.background.bg-loaded {
  background-image: url('@/assets/bg.svg');
  opacity: 1;
}

.landing-page {
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: "Noto Serif SC", serif;
  color: #b68d41;
  padding: 10vh 5vw 6vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-group {
  margin-top: 4vh;
  max-width: 90vw;
  padding: 0 4vw;
}

.main-title {
  font-size: clamp(32px, 10vw, 98px);
  font-style: normal;
  font-weight: 900;
  letter-spacing: 0.15em;
  font-family: "Source Han Serif CN";
  background: linear-gradient(95deg, #DBB24B 2.83%, #B48B32 57.68%, #7D5616 100.1%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: clamp(14px, 3vw, 28px);
  margin-top: 2vh;
  color: #C8A264;
  letter-spacing: 0.3em;
  font-weight: 500;
  font-family: "Source Han Serif CN";
}

.swipe-tip {
  text-align: center;
  font-size: 5vw;
  color: #b68d41;
  animation: fadeInUp 1.2s ease-in-out;
  margin-top: clamp(40px, 15vh, 150px);
  margin-bottom: 2vh;
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
  font-size: clamp(16px, 3vw, 24px);
  font-weight: 700;
  font-family: "Source Han Serif CN";
  color: #C8A264;
  letter-spacing: 0.2em;
}

.text-en {
  font-size: clamp(12px, 2.2vw, 16px);
  font-weight: 700;
  font-family: "Source Han Serif CN";
  color: #C8A264;
  letter-spacing: 0.15em;
}

.clear-btn {
  position: fixed;
  bottom: 2vh;
  right: 2vw;
  font-size: clamp(12px, 2vw, 16px);
  color: #886417;
  cursor: pointer;
  padding: 6px 14px;
  z-index: 1000;
  transition: transform 0.2s ease;
}
.clear-btn:hover {
  transform: scale(1.05);
}

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
</style>
