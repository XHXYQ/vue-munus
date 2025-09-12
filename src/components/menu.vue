<template>
  <div class="menu-page">
    <img class="bg-image" src="@/assets/index2.png" alt="背景图" />
    <!-- <h1 class="title">选择菜系</h1> -->
    <h1 class="title">
      选择菜系
      <div class="title-en">Choose Category</div>

      <div class="back-btn" @click="goHome">
        <el-icon class="back-icon">
          <ArrowLeftBold />
        </el-icon>
        <div class="back-btn-text">
          返回首页
          <div class="back-btn-en">Back</div>
        </div>
      </div>
    </h1>
    <div class="menu-body" :class="loading ? 'menu-body-skeleton' : '' " ref="menuBodyRef">
      <div class="menu-grid">
        <!-- 骨架屏 -->
        <template v-if="loading">
          <div class="menu-card-warper" v-for="item in 8" :key="'skeleton-' + item">
            <div class="menu-card menu-card-skeleton">
              <!-- <div class="card-img-wrapper skeleton-img"></div> -->
              <div class="card-text card-text-skeleton">
                <h2 class="card-title skeleton-title"></h2>
                <p class="card-subtitle skeleton-subtitle"></p>
              </div>
              <img class="card-next skeleton-next" src="@/assets/next.svg" alt="箭头" />
            </div>
          </div>
        </template>
        
        <!-- 实际菜单数据 -->
        <template v-else>
          <div class="menu-card-warper" v-for="item in menuList" :key="item.title" @click="handleMenuClick(item)">
            <div class="menu-card">
              <div class="card-img-wrapper">
                <img :src="item.img" alt="image" class="card-img" loading="lazy" />
              </div>
              <div class="card-text">
                <h2 class="card-title">{{ item.title }}</h2>
                <p class="card-subtitle">{{ item.subtitle }}</p>
              </div>
              <img class="card-next" src="@/assets/next.svg" alt="箭头" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- <div class="back-btn" @click="goHome">返回首页</div> -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, nextTick, watch, watchEffect, onBeforeUnmount } from "vue";
import { listCategory } from '@/api/system/category'
import { ArrowLeftBold } from "@element-plus/icons-vue";
import type { CategoryVO } from '@/api/system/category/types'
import '@/assets/font/fonts.css'

const router = useRouter();

// 滚动位置记忆
const SCROLL_POSITION_KEY = 'menu-page-scroll-position';
const menuBodyRef = ref<HTMLElement | null>(null);

const menuList = ref<Array<{
  title: string
  subtitle: string
  img: string
  code: string
}>>([]);

const loading = ref(true);

const defaultImg = 'https://dummyimage.com/100x100/ccc/fff&text=菜系'

function goHome() {
  router.push("/index");
}

// 截断文本（中文20字，英文30字符）
function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str
}

async function fetchMenuList() {
  try {
    const res = await listCategory();

    // 处理类型问题：res可能是CategoryVO[]或包含rows的对象
    const data = Array.isArray(res) ? res : res?.rows || []
    // ✅ 按照 sort 从小到大排序（字段名需确保后端返回中有）
    data.sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))

    menuList.value = data.map((item: any) => ({
      title: truncate(item.name || '', 20),
      subtitle: truncate(item.nameEn || '', 30),
      img: item.imageUrl || item.imageUrl || defaultImg, // 兼容两种可能的字段名
      code: String(item.id)
    }))

  } catch (err) {
    console.error('获取菜系失败', err)
  } finally {
    loading.value = false
  }
}

const stop = watch(loading, async (newValue, oldValue) => {
   if (!newValue) {
     await nextTick()
      const imgs = document.querySelectorAll('.card-img')
      imgs.forEach((img) => {
        if (img instanceof HTMLImageElement) {
          img.onload = () => {
            img.classList.add('loaded')
          }
        }
      })
      
      // 在数据加载完成后恢复滚动位置
      restoreScrollPosition();
   } 
})

// 处理菜单点击，保存滚动位置
function handleMenuClick(item: any) {
  // 保存当前滚动位置
  if (menuBodyRef.value) {
    const scrollTop = menuBodyRef.value.scrollTop;
    sessionStorage.setItem(SCROLL_POSITION_KEY, scrollTop.toString());
  }
  
  // 跳转到菜单选择页面
  router.push({ 
    name: 'menuChoose', 
    query: { 
      type: item.code, 
      name: item.title, 
      nameEn: item.subtitle 
    } 
  });
}

// 恢复滚动位置
function restoreScrollPosition() {
  const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
  if (savedPosition && menuBodyRef.value) {
    const scrollTop = parseInt(savedPosition, 10);
    menuBodyRef.value.scrollTop = scrollTop;
  }
}

onMounted(() => {
  fetchMenuList();
  sessionStorage.removeItem('menu-choose-page-state');
});

// 页面卸载时清理
onBeforeUnmount(() => {
  // 可选：如果需要在页面卸载时清理存储的位置
  // sessionStorage.removeItem(SCROLL_POSITION_KEY);
});
</script>

<style scoped>
.menu-page {
  width: 100%;
  height: 100vh;
  /* min-height: 100vh; */
  /* overflow-y: auto; */
  /* ✅ 允许垂直滚动 */
  /* scrollbar-width: none; */
  /* ✅ Firefox 隐藏滚动条 */
  /* -ms-overflow-style: none; */
  /* ✅ IE/Edge 隐藏滚动条 */
  /* background: url("@/assets/menu/menubg.svg") no-repeat center center; */
  background-size: cover;
  padding: 3vh 3vw;
  box-sizing: border-box;
  color: #5e4003;
  text-align: center;
  display: flex;
  flex-direction: column;
  user-select: none;
}

.bg-image {
  position: fixed;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}


/* ✅ Chrome / Webkit 隐藏滚动条 */
.menu-page::-webkit-scrollbar {
  display: none;
}

.title {
  font-family: 'Source Han Serif CN Heavy';
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 3vh;
  color: #7b5500;
  letter-spacing: 6px;
  flex: none;
  position: relative;
}

.menu-body {
  flex: 1;
  overflow-y: auto;
  /* ✅ 允许垂直滚动 */
  scrollbar-width: none;
  /* ✅ Firefox 隐藏滚动条 */
  -ms-overflow-style: none;
}

.menu-body-skeleton {
  overflow: hidden;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* gap: 88px; */
  gap: 3vw;
  margin-bottom: 6vh;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.menu-card-warper {
  width: 100%;
  height: 24vh;
  border-radius: 12px;
  overflow: hidden;
  /* 自定义点击高亮颜色 */
  -webkit-tap-highlight-color: transparent;
}

.menu-card {
  display: flex;
  align-items: center;
  /* width: 100%;
  height: 24vh; */
  width: 100%;
  height: 100%;
  background: rgba(64, 44, 13, 0.35);
  border-radius: 12px;
  padding: 0 32px;
  cursor: pointer;
  transition: transform 0.2s ease;
  backdrop-filter: blur(6px);
  /* gap: 28px; */
  overflow: hidden;
}

.menu-card:hover {
  transform: scale(1.04);
}
.menu-card.menu-card-skeleton {
  opacity: 0.5;
}
.menu-card.menu-card-skeleton:hover {
  transform: scale(1);
}

.card-img-wrapper {
  flex: none;
  width: 24vh;
  height: 24vh;
  margin-left: calc(-28vh * 0.6);
  border-radius: 50%;
  overflow: hidden;
  user-select: none;
  /* 禁止选中图片 */
  -webkit-user-drag: none;
  /* 禁止图片被拖动 */
  pointer-events: none;
  /* 可选：禁用鼠标事件（仅适用于纯展示图） */
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.card-img.loaded {
  opacity: 1;
}

.card-text {
  flex: 1;
  overflow: hidden;
  text-align: left;
  margin-left: 10%;
  margin-right: 8px;
}
.card-text-skeleton {
  margin-left: 15%;
}

.card-title,
.card-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  /* max-width: 100%; */
}

.card-title {
  font-family: "Source Han Serif CN Heavy";
  font-size: 36px;
  line-height: 38px;
  font-weight: 900;
  margin-bottom: 0.55em;
  color: #fff;
}

.card-subtitle {
  font-family: "Source Han Serif CN Bold";
  font-size: 24px;
  /* line-height: 2px; */
  font-style: normal;
  font-weight: 700;
  color: #fff;
}

.card-next {
  flex: none;
  font-size: 32px;
  color: #fff;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  flex: none;
  font-weight: 700;
  cursor: pointer;
  background: none;
  /* 移除背景 */
  padding: 0;
  /* 移除内边距 */
  border-radius: 0;
  /* 移除圆角 */
  backdrop-filter: none;
  /* 取消毛玻璃效果 */
  transition: color 0.3s ease;
  /* margin: 3vh auto 0; */
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 20px;
  margin-right: 6px;
  color: #886417;
}

.back-btn-text {
  font-size: 24px;
  font-style: normal;
  color: #886417;
  font-family: "Source Han Serif CN Bold";
}

.back-btn:hover {
  color: #aa8533;
  /* 可选：悬停时字体颜色加深 */
  /* transform: none; */
  box-shadow: none;
}


@media (max-width: 1024px) {
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .card-img-wrapper {
    width: 100px;
    height: 100px;
  }

  .card-title {
    font-size: 32px;
  }

  .card-next {
    margin-right: 6px;
  }

  .card-subtitle {
    font-size: 18px;
  }

  .menu-card {
    padding: 30px 2px;
    /* gap: 20px; */
    gap: 0px;
  }

  .title {
    font-size: 32px;
  }

  .back-btn {
    margin-top: 10vh;
  }
}

/* 响应式处理 */
@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 4vh;
  }

  .card-img-wrapper {
    width: 18vh;
    height: 18vh;
    margin-left: calc(-18vh * 0.6);
  }

  .card-title {
    font-size: 20px;
    line-height: 1.2;
    margin-bottom: 0.4em;

  }

  .card-subtitle {
    font-size: 14px;
    line-height: 1.2;
  }

  .menu-card {
    padding: 16px 16px;
    gap: 16px;
    height: 18vh;
    border-radius: 10px;
  }

  .title {
    font-size: 24px;
    margin-bottom: 32px;
    letter-spacing: 3px;
  }

  .back-btn {
    font-size: 18px;
    margin-top: 24px;
  }
  
  .card-next {
    font-size: 24px;
  }
  
  .title-en {
    font-size: 16px;
    letter-spacing: 0.5px;
  }
  
  .back-btn-en {
    font-size: 14px;
    margin-top: 2px;
  }
}

/* 超小屏幕设备优化 */
@media (max-width: 480px) {
  .menu-grid {
    gap: 16px;
  }

  .card-img-wrapper {
    width: 60px;
    height: 60px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-subtitle {
    font-size: 12px;
  }

  .menu-card {
    padding: 12px;
    gap: 12px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 24px;
    letter-spacing: 2px;
  }

  .back-btn {
    font-size: 16px;
    margin-top: 16px;
  }
}

.title-en {
  font-size: 20px;
  /* color: #fff; */
  /* 浅白色 */
  /* margin-top: 5px; */
  font-weight: 700;
  letter-spacing: 1px;
  font-family: "Source Han Serif CN Bold";
}

.back-btn-en {
  font-size: 16px;
  /* color: #fff; */
  font-weight: 700;
  margin-top: 4px;
  letter-spacing: 0.5px;
  font-family: "Source Han Serif CN Bold";
}

/* 骨架屏样式 */
.skeleton-img {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-title {
  height: 36px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.55em;
}

.skeleton-subtitle {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-next {
  visibility: hidden;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
