<template>
  <div class="menu-choose-page">
    <!-- 左侧分类 -->
    <aside class="category-sidebar">
      <div class="back" @click="router.push('/menu')">
        <el-icon class="back-icon">
          <ArrowLeftBold />
        </el-icon>
        <div class="back-text">
          <p class="zh">返回选择菜系</p>
          <p class="en">Back</p>
        </div>
      </div>
      <div class="category-list" ref="categoryListRef" @touchstart="handleListTouchStart"
        @touchend="handleListTouchEnd" @touchmove="handleListTouchScroll($event, '.category-list')">
        <template v-if="loading">
          <div class="category-item category-item-skeleton" v-for="i in 3" :key="'skeleton-' + i">
            <div class="name-cn name-skeleton"></div>
          </div>
        </template>
        <template v-else>
          <div v-for="(item, index) in categories" :key="item.name"
            :class="['category-item', { active: index === activeIndex }]" @click="selectCategory(index)">
            <div class="name-cn">{{ item.name }}</div>
            <div class="name-en">{{ item.en }}</div>
            <div class="badge" v-if="item.count > 0">{{ item.count }}</div>
          </div>
        </template>
      </div>
    </aside>

    <!-- 右侧菜单列表 -->
    <main class="menu-content">
      <h1 class="menu-title">
        <div class="zh">{{ categoryName }}</div>
        <div class="en">{{ categoryNameEn }}</div>

        <div v-if="!cartVisible" class="cart-fab" @click="toggleCart">
          <el-icon class="cart-icon">
            <ShoppingCart />
          </el-icon>
          <div class="cart-text">
            <p class="zh">购物车</p>
            <p class="en">Shopping cart</p>
          </div>
          <div class="cart-badge" v-if="totalCount > 0">{{ totalCount }}</div>
        </div>
      </h1>

      <div class="menu-overlay-wrapper">
        <div class="menu-wrapper">
          <template v-if="loading">
            <div class="menu-item-skeleton" v-for="i in 8" :key="'menu-item-skeleton-' + i">
              <div class="dish-name-skeleton"></div>
            </div>
          </template>
          <!-- 为菜单内容添加过渡效果 -->
          <transition name="slide-fade" mode="out-in">
            <div class="menu-section-wrapper" :key="activeIndex">
              <div class="menu-section" v-for="group in currentCategory.groups" :key="group.name">
                <h2 class="group-title">
                  <div class="group-cn">{{ group.name }}</div>
                  <div class="group-en">{{ group.en }}</div>
                </h2>
                <!-- 确保始终渲染.menu-list容器以支持滑动切换功能 -->
                <div class="menu-list" @scroll.passive="onMenuListScroll" @touchstart.passive="onTouchStart"
                  @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd"
                  :ref="(el) => { if (el) menuListRefs[index] = el }">
                  <div class="menu-item" v-for="dish in group.items" :key="dishKey(dish)">
                    <div class="dish-img-box">
                      <img :src="dish.img" class="dish-img" />
                      <div class="submitted-tag" v-if="dish.submitted">
                        <ShoppingCart /> <span class="zh">已购</span>
                      </div>
                    </div>
                    <div class="dish-info">
                      <div class="dish-name">{{ dish.name }}</div>
                      <div class="dish-en">{{ dish.en }}</div>
                    </div>
                    <div class="quantity-control">
                      <template v-if="dish.count > 0">
                        <button @click="decrease(dish)">-</button>
                        <div class="count">{{ dish.count }}</div>
                        <button @click="increase(dish)">+</button>
                      </template>
                      <template v-else>
                        <button @click="increase(dish)">+</button>
                      </template>
                    </div>
                  </div>
                  <!-- 当没有菜品时显示提示信息 -->
                  <div v-if="group.items.length === 0" class="no-dishes">
                    <div class="no-dishes-text">暂无菜品</div>
                  </div>
                </div>
              </div>
              <!-- 当没有分组时显示空的menu-list以支持滑动切换 -->
              <div v-if="currentCategory.groups.length === 0" class="menu-section">
                <div class="menu-list" @scroll.passive="onMenuListScroll" @touchstart.passive="onTouchStart"
                  @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd">
                  <div class="no-dishes">
                    <div class="no-dishes-text">暂无菜品</div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </main>

    <!-- 底部悬浮购物车图标（购物车打开时隐藏） -->
    <!-- <div v-if="!cartVisible" class="cart-fab" @click="toggleCart">
      <img src="@/assets/menu/shopCar2.svg" class="cart-icon" />
      <div class="cart-badge" v-if="totalCount > 0">{{ totalCount }}</div>
    </div> -->

    <!-- 遮罩层 -->
    <div v-if="cartVisible" class="cart-mask" @click="toggleCart" />

    <!-- 右侧购物车面板（展示全局已选） -->
    <div class="cart-drawer" v-if="cartVisible" @click.stop>
      <div class="cart-header">
        <div class="cart-selected">
          <div>
            <div class="zh">已选择</div>
            <div class="en">Selected</div>
          </div>
          <div class="count">({{ totalCount }})</div>
        </div>

        <div class="cart-clear" @click="clearCart">
          <img src="@/assets/trash.svg" class="trash-icon" />
          <div class="clear-text">
            <div class="zh">清空列表</div>
            <div class="en">Clear</div>
          </div>
        </div>
      </div>

      <div class="cart-list" @touchstart="handleListTouchStart" @touchend="handleListTouchEnd" @touchmove="handleListTouchScroll($event, '.cart-list')">
        <template v-if="globalCartList.length > 0">
          <div v-for="(group, groupIndex) in globalCartList" :key="groupIndex">
            <h3 class="cart-group-name" v-if="group.cartCategoryName">
              <div class="cart-group-name-cn">{{ group.cartCategoryName }}</div>
              <div class="cart-group-name-en">{{ group.cartCategoryNameEn }}</div>
            </h3>
            <div class="cart-item" v-for="dish in group.children" :key="dishKey(dish)">
              <img :src="dish.img" />
              <div class="cart-info">
                <div class="cart-name">{{ dish.name }}</div>
                <div class="cart-en">{{ dish.en }}</div>
              </div>
              <div class="quantity-control">
                <button @click="decrease(dish)">－</button>
                <div class="count">{{ dish.count }}</div>
                <button @click="increase(dish)">＋</button>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="cart-empty-tip">暂无菜品，请添加</div>
      </div>

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
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { groupWithDishes } from "@/api/system/dishGroup";
import { ArrowLeftBold, ShoppingCart } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const activeIndex = ref(0);
const cartVisible = ref(false);

// 添加滚动联动相关的引用
const categoryListRef = ref(null);
const menuListRefs = ref([]);

/** ---------- 全局购物车（跨菜系共享） ---------- */
const CART_KEY = 'cachedDishesAll';
const cartMap = ref({}); // { [key]: dishObjWithCount }

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    cartMap.value = raw ? JSON.parse(raw) : {};
  } catch {
    cartMap.value = {};
  }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cartMap.value));
}
function dishKey(dish) {
  return dish.id ?? dish.dishId ?? dish.code ?? dish.name;
}

const globalCartList = computed(() => {
  const cartItems = Object.values(cartMap.value);

  // 按 groupName 分组
  const grouped = {};
  cartItems.forEach(item => {
    const cartCategoryName = item.categoryName || '未分组';
    const cartCategoryNameEn = item.categoryNameEn || 'unknown';
    if (!grouped[cartCategoryName]) {
      grouped[cartCategoryName] = {
        items: [],
        en: cartCategoryNameEn
      };
    }
    grouped[cartCategoryName].items.push(item);
  });

  // 转换为 [{cartCategoryName: 'xxx', cartCategoryNameEn: 'xxx', children: [...]}, ...] 格式
  return Object.entries(grouped).map(([cartCategoryName, groupData]) => ({
    cartCategoryName,
    cartCategoryNameEn: groupData.en,
    children: groupData.items
  }));
});

const totalCount = computed(() =>
  Object.values(cartMap.value).reduce((s, d) => s + (d.count || 0), 0)
);
/** ------------------------------------------------- */

const type = computed(() => route.query.type || "chinese");
const isContinue = computed(() => route.query.isContinue || "0");
const categoryName = computed(() => decodeURIComponent(route.query.name || "菜系"));
const categoryNameEn = computed(() => decodeURIComponent(route.query.nameEn || "Cuisine"));

const categories = ref([]); // [{ name, en, count, groups:[{ name,en, items:[dish] }] }]
const currentCategory = computed(() => categories.value[activeIndex.value] || { name: "", groups: [] });

function toggleCart() {
  cartVisible.value = !cartVisible.value;
}

/** 根据全局购物车回灌当前分类中所有菜品的数量，并统计分类count */
function syncCountsFromCart() {
  categories.value.forEach((cat) => {
    let catCount = 0;
    cat.groups.forEach((group) => {
      group.items?.forEach((dish) => {
        const key = dishKey(dish);
        const inCart = cartMap.value[key];
        dish.count = inCart ? inCart.count : 0;
        console.log("🚀 ~ syncCountsFromCart ~ dish:", dish)
        catCount += (dish.count - (dish?.submitted || 0));
      });
    });
    cat.count = catCount;
  });
}

function increase(dish) {
  const key = dishKey(dish);
  if (cartMap.value[key]?.count == 99) return;
  const next = (cartMap.value[key]?.count || 0) + 1;
  const newDish = { ...dish, count: next };
  cartMap.value = { ...cartMap.value, [key]: newDish };
  saveCart();

  // 如果这个菜在当前分类中，回写它的 count；分类计数整体更新
  dish.count = next;
  syncCountsFromCart();
}

function decrease(dish) {

  const key = dishKey(dish);
  const cur = cartMap.value[key]?.count || 0;
  if (dish.submitted && cur <= dish.submitted) {
    ElMessage({
      type: 'warning',
      message: '已点菜单无法减少'
    });
    return
  }
  if (cur <= 1) {
    // 归零则从全局购物车移除
    const { [key]: _, ...rest } = cartMap.value;
    cartMap.value = rest;
    saveCart();
    dish.count = 0;
  } else {
    const next = cur - 1;
    cartMap.value = { ...cartMap.value, [key]: { ...dish, count: next } };
    saveCart();
    dish.count = next;
  }
  syncCountsFromCart();
}

function clearCart() {
  ElMessageBox.confirm(
    '确定要清空所有新增菜品吗？此操作不可撤销。',
    '清空购物车',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      confirmButtonClass: 'confirm-button',
      cancelButtonClass: 'cancel-button'
    }
  ).then(() => {
    // 清空全局
    // cartMap.value = {};
    // console.log("🚀 ~ clearCart ~ cartMap.value:", cartMap.value)
    cartMap.value = Object.values(cartMap.value).filter(dish => {
      dish.count = dish?.submitted || 0;
      return dish.count;
    }).reduce((acc, dish) => {
      acc[dishKey(dish)] = dish;
      return acc;
    }, {});
    // cartMap.value = Object.values(cartMap.value).filter(dish => {
    //   dish.count = dish?.submitted || 0;
    //   return dish.count;
    // })
    // .map(dish => ({ 
    //   [dish.id]: {...dish}
    // }));
    // console.log("🚀 ~ clearCart ~ cartMap.value: 222222222", cartMap.value)
    saveCart();
    // 清空当前页面所有菜的数量
    categories.value.forEach((cat) => {
      console.log("🚀 ~ clearCart ~ cat:", cat)
      cat.count = 0;
      cat.groups.forEach((group) => {
        group.items.forEach((item) => {
          if(item.count) {
            item.count = cartMap.value[item.id]?.submitted || 0;
          }else {
            item.count = 0;
          }
        });
      });
    });

    ElMessage({
      type: 'success',
      message: '购物车已清空'
    });
  }).catch(() => {
    // 用户点击取消或关闭弹窗
    // 不执行任何操作
  });
}

async function selectCategory(index) {
  activeIndex.value = index;
  // 切换分类后，把全局购物车数量回灌
  syncCountsFromCart();

  // 滚动到对应的左侧分类项
  await nextTick();
  scrollToCategory(index);
}

// 滚动到指定的分类项
function scrollToCategory(index) {
  if (categoryListRef.value && categoryListRef.value.children[index]) {
    const categoryItem = categoryListRef.value.children[index];
    const container = categoryListRef.value;

    // 计算元素在容器中的位置
    const itemOffsetTop = categoryItem.offsetTop;
    const itemHeight = categoryItem.offsetHeight;
    const containerHeight = container.clientHeight;

    // 将元素滚动到容器中心位置
    const scrollPosition = itemOffsetTop - (containerHeight / 2) + (itemHeight / 2);

    // 平滑滚动到指定位置
    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  }
}

// 处理右侧菜单列表滚动到底部或顶部的事件
function handleMenuScroll(direction) {
  if (direction === 'top' && activeIndex.value > 0) {
    // 滚动到顶部，切换到上一个分类
    selectCategory(activeIndex.value - 1);
  } else if (direction === 'bottom' && activeIndex.value < categories.value.length - 1) {
    // 滚动到底部，切换到下一个分类
    selectCategory(activeIndex.value + 1);
  }
}

// 右侧菜单列表滚动事件处理
function onMenuListScroll(event) {
  const element = event.target;
  const { scrollTop, scrollHeight, clientHeight } = element;

  // 添加一些容差值，避免浮点数精度问题
  const tolerance = 2;

  // 检查是否滚动到顶部
  if (scrollTop <= tolerance && activeIndex.value > 0) {
    handleMenuScroll('top');
  }
  // 检查是否滚动到底部
  else if (scrollTop + clientHeight >= scrollHeight - tolerance && activeIndex.value < categories.value.length - 1) {
    handleMenuScroll('bottom');
  }
  // 特殊处理：如果内容不足以滚动，也要能切换分类
  else if (scrollHeight <= clientHeight) {
    // 内容不足以滚动时，向上滑动切换到下一个分类，向下滑动切换到上一个分类
    // 这种情况会在触摸事件中处理
  }
}


// 触摸事件相关变量
let touchStartY = 0;
const isScrollable = ref(false);

const handleCategoryScroll = (event) => { 
  const categoryList = document.querySelector('.category-list')
  const { scrollTop, scrollHeight, clientHeight } = categoryList;
  if(scrollTop == 0) {
    isScrollable.value = true;
  } else {
    isScrollable.value = false;
  }
};

const handleListTouchStart = (event) => { 
  touchStartY = event.touches[0].clientY;
  isScrollable.value = true;
};

const handleListTouchEnd = (event) => { 
  isScrollable.value = false;
};

const handleListTouchScroll = (event, className) => {
  const categoryList = document.querySelector(className)
  const { scrollTop, scrollHeight, clientHeight } = categoryList;

  const touchEndY = event.changedTouches[0].clientY;
  const touchDiff = touchStartY - touchEndY;
  const tolerance = 15; // 触摸滑动的最小距离阈值

  if (touchDiff < -tolerance && scrollTop === 0) {
    isScrollable.value = false;
  }else {
    isScrollable.value = true;
  }
}

// 触摸开始事件
function onTouchStart(event) {
  const element = event.target.closest('.menu-list');
  if (element) {
    touchStartY = event.touches[0].clientY;
    const { scrollTop, scrollHeight, clientHeight } = element;
    isScrollable.value = !(scrollHeight <= clientHeight);
    // console.log("🚀 ~ onTouchStart ~ isScrollable.value:", isScrollable.value)
  } else {
    const element = event.target;
    const { scrollTop, scrollHeight, clientHeight } = element;
    isScrollable.value = !(scrollHeight <= clientHeight);
  }
}

// 触摸移动事件
function onTouchMove(event) {
}

// 触摸结束事件
function onTouchEnd(event) {
  isScrollable.value = false;
  const element = event.target.closest('.menu-list');
  if (element) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchDiff = touchStartY - touchEndY;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const tolerance = 15; // 触摸滑动的最小距离阈值

    // 检查是否可以切换分类
    const canSwitchUp = activeIndex.value > 0;
    const canSwitchDown = activeIndex.value < categories.value.length - 1;

    // 如果内容不足以滚动，根据滑动方向切换分类
    if (scrollHeight <= clientHeight) {
      if (touchDiff > tolerance && canSwitchDown) {
        // 向上滑动，切换到下一个分类
        handleMenuScroll('bottom');
        return;
      } else if (touchDiff < -tolerance && canSwitchUp) {
        // 向下滑动，切换到上一个分类
        handleMenuScroll('top');
        return;
      }
    }

    // 如果在顶部向上滑动
    if (scrollTop <= 5 && touchDiff > tolerance && canSwitchDown) {
      // 向上滑动，切换到下一个分类
      handleMenuScroll('bottom');
      return;
    }
    // 如果在底部向下滑动
    else if (scrollTop + clientHeight >= scrollHeight - 5 && touchDiff < -tolerance && canSwitchUp) {
      // 向下滑动，切换到上一个分类
      handleMenuScroll('top');
      return;
    }

    // 特殊处理：如果在顶部且向上拉（负值），切换到上一个分类
    if (scrollTop <= 2 && touchDiff < -tolerance && canSwitchUp) {
      handleMenuScroll('top');
      return;
    }
    // 特殊处理：如果在底部且向下拉（正值），切换到下一个分类
    else if (scrollTop + clientHeight >= scrollHeight - 2 && touchDiff > tolerance && canSwitchDown) {
      handleMenuScroll('bottom');
      return;
    }
  }
}

async function fetchDishGroups() {
  try {
    loading.value = true;
    // 你的后端：根据“菜系根分类ID”取分组与菜品
    const rawType = route.query.type;
    const categoryMap = { chinese: 1, western: 2, beverages: 3, snacks: 4 };
    const rootCategoryId = categoryMap[rawType] || rawType || 1;

    const res = await groupWithDishes({ categoryId: rootCategoryId });
    const rows = res?.data || [];
    if (!Array.isArray(rows)) throw new Error("接口返回格式不正确");
    const currentCategoryCartList = globalCartList.value.find(item => item.cartCategoryName == categoryName.value)?.children || [];
    categories.value = rows.map((group) => ({
      id: group.groupId,
      name: group.groupName,
      en: group.groupEn,
      count: 0,
      groups: [
        {
          name: group.groupName,
          en: group.groupEn,
          items: (group.items || []).map((dish) => {
            const cartItem = currentCategoryCartList.find(s => s.id === dish.id)
            const result = {
              ...dish,
              groupName: group.groupName,
              groupNameEn: group.groupEn,
              categoryName: categoryName.value,
              categoryNameEn: categoryNameEn.value,
              en: dish.nameEn,
              img: dish.imageUrl || dish.image || "",
              count: 0,
            };
            if (cartItem) {
              result.submitted = cartItem.submitted;
            }
            return result;
          }),
        },
      ],
    }));

    activeIndex.value = 0;
  } catch (e) {
    console.error("加载分组菜品失败", e);
    ElMessage({
      type: "error",
      message: "加载分组菜品失败",
    });
  } finally {
    loading.value = false;
  }
}

function confirmMenu() {
  let dishes = JSON.parse(JSON.stringify(globalCartList.value));
  dishes.forEach(item => { 
    let newChildren = [];
    item.children.forEach(child => {
      child.count -= (child?.submitted || 0);
      if(child.count > 0) {
        newChildren.push(child);
      }
    });
    console.log("🚀 ~ confirmMenu ~ newChildren:", newChildren)
    item.children = newChildren;
  });
  console.log("🚀 ~ confirmMenu ~ dishes:", dishes)
  dishes = dishes.filter(item => item.children.length > 0);
  console.log("🚀 ~ confirmMenu ~ dishes:", dishes)
  if (dishes.length === 0) {
    ElMessage.warning("请先添加菜品再确认");
    return;
  }
  const query = {
    items: JSON.stringify(dishes),
    type: type.value,
    name: categoryName.value,
  };

  if (isContinue == 1) {
    query.isContinue = 1;
  }

  // if(route.query.)
  // 直接使用全局购物车（所有菜系汇总）
  router.push({
    path: "/confirmMenu",

    query,
  });
}

// 阻止iOS橡皮筋效果，只在右侧列表区域特定条件下
// 确保只在右侧列表无法滚动或在顶部时阻止橡皮筋效果，不影响正常滚动
function preventPullToRefresh(e) {
  // CSS样式已经通过 overscroll-behavior-y: contain 处理了橡皮筋效果
  // 这里不需要额外的JavaScript处理
  // 保留此函数以便将来扩展
  if (!isScrollable.value) {
    e.preventDefault()
  }
}

onMounted(async () => {
  document.addEventListener('touchmove', preventPullToRefresh, { passive: false })
  // document.querySelector('body').style.overscrollBehavior = 'none';
  // document.querySelector('html').style.overscrollBehavior = 'none';

  loadCart();          // 读全局购物车
  await fetchDishGroups();   // 拉取当前菜系的分组与菜
  syncCountsFromCart(); // 回灌数量

  // 初始化时确保第一个分类可见
  await nextTick();
  if (categories.value.length > 0) {
    scrollToCategory(0);
  }

  // 阻止页面被上拉下拉
  // preventPullToRefresh();
});
onBeforeUnmount(() => { 
  document.removeEventListener('touchmove', preventPullToRefresh);
});
</script>


<style scoped>
.menu-choose-page {
  display: flex;
  background: url("@/assets/index2.png") no-repeat center center;
  background-size: cover;
  font-family: "Source Han Serif CN";
  color: #5e4003;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  overflow: hidden;
  /* 禁止父容器滚动 */
  user-select: none;
  overscroll-behavior-y: contain;
  /* 禁止上拉刷新 */
  -webkit-overscroll-behavior-y: contain;
  /* Safari 兼容 */
}

/* 菜单覆盖层容器 */
.menu-overlay-wrapper {
  overscroll-behavior-y: contain;
  -webkit-overscroll-behavior-y: contain;
}

/* 菜单包装器 */
.menu-wrapper {
  overscroll-behavior-y: contain;
  -webkit-overscroll-behavior-y: contain;
}

/* 右侧菜单列表容器 */
.menu-list {
  overscroll-behavior-y: contain;
  -webkit-overscroll-behavior-y: contain;
}

/* 左侧分类栏 */
.category-sidebar {
  width: 220px;
  /* background: rgba(255, 255, 255, 0.2); */
  padding: 24px 16px;
  padding-right: 0;
  box-sizing: border-box;
  height: 100vh;
  /* 占满整个视口高度 */
  display: flex;
  flex-direction: column;
}

.category-list {
  flex: 1;
  overflow-y: auto;
  /* 允许左侧区域滚动 */
  scroll-behavior: smooth;
  /* 平滑滚动 */
  /* 隐藏滚动条 - Webkit 浏览器 (Chrome, Safari, Edge) */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

.back {
  font-size: 24px;
  font-family: 'Source Han Serif CN Bold';
  margin-bottom: 16px;
  color: #886417;
  cursor: pointer;
  display: flex;
  /* line-height: 28px; */
  align-items: center;
  gap: 6px;
  font-weight: 700;
  letter-spacing: 3.6px;
  height: 92px;
}

.back-icon {
  font-size: 20px;
}

.category-item {
  padding: 12px 16px;
  margin-bottom: 12px;
  /* border-radius: 12px; */
  background: transparent;
  transition: background 0.2s;
  position: relative;
  cursor: pointer;
}

.category-item-skeleton {
  background: rgba(64, 44, 13, 0.35);
  height: 80px;
  margin-right: 16px;
  border-radius: 8px;
}

.category-item-skeleton:first-of-type {
  margin-right: 0;
  border-radius: 8px 0 0 8px;
}

.category-item-skeleton .name-skeleton {
  height: 28px;
  width: 12vw;
  background: white;
  opacity: 0.25;
  border-radius: 4px;
}

.category-item:last-of-type {
  margin-bottom: 0;
}

.category-item.active {
  /* background: rgba(64, 44, 13, 0.35); */
  background: #402C0D59;
  border-left: 4px solid #FFFFFF;
  color: white;
}

.category-item.active .name-cn {
  color: #fff;
}

.category-item.active .name-en {
  color: #fff;
}

.name-cn {
  font-family: 'Source Han Serif CN Bold';
  font-size: 28px;
  font-style: normal;
  line-height: 32px;
  font-weight: 700;
  color: #886417;
  margin-bottom: 5px;
  text-align: center;
}

.name-en {
  font-size: 14px;
  color: #886417;
  text-align: center;
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
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  padding-left: 0;
  position: relative;
  height: 100vh;
  /* 占满整个视口高度 */
  overflow: hidden;
  /* 隐藏溢出内容 */
  position: relative;
}

.menu-title {
  font-size: 40px;
  font-weight: 900;
  font-style: normal;
  margin: 0 auto 12px;
  color: #886417;
  text-align: center;
  letter-spacing: 6px;
}

.cart-fab {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 24px;
  margin-right: 38px;
  font-size: 24px;
  font-family: 'Source Han Serif CN Bold';
  margin-bottom: 16px;
  color: #886417;
  cursor: pointer;
  display: flex;
  /* line-height: 28px; */
  align-items: center;
  gap: 6px;
  font-weight: 700;
  letter-spacing: 3.6px;
  width: max-content;
  height: 92px;
  gap: 8px;
  white-space: nowrap;
  /* overflow: hidden; */
}

.cart-icon {
  font-size: 20px;
}

.cart-text .zh {
  /* 中文一行 + 自适应字号与字距 */
  white-space: nowrap;
  font-size: clamp(16px, 1.9vw, 22px);
  /* 小屏略缩 */
  letter-spacing: clamp(1.2px, 0.28vw, 3.6px);
  /* line-height: 1.25; */
  text-align: center;
}

.cart-text .en {
  /* 英文副文更克制一点 */
  font-size: clamp(12px, 1.2vw, 14px);
  letter-spacing: 0.5px;
  /* line-height: 1.1; */
  text-align: center;
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
  border-radius: 0px 8px 8px 0px;
  /* padding: 24px 32px; */
  padding-left: 24px;
  padding-top: 20px;
  width: 100%;
  margin-left: 0;
  box-sizing: border-box;
  backdrop-filter: blur(10px);

  /* 🔧 移除 height 固定高度 */
  /* height: 92%; ❌ 删除 */

  /* ✅ 改为自动撑满且支持滚动 */
  overflow-y: hidden;
  flex: 1;
}

@media (max-height: 600px) {
  .menu-overlay-wrapper {
    /* height: calc(100vh - 60px);  */
    padding: 16px;
  }
}

.menu-wrapper {
  width: 100%;
  height: 100%;
}

.menu-section-wrapper {
  height: 100%;
}

.menu-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-list {
  padding-right: 24px;
  flex: 1;
  overflow-y: auto;
  /* 隐藏滚动条 - Webkit 浏览器 (Chrome, Safari, Edge) */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

/* ✅ 响应式：小屏幕时可适当缩小字号和边距 */
@media (max-width: 768px) {
  .menu-content {
    padding: 16px;
    padding-left: 0;
  }

  .menu-title {
    font-size: 22px;
    margin-bottom: 16px;
  }
}

.group-title {
  display: flex;
  flex-direction: column;
  /* ✅ 垂直排列 */
  align-items: flex-start;
  /* margin-top: 32px; */
  margin-bottom: 16px;
}

.group-cn {
  font-size: 28px;
  font-weight: 700;
  line-height: 32px;
  color: #fff;
  letter-spacing: 3.6px;
  font-family: 'Source Han Serif CN Heavy';
}

.group-en {
  font-size: 20px;
  color: #fff;
  margin-top: 7px;
  /* ✅ 增加上下间隔 */
  letter-spacing: 2px;
  font-family: 'Source Han Serif CN Bold';
}

.menu-item-skeleton {
  background: rgba(64, 44, 13, 0.1);
  height: 80px;
  width: calc(100% - 24px);
  margin-bottom: 16px;
  /* margin-right: 24px; */
  border-radius: 8px;
  padding: 16px;
}

.dish-name-skeleton {
  background: white;
  height: 28px;
  width: 40%;
  opacity: 0.25;
  border-radius: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px dashed #c7b294;
}

.dish-img-box {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 16px;
  width: 130px;
  height: 130px;
}
.submitted-tag {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  font-size: 12px;
  border-radius: 0 0  0 12px;
  background: #DE4E50;
  /* width: 60px; */
  /* white-space: nowrap; */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  gap: 2px;
}
.submitted-tag>svg {
  width: 14px;
  height: 14px;
}
.dish-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  /* 禁止选中图片 */
  -webkit-user-drag: none;
  /* 禁止图片被拖动 */
  pointer-events: none;
  /* 可选：禁用鼠标事件（仅适用于纯展示图） */
}

.dish-info {
  flex: 1;
  text-align: left;
}

.dish-name {
  font-family: 'Source Han Serif CN Heavy';
  font-size: 28px;
  font-weight: 900;
  font-style: normal;
  line-height: 28px;
  letter-spacing: 4.2px;
  margin-bottom: 5px;
}

.dish-en {
  font-family: 'Source Han Serif CN Bold';
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
  font-size: 26px;
  line-height: 26px;
  background: none;
  border: 2px solid #fff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  /* font-weight: bold; */
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-control .count {
  width: 30px;
  height: 30px;
  line-height: 30px;
  font-size: 20px;
  font-weight: 700;
  font-style: normal;
  letter-spacing: 3px;
  color: #fff;
  text-align: center;
}

/* .cart-fab {
  position: fixed;
  bottom: 32px;
  left: 32px;
  width: 64px;
  height: 64px;
  background: transparent;
  cursor: pointer;
  z-index: 1000;
} */

.cart-icon {
  width: 100%;
  height: 100%;
}

.cart-badge {
  position: absolute;
  top: 0px;
  right: 0px;
  background: #d64040;
  color: white;
  font-size: 14px;
  border-radius: 50%;
  padding: 2px 6px;
  min-width: 26px;
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
}

.cart-drawer {
  /* 添加 padding-bottom 给按钮留空间 */
  padding: 24px 24px 80px;
  padding-right: 0;
  position: fixed;
  right: 0;
  top: 0;
  width: 706px;
  height: 100vh;
  background: #f5e8d5;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.cart-clear {
  padding-right: 24px;
  text-align: right;
  font-size: 14px;
  color: red;
  cursor: pointer;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Source Han Serif CN Bold';
  cursor: pointer;
}

.cart-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
  padding-right: 24px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 0;
  border-bottom: 2px solid #8864174D;
}

.cart-item img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 12px;
  user-select: none;
  /* 禁止选中图片 */
  -webkit-user-drag: none;
  /* 禁止图片被拖动 */
  pointer-events: none;
  /* 可选：禁用鼠标事件（仅适用于纯展示图） */
}

.cart-info {
  flex: 1;
}

.cart-group-name {
  font-size: 20px;
  font-weight: bold;
  color: #88641799;
  margin: 16px 0 8px 0;
  padding-bottom: 4px;
  font-family: 'Source Han Serif CN Bold';
  display: flex;
  gap: 10px;
}

.cart-group-name .cart-group-name-cn {
  font-size: 20px;
  font-weight: bold;
  line-height: 1.2;
}

.cart-group-name .cart-group-name-en {
  font-size: 16px;
  font-weight: normal;
  line-height: 1.2;
  margin-top: 2px;
}

.cart-name {
  font-size: 24px;
  color: #886417;
  font-weight: 700;
  font-family: "Source Han Serif CN Bold";
  letter-spacing: 3.6px;
  line-height: 28px;
  font-style: normal;
}

.cart-en {
  font-size: 16px;
  color: #886417;
  font-weight: 700;
  font-family: "Source Han Serif CN Bold";
  letter-spacing: 2.4px;
  line-height: 20px;
  font-style: normal;
  margin-top: 8px;
}

/* 固定底部操作栏 */
.cart-actions {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 706px;
  /* background: #f5e8d5; */
  padding: 12px 24px;
  /* box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1); */
  box-sizing: border-box;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.cart-actions button {
  font-family: 'Source Han Serif CN Bold';
  flex: 1;
  padding: 12px;
  border: none;
  font-size: 20px;
  /* margin-right: 12px; */
  border-radius: 6px;
  cursor: pointer;
  background: #ccb89a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.cart-actions button .en {
  font-size: 14px;
}

/* 底部操作栏按钮 - 确认下单 */
.cart-actions .confirm-btn {
  background: #b68d41;
  color: white;
  border: none;
  /* padding: 12px 32px; */
  /* font-size: 20px; */
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
  letter-spacing: 2px;
}

.cart-actions .confirm-btn:hover {
  background: #886417;
}

/* 过渡动画 - 垂直滑动 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 无菜品提示样式 */
.no-dishes {
  text-align: center;
  padding: 40px 0;
}

.no-dishes-text {
  font-size: 24px;
  color: #886417;
  opacity: 0.6;
}

/* 🎯 Firefox 浏览器支持滚动条颜色（较少控制力） */
.cart-drawer {
  scrollbar-color: #886417 transparent;
  scrollbar-width: thin;
}

.cart-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.1);
  /* 可调浅色遮罩 */
  backdrop-filter: blur(6px);
  /* 🔥 毛玻璃模糊 */
  -webkit-backdrop-filter: blur(6px);
  /* Safari 兼容 */
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
  width: 18px;
  height: 18px;
  margin-right: 6px;
  vertical-align: middle;
}

.cart-drawer .quantity-control button {
  border-color: #886417;
  color: #886417;
}

.cart-drawer .quantity-control .count {
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
  background-color: #886417;
  /* ✅ 滚动条颜色 */
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

.menu-title>.zh {
  font-size: 40px;
  font-weight: 900;
  color: #886417;
  letter-spacing: 6px;
}

/* .back-text en, */
.menu-title>.en {
  font-size: 20px;
  color: #886417;
  /* margin-top: 4px; */
  font-weight: 500;
  letter-spacing: 1.5px;
  text-align: center;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.cart-selected {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 20px;
  color: #886417;
  font-weight: 700;
  line-height: 1.2;
  font-family: 'Source Han Serif CN Bold';
}

.cart-selected .en {
  font-size: 14px;
  font-weight: 500;
  color: #886417;
  opacity: 0.85;
  margin-top: 2px;
  text-align: center;
}

.cart-selected .count {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 4px;
}


.clear-text .zh {
  font-size: 14px;
  color: red;
  font-weight: 600;
  line-height: 1.2;
}

.clear-text .en {
  font-size: 14px;
  color: red;
  font-weight: 500;
  opacity: 0.8;
  line-height: 1.2;
  margin-top: 4px;
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
  position: fixed;
  /* 关键：跟随视口铺满到底部 */
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px;
  /* 和 .category-sidebar 的宽度一致 */
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  /* 不挡点击 */
  z-index: 0;
  /* 置底，内容在上 */
}

/* 3) 让 sidebar/右侧内容在背景条之上即可 */
.category-sidebar,
.menu-content {
  position: relative;
  z-index: 1;
}

/* 4) sidebar 自身背景可以透明（保留你原有 hover/active 视觉不变） */
.category-sidebar {
  background: transparent;
  /* 原来是 rgba(255,255,255,0.2)，交给 ::before 画 */
}

/* 5) 右侧内部区域的最大高度用 dvh，更稳（横屏地址栏不会压缩） */
@supports (height: 100dvh) {
  .menu-overlay-wrapper {
    /* max-height: calc(100dvh - 100px); 你原来是 100vh - 100px */
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
    padding: 16px;
    padding-right: 0;
  }
}

.category-sidebar {
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}

/* === A. 返回选择菜系：一行显示 + 轻量响应 === */
.back {
  /* 容器不换行、不挤压 */
  white-space: nowrap;
  overflow: hidden;
}

.back-text {
  /* 让文本区域可缩 */
  min-width: 0;
}

.back-text .zh {
  /* 中文一行 + 自适应字号与字距 */
  white-space: nowrap;
  font-size: clamp(16px, 1.9vw, 22px);
  /* 小屏略缩 */
  letter-spacing: clamp(1.2px, 0.28vw, 3.6px);
  /* line-height: 1.25; */
  text-align: center;
}

.back-text .en {
  /* 英文副文更克制一点 */
  font-size: clamp(12px, 1.2vw, 14px);
  letter-spacing: 0.5px;
  /* line-height: 1.1; */
  text-align: center;
}

/* 避免图标与文字挤压，确保一行容纳 */
.back {
  gap: 8px;
  /* 原 6px -> 8px，空间更均衡 */
}

/* === B. 左侧分类项字号轻量响应（保持你原风格）=== */
.name-cn {
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.15;
  white-space: nowrap;
  /* 防止两字一行的断行 */
}

.name-en {
  font-size: clamp(12px, 1.2vw, 14px);
}

/* === C. 数量徽标：严格居中 & 1~3 位自适应 === */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  /* 单个数字圆点直径 */
  height: 20px;
  padding: 0 6px;
  /* 两位数会变椭圆胶囊 */
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

/* 自定义确认弹窗按钮样式 */
:deep(.el-message-box__btns .el-button--primary) {
  background-color: #b68d41 !important;
  border-color: #b68d41 !important;
  color: white !important;
}

:deep(.el-message-box__btns .el-button) {
  background-color: #f5f5f5 !important;
  color: #666 !important;
  border-color: #dcdfe6 !important;
}

/* 保留原有的类名样式，以防Element Plus版本差异 */
:global(.confirm-button) {
  background-color: #b68d41 !important;
  border-color: #b68d41 !important;
  color: white !important;
  outline: none !important;
}

:global(.cancel-button) {
  background-color: #f5f5f5 !important;
  color: #666 !important;
  border-color: #dcdfe6 !important;
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
  .menu-choose-page {
    min-height: 100dvh;
  }
}

.menu-choose-page::before {
  content: "";
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px;
  /* 同步 sidebar 宽度 */
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  z-index: 0;
}

.category-sidebar,
.menu-content {
  position: relative;
  z-index: 1;
}

/* 宽度断点同步（你之前也可加过，保留一致即可） */
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
</style>