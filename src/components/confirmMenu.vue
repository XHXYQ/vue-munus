<template>
    <div class="confirm-page">
      <!-- 返回选择菜品 -->
      <div class="top-bar" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeftBold /></el-icon>
        返回选择菜品
      </div>
  
      <h1 class="title">确认菜单</h1>
  
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
            <tr v-for="(dish, index) in dishes" :key="dish.name">
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
                <span class="delete-btn" @click="remove(index)">🗑 删除</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 添加订单备注 -->
<div class="order-remark-row">
  <span v-if="orderRemark">备注：{{ orderRemark }}</span>
  <span v-else class="add-remark" @click="openRemarkDialog">+ 添加备注</span>
  <span v-if="orderRemark" class="edit-remark" @click="openRemarkDialog">✎ 修改</span>
</div>

      </div>
  
      <!-- 固定底部操作栏 -->
      <div class="bottom-actions">
        <button class="back-btn" @click="router.back()">返回</button>
        <button class="submit-btn" @click="submitOrder">提交</button>
      </div>
    </div>

    <!-- 添加备注弹窗 -->
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

  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ArrowLeftBold } from '@element-plus/icons-vue'
  
  const route = useRoute();
  const router = useRouter();

  const orderRemark = ref(""); // 整个订单备注
const tempRemark = ref(""); // 弹窗临时输入
const showRemarkDialog = ref(false); // 添加这一行！！

  
  const dishes = ref([]);
  
  onMounted(() => {
    const items = route.query.items;
    if (items) {
      dishes.value = JSON.parse(items);
    }
  });
  
  function increase(dish) {
    dish.count++;
  }
  
  function decrease(dish) {
    if (dish.count > 1) dish.count--;
  }
  
  function remove(index) {
    dishes.value.splice(index, 1);
  }
  
  function submitOrder() {
  console.log("提交菜单：", dishes.value);
  console.log("备注：", orderRemark.value);

  router.push({
    path: '/orderInfo',
    query: {
      dishes: JSON.stringify(dishes.value),
      remark: orderRemark.value
    }
  })
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
    background: url("@/assets/menu/menubg.svg") no-repeat center center;
    background-size: cover;
    min-height: 100vh;
    padding: 24px;
    font-family: "Noto Serif SC", serif;
    color: #5e4003;
    box-sizing: border-box;
    position: relative;
  }
  
  .top-bar {
    font-size: 16px;
    color: #a07417;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-weight: bold;
  }
  
  .back-icon {
    font-size: 20px;
    margin-right: 6px;
  }
  
  .title {
    font-size: 28px;
    text-align: center;
    color: #7b5500;
    letter-spacing: 4px;
    margin-bottom: 24px;
  }
  
  .table-wrapper {
    background: rgba(102, 66, 33, 0.25);
    border-radius: 12px;
    padding: 24px;
    box-sizing: border-box;
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
  }
  
  .dish-name-cn {
    font-weight: bold;
    font-size: 16px;
    color: #fefdfb;
  }
  
  .dish-name-en {
    font-size: 13px;
    color: #f1e9db;
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
    font-size: 16px;
    background: none;
    border: 1px solid #fff;
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
    background: linear-gradient(to top, rgba(245, 232, 213, 0.9), rgba(245, 232, 213, 0));
  }
  
  .bottom-actions button {
    padding: 10px 32px;
    font-size: 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
  
  .back-btn {
    background: #ccb89a;
    color: white;
  }
  
  .submit-btn {
    background: #b68d41;
    color: white;
  }

  .order-remark-row {
  margin-top: 16px;
  font-size: 14px;
  color: #7b5500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

.add-remark {
  color: #fefdfb;
  cursor: pointer;
}

.edit-remark {
  margin-left: 12px;
  color: #a07c49;
  cursor: pointer;
}

.remark-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.remark-dialog {
  background: #f5e0c6;
  padding: 24px;
  width: 440px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.remark-header {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #5e4003;
}

.remark-header .close {
  cursor: pointer;
}

.remark-dialog textarea {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 1px solid #b68d41;
  border-radius: 6px;
  resize: none;
  font-size: 14px;
  background: #fffaf0;
}

.remark-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}

.remark-footer button {
  padding: 8px 20px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.remark-footer .cancel {
  background: #ccb89a;
  color: white;
}

.remark-footer .confirm {
  background: #b68d41;
  color: white;
}

  </style>
  