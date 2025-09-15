<template>
  <div class="confirm-page">
    <div class="header-row">
      <div class="top-bar" @click="router.back()">
        <el-icon class="back-icon">
          <ArrowLeftBold />
        </el-icon>
        <div class="top-bar-text">
          <div class="zh">返回选择菜品</div>
          <div class="en">Back</div>
        </div>
      </div>
      <el-popover placement="bottom-end" trigger="click" :showArrow="false"
        popperStyle="background: #D4C0A8; border: none;" width="20rem">
        <template #reference>
          <div class="top-bar">
            <el-icon class="back-icon">
              <Clock />
            </el-icon>
            <div class="top-bar-text">
              <div class="zh">历史记录</div>
              <div class="en">records</div>
            </div>
          </div>
        </template>
        <div class="history-board">
          <div class="history-board-title">
            <div class="zh">当前显示记录</div>
            <div class="en">Current display record</div>
          </div>
          <div class="history-board-list">
            <div class="history-item" :class="orderIndex === index ? 'activeOrder' : ''"
              v-for="(item, index) in historyOrders" :key="index" @click="selectHistoryOrder(item, index)">
              <div class="item-title">{{ item.datetime }}</div>
              <img class="" src="@/assets/checked.svg" alt="√" v-show="orderIndex === index"/>
            </div>
            <div class="history-item" :class="orderIndex === -1 ? 'activeOrder' : ''" @click="orderIndex = -1">
              <div class="item-title">当前待下单</div>
              <img class="" src="@/assets/checked.svg" alt="√" v-show="orderIndex === -1"/>
            </div>
          </div>
        </div>
      </el-popover>

      <h1 class="title">
        <div class="zh">确认菜单</div>
        <div class="en">Confirm Menu</div>
      </h1>
    </div>

    <div class="menu-container">
      <div class="menu-list" @touchstart="handleListTouchStart" @touchend="handleListTouchEnd"
        @touchmove="handleListTouchScroll($event, '.menu-list')">
        <div v-for="(group, groupIndex) in (orderIndex == -1 ? dishes : currentOrder)" :key="groupIndex">
          <div class="cart-group-name-cn">{{ group.cartCategoryName }}</div>
          <div class="cart-group-name-en">{{ group.cartCategoryNameEn }}</div>
          <div class="table-wrapper">
            <table class="dish-table">
              <thead>
                <tr>
                  <th>序号<div class="en">Number</div>
                  </th>
                  <th>菜品名称<div class="en">Dish name</div>
                  </th>
                  <th>数量<div class="en">Quantity</div>
                  </th>
                  <th v-if="orderIndex == -1">操作<div class="en">Operation</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="cart-item" v-for="(dish, index) in group.children" :key="dishKey(dish)">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="dish-name-cn">{{ dish.name }}</div>
                    <div class="dish-name-en">{{ dish.en }}</div>
                  </td>
                  <td>
                    <div class="quantity-control">
                      <button @click="decrease(dish)" v-if="orderIndex == -1">-</button>
                      <span>{{ dish.count }}</span>
                      <button @click="increase(dish)" v-if="orderIndex == -1">+</button>
                    </div>
                  </td>
                  <td  v-if="orderIndex == -1">
                    <span class="delete-btn" @click="removeDish(dish)">
                      <img src="@/assets/trash.svg" class="trash-icon" />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 订单备注 -->
        <div class="order-remark" v-if="orderIndex !== -1">
          <div class="remark-title">备注：</div>
          <div class="remark-content">{{ currentRemark || '' }}</div>
        </div>
      </div>

      <div class="bottom-actions" v-if="orderIndex == -1">
        <button class="back-btn" @click="router.back()">
          <div class="zh">返回</div>
          <div class="en">Back</div>
        </button>
        <button class="submit-btn" @click="openRemarkDialog">
          <div class="zh">提交</div>
          <div class="en">Submit</div>
        </button>
      </div>
    </div>

    <!-- 备注弹窗 -->
    <div class="remark-modal" v-if="showRemarkDialog">
      <div class="remark-dialog">
        <div class="remark-header">
          <div class="remark-title">
            <div>添加备注</div>
            <div class="en">Select specifications</div>
          </div>
          <span class="close" @click="showRemarkDialog = false">✕</span>
        </div>
        <div class="remark-label">
          <div>备注</div>
          <div class="en">Remarks</div>
        </div>
        <textarea v-model="tempRemark" placeholder="请输入备注内容  Please enter the remarks" />
        <div class="remark-footer">
          <button class="cancel" @click="showRemarkDialog = false">取消 <span class="en">Cancel</span></button>
          <button class="confirm" @click="submitOrder">提交 <span class="en">Submit</span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox, ElPopover } from "element-plus";
import { ArrowLeftBold, Clock } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();

const CART_KEY = 'cachedDishesAll';
const orderRemark = ref("");
const tempRemark = ref("");
const showRemarkDialog = ref(false);
const historyOrders = ref([]);
const currentOrder = ref([]);
const currentRemark = ref('');
const orderIndex = ref(-1);
const dishes = ref([]); // 此页展示用（数组）
const cartMap = ref({}); // 全局购物车镜像（对象）
const isScrollable = ref(false);

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
function dishKey(dish) {
  return dish.id ?? dish.dishId ?? dish.code ?? dish.name;
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    cartMap.value = raw ? JSON.parse(raw) : {};
    console.log(22,cartMap.value)
  } catch {
    cartMap.value = {};
  }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cartMap.value));
}
function syncListFromMap() {

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
  dishes.value = Object.entries(grouped).map(([cartCategoryName, groupData]) => ({
    cartCategoryName,
    cartCategoryNameEn: groupData.en,
    children: groupData.items
  }));
}
let touchStartY = 0;
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
  } else {
    isScrollable.value = true;
  }
}

function preventPullToRefresh(e) {
  // 处理橡皮筋效果
  if (!isScrollable.value) {
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('touchmove', preventPullToRefresh, { passive: false })

  historyOrders.value = JSON.parse(localStorage.getItem("historyOrders") || "[]");
  console.log(11,historyOrders.value)
  loadCart();
  setTimeout(() => {
    let dishesCopy = JSON.parse(JSON.stringify(globalCartList.value));
    console.log("🚀 ~ confirmMenu.vue:264 ~ dishesCopy:", dishesCopy)
    dishesCopy.forEach(item => { 
      let newChildren = [];
      item.children.forEach(child => {
        if(child.count > 0) {
          newChildren.push(child);
        }
      });
      item.children = newChildren;
    });
    dishesCopy = dishesCopy.filter(item => item.children.length > 0);
    dishes.value = dishesCopy
  }, 100);

  // 兼容从菜单页 query 传来的 items，但以全局购物车为准
  const fromQuery = route.query.items ? JSON.parse(route.query.items) : null;
  console.log("🚀 ~ fromQuery:", fromQuery)
  if (fromQuery && fromQuery.length) {
    // dishes.value = fromQuery;
  }
  // if (fromQuery && fromQuery.length) {
  //   const tmp = {};
  //   fromQuery.forEach(d => (tmp[dishKey(d)] = d));
  //   // cartMap.value = tmp;
  //   console.log("🚀 ~ tmp:", tmp)
  //   // saveCart();
  // }
  // syncListFromMap();
});

onBeforeUnmount(() => {
  document.removeEventListener('touchmove', preventPullToRefresh);
});

const selectHistoryOrder = (order, index) => { 
  orderIndex.value = index;
  currentOrder.value = order.dishes;
  currentRemark.value = order.remark;
};

function increase(dish) {
  if (dish.count == 99) return;
  dish.count++;
  const key = dishKey(dish);
  const next = (cartMap.value[key]?.count || 0) + 1;
  cartMap.value[key] = { ...dish, count: next };
  saveCart();
  // syncListFromMap();
}

function decrease(dish) {
  const key = dishKey(dish);
  const cur = cartMap.value[key]?.count || 0;
  // if(dish.submitted && cur <= dish.submitted) {
  //   ElMessage({
  //     type: 'warning',
  //     message: '已点菜单无法减少'
  //   });
  //   return
  // }
  if (cur <= 1) {
    const { [key]: _, ...rest } = cartMap.value;
    cartMap.value = rest;
  } else {
    cartMap.value[key] = { ...dish, count: cur - 1 };
  }
  saveCart();

  dish.count--;
  console.log("🚀 ~ decrease ~ dish.count:", dish.count)
  if (dish.count == 0) {
    // 删除dishes.value里面这条数据
    for (let i = 0; i < dishes.value.length; i++) {
      const element = dishes.value[i];
      if (element.cartCategoryName === dish.categoryName) {
        element.children = element.children.filter(d => d.id != dish.id);
        // 如果children.length == 0，则删除element
        if (element.children.length == 0) {
          dishes.value.splice(i, 1);
        }
        break;
      }
    }
  }
  // syncListFromMap();
}

function removeDish(dish) {
  ElMessageBox.confirm(
    '',
    `确定删除${dish.name}吗`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      confirmButtonClass: 'confirm-button',
      cancelButtonClass: 'cancel-button',
      customClass: 'custom-message-box'
    }
  ).then(() => {
    console.log("🚀 ~ removeDish ~ dish:", dish)
    const key = dishKey(dish);
    console.log("🚀 ~ removeDish ~ cartMap.value:", cartMap.value[key])
    if (cartMap.value[key].submitted) {
      cartMap.value[key].count = cartMap.value[key].submitted;
    } else {
      delete cartMap.value[key];
    }
    console.log("🚀 ~ removeDish ~ cartMap.value:", cartMap.value)
    saveCart();

    // 删除dishes.value里面这条数据
    for (let i = 0; i < dishes.value.length; i++) {
      const element = dishes.value[i];
      if (element.cartCategoryName === dish.categoryName) {
        element.children = element.children.filter(d => d.id != dish.id);
        // 如果删除的菜品是当前分类下的最后一条数据，则删除该分类
        if (!element.children.length) {
          dishes.value.splice(i, 1);
        }
        break;
      }
    }
    // syncListFromMap();
  }).catch(() => {
    // 用户点击取消或关闭弹窗
    // 不执行任何操作
  });
}

function submitOrder() {
  orderRemark.value = tempRemark.value;
  showRemarkDialog.value = false;

  // dishes.value.forEach((dish) => {
  //   dish.children = dish.children.filter((child) => child.count != child.submitted);
  //   dish.children.forEach((child) => {
  //     if(child.submitted) {
  //       child.count -= child.submitted;
  //       delete child.submitted;
  //     }
  //   });
  // });
  // dishes.value = dishes.value.filter((dish) => dish.children.length > 0);
  // console.log("🚀 ~ submitOrder ~ dishes.value:", dishes.value)

  const now = new Date();
  console.log("🚀 ~ confirmMenu.vue:368 ~ submitOrder ~ now:", now)
  const datetime = now.toLocaleString().replace("T", " ").substring(0, 19);
  console.log(`🚀 ~ confirmMenu.vue:370 ~ submitOrder ~ now.toISOString().replace("T", " "):`, now.toISOString().replace("T", " "))
  const historyOrders = JSON.parse(localStorage.getItem('historyOrders') || '[]');
  historyOrders.push({
    datetime,
    dishes: JSON.parse(JSON.stringify(dishes.value)),
    remark: orderRemark.value,
  });
  localStorage.setItem('historyOrders', JSON.stringify(historyOrders))

  // const localCartList = JSON.parse(localStorage.getItem('cachedDishesAll') || '[]');
  // for (const key in localCartList) {
  //   delete localCartList[key].submitted;
  // }
  localStorage.setItem('cachedDishesAll', []);

  router.push({
    path: "/orderInfo",
    query: {
      dishes: JSON.stringify(dishes.value),
      remark: orderRemark.value,
      category: route.query.type || "",
      name: route.query.name || "",
    },
  });
}

function openRemarkDialog() {
  if (dishes.value.length === 0) {
    ElMessage.warning("请至少选择一个菜品再提交");
    return;
  }

  tempRemark.value = orderRemark.value;
  showRemarkDialog.value = true;
}
function confirmRemark() {
  orderRemark.value = tempRemark.value;
  showRemarkDialog.value = false;
}
</script>



<style scoped>
:global(.custom-message-box .el-message-box__title) {
  max-width: 100%;
  width: max-content;
  align-items: baseline !important;
}
:global(.custom-message-box .el-message-box__title span) {
  display: block;
  flex: 1;
  width: max-content;
  word-break: break-word;
}

.confirm-page {
  background: url("@/assets/index2.png") no-repeat center center;
  background-size: cover;
  /* padding: 24px; */
  font-family: "Noto Serif SC", serif;
  color: #886417;
  box-sizing: border-box;
  position: relative;
  font-size: 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  font-family: 'Source Han Serif CN Bold';
  user-select: none;
}

.header-row {
  position: relative;
  /* padding: 0 24px; */
  padding-top: 28px;
  margin-bottom: 32px;
  /* height: 48px; */
  height: max-content;
  flex: none;
  display: flex;
  justify-content: space-between;
}


.top-bar {
  text-align: center;
  font-family: 'Source Han Serif CN Bold';
  font-size: 24px;
  color: #886417;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 700;
  letter-spacing: 2.4px;
  height: auto;
  width: max-content;
  padding-right: 16px;
}

.top-bar .en {
  font-size: 16px;
  margin-top: 4px;
}

.history-board {
  /* width: max-content; */
  font-family: 'Source Han Serif CN Bold';
  color: #886417;
}

.history-board-title {
  width: max-content;
}

.history-board-title .zh {
  font-family: 'Source Han Serif CN Heavy';
  font-size: 20px;
}

.history-board-title .en {
  font-size: 14px;
}

.history-board-list {
  margin-top: 4px;
}

.history-board-list .history-item {
  padding: 10px 8px;
  font-size: 16px;
  border-radius: 8px;
}

.history-board-list .history-item.activeOrder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #88641780;
  color: white;
}



.back-icon {
  font-size: 20px;
  margin-right: 6px;
  color: #886417;
}

.menu-container {
  backdrop-filter: blur(10px);
  background: rgba(64, 44, 13, 0.35);
  border-radius: 20px;
  /* height: 100%; */
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 针对 Webkit 浏览器 (Chrome, Safari) 的滚动条样式 */
.menu-container::-webkit-scrollbar {
  width: 8px;
}

.menu-container::-webkit-scrollbar-track {
  background: transparent;
  /* 滚动槽背景色设为透明 */
  border-radius: 4px;
}

.menu-container::-webkit-scrollbar-thumb {
  background-color: #886417;
  border-radius: 4px;
}

/* 隐藏滚动条上下按钮 */
.menu-container::-webkit-scrollbar-button {
  display: none;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  /* 添加滚动条样式 */
  scrollbar-width: thin;
  /* 对于 Firefox */
  scrollbar-color: #886417 rgba(102, 66, 33, 0.25);
  /* 对于 Firefox */
  color: white;
}

.menu-list .cart-group-name-cn {
  font-size: 16px;
}

.menu-list .cart-group-name-en {
  font-size: 14px;
  font-family: 'Source Han Serif CN Medium';
}

.table-wrapper {
  /* background: rgba(102, 66, 33, 0.25); */
  border-radius: 12px;
  /* padding: 24px; */
  margin-top: 24px;
  box-sizing: border-box;
  /* max-height: calc(100vh - 240px); */
  /* overflow-y: auto; */

  border-radius: 8px;
  /* background: rgba(64, 44, 13, 0.35); */
  /* backdrop-filter: blur(10px); */
}

.dish-table {
  width: 100%;
  border-collapse: collapse;
}

.dish-table th {
  background: #88641766;
  padding: 20px;
  font-size: 20px;
}

.dish-table th .en {
  font-size: 14px;
  line-height: 14px;
}

.dish-table th:first-child {
  border-radius: 8px 0 0 0;
  width: 10%;
}

.dish-table th:nth-child(2),
.dish-table td:nth-child(2) {
  text-align: left;
  width: 40%;
}

.dish-table th:last-child {
  border-radius: 0 8px 0 0;
}

/* .dish-table th, */
.dish-table td {
  padding: 20px;
  border-bottom: 1px solid #fcfcfc;
  text-align: center;
  color: #fff;
  font-size: 16px;
  text-align: left;
}

.dish-name-cn {
  font-weight: 700;
  font-size: 20px;
  color: #fefdfb;
  line-height: 24px;
  letter-spacing: 3px;
  font-style: normal;
}

.dish-name-en {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-family: "Source Han Serif CN Medium";
  letter-spacing: 2.4px;
  line-height: 20px;
  font-style: normal;
  margin-top: 8px;
}

/* .quantity-control {
  display: flex;
  justify-content: center;
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
  } */

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
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

.delete-btn {
  color: red;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-actions {
  flex: none;
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 12px 0;
}

.bottom-actions button {
  padding: 10px 32px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  /* justify-content: space-evenly; */
  jsustify-content: center;
  align-items: end;
  gap: 8px;
}

.back-btn {
  background: #88641780;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
}

.submit-btn {
  background: #886417;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
}

.order-remark-row {
  margin-top: 16px;
  font-size: 14px;
  color: #7b5500;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 12px;
  word-break: break-word;
}

.remark-content {
  font-size: 16px;
  font-family: 'Source Han Serif CN Medium';
  user-select: text;
  white-space: pre-wrap; /* 允许换行 */
  word-wrap: break-word; /* 防止长单词溢出 */
}

.edit-btn-wrapper {
  display: flex;
  justify-content: flex-end;
}

.add-remark {
  color: #fefdfb;
  cursor: pointer;
  font-size: 23px;
}

.edit-remark {
  color: #a07c49;
  cursor: pointer;
}

.remark-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  /* 可调深浅 */
  backdrop-filter: blur(8px);
  /* 关键：模糊效果 */
  -webkit-backdrop-filter: blur(8px);
  /* Safari 支持 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.remark-dialog {
  background: #D4C0A8;
  padding: 20px 24px;
  width: 55vw;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-family: "Source Han Serif CN Bold";
  color: #886417;
  position: relative;
}

.remark-dialog .en {
  font-family: "Source Han Serif CN Medium";
}


.remark-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

.remark-header .remark-title .en {
  font-size: 16px;
}

.remark-header .close {
  font-size: 20px;
  font-weight: normal;
  cursor: pointer;
}

.remark-label {
  font-size: 16px;
}

.remark-label .en {
  font-size: 14px;
}

.remark-dialog textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  font-size: 15px;
  border: none;
  /* 去掉黑色边框 */
  outline: none;
  /* 去掉点击后的黑色高亮框 */
  border-radius: 8px;
  background: transparent;
  color: #5e4003;
  resize: none;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 1px #d8c3a0;
  /* 可选：柔和内边框 */
  border: 1px solid #886417;
  margin-top: 4px;
}

/* 修改 placeholder 的样式 */
.remark-dialog textarea::placeholder {
  color: #00000033;
  /* 设置 placeholder 颜色 */
  font-size: 14px;
  /* 设置 placeholder 字体大小 */
  opacity: 0.7;
  /* 可选：调整透明度 */
}

/* 兼容 Webkit 浏览器 */
.remark-dialog textarea::-webkit-input-placeholder {
  color: #00000033;
  font-size: 14px;
}

/* 兼容 Mozilla 浏览器 */
.remark-dialog textarea::-moz-placeholder {
  color: #00000033;
  font-size: 14px;
}

/* 兼容 IE 浏览器 */
.remark-dialog textarea:-ms-input-placeholder {
  color: #00000033;
  font-size: 14px;
}

.remark-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
  font-family: 'Source Han Serif CN Bold';
}

.remark-footer button {
  padding: 8px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.remark-footer button .en {
  font-size: 14px;
}

.remark-footer .cancel {
  background: rgba(136, 100, 23, 0.5);
  color: white;
}

.remark-footer .cancel .en {
  color: #DCDCDC;
}

.remark-footer .confirm {
  background: #886417;
  color: white;
}


.trash-icon {
  width: 18px;
  height: 18px;
  margin-right: 4px;
  vertical-align: middle;
}

.top-bar-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.title {
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translateX(-50%);
  font-size: 40px;
  font-weight: 900;
  color: #886417;
  letter-spacing: 6px;
  line-height: 1.1;
  margin: 0;
  white-space: nowrap;
  /* margin-top: -46px; */
  text-align: center;
}

.title .zh {
  font-family: "Source Han Serif CN Heavy";
  font-size: 40px;
}

.title .en {
  font-family: "Source Han Serif CN Bold";
  font-size: 18px;
  font-weight: 500;
  opacity: 0.7;
  letter-spacing: 2px;
  margin-top: 6px;
}

.bottom-actions button .zh {
  font-size: 16px;
  font-weight: 700;
}

.bottom-actions button .en {
  font-size: 12px;
  opacity: 0.8;
}
</style>
