<template>
  <div class="landing-wrapper" @click="goToMenu">
    <!-- 背景图淡入层 -->
    <div class="background" :class="{ 'bg-loaded': bgLoaded }"></div>

    <!-- 页面主体内容 -->
    <div class="landing-page">
      <div class="content-wrapper">
        <!-- Logo 图标 -->
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Club Logo" class="logo" />
        </div>

        <!-- 标题区 -->
        <div class="title-group" ref="titleGroupRef">
          <h1 class="main-title" ref="mainTitleRef" :style="mainTitleStyle">
            克来姆国际商务会所
          </h1>
          <h2 class="subtitle">Clement International Business Club</h2>
        </div>
      </div>

      <!-- 滑动提示 -->
      <div class="swipe-tip">
        <div class="arrow">&#x25B2;</div>
        <div class="text">点击屏幕开始点餐</div>
        <div class="text-en">Click on the screen to start ordering</div>
      </div>

      <!-- 清除数据按钮 -->
      <div class="clear-btn" @click.stop="clearStorage">清除数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const bgLoaded = ref(false)

const titleGroupRef = ref(null)
const mainTitleRef = ref(null)
/** 动态注入的标题样式（仅字号与字距），其它视觉完全沿用你的样式 */
const mainTitleStyle = ref({})

function goToMenu() {
  router.push('/menu')
}

async function clearStorage() {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有本地数据吗？此操作不可恢复。',
      '确认清除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'confirm-button',
        cancelButtonClass: 'cancel-button'
      }
    )
    localStorage.clear()
    sessionStorage.clear()
    ElMessage.success('已清除本地数据')
  } catch {
    // 用户取消操作，不做任何处理
  }
}

/** 让主标题在任意屏宽“始终一行”地自适应 */
function fitTitle() {
  const group = titleGroupRef.value
  const title = mainTitleRef.value
  if (!group || !title) return

  // 1) 先给一个“基于视口”的初始字号（偏保守，横屏时再降一点）
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  const landscape = vw > vh

  // 基础字号：在你原来 10vw 的基础上更保守一些，避免平板横屏过大
  let base = Math.min(98, Math.max(32, vw * 0.08)) // 8vw, clamp 32~98
  if (landscape) base *= 0.88 // 横屏再小一点，避免换行

  // 2) 试排：如果超出容器宽度则逐步减小字号与字距
  title.style.fontSize = base + 'px'
  title.style.letterSpacing = '0.15em' // 你的默认字距

  // 可用宽度（考虑容器内边距，稍微预留 1% 宽度余量）
  const containerWidth = group.clientWidth * 0.99

  // 每次递减 1px，直到不溢出或达到下限
  const minFont = 24 // 极限下限，防止无限减小
  let cur = base
  let letter = 0.15 // em
  const minLetter = 0.06 // 缩到一定程度不再更小，保持可读性

  // 先测一次
  const overflow = () => title.scrollWidth > containerWidth

  // 如果太宽就往下调
  while (overflow() && cur > minFont) {
    cur -= 1
    title.style.fontSize = cur + 'px'
    // 字距也按比例收一点（大屏大字距，小屏小字距）
    letter = Math.max(minLetter, 0.15 * (cur / 98))
    title.style.letterSpacing = `${letter}em`
  }

  // 把结果存到响应式，避免内联 style 与你的类冲突
  mainTitleStyle.value = {
    fontSize: `${cur}px`,
    letterSpacing: `${letter}em`,
  }
}

function handleResize() {
  // 下一帧再 fit，避免某些设备上获取到的 clientWidth 还未更新
  requestAnimationFrame(() => {
    fitTitle()
  })
}

onMounted(async () => {
  const img = new Image()
  img.src = new URL('@/assets/index.png', import.meta.url).href
  img.onload = () => { bgLoaded.value = true }

  await nextTick()
  fitTitle()
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)
  console.log('index.vue mounted')
  sessionStorage.removeItem('menu-page-scroll-position');
  sessionStorage.removeItem('menu-choose-page-state');
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleResize)
})
</script>

<style scoped>
/* 保留你的样式，只做“兼容补丁” */

.landing-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  user-select: none;
}
/* 移动端高度单位补丁，避免地址栏导致的跳动 */
@supports (height: 100dvh) {
  .landing-wrapper { height: 100dvh; }
}

.background {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #fdf9f1;
  z-index: 0;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.background.bg-loaded {
  background-image: url('@/assets/index1.png');
  opacity: 1;
}

.landing-page {
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: "Noto Serif SC", serif;
  color: #b68d41;
  padding: 10vh 5vw 6vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}
@supports (height: 100dvh) {
  .landing-page { height: 100dvh; }
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

/* ==== 这里保持你的视觉，但禁止换行，交给 JS 去缩放字号 ==== */
.main-title {
  font-size: clamp(32px, 10vw, 98px);
  font-style: normal;
  font-weight: 900;
  letter-spacing: 0.15em;
  white-space: nowrap;               /* 关键：不换行 */
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

.logo {
  width: clamp(72px, 18vw, 180px);
  height: auto;
}

.swipe-tip {
  flex: 1;
  text-align: center;
  font-size: 5vw;
  color: #b68d41;
  animation: fadeInUp 1.2s ease-in-out;
  /* margin-top: clamp(40px, 15vh, 150px); */
  margin-bottom: 2vh;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: end;
}
@media (hover: hover) and (pointer: fine) {
  .swipe-tip:hover { transform: scale(1.05); }
}

.arrow {
  font-size: clamp(16px, 4vw, 28px);
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
  bottom: max(2vh, env(safe-area-inset-bottom));
  right: calc(2vw + env(safe-area-inset-right));
  font-size: clamp(12px, 2vw, 16px);
  color: #886417;
  cursor: pointer;
  padding: 6px 14px;
  z-index: 1000;
  transition: transform 0.2s ease;
}
@media (hover: hover) and (pointer: fine) {
  .clear-btn:hover { transform: scale(1.05); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) and (min-width: 800px) {
  .main-title {
    font-size: 8vw;
    letter-spacing: 0.05em;
  }
  .subtitle {
    font-size: 2vw;
    letter-spacing: 0.3em;
  }
}

/* 矮屏仅减一点内边距，防止拥挤；不会改变你的布局结构 */
@media (max-height: 600px) {
  .landing-page { padding: 6vh 5vw 4vh; }
  .title-group { margin-top: 2vh; }
  /* .swipe-tip { margin-top: clamp(24px, 8vh, 120px); } */
}

/* 1) 整页高度仍然保留（lvh 更稳，没就用 dvh，再兜底 100vh） */
.landing-wrapper,
.landing-page {
  height: 100vh; /* 兜底 */
}
@supports (height: 100lvh) {
  .landing-wrapper, .landing-page { height: 100lvh; }
}
@supports (height: 100dvh) {
  .landing-wrapper, .landing-page { height: 100dvh; }
}

/* 2) 核心：把所有“竖向间距”的 vh 改成 clamp(px, vw, px) —— 不再抖 */
.landing-page {
  /* 原来：padding: 10vh 5vw 6vh; */
  padding:
    clamp(24px, 8vw, 120px)   /* 顶部 */
    5vw
    clamp(16px, 6vw, 72px);   /* 底部 */
}

.title-group {
  /* 原来：margin-top: 4vh; */
  margin-top: clamp(12px, 4vw, 40px);
}

.swipe-tip {
  /* 原来：margin-top: clamp(40px, 15vh, 150px); margin-bottom: 2vh; */
  /* margin-top: clamp(40px, 10vw, 150px); */
  margin-bottom: clamp(8px, 2.5vw, 24px);
}

/* 3) 小高屏（很矮的横屏）下再紧一点（可选） */
@media (max-height: 600px) {
  .landing-page {
    padding:
      clamp(16px, 6vw, 64px)
      5vw
      clamp(12px, 4vw, 48px);
  }
  .title-group { margin-top: clamp(8px, 3vw, 24px); }
  /* .swipe-tip  { margin-top: clamp(24px, 8vw, 120px); } */
}

.background { transition: opacity 0.8s ease-in-out; }

</style>
