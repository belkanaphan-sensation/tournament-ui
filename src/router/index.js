import { createRouter, createWebHistory } from 'vue-router'
import Occasions from '../components/occasion/Occasions.vue'
import Activities from '../components/activity/Activities.vue'
import Milestones from '../components/milestone/Milestones.vue'
import Rounds from '../components/round/Rounds.vue'
const routes = [
  {
    path: '/',
    redirect: '/occasions'
  }, {
    path: '/occasions',
    name: 'Occasions',
    component: Occasions
  }, {
    path: '/activities/:occasionId',
    name: 'Activities',
    component: Activities,
  }, {
    path: '/milestones/:activityId',
    name: 'Milestones',
    component: Milestones,
  }, {
    path: '/rounds/:milestoneId',
    name: 'Rounds',
    component: Rounds,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router