import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Occasions from '../components/occasion/Occasions.vue'
import Activities from '../components/activity/Activities.vue'
import Milestones from '../components/milestone/Milestones.vue'
import Rounds from '../components/round/Rounds.vue'
import UserDetails from '../components/userinfo/UserDetails.vue'
import Participants from '../components/participant/Participants.vue'

const routes = [
  {
    path: '/auth/login',
    name: 'LoginPage',
    component: LoginPage
  }, {
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
  }, {
    path: '/userDetails',
    name: 'UserDetails',
    component: UserDetails
  }, {
    path: '/participants/:milestoneId/:roundId',
    name: 'Participants',
    component: Participants,
    props: true,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Всегда прокручивать к верху страницы
    return { top: 0 }
  }
})

export default router