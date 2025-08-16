<template>
  <div class="confirm-page">
    <div class="header-row">
      <div class="top-bar" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeftBold /></el-icon>
        <div class="top-bar-text">
          <div class="zh">返回选择菜品</div>
          <div class="en">Back</div>
        </div>
      </div>

      <h1 class="title">
        <div class="zh">确认菜单</div>
        <div class="en">Confirm Menu</div>
      </h1>
    </div>

    <div class="table-wrapper">
      <table class="dish-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>菜品名称</th>
            <th>数量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dish, index) in dishes" :key="dishKey(dish)">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="dish-name-cn">{{ dish.name }}</div>
              <div class="dish-name-en">{{ dish.en }}</div>
            </td>
            <td>
              <div class="quantity-control">
                <button @click="decrease(dish)">－</button>
                <span>{{ dish.count }}</span>
                <button @click="increase(dish)">＋</button>
              </div>
            </td>
            <td>
              <span class="delete-btn" @click="removeDish(dish)">
                <img src="@/assets/menu/TrashSimple.svg" class="trash-icon" />
                删除
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 订单备注 -->
      <div class="order-remark-row">
        <div class="remark-content">
          <span v-if="orderRemark">备注：{{ orderRemark }}</span>
          <span v-else class="add-remark" @click="openRemarkDialog">+ 添加备注</span>
        </div>
        <div v-if="orderRemark" class="edit-btn-wrapper">
          <span class="edit-remark" @click="openRemarkDialog">✎ 修改</span>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <button class="back-btn" @click="router.back()">
        <div class="zh">返回</div><div class="en">Back</div>
      </button>
      <button class="submit-btn" @click="submitOrder">
        <div class="zh">提交</div><div class="en">Submit</div>
      </button>
    </div>

    <!-- 备注弹窗 -->
    <div class="remark-modal" v-if="showRemarkDialog">
      <div class="remark-dialog">
        <div class="remark-header">
          <span>添加备注</span>
          <span class="close" @click="showRemarkDialog = false">✕</span>
        </div>
        <textarea v-model="tempRemark" placeholder="请输入备注内容" />
        <div class="remark-footer">
          <button class="cancel" @click="showRemarkDialog = false">取消</button>
          <button class="confirm" @click="confirmRemark">确认并提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeftBold } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();

const CART_KEY = 'cachedDishesAll';
const orderRemark = ref("");
const tempRemark = ref("");
const showRemarkDialog = ref(false);

const dishes = ref([]); // 此页展示用（数组）
const cartMap = ref({}); // 全局购物车镜像（对象）

function dishKey(dish) {
  return dish.id ?? dish.dishId ?? dish.code ?? dish.name;
}

function loadCart() {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    cartMap.value = raw ? JSON.parse(raw) : {};
  } catch {
    cartMap.value = {};
  }
}
function saveCart() {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cartMap.value));
}
function syncListFromMap() {
  dishes.value = Object.values(cartMap.value);
}

onMounted(() => {
  loadCart();
  // 兼容从菜单页 query 传来的 items，但以全局购物车为准
  const fromQuery = route.query.items ? JSON.parse(route.query.items) : null;
  if (fromQuery && fromQuery.length && Object.keys(cartMap.value).length === 0) {
    const tmp = {};
    fromQuery.forEach(d => (tmp[dishKey(d)] = d));
    cartMap.value = tmp;
    saveCart();
  }
  syncListFromMap();
});

function increase(dish) {
  const key = dishKey(dish);
  const next = (cartMap.value[key]?.count || 0) + 1;
  cartMap.value[key] = { ...dish, count: next };
  saveCart();
  syncListFromMap();
}

function decrease(dish) {
  const key = dishKey(dish);
  const cur = cartMap.value[key]?.count || 0;
  if (cur <= 1) {
    const { [key]: _, ...rest } = cartMap.value;
    cartMap.value = rest;
  } else {
    cartMap.value[key] = { ...dish, count: cur - 1 };
  }
  saveCart();
  syncListFromMap();
}

function removeDish(dish) {
  const key = dishKey(dish);
  const { [key]: _, ...rest } = cartMap.value;
  cartMap.value = rest;
  saveCart();
  syncListFromMap();
}

function submitOrder() {
  if (dishes.value.length === 0) {
    ElMessage.warning("请至少选择一个菜品再提交");
    return;
  }
  // 此处可根据业务封装为后端需要的提交结构
  // 仍然保持你的原路由跳转
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
  tempRemark.value = orderRemark.value;
  showRemarkDialog.value = true;
}
function confirmRemark() {
  orderRemark.value = tempRemark.value;
  showRemarkDialog.value = false;
}
</script>



<style scoped>
.confirm-page {
  background: url("@/assets/index2.png") no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  padding: 24px;
  font-family: "Noto Serif SC", serif;
  color: #886417;
  box-sizing: border-box;
  position: relative;
  font-size: 16px;
}

.header-row {
  position: relative; /* 让标题可以绝对定位在这行中 */
  padding: 0 24px;
  margin-bottom: 24px;
  height: 48px; /* 你可以根据视觉需要调整 */
}


.top-bar {
  font-size: 24px;
  color: #886417;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 700;
  letter-spacing: 2.4px;
  height: 100%;
}

.back-icon {
  font-size: 20px;
  margin-right: 6px;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  font-weight: 900;
  color: #886417;
  font-family: "Source Han Serif CN";
  letter-spacing: 6px;
  line-height: 1;
  margin: 0;
  white-space: nowrap;
  margin-top: -46px;
}

.table-wrapper {
  background: rgba(102, 66, 33, 0.25);
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  /* 添加滚动条样式 */
  scrollbar-width: thin; /* 对于 Firefox */
  scrollbar-color: #886417 rgba(102, 66, 33, 0.25); /* 对于 Firefox */
  border-radius: 8px;
background: rgba(64, 44, 13, 0.35);
backdrop-filter: blur(10px);
}

/* 针对 Webkit 浏览器 (Chrome, Safari) 的滚动条样式 */
.table-wrapper::-webkit-scrollbar {
  width: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: rgba(102, 66, 33, 0.25);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background-color: #886417;
  border-radius: 4px;
}

.dish-table {
  width: 100%;
  border-collapse: collapse;
}

.dish-table th,
.dish-table td {
  padding: 12px;
  border-bottom: 1px solid #fcfcfc;
  text-align: center;
  color: #fff;
  font-size: 16px;
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
  font-family: "Source Han Serif CN";
  letter-spacing: 2.4px;
  line-height: 20px;
  font-style: normal;
}

.quantity-control {
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
}

.delete-btn {
  color: red;
  cursor: pointer;
}

.bottom-actions {
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
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
  justify-content: space-evenly;
  align-items: end;
}

.back-btn {
  background: rgba(136, 100, 23, 0.5);
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
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
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
  background: rgba(0, 0, 0, 0.6); /* 可调深浅 */
  backdrop-filter: blur(8px); /* 关键：模糊效果 */
  -webkit-backdrop-filter: blur(8px); /* Safari 支持 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.remark-dialog {
  background: #D4C0A8;
  padding: 24px 32px;
  width: 480px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-family: "Source Han Serif CN";
  color: #5e4003;
  position: relative;
}


.remark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #5e4003;
}

.remark-header .close {
  font-size: 20px;
  font-weight: normal;
  cursor: pointer;
}


.remark-dialog textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  font-size: 15px;
  border: none; /* 去掉黑色边框 */
  outline: none; /* 去掉点击后的黑色高亮框 */
  border-radius: 8px;
  background: #fffdf7;
  color: #5e4003;
  resize: none;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 1px #d8c3a0; /* 可选：柔和内边框 */
}



.remark-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
}

.remark-footer button {
  padding: 8px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.remark-footer .cancel {
  background: rgba(136, 100, 23, 0.5);
  color: white;
}

.remark-footer .confirm {
  background: #886417;
  color: white;
}


.trash-icon {
  width: 16px;
  height: 16px;
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
  transform: translateX(-50%);
  font-size: 32px;
  font-weight: 900;
  color: #886417;
  font-family: "Source Han Serif CN";
  letter-spacing: 6px;
  line-height: 1.1;
  margin: 0;
  white-space: nowrap;
  margin-top: -46px;
  text-align: center;
}

.title .zh {
  font-size: 40px;
}

.title .en {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.7;
  letter-spacing: 2px;
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
