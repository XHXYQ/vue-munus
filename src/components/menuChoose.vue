<template>
  <div class="menu-choose-page">
    <!-- 左侧分类 -->
    <aside class="category-sidebar">
      <!-- <div class="back" @click="router.push('/menu')">
        <el-icon class="back-icon"><ArrowLeftBold /></el-icon>
        返回选择菜系
      </div> -->
      <div class="back" @click="router.push('/menu')">
        <el-icon class="back-icon"><ArrowLeftBold /></el-icon>
        <div class="back-text">
          <div class="zh">返回选择菜系</div>
          <div class="en">Back</div>
        </div>
      </div>

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
      <!-- 标题在外部，居中显示 -->
      <!-- <h1 class="menu-title">{{ categoryName }}</h1> -->
      <h1 class="menu-title">
        <div class="zh">{{ categoryName }}</div>
        <div class="en">{{ categoryNameEn }}</div>
      </h1>

      <!-- 内部遮罩框 -->
      <div class="menu-overlay-wrapper">
        <div class="menu-wrapper">
          <div
            class="menu-section"
            v-for="group in currentCategory.groups"
            :key="group.name"
          >
            <h2 class="group-title">
              <div class="group-cn">{{ group.name }}</div>
              <div class="group-en">{{ group.en }}</div>
            </h2>

            <div class="menu-item" v-for="dish in group.items" :key="dish.name">
              <img :src="dish.img" class="dish-img" />
              <div class="dish-info">
                <div class="dish-name">{{ dish.name }}</div>
                <div class="dish-en">{{ dish.en }}</div>
              </div>
              <div class="quantity-control">
                <template v-if="dish.count > 0">
                  <button @click="decrease(dish)">－</button>
                  <span>{{ dish.count }}</span>
                  <button @click="increase(dish)">＋</button>
                </template>
                <template v-else>
                  <button @click="increase(dish)">＋</button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部悬浮购物车图标（购物车打开时隐藏） -->
    <div v-if="!cartVisible" class="cart-fab" @click="toggleCart">
      <img src="@/assets/menu/shopCar2.svg" class="cart-icon" />
      <div class="cart-badge" v-if="totalCount > 0">{{ totalCount }}</div>
    </div>

    <!-- 遮罩层（点击空白关闭购物车） -->
    <div v-if="cartVisible" class="cart-mask" @click="toggleCart" />
    <!-- 右侧购物车面板 -->
    <div class="cart-drawer" v-if="cartVisible" @click.stop>
      <div class="cart-header">
        <div class="cart-selected">
          <div class="zh">已选择({{ totalCount }})</div>
          <div class="en">Selected</div>
        </div>

        <div class="cart-clear" @click="clearCart">
          <img src="@/assets/menu/TrashSimple.svg" class="trash-icon" />
          <div class="clear-text">
            <div class="zh">清空列表</div>
            <div class="en">Clear</div>
          </div>
        </div>
      </div>

      <div class="cart-list">
        <template v-if="selectedItems.length > 0">
          <div class="cart-item" v-for="dish in selectedItems" :key="dish.name">
            <img :src="dish.img" />
            <div class="cart-info">
              <div class="cart-name">{{ dish.name }}</div>
              <div class="cart-en">{{ dish.en }}</div>
            </div>
            <div class="quantity-control">
              <button @click="decrease(dish)">－</button>
              <span>{{ dish.count }}</span>
              <button @click="increase(dish)">＋</button>
            </div>
          </div>
        </template>

        <div v-else class="cart-empty-tip">暂无菜品，请添加</div>
      </div>

      <!-- <div class="cart-actions">
        <button @click="toggleCart">返回</button>
        <button class="confirm-btn" @click="confirmMenu">确认</button>
      </div> -->
      <div class="cart-actions">
        <button @click="toggleCart">
          <div class="zh">返回</div>
          <div class="en">Back</div>
        </button>
        <button class="confirm-btn" @click="confirmMenu">
          <div class="zh">确认</div>
          <div class="en">Confirm</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { listDishGroup, groupWithDishes } from "@/api/system/dishGroup";
import { listDish } from "@/api/system/dish";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const activeIndex = ref(0);

const type = computed(() => route.query.type || "chinese");

//接收菜系名
const categoryName = computed(() =>
  decodeURIComponent(route.query.name || "菜系")
);

const categoryNameEn = computed(() =>
  decodeURIComponent(route.query.nameEn || "Cuisine")
);

// 根据 type 加载对应分类数据
const categoryData = computed(() => {
  switch (type.value) {
    case "chinese":
      return chineseData;
    case "western":
      return westernData;
    case "beverages":
      return beverageData;
    case "snacks":
      return snacksData;
    default:
      return [];
  }
});

const categories = ref([]);

const currentCategory = computed(
  () => categories.value[activeIndex.value] || { name: "", groups: [] }
);

async function selectCategory(index) {
  activeIndex.value = index;
  await fetchDishesByCategory(categories.value[index]);
}

const cartVisible = ref(false);
function toggleCart() {
  cartVisible.value = !cartVisible.value;
}

function updateAllCounts() {
  categories.value.forEach((cat) => {
    cat.count = cat.groups.reduce(
      (total, g) => total + g.items?.reduce((sum, item) => sum + item.count, 0),
      0
    );
  });
}
const totalCount = computed(() =>
  categories.value.reduce((sum, cat) => sum + cat.count, 0)
);

// 获取所有已选择的商品
const selectedItems = computed(() => {
  const items = [];
  categories.value.forEach((cat) =>
    cat.groups.forEach((group) =>
      group.items?.forEach((dish) => {
        if (dish.count > 0) items.push(dish);
      })
    )
  );
  return items;
});

function confirmMenu() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning("请先选择菜品再确认");
    return;
  }

  sessionStorage.setItem("cachedDishes", JSON.stringify(selectedItems.value));
  router.push({
    path: "/confirmMenu",
    query: {
      items: JSON.stringify(selectedItems.value),
    },
  });
}

async function fetchDishGroups() {
  try {
    const rawType = route.query.type;
    const categoryMap = {
      chinese: 1,
      western: 2,
      beverages: 3,
      snacks: 4,
    };
    const rootCategoryId = categoryMap[rawType] || Number(rawType) || 1;

    const res = await groupWithDishes({ categoryId: rootCategoryId });

    if (!res || typeof res !== "object") {
      console.error("❌ res 是 undefined 或非对象", res);
      throw new Error("接口响应格式不对");
    }

    const rows = res.data; // ✅ 关键点在这里！
    if (!Array.isArray(rows)) {
      console.error("❌ rows 不是数组", res);
      throw new Error("接口返回格式不正确");
    }

    categories.value = rows.map((group) => ({
      id: group.groupId,
      name: group.groupName,
      en: group.groupEn,
      count: 0,
      groups: [
        {
          name: group.groupName,
          en: group.groupEn,
          items: (group.items || []).map((dish) => ({
            ...dish,
            en: dish.nameEn,
            img: dish.imageUrl || dish.image || "",
            count: 0,
          })),
        },
      ],
    }));

    activeIndex.value = 0;
  } catch (err) {
    console.error("加载分组菜品失败", err);
  }
}

const CART_KEY = computed(() => `cachedDishes_${type.value}`);

function saveCartToCache() {
  sessionStorage.setItem(CART_KEY.value, JSON.stringify(selectedItems.value));
}

function increase(dish) {
  dish.count++;
  categories.value[activeIndex.value].count++;
  saveCartToCache();
}

function decrease(dish) {
  if (dish.count > 0) {
    dish.count--;
    categories.value[activeIndex.value].count--;
    saveCartToCache();
  }
}

function clearCart() {
  categories.value = categories.value.map((cat) => {
    const updatedGroups = cat.groups.map((group) => {
      const updatedItems = group.items.map((item) => ({
        ...item,
        count: 0,
      }));
      return { ...group, items: updatedItems };
    });

    return {
      ...cat,
      groups: updatedGroups,
      count: 0,
    };
  });

  sessionStorage.removeItem(CART_KEY.value);
}

onMounted(async () => {
  await fetchDishGroups(); // 加载菜单项
  restoreCartFromCache();

  // ✅ 确保 type 已准备好再读取缓存
  const cached = sessionStorage.getItem(`cachedDishes_${type.value}`);
  if (cached) {
    const savedItems = JSON.parse(cached);
    savedItems.forEach((savedDish) => {
      categories.value.forEach((cat) => {
        cat.groups.forEach((group) => {
          group.items?.forEach((dish) => {
            if (dish.name === savedDish.name) {
              dish.count = savedDish.count;
            }
          });
        });
      });
    });

    updateAllCounts();
    console.log("✅ 购物车恢复成功:", savedItems);
  }
});

function restoreCartFromCache() {
  const cached = sessionStorage.getItem(CART_KEY.value);
  if (!cached) return;

  const savedItems = JSON.parse(cached);
  savedItems.forEach((savedDish) => {
    categories.value.forEach((cat) => {
      cat.groups.forEach((group) => {
        group.items?.forEach((dish) => {
          if (dish.name === savedDish.name) {
            dish.count = savedDish.count;
          }
        });
      });
    });
  });

  updateAllCounts();
  console.log("✅ 购物车数据已恢复", savedItems);
}

watchEffect(() => {
  if (categories.value.length > 0) {
    const cached = sessionStorage.getItem(CART_KEY.value);
    if (cached) {
      const savedItems = JSON.parse(cached);
      savedItems.forEach((savedDish) => {
        categories.value.forEach((cat) => {
          cat.groups.forEach((group) => {
            group.items?.forEach((dish) => {
              if (dish.name === savedDish.name) {
                dish.count = savedDish.count;
              }
            });
          });
        });
      });

      updateAllCounts();
      console.log("✅ 购物车已恢复", savedItems);
    }
  }
});
</script>

<style scoped>
.menu-choose-page {
  display: flex;
  background: url("@/assets/index2.png") no-repeat center center;
  background-size: cover;
  font-family: "Source Han Serif CN";
  color: #5e4003;
  display: flex;
  height: 100vh;
  overflow: auto;
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}

/* 左侧分类栏 */
.category-sidebar {
  width: 220px;
  background: rgba(255, 255, 255, 0.2);
  padding: 24px 16px;
  box-sizing: border-box;
}

.back {
  font-size: 22px;
  font-style: normal;
  margin-bottom: 24px;
  color: #886417;
  cursor: pointer;
  display: flex;
  line-height: 28px;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  letter-spacing: 3.6px;
}

.back-icon {
  font-size: 20px;
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
  background: rgba(64, 44, 13, 0.35);
  color: white;
}

.category-item.active .name-cn {
  color: #fff;
}

.category-item.active .name-en {
  color: #fff;
}

.name-cn {
  font-size: 28px;
  font-style: normal;
  line-height: 32px;
  font-weight: 700;
  color: #886417;
  margin-bottom: 5px;
}

.name-en {
  font-size: 14px;
  color: #886417;
}

.badge {
  position: absolute;
  top: 28px;
  right: 12px;
  background: #d64040;
  color: white;
  font-size: 12px;
  border-radius: 999px;
  padding: 2px 8px;
}

.menu-content {
  flex: 1;
  padding: 24px 16px;
  position: relative;
  height: 100%; /* ✅ 新增 */
  max-height: 100vh; /* ✅ 限制最大高度 */
}

.menu-title {
  font-size: 40px;
  font-weight: 900;
  font-style: normal;
  line-height: 44px;
  margin: 0 auto 16px;
  color: #886417;
  text-align: center;
  letter-spacing: 6px;
}

/* 包裹商品列表的浅棕色背景区域 */
/* .menu-overlay-wrapper {
  background: rgba(102, 66, 33, 0.25);
  border-radius: 12px;
  padding: 24px 32px;
  width: 96%;
  height: 92%;
  margin-left: 0;
  box-sizing: border-box;
  border-radius: 8px;
  background: rgba(64, 44, 13, 0.35);
  backdrop-filter: blur(10px);
} */
.menu-overlay-wrapper {
  background: rgba(64, 44, 13, 0.35);
  border-radius: 12px;
  padding: 24px 32px;
  width: 96%;
  margin-left: 0;
  box-sizing: border-box;
  border-radius: 8px;
  backdrop-filter: blur(10px);

  /* 🔧 移除 height 固定高度 */
  /* height: 92%; ❌ 删除 */

  /* ✅ 改为自动撑满且支持滚动 */
  overflow-y: auto;
  max-height: calc(100vh - 100px); /* 留出顶部标题与边距空间，可调 */
}

@media (max-height: 600px) {
  .menu-overlay-wrapper {
    max-height: calc(100vh - 60px); /* 更紧凑 */
    padding: 16px;
  }
}

.menu-wrapper {
  width: 100%;
}

/* ✅ 响应式：小屏幕时可适当缩小字号和边距 */
@media (max-width: 768px) {
  .menu-content {
    padding: 16px;
  }

  .menu-title {
    font-size: 22px;
    margin-bottom: 16px;
  }
}

.group-title {
  display: flex;
  flex-direction: column; /* ✅ 垂直排列 */
  align-items: flex-start;
  margin-top: 32px;
  margin-bottom: 16px;
}

.group-cn {
  font-size: 28px;
  font-weight: 700;
  line-height: 32px;
  color: #fff;
  letter-spacing: 3.6px;
}

.group-en {
  font-size: 20px;
  color: #fff;
  margin-top: 7px; /* ✅ 增加上下间隔 */
  letter-spacing: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px dashed #c7b294;
}

.dish-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  user-select: none; /* 禁止选中图片 */
  -webkit-user-drag: none; /* 禁止图片被拖动 */
  pointer-events: none; /* 可选：禁用鼠标事件（仅适用于纯展示图） */
}

.dish-info {
  flex: 1;
  text-align: left;
}

.dish-name {
  font-size: 28px;
  font-weight: 900;
  font-style: normal;
  line-height: 28px;
  letter-spacing: 4.2px;
  margin-bottom: 5px;
}

.dish-en {
  font-size: 20px;
  color: #fff;
  font-weight: 700;
  font-style: normal;
  line-height: 24px;
  letter-spacing: 3px;
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
  font-size: 13px;
  background: none;
  border: 2px solid #fff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-control span {
  font-size: 20px;
  font-weight: 700;
  font-style: normal;
  line-height: 24px;
  letter-spacing: 3px;
  color: #fff;
}

.cart-fab {
  position: fixed;
  bottom: 32px;
  left: 32px;
  width: 64px;
  height: 64px;
  background: transparent;
  cursor: pointer;
  z-index: 1000;
}
.cart-icon {
  width: 100%;
  height: 100%;
}
.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #d64040;
  color: white;
  font-size: 14px;
  border-radius: 50%;
  padding: 2px 9px;
}

.cart-drawer {
  /* 添加 padding-bottom 给按钮留空间 */
  padding: 24px 24px 80px;
  position: fixed;
  right: 0;
  top: 0;
  width: 706px;
  height: 100vh;
  background: #f5e8d5;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  z-index: 999;
  overflow-y: auto;
}

.cart-clear {
  text-align: right;
  font-size: 14px;
  color: red;
  cursor: pointer;
  margin-bottom: 16px;
}

.cart-list {
  margin-bottom: 24px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 0;
  border-bottom: 2px solid rgba(136, 100, 23, 0.3);
}

.cart-item img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 12px;
  user-select: none; /* 禁止选中图片 */
  -webkit-user-drag: none; /* 禁止图片被拖动 */
  pointer-events: none; /* 可选：禁用鼠标事件（仅适用于纯展示图） */
}

.cart-info {
  flex: 1;
}

.cart-name {
  font-size: 24px;
  color: #886417;
  font-weight: 700;
  font-family: "Source Han Serif CN";
  letter-spacing: 3.6px;
  line-height: 28px;
  font-style: normal;
}

.cart-en {
  font-size: 16px;
  color: #886417;
  font-weight: 700;
  font-family: "Source Han Serif CN";
  letter-spacing: 2.4px;
  line-height: 20px;
  font-style: normal;
}

/* 固定底部操作栏 */
.cart-actions {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 706px;
  background: #f5e8d5;
  padding: 12px 24px;
  /* box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1); */
  box-sizing: border-box;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
}

.cart-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  font-size: 16px;
  margin-right: 12px;
  border-radius: 6px;
  cursor: pointer;
  background: #ccb89a;
  color: white;
}

.cart-actions button.confirm-btn {
  background: #b68d41;
}

.cart-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.1); /* 可调浅色遮罩 */
  backdrop-filter: blur(6px); /* 🔥 毛玻璃模糊 */
  -webkit-backdrop-filter: blur(6px); /* Safari 兼容 */
  z-index: 998;
}

/* 当前分类下的小组中文名 */
.group-title {
  color: white !important;
}

/* 当前分类下的小组英文名 */
.group-title .group-en {
  color: #fff !important;
}

/* 当前分类下的菜品名与英文名 */
.menu-item .dish-name,
.menu-item .dish-en {
  color: white !important;
}

/* .menu-content.activeCategory .menu-title, */
.menu-content.activeCategory .group-title,
.menu-content.activeCategory .group-en,
.menu-content.activeCategory .dish-name,
.menu-content.activeCategory .dish-en {
  color: white !important;
}

.cart-empty-tip {
  text-align: center;
  color: #a07c49;
  font-size: 16px;
  padding: 320px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.6;
}

.trash-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: middle;
}

.cart-drawer .quantity-control button {
  border-color: #886417;
  color: #886417;
}

.cart-drawer .quantity-control span {
  color: #886417;
}

/* 🎯 自定义滚动条样式（WebKit 浏览器：Chrome / Edge / Safari） */
.cart-drawer::-webkit-scrollbar {
  width: 8px;
}

.cart-drawer::-webkit-scrollbar-track {
  background: transparent;
}

.cart-drawer::-webkit-scrollbar-thumb {
  background-color: #886417; /* ✅ 滚动条颜色 */
  border-radius: 4px;
}

/* 可选：鼠标悬停时加深颜色 */
.cart-drawer::-webkit-scrollbar-thumb:hover {
  background-color: #6d4f13;
}

/* 🎯 Firefox 浏览器支持滚动条颜色（较少控制力） */
.cart-drawer {
  scrollbar-color: #886417 transparent;
  scrollbar-width: thin;
}

.menu-choose-page::-webkit-scrollbar {
  width: 8px;
}
.menu-choose-page::-webkit-scrollbar-track {
  background: transparent;
}
.menu-choose-page::-webkit-scrollbar-thumb {
  background-color: #886417;
  border-radius: 4px;
}
.menu-choose-page::-webkit-scrollbar-thumb:hover {
  background-color: #6d4f13;
}

/* Firefox 支持 */
.menu-choose-page {
  scrollbar-color: #886417 transparent;
  scrollbar-width: thin;
}

.menu-title .zh {
  font-size: 40px;
  font-weight: 900;
  color: #886417;
  letter-spacing: 6px;
  line-height: 44px;
}

.back-text en,
.menu-title .en {
  font-size: 20px;
  color: #886417;
  margin-top: 4px;
  font-weight: 500;
  letter-spacing: 1.5px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.cart-selected {
  font-size: 20px;
  color: #886417;
  font-weight: 700;
  line-height: 1.2;
}

.cart-selected .en {
  font-size: 14px;
  font-weight: 500;
  color: #886417;
  opacity: 0.85;
  margin-top: 2px;
  text-align: center;
}

.cart-clear {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  cursor: pointer;
}

.clear-text .zh {
  font-size: 14px;
  color: red;
  font-weight: 600;
  line-height: 1.2;
}

.clear-text .en {
  font-size: 12px;
  color: red;
  font-weight: 500;
  opacity: 0.8;
  line-height: 1.2;
  margin-top: 2px;
  text-align: center;
}

/* 1) 容器用 dvh 兜底，建立定位上下文 */
.menu-choose-page {
  position: relative;
  min-height: 100vh;
}
@supports (height: 100dvh) {
  .menu-choose-page {
    min-height: 100dvh;
  }
}

/* 2) 用 ::before 在“容器层”画一条固定的左侧淡白色背景条
      这样页面再长、再滚，这条背景都铺到底 */
.menu-choose-page::before {
  content: "";
  position: fixed; /* 关键：跟随视口铺满到底部 */
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px; /* 和 .category-sidebar 的宽度一致 */
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none; /* 不挡点击 */
  z-index: 0; /* 置底，内容在上 */
}

/* 3) 让 sidebar/右侧内容在背景条之上即可 */
.category-sidebar,
.menu-content {
  position: relative;
  z-index: 1;
}

/* 4) sidebar 自身背景可以透明（保留你原有 hover/active 视觉不变） */
.category-sidebar {
  background: transparent; /* 原来是 rgba(255,255,255,0.2)，交给 ::before 画 */
}

/* 5) 右侧内部区域的最大高度用 dvh，更稳（横屏地址栏不会压缩） */
@supports (height: 100dvh) {
  .menu-overlay-wrapper {
    max-height: calc(100dvh - 100px); /* 你原来是 100vh - 100px */
  }
}

/* 6) 如果你在窄屏想把侧栏变窄，可加这个断点（可选） */
@media (max-width: 1024px) {
  .menu-choose-page::before {
    width: 200px;
  }
  .category-sidebar {
    width: 200px;
  }
}
@media (max-width: 768px) {
  .menu-choose-page::before {
    width: 180px;
  }
  .category-sidebar {
    width: 180px;
  }
}
.category-sidebar {
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}
.cart-fab {
  bottom: max(32px, calc(env(safe-area-inset-bottom) + 12px));
}

/* === A. 返回选择菜系：一行显示 + 轻量响应 === */
.back {                    /* 容器不换行、不挤压 */
  white-space: nowrap;
  overflow: hidden;
}
.back-text {               /* 让文本区域可缩 */
  min-width: 0;
}
.back-text .zh {           /* 中文一行 + 自适应字号与字距 */
  white-space: nowrap;
  font-size: clamp(16px, 1.9vw, 22px);       /* 小屏略缩 */
  letter-spacing: clamp(1.2px, 0.28vw, 3.6px);
  line-height: 1.25;
}
.back-text .en {           /* 英文副文更克制一点 */
  font-size: clamp(12px, 1.2vw, 14px);
  letter-spacing: 0.5px;
  line-height: 1.1;
}
/* 避免图标与文字挤压，确保一行容纳 */
.back {
  gap: 8px;                /* 原 6px -> 8px，空间更均衡 */
}

/* === B. 左侧分类项字号轻量响应（保持你原风格）=== */
.name-cn {
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.15;
  white-space: nowrap;     /* 防止两字一行的断行 */
}
.name-en {
  font-size: clamp(12px, 1.2vw, 14px);
}

/* === C. 数量徽标：严格居中 & 1~3 位自适应 === */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;          /* 单个数字圆点直径 */
  height: 20px;
  padding: 0 6px;           /* 两位数会变椭圆胶囊 */
  line-height: 20px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #d64040;
  color: #fff;

  /* 你的原始定位保持不变： */
  position: absolute;
  top: 28px;
  right: 12px;
}

/* === D. （可选）横屏更紧凑：进一步压一点字距与字号 === */
@media (orientation: landscape) and (max-height: 600px) {
  .back-text .zh {
    font-size: clamp(14px, 1.6vw, 20px);
    letter-spacing: clamp(1px, 0.22vw, 3px);
  }
}

/* === E. 仍然保留你之前的左侧背景铺满补丁，不需要 JS === */
/* 如果已经有了这段，可以忽略；没有就保留 */
.menu-choose-page {
  position: relative;
  min-height: 100vh;
}
@supports (height: 100dvh) {
  .menu-choose-page { min-height: 100dvh; }
}
.menu-choose-page::before {
  content: "";
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: 220px;                      /* 同步 sidebar 宽度 */
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  z-index: 0;
}
.category-sidebar,
.menu-content { position: relative; z-index: 1; }

/* 宽度断点同步（你之前也可加过，保留一致即可） */
@media (max-width: 1024px) {
  .menu-choose-page::before { width: 200px; }
  .category-sidebar { width: 200px; }
}
@media (max-width: 768px) {
  .menu-choose-page::before { width: 180px; }
  .category-sidebar { width: 180px; }
}

</style>
