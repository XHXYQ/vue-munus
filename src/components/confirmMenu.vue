<template>
    <div class="confirm-page">
      <!-- 返回选择菜品 -->
      <div class="top-bar" @click="router.back()">
        <span class="back-icon">←</span>
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
      </div>
  
      <!-- 固定底部操作栏 -->
      <div class="bottom-actions">
        <button class="back-btn" @click="router.back()">返回</button>
        <button class="submit-btn" @click="submitOrder">提交</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  
  const route = useRoute();
  const router = useRouter();
  
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
    // 可以发送给后端或跳转下一步页面
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
    border-bottom: 1px solid #e6d5b3;
    text-align: center;
  }
  
  .dish-name-cn {
    font-weight: bold;
    font-size: 16px;
  }
  
  .dish-name-en {
    font-size: 13px;
    color: #9b7e4e;
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
    border: 1px solid #b68d41;
    color: #b68d41;
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
  </style>
  