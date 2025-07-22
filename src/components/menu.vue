<template>
  <div class="menu-page">
    <h1 class="title">选择菜系</h1>

    <div class="menu-grid">
      <div
        class="menu-card"
        v-for="item in menuList"
        :key="item.title"
        @click="router.push({ name: 'menuChoose', query: { type: item.code } })"
      >
        <div class="card-img-wrapper">
          <img :src="item.img" alt="image" class="card-img" />
        </div>
        <div class="card-text">
          <h2 class="card-title">{{ item.title }}</h2>
          <p class="card-subtitle">{{ item.subtitle }}</p>
        </div>
        <div class="card-arrow">❯</div>
      </div>
    </div>

    <div class="back-btn" @click="goHome">返回首页</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { listCategory } from '@/api/system/category'
import type { CategoryVO } from '@/api/system/category/types'

const router = useRouter();

// 页面渲染所需结构
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

async function fetchMenuList() {
  try {
    const res = await listCategory()
    console.log("⚠️ listCategory 返回值是：", res)
    
    // ✅ 从 res.rows 中提取数据，如果 res 或 res.rows 为空，则默认为空数组
    const rows = res?.rows || []

    menuList.value = rows.map((item) => ({
      title: item.name,          // 使用 item.name 作为 title
      subtitle: item.nameEn,    // 使用 item.nameEn 作为 subtitle
      img: item.image || defaultImg,  // 使用 item.imageUrl 或默认图片
      code: String(item.id)      // 使用 item.id 作为 code（转换为字符串）
    }))
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
  min-height: 100vh;
  width: 100vw;
  background: url("@/assets/menu/menubg.svg") no-repeat center center;
  background-size: cover;
  padding: 8vh 6vw;
  box-sizing: border-box;
  font-family: "Noto Serif SC", serif;
  color: #5e4003;
  text-align: center;
}

.title {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 6vh;
  color: #7b5500;
  letter-spacing: 6px;
}

/* .menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 48px;
  margin-bottom: 6vh;
  justify-content: center;
} */
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
  background: rgba(177, 144, 101, 0.3);
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
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-text {
  text-align: left;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #3c2a00;
}

.card-subtitle {
  font-size: 18px;
  color: #9b7e4e;
}

.card-arrow {
  font-size: 26px;
  color: #b68d41;
}

.back-btn {
  font-size: 18px;
  /* color: #a07417; */
  cursor: pointer;
  margin-top: 4vh;
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .card-img-wrapper {
    width: 80px;
    height: 80px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-subtitle {
    font-size: 14px;
  }

  .menu-card {
    padding: 16px 20px;
  }

  .title {
    font-size: 24px;
  }
}

.back-btn {
  font-size: 18px;
  color: #a07417;
  cursor: pointer;

  background: rgba(255, 255, 255, 0.15);
  padding: 10px 24px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  /* ✅ 关键居中属性 */
  display: inline-block;
  margin: 4vh auto 0;
}


.back-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>
