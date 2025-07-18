// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import TheWelcome from '../components/TheWelcome.vue'
import Index from '../components/index.vue'
import Menu from '../components/menu.vue'
import MenuChoose from '../components/menuChoose.vue'
import confirmMenu from '../components/confirmMenu.vue'
import orderInfo from '../components/orderInfo.vue'

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/welcome', component: TheWelcome },
  { path: '/index', component: Index },
  { path: '/menu', component: Menu },
  { path: '/menuChoose', name: 'menuChoose', component: MenuChoose },
  { path: '/confirmMenu', name: 'confirmMenu', component: confirmMenu },
  { path: '/orderInfo', name: 'orderInfo', component: orderInfo },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
