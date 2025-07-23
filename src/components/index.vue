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
        <div class="text-en">Swipe the screen to start ordering</div>
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
  overflow: hidden;
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
}

.background.bg-loaded {
  background-image: url('@/assets/bg.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 1;
}

.landing-page {
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: "Noto Serif SC", serif;
  color: #b68d41;
  padding: 10vh 5vw 6vh;
  box-sizing: border-box;
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

/* ✅ 用于居中内容的包裹器 */
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 标题 */
.title-group {
  margin-top: 4vh;
  max-width: 90vw;
  padding: 0 4vw;
}


.main-title {
  font-size: 98px;
  font-style: normal;
  font-weight: 900;
  color: #886417;
  letter-spacing: 14.7px;
  font-family: "Source Han Serif CN";
  background: linear-gradient(95deg, #DBB24B 2.83%, #B48B32 57.68%, #7D5616 100.1%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 28px;
  margin-top: 2vh;
  color: #C8A264;
  letter-spacing: 7.84px;
  font-weight: 500;
  font-style: normal;
  line-height: normal;
  font-family: "Source Han Serif CN";
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
  font-size: 24px;
  font-weight: 700;
  font-style: normal;
  font-family: "Source Han Serif CN";
  color: #C8A264;
  letter-spacing: 3.6px;
}

.text-en {
  font-size: 16px;
  font-weight: 700;
  font-style: normal;
  line-height: 20px;
  font-family: "Source Han Serif CN";
  color: #C8A264;
  letter-spacing: 2.4px;
}

/* 清除按钮 */
.clear-btn {
  position: fixed;
  bottom: 12px;
  right: 16px;
  font-size: 14px;
  color: #886417;
  cursor: pointer;
  padding: 6px 14px;
  /* background: rgba(255, 255, 255, 0.3); */
  /* border-radius: 999px;
  backdrop-filter: blur(4px); */
  /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); */
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

