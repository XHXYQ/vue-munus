<template>
  <div class="order-info-page">
    <div class="order-box">
      <img src="@/assets/SealCheck.svg" class="check-icon" alt="已提交图标" />
      <div class="message">您的订单已收到，请您耐心等候！</div>
      <div class="message-en">Your order has been received. Please wait patiently!</div>

      <div class="button-group">
        <button class="btn light" @click="goHome">返回首页 <div class="en">Return to the homepage</div></button>
        <button class="btn light" @click="viewOrder">查看订单 <div class="en">View the order</div></button>
        <button class="btn dark" @click="continueAdd">继续加菜 <div class="en">Continue to add dishes to the menu</div>
        </button>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <div class="order-dialog" v-if="showDialog">
      <!-- <div class="dialog-box">
        <div class="dialog-header">
          <span>查看订单</span>
          <span class="close" @click="showDialog = false">✕</span>
        </div>

        <table class="dialog-table">
          <thead class="dialog-header-row">
            <tr>
              <th>序号</th>
              <th>菜品名称</th>
              <th>数量</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, idx) in dishes" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="name-cn">{{ item.name }}</div>
                <div class="name-en">{{ item.en }}</div>
              </td>
              <td>{{ item.count }}</td>
            </tr>
          </tbody>
        </table>

        <div class="remark">备注：{{ remark || "无" }}</div>

        <div class="dialog-footer">
          <button @click="copyContent">复制内容</button>
        </div>
      </div> -->
      <!-- ✅ 修改后的结构：将 scroll 区域包裹在 .dialog-content 中 -->
      <div class="dialog-box">
        <div class="nav-button left" v-if="orderIndex !== 0" @click="prevOrder">
          <el-icon class="back-icon"><ArrowLeftBold /></el-icon>
        </div>
        <div class="nav-button right" v-if="orderIndex !== orders.length - 1" @click="nextOrder">
          <el-icon class="back-icon"><ArrowRightBold /></el-icon>
        </div>
        <div class="dialog-header">
          <div class="dialog-title">
            <span>查看订单</span>
            <div class="en">View the order </div>
          </div>
          <span class="close" @click="showDialog = false">✕</span>
        </div>

        <div class="order-id">{{ orders[orderIndex]?.datetime || '' }}</div>

        <div class="menu-list">
          <div v-for="(group, groupIndex) in (orders[orderIndex]?.dishes || [])" :key="groupIndex">
            <div class="cart-group-name-cn">{{ group.cartCategoryName }}</div>
            <div class="cart-group-name-en">{{ group.cartCategoryNameEn }}</div>
            <div class="table-wrapper">
              <table class="dish-table">
                <thead>
                  <tr>
                    <th>序号<div class="en">number</div>
                    </th>
                    <th>菜品名称<div class="en">Dish name</div>
                    </th>
                    <th>数量<div class="en">Quantity</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="cart-item" v-for="(dish, index) in group.children" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div class="dish-name-cn">{{ dish.name }}</div>
                      <div class="dish-name-en">{{ dish.en }}</div>
                    </td>
                    <td>
                      <div class="quantity-control">
                        <span>{{ dish.count }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- 订单备注 -->
              <!-- <div class="order-remark-row">
              <div class="remark-content">
                <span v-if="orderRemark">备注：{{ orderRemark }}</span>
                <span v-else class="add-remark" @click="openRemarkDialog">+ 添加备注</span>
              </div>
              <div v-if="orderRemark" class="edit-btn-wrapper">
                <span class="edit-remark" @click="openRemarkDialog">✎ 修改</span>
              </div>
            </div> -->
            </div>
          </div>

          <div class="order-remark">
            <div class="remark-title">备注：</div>
            <div class="remark-content">{{ orders[orderIndex]?.remark || '' }}</div>
          </div>
        </div>

        <div class="dialog-footer">
          <button @click="copyContent">复制内容 Copy</button>
        </div>


        <!-- <div class="dialog-content">
          <table class="dialog-table">
            <thead class="dialog-header-row">
              <tr class="dialog-header-row-tr">
                <th>序号</th>
                <th>菜品名称</th>
                <th>数量</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, idx) in dishes" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>
                  <div class="name-cn">{{ item.name }}</div>
                  <div class="name-en">{{ item.en }}</div>
                </td>
                <td>{{ item.count }}</td>
              </tr>
            </tbody>
          </table>

          <div class="remark">备注：{{ remark || "无" }}</div>

          <div class="dialog-footer">
            <button @click="copyContent">复制内容</button>
          </div>
        </div> -->
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeftBold, ArrowRightBold } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const dishes = ref([]);
const remark = ref("");
const orders = ref([]);
const orderIndex = ref(null);
const showDialog = ref(false);

onMounted(() => {
  dishes.value = JSON.parse(route.query.dishes || "[]");
  remark.value = route.query.remark || "";

  orders.value = JSON.parse(localStorage.getItem("historyOrders") || "[]");
  orderIndex.value = orders.value.length - 1;
});

// 切换到上一个订单
const prevOrder = () => {
  if (orderIndex.value > 0) {
    orderIndex.value--;
  }
};

// 切换到下一个订单
const nextOrder = () => {
  if (orderIndex.value < orders.value.length - 1) {
    orderIndex.value++;
  }
};

const goHome = () => router.push("/index");

const continueAdd = () => {
  const dishesAll = JSON.parse(localStorage.getItem('cachedDishesAll'));
  for (const key in dishesAll) {
    dishesAll[key].submitted = dishesAll[key].count;
  }
  localStorage.setItem('cachedDishesAll', JSON.stringify(dishesAll));
  
  const category = route.query.category || "chinese";
  const name = route.query.name || "中式佳肴"; // 默认值
  router.push({ path: "/menuChoose", query: { type: category, name, isContinue: 1 } });
};

const viewOrder = () => {
  showDialog.value = true;
};

// function copyContent() {
//   // const now = new Date();
//   // const datetime = now.toISOString().replace("T", " ").substring(0, 19);
//   const currentOrder = orders.value[orderIndex.value];

//   let content = `订单：\n时间：${currentOrder.datetime}\n\n菜系\n`;

//   console.log("🚀 ~ copyContent ~ currentOrder.dishes:", currentOrder.dishes)
//   for (const category of currentOrder.dishes) {
//     for (const item of category.children) {
//       console.log("🚀 ~ copyContent ~ item:", item)
//       content += `${item.name} x${item.count}\n`;
//     }
//   }

//   content += `\n备注：\n${currentOrder.remark || "无"}\n`;

//   navigator.clipboard.writeText(content).then(() => {
//     ElMessage.success("已复制订单内容");
//   });
// }
function copyContent() {
  const currentOrder = orders.value[orderIndex.value];

  let content = `订单：\n时间：${currentOrder.datetime}\n\n菜系\n`;

  for (const category of currentOrder.dishes) {
    for (const item of category.children) {
      content += `${item.name} x${item.count}\n`;
    }
  }

  content += `\n备注：\n${currentOrder.remark || "无"}\n`;

  // 首先尝试使用现代的 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(content).then(() => {
      ElMessage.success("已复制订单内容");
    }).catch(() => {
      // 如果现代 API 失败，使用降级方案
      fallbackCopyTextToClipboard(content);
    });
  } else {
    // 如果不支持 Clipboard API，直接使用降级方案
    fallbackCopyTextToClipboard(content);
  }
}

// 降级方案：使用 document.execCommand('copy')
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // 避免滚动到底部
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.zIndex = "-1";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      ElMessage.success("已复制订单内容");
    } else {
      ElMessage.error("复制失败，请手动复制");
    }
  } catch (err) {
    ElMessage.error("复制失败，请手动复制");
  }
  
  document.body.removeChild(textArea);
}
</script>

<style scoped>
.order-info-page {
  background: url("@/assets/index2.png") no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  /* font-family: "Noto Serif SC", serif; */
}

.order-box {
  background: rgba(145, 118, 81, 0.65);
  border-radius: 16px;
  /* padding: 40px 32px; */
  padding: 5vh;
  text-align: center;
  color: #fff;
  width: 60%;
  user-select: none;
}

.check-icon {
  width: 128px;
  height: 128px;
  margin: 0 auto 24px;
  display: block;
  aspect-ratio: 1/1;
}

.message {
  font-size: 28px;
  font-style: normal;
  line-height: 32px;
  letter-spacing: 4.2px;
  font-weight: 700;
  color: #ffffff;
}

.message-en {
  font-size: 16px;
  margin-top: 4px;
  margin-bottom: 40px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn {
  padding: 12px 0;
  font-size: 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-family: 'Source Han Serif CN Bold';
}

.btn .en {
  margin-top: 2px;
  font-size: 14px;
}

.btn.light {
  background: #b39253;
  color: white;
  width: 272px;
}

.btn.dark {
  background: #7a5700;
  color: white;
  width: 272px;
}

.order-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

/* .dialog-box {
    background: #f5e3c6;
    width: 500px;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    color: #7a5700;
  } */
/* .dialog-box {
  background: #f5e3c6;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #7a5700;
} */

/* .dialog-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-bottom: 16px;
  } */
/* .dialog-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 16px;
  position: sticky;
  top: 0;
  background: #f5e3c6;
  z-index: 1;
  padding-top: 8px;
} */
.dialog-box {
  background: #D4C0A8;
  /* width: 500px; */
  width: 70vw;
  max-height: 85vh;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #7a5700;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  padding-right: 0;
  position: relative;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(136, 100, 23, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: white;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.3s;
}

.nav-button:hover {
  background: rgba(136, 100, 23, 1);
}

.nav-button.left {
  left: -60px;
}

.nav-button.right {
  right: -60px;
}

.dialog-header {
  position: sticky;
  top: 0;
  /* padding: 16px 24px; */
  display: flex;
  justify-content: space-between;
  z-index: 2;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding-right: 24px;
}

.order-id {
  color: white;
  font-size: 16px;
  border-radius: 4px;
  padding: 4px 8px;
  background: #88641780;
  margin-right: 24px;
  width: max-content;
  user-select: text;
}

.dialog-content {
  padding: 16px 24px 24px;
  overflow-y: auto;
  flex: 1;
  /* 占满剩余高度 */
  max-height: 80vh;
  /* 限高，触发滚动 */
  border-bottom-right-radius: 6px;
}


.dialog-header .close {
  cursor: pointer;
  font-size: 20px;
}

.dialog-header span {
  font-size: 20px;
  font-weight: 700;
  color: #886417;
  line-height: normal;
  /* font-family: "Source Han Serif CN"; */
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  /* padding: 16px; */
  overflow-y: auto;
  /* 添加滚动条样式 */
  scrollbar-width: thin;
  /* 对于 Firefox */
  scrollbar-color: #886417 rgba(102, 66, 33, 0.25);
  /* 对于 Firefox */
  color: #886417;
  padding-right: 24px;
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
  max-height: calc(100vh - 240px);
  overflow-y: auto;

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
  color: white;
}

.dish-table th .en {
  font-size: 14px;
  line-height: 14px;
}

.dish-table th:first-child {
  border-radius: 8px 0 0 0;
}

.dish-table th:nth-child(2),
.dish-table td:nth-child(2) {
  text-align: left;
  width: 70%;
}

.dish-table th:last-child {
  border-radius: 0 8px 0 0;
}

/* .dish-table th, */
.dish-table td {
  user-select: text;
  padding: 20px;
  border-bottom: 1px solid #fcfcfc;
  text-align: center;
  color: #886417;
  font-size: 16px;
}

.dish-name-cn {
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 3px;
  font-style: normal;
}

.dish-name-en {
  font-size: 16px;
  font-weight: 500;
  font-family: "Source Han Serif CN Medium";
  letter-spacing: 2.4px;
  line-height: 20px;
  font-style: normal;
  margin-top: 8px;
}

.menu-list .remark-content {
  font-size: 16px;
  font-family: 'Source Han Serif CN Medium';
  user-select: text;
}

/* 
.dialog-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.dialog-table th,
.dialog-table td {
  text-align: center;
  padding: 8px 0;
  border-bottom: 1px solid #d3b78a;
}

.dialog-header-row th {
  color: white;
  font-weight: 700;
  background-color: #886417;
}

.name-cn {
  font-weight: 700;
  font-size: 16px;
  font-style: normal;
}

.name-en {
  font-size: 12px;
  color: #8c6e45;
} */

.remark {
  margin-top: 12px;
  font-size: 14px;
}

.dialog-footer {
  text-align: center;
  border-bottom-left-radius: 6px;
  /* ✅ 添加圆角 */
  border-bottom-right-radius: 6px;
  /* ✅ 添加圆角 */
}

.dialog-footer button {
  background: #7a5700;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background-color: #886417;
  border-radius: 4px;
}

.dialog-content::-webkit-scrollbar-track {
  background-color: #f5e3c6;
}

.dialog-header-row-tr th:first-child {
  border-top-left-radius: 8px;
  overflow: hidden;
}

.dialog-header-row-tr th:last-child {
  border-top-right-radius: 8px;
  overflow: hidden;
}
</style>
