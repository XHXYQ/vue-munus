<template>
  <div class="menu-page">
    <h1 class="title">选择菜系</h1>

    <div class="menu-grid">
      <div class="menu-card" v-for="item in menuList" :key="item.title" @click="router.push(item.link)">
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

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/index')
}

const menuList = [
  {
    title: '中式佳肴',
    subtitle: 'Chinese cuisine',
    img: 'https://dummyimage.com/100x100/ccc/fff&text=中餐',
    link: '/menu/chinese',
  },
  {
    title: '西式珍味',
    subtitle: 'Western cuisine',
    img: 'https://dummyimage.com/100x100/ccc/fff&text=西餐',
    link: '/menu/western',
  },
  {
    title: '特调饮品',
    subtitle: 'Beverages',
    img: 'https://dummyimage.com/100x100/ccc/fff&text=饮品',
    link: '/menu/beverages',
  },
  {
    title: '精致小点',
    subtitle: 'Snacks',
    img: 'https://dummyimage.com/100x100/ccc/fff&text=小点',
    link: '/menu/snacks',
  },
]
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  width: 100vw;
  background: url('@/assets/menu/menubg.svg') no-repeat center center;
  background-size: cover;
  padding: 8vh 6vw;
  box-sizing: border-box;
  font-family: 'Noto Serif SC', serif;
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

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 48px;
  margin-bottom: 6vh;
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
  color: #a07417;
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
  margin-top: 4vh;

  background: rgba(255, 255, 255, 0.15);
  padding: 10px 24px;
  border-radius: 999px;
  display: inline-block;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(4px);
}

.back-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}


</style>
