<template>
  <div class="menu-choose-page">
    <!-- 左侧分类 -->
    <aside class="category-sidebar">
      <div class="back" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeftBold /></el-icon>
        返回选择菜系
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
      <h1 class="menu-title">{{ currentCategory.name }}</h1>

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
                <button @click="decrease(dish)">－</button>
                <span>{{ dish.count }}</span>
                <button @click="increase(dish)">＋</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部悬浮购物车图标 -->
    <div class="cart-fab" @click="toggleCart">
      <img src="@/assets/menu/shopCar2.svg" class="cart-icon" />
      <div class="cart-badge" v-if="totalCount > 0">{{ totalCount }}</div>
    </div>

    <!-- 遮罩层（点击空白关闭购物车） -->
    <div v-if="cartVisible" class="cart-mask" @click="toggleCart" />
    <!-- 右侧购物车面板 -->
    <div class="cart-drawer" v-if="cartVisible" @click.stop>
      <h3>已选择({{ totalCount }})</h3>
      <div class="cart-clear" @click="clearCart">清空列表</div>
      <!-- <div class="cart-list">
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
      </div> -->
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

      <div class="cart-actions">
        <button @click="toggleCart">返回</button>
        <!-- <button class="confirm-btn">确认</button> -->
        <button class="confirm-btn" @click="confirmMenu">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { listDishGroup, groupWithDishes } from "@/api/system/dishGroup";
import { listDish } from "@/api/system/dish";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const activeIndex = ref(0);

const type = computed(() => route.query.type || "chinese");

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

// function selectCategory(index) {
//   activeIndex.value = index;
// }
async function selectCategory(index) {
  activeIndex.value = index;
  await fetchDishesByCategory(categories.value[index]);
}

function increase(dish) {
  dish.count++;
  categories.value[activeIndex.value].count++;
}

function decrease(dish) {
  if (dish.count > 0) {
    dish.count--;
    categories.value[activeIndex.value].count--;
  }
}

const cartVisible = ref(false);
function toggleCart() {
  cartVisible.value = !cartVisible.value;
}
function clearCart() {
  categories.value.forEach((cat) =>
    cat.groups.forEach((g) => g.items?.forEach((item) => (item.count = 0)))
  );
  updateAllCounts();
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

// function confirmMenu() {
//   router.push({
//     path: "/confirmMenu",
//     query: {
//       items: JSON.stringify(selectedItems.value),
//     },
//   });
// }
// function confirmMenu() {
//   if (selectedItems.value.length === 0) {
//     ElMessage.warning("请先选择菜品再确认");
//     return;
//   }

//   router.push({
//     path: "/confirmMenu",
//     query: {
//       items: JSON.stringify(selectedItems.value),
//     },
//   });
// }
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


// 页面加载时调用接口
// onMounted(async () => {
//   await fetchDishGroups();
// });
onMounted(async () => {
  await fetchDishGroups();

  // 恢复购物车数据
  const cached = sessionStorage.getItem("cachedDishes");
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
  }
});



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
</script>

<style scoped>
.menu-choose-page {
  display: flex;
  height: 100vh;
  background: url("@/assets/menu/menubg.svg") no-repeat center center;
  background-size: cover;
  font-family: "Noto Serif SC", serif;
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
  overflow-y: auto;
  position: relative;
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
.menu-overlay-wrapper {
  background: rgba(102, 66, 33, 0.25);
  border-radius: 12px;
  padding: 24px 32px;
  width: 96%;
  height: 92%;
  margin-left: 0; /* 贴近左侧分类栏 */
  box-sizing: border-box;
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
  font-size: 16px;
  background: none;
  border: 1px solid #fff;
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
  width: 360px;
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
}

.cart-item img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 12px;
}

.cart-info {
  flex: 1;
}

.cart-name {
  font-weight: bold;
}

.cart-en {
  font-size: 14px;
  color: #a07c49;
}

/* 固定底部操作栏 */
.cart-actions {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 360px;
  background: #f5e8d5;
  padding: 12px 24px;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
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
  background: rgba(0, 0, 0, 0.05); /* 可选淡色遮罩 */
  z-index: 998; /* 比 .cart-drawer 稍低 */
}

/* 右侧当前分类标题 */
/* .menu-title {
  color: white !important;
} */

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
</style>
