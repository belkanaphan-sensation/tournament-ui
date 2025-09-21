import { createRouter, createWebHistory } from 'vue-router'
import Occasions from '../components/occasion/Occasions.vue'
import Activities from '../components/activity/Activities.vue'
const routes = [
  {
    path: '/',
    redirect: '/occasions'
  },
  {
    path: '/occasions',
    name: 'Occasions',
    component: Occasions
  },
    {
    path: '/activities',
    name: 'Activities',
    component: Activities
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router