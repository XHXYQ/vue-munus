<template>
    <div class="order-info-page">
      <div class="order-box">
        <img src="@/assets/SealCheck.svg" class="check-icon" alt="已提交图标" />
        <div class="message">您的订单已收到，请您耐心等候！</div>
  
        <div class="button-group">
          <button class="btn light" @click="goHome">返回首页</button>
          <button class="btn light" @click="viewOrder">查看订单</button>
          <button class="btn dark" @click="continueAdd">继续加菜</button>
        </div>
      </div>
  
      <!-- 订单详情弹窗 -->
      <div class="order-dialog" v-if="showDialog">
        <div class="dialog-box">
          <div class="dialog-header">
            <span>查看订单</span>
            <span class="close" @click="showDialog = false">✕</span>
          </div>
  
          <table class="dialog-table">
            <thead>
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
  
          <div class="remark">备注：{{ remark || '无' }}</div>
  
          <div class="dialog-footer">
            <button @click="copyContent">复制内容</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  
  const dishes = ref([])
  const remark = ref('')
  const showDialog = ref(false)
  
  onMounted(() => {
    dishes.value = JSON.parse(route.query.dishes || '[]')
    remark.value = route.query.remark || ''
  })
  
  const goHome = () => router.push('/index')
  // const continueAdd = () => router.push('/menu')
  const continueAdd = () => {
  const category = route.query.category || 'chinese'  // 默认中文菜系
  router.push({ path: '/menuChoose', query: { type: category } })
}

  const viewOrder = () => {
    showDialog.value = true
  }
  
  function copyContent() {
    const now = new Date()
    const datetime = now.toISOString().replace('T', ' ').substring(0, 19)
  
    let content = `订单：\n时间：${datetime}\n\n菜系\n`
  
    for (const item of dishes.value) {
      content += `${item.name} x${item.count}\n`
    }
  
    content += `\n备注：\n${remark.value || '无'}\n`
  
    navigator.clipboard.writeText(content).then(() => {
      alert('已复制订单内容')
    })
  }
  </script>
  
  <style scoped>
  .order-info-page {
    background: url("@/assets/menu/menubg.svg") no-repeat center center;
    background-size: cover;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "Noto Serif SC", serif;
  }
  
  .order-box {
    background: rgba(160, 132, 94, 0.65);
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    color: #fff;
    width: 50%;
  }
  
  .check-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    display: block;
  }
  
  .message {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 32px;
    color: #ffffff;
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .btn {
    padding: 12px 0;
    font-size: 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
  
  .btn.light {
    background: #b39253;
    color: white;
  }
  
  .btn.dark {
    background: #7a5700;
    color: white;
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
  .dialog-box {
  background: #f5e3c6;
  width: 500px;
  max-height: 80vh; /* 限制最大高度 */
  overflow-y: auto;  /* 超出滚动 */
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #7a5700;
}

  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-bottom: 16px;
  }
  
  .dialog-header .close {
    cursor: pointer;
    font-size: 20px;
  }
  
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
  
  .name-cn {
    font-weight: bold;
  }
  
  .name-en {
    font-size: 12px;
    color: #8c6e45;
  }
  
  .remark {
    margin-top: 12px;
    font-size: 14px;
  }
  
  .dialog-footer {
    text-align: right;
  }
  
  .dialog-footer button {
    background: #7a5700;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
  }
  </style>
  