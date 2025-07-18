<template>
    <div class="menu-choose-page">
      <!-- 左侧分类 -->
      <aside class="category-sidebar">
        <div class="back" @click="router.back()">← 返回选择菜系</div>
        <div
          v-for="(item, index) in categories"
          :key="item.name"
          :class="['category-item', { active: index === activeIndex }]"
          @click="selectCategory(index)"
        >
          <div class="name-cn">{{ item.name }}</div>
          <div class="name-en">{{ item.en }}</div>
          <div class="badge" v-if="item.count > 0">{{ item.count }}</div>
        </div>
      </aside>
  
      <!-- 右侧菜单列表 -->
      <main class="menu-content">
        <h1 class="menu-title">{{ currentCategory.name }}</h1>
  
        <div class="menu-section" v-for="group in currentCategory.groups" :key="group.name">
          <h2 class="group-title">
            {{ group.name }}
            <span class="group-en">{{ group.en }}</span>
          </h2>
  
          <div class="menu-item" v-for="dish in group.items" :key="dish.name">
            <img :src="dish.img" class="dish-img" />
            <div class="dish-info">
              <div class="dish-name">{{ dish.name }}</div>
              <div class="dish-en">{{ dish.en }}</div>
            </div>
            <div class="quantity-control">
              <button @click="decrease(dish)">－</button>
              <span>{{ dish.count }}</span>
              <button @click="increase(dish)">＋</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  
  const router = useRouter()
  const route = useRoute()
  const activeIndex = ref(2)

  const type = computed(() => route.query.type || 'chinese')

  // 根据 type 加载对应分类数据
const categoryData = computed(() => {
  switch (type.value) {
    case 'chinese': return chineseData
    case 'western': return westernData
    case 'beverages': return beverageData
    case 'snacks': return snacksData
    default: return []
  }
})
  
  const categories = ref([
    { name: '精选套餐', en: 'Simple meal', count: 0, groups: [] },
    { name: '家常臻选', en: 'Home-style stir-fry', count: 0, groups: [] },
    {
      name: '特色火锅',
      en: 'Hot pot',
      count: 3,
      groups: [
        {
          name: '肉韵醇香',
          en: 'Meat',
          items: [
            { name: '鸡肉', en: 'Chicken', img: 'https://dummyimage.com/100x100/ddd/000&text=鸡肉', count: 1 },
            { name: '牛肉', en: 'Beef', img: 'https://dummyimage.com/100x100/ccc/000&text=牛肉', count: 0 },
            { name: '牛肉丸', en: 'Stewed Beef Meatballs', img: 'https://dummyimage.com/100x100/eee/000&text=丸', count: 0 }
          ]
        }
      ]
    },
    { name: '主食荟萃', en: 'Staple food', count: 0, groups: [] }
  ])
  
  const currentCategory = ref(categories.value[activeIndex.value])
  
  function selectCategory(index) {
    activeIndex.value = index
    currentCategory.value = categories.value[index]
  }
  
  function increase(dish) {
    dish.count++
    categories.value[activeIndex.value].count++
  }
  
  function decrease(dish) {
    if (dish.count > 0) {
      dish.count--
      categories.value[activeIndex.value].count--
    }
  }
  </script>
  
  <style scoped>
  .menu-choose-page {
    display: flex;
    height: 100vh;
    background: url('@/assets/menu/menubg.svg') no-repeat center center;
    background-size: cover;
    font-family: 'Noto Serif SC', serif;
    color: #5e4003;
  }
  
  /* 左侧分类栏 */
  .category-sidebar {
    width: 220px;
    background: rgba(255, 255, 255, 0.2);
    padding: 24px 16px;
    box-sizing: border-box;
  }
  
  .back {
    font-size: 16px;
    margin-bottom: 24px;
    color: #a07417;
    cursor: pointer;
  }
  
  .category-item {
    padding: 12px 16px;
    margin-bottom: 12px;
    border-radius: 12px;
    background: transparent;
    transition: background 0.2s;
    position: relative;
    cursor: pointer;
  }
  
  .category-item.active {
    background: rgba(177, 144, 101, 0.4);
  }
  
  .name-cn {
    font-size: 18px;
    font-weight: bold;
  }
  
  .name-en {
    font-size: 14px;
    color: #9b7e4e;
  }
  
  .badge {
    position: absolute;
    top: 8px;
    right: 12px;
    background: #d64040;
    color: white;
    font-size: 12px;
    border-radius: 999px;
    padding: 2px 6px;
  }
  
  /* 右侧菜单内容 */
  .menu-content {
    flex: 1;
    padding: 24px 32px;
    overflow-y: auto;
  }
  
  .menu-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #7b5500;
    letter-spacing: 4px;
  }
  
  .group-title {
    font-size: 20px;
    font-weight: 600;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #5e4003;
  }
  
  .group-en {
    font-size: 14px;
    color: #9b7e4e;
    margin-left: 8px;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px dashed #c7b294;
  }
  
  .dish-img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 16px;
  }
  
  .dish-info {
    flex: 1;
    text-align: left;
  }
  
  .dish-name {
    font-size: 18px;
    font-weight: bold;
  }
  
  .dish-en {
    font-size: 14px;
    color: #a07c49;
    margin-top: 4px;
  }
  
  .quantity-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .quantity-control button {
    width: 28px;
    height: 28px;
    font-size: 16px;
    background: none;
    border: 1px solid #b68d41;
    color: #b68d41;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>
  