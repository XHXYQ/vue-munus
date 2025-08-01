<template>
  <div class="menu-page">
    <img class="bg-image" src="@/assets/menu/menubg.svg" alt="背景图" />
    <!-- <h1 class="title">选择菜系</h1> -->
    <h1 class="title">
  选择菜系
  <div class="title-en">Choose Category</div>
</h1>

    <div class="menu-grid">
      <div
        class="menu-card"
        v-for="item in menuList"
        :key="item.title"
        @click="router.push({ name: 'menuChoose', query: { type: item.code, name: item.title, nameEn: item.subtitle } })"
      >
        <div class="card-img-wrapper">
          <img
            :src="item.img"
            alt="image"
            class="card-img"
            loading="lazy"
          />
        </div>
        <div class="card-text">
          <h2 class="card-title">{{ item.title }}</h2>
          <p class="card-subtitle">{{ item.subtitle }}</p>
        </div>
        <div class="card-arrow">❯</div>
      </div>
    </div>

    <!-- <div class="back-btn" @click="goHome">返回首页</div> -->
    <div class="back-btn" @click="goHome">
  返回首页
  <div class="back-btn-en">Back to Home</div>
</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import { listCategory } from '@/api/system/category'
import type { CategoryVO } from '@/api/system/category/types'

const router = useRouter();

const menuList = ref<Array<{
  title: string
  subtitle: string
  img: string
  code: string
}>>([])

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
    const res = await listCategory()
    console.log("listCategory response:", res)
    
    // 处理类型问题：res可能是CategoryVO[]或包含rows的对象
    const data = Array.isArray(res) ? res : res?.rows || []
    
    menuList.value = data.map((item: any) => ({
      title: truncate(item.name || '', 20),
      subtitle: truncate(item.nameEn || '', 30),
      img: item.imageUrl || item.imageUrl || defaultImg, // 兼容两种可能的字段名
      code: String(item.id)
    }))

    await nextTick()
    const imgs = document.querySelectorAll('.card-img')
    imgs.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.onload = () => {
          img.classList.add('loaded')
        }
      }
    })
  } catch (err) {
    console.error('获取菜系失败', err)
  }
}

onMounted(() => {
  fetchMenuList()
})
</script>

<style scoped>

.menu-page {
  width: 100%;
  min-height: 100vh;
  overflow-y: auto; /* ✅ 允许垂直滚动 */
  scrollbar-width: none; /* ✅ Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* ✅ IE/Edge 隐藏滚动条 */
  /* background: url("@/assets/menu/menubg.svg") no-repeat center center; */
  background-size: cover;
  padding: 8vh 6vw;
  box-sizing: border-box;
  font-family: "Source Han Serif CN";
  color: #5e4003;
  text-align: center;
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
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 6vh;
  color: #7b5500;
  letter-spacing: 6px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 88px;
  margin-bottom: 6vh;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.menu-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  width: 100%;
  max-width: 600px;
  background: rgba(64, 44, 13, 0.35);
  border-radius: 20px;
  padding: 28px 32px;
  cursor: pointer;
  transition: transform 0.2s ease;
  backdrop-filter: blur(6px);
  gap: 28px;
}

.menu-card:hover {
  transform: scale(1.04);
}

.card-img-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  user-select: none;        /* 禁止选中图片 */
  -webkit-user-drag: none;  /* 禁止图片被拖动 */
  pointer-events: none;     /* 可选：禁用鼠标事件（仅适用于纯展示图） */
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
  text-align: left;
}

.card-title,
.card-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

.card-title {
  font-size: 44px;
  font-weight: 900;
  margin-bottom: 8px;
  color: #fff;
}

.card-subtitle {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  color: #fff;
}

.card-arrow {
  font-size: 32px;
  color: #fff;
}

.back-btn {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  color: #886417;
  cursor: pointer;
  background: none; /* 移除背景 */
  padding: 0; /* 移除内边距 */
  border-radius: 0; /* 移除圆角 */
  backdrop-filter: none; /* 取消毛玻璃效果 */
  transition: color 0.3s ease;
  display: inline-block;
  margin: 4vh auto 0;
}

.back-btn:hover {
  color: #aa8533; /* 可选：悬停时字体颜色加深 */
  transform: none;
  box-shadow: none;
}


@media (max-width: 1024px) {
  .card-img-wrapper {
    width: 100px;
    height: 100px;
  }

  .card-title {
    font-size: 32px;
  }

  .card-arrow{
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
  .back-btn{
    margin-top: 10vh;
  }
}

/* 响应式处理 */
@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .card-img-wrapper {
    width: 72px;
    height: 72px;
  }

  .card-title {
    font-size: 20px;
    line-height: 1.2;
  }

  .card-subtitle {
    font-size: 14px;
    line-height: 1.2;
  }

  .menu-card {
    padding: 16px 16px;
    gap: 16px;
  }

  .title {
    font-size: 24px;
    margin-bottom: 32px;
  }

  .back-btn {
    font-size: 18px;
    margin-top: 24px;
  }
}

.title-en {
  font-size: 20px;
  color: #fff; /* 浅白色 */
  margin-top: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: "Source Han Serif CN";
}

.back-btn-en {
  font-size: 16px;
  color: #fff;
  font-weight: 700;
  margin-top: 4px;
  letter-spacing: 0.5px;
  font-family: "Source Han Serif CN";
}


</style>
