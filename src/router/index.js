import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Occasions from '../components/occasion/Occasions.vue'
import OccasionList from '../components/occasion/OccasionList.vue'
import OccasionDetail from '../components/occasion/OccasionDetail.vue'
import Activities from '../components/activity/Activities.vue'
import ActivityDetail from '../components/activity/ActivityDetail.vue'
import ActivityRegistrationDetail from '../components/activity/ActivityRegistrationDetail.vue'
import Milestones from '../components/milestone/Milestones.vue'
import MilestoneDetail from '../components/milestone/MilestoneDetail.vue'
import MilestoneResultDetail from '../components/milestone/MilestoneResultDetail.vue'
import Rounds from '../components/round/Rounds.vue'
import RoundDetail from '../components/round/RoundDetail.vue'
import UserDetails from '../components/userinfo/UserDetails.vue'
import Contestants from '../components/contestant/Contestants.vue'
import ContestantsAnnouncer from '../components/contestant/ContestantsAnnouncer.vue'
import Test from '../components/test/Test.vue'
import SnakeGame from '../components/userinfo/SnakeGame.vue'

const routes = [
  {
    path: '/auth/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: {}
  }, {
    path: '/',
    redirect: '/occasions',
    meta: {}
  }, {
    path: '/occasions',
    name: 'Occasions',
    // component: Occasions
  }, {
    path: '/occasions',
    name: 'OccasionsForUser',
    component: Occasions,
  }, {
    path: '/occasions',
    name: 'OccasionList',
    component: OccasionList,
  }, {
    path: '/occasionDetail/:occasionId',
    name: 'OccasionDetail',
    component: OccasionDetail,
  }, {
    path: '/activities/:occasionId',
    name: 'Activities',
    component: Activities,
  }, {
    path: '/milestones/:activityId',
    name: 'Milestones',
    component: Milestones,
  }, {
    path: '/milestoneDetail/:milestoneId',
    name: 'MilestoneDetail',
    component: MilestoneDetail,
  }, {
    path: '/milestoneResultDetail/:milestoneId',
    name: 'MilestoneResultDetail',
    component: MilestoneResultDetail,
  }, {
    path: '/activityDetail/:activityId',
    name: 'ActivityDetail',
    component: ActivityDetail,
  }, {
    path: '/activityRegistrationDetail/:activityId',
    name: 'ActivityRegistrationDetail',
    component: ActivityRegistrationDetail,
  }, {
    path: '/rounds/:milestoneId',
    name: 'Rounds',
    component: Rounds,
  }, {
    path: '/roundDetail/:roundId',
    name: 'RoundDetail',
    component: RoundDetail,
  }, {
    path: '/userDetails',
    name: 'UserDetails',
    component: UserDetails
  }, {
    path: '/contestants/:milestoneId/:roundId',
    name: 'Contestants',
    component: Contestants,
    props: true,
  },{
    path: '/contestantsAnnouncer/:milestoneId/:roundId',
    name: 'ContestantsAnnouncer',
    component: ContestantsAnnouncer,
    props: true,
  }, {
    path: '/test',
    name: 'Test',
    component: Test
  },
  {
    path: '/snake-game',
    name: 'SnakeGame',
    component: SnakeGame
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Всегда прокручивать к верху страницы
    return { top: 0 }
  }
});


router.beforeEach((to, from, next) => {
    if (to.name === 'LoginPage') {
        return next();
    }

    // Если это уже редирект по роли - пропускаем
    if (!!to.meta?.isRoleRedirect) {
        return next();
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.roles || userInfo.roles.length < 1) {
        return next({
                        name: 'LoginPage',
                        params: to.params,
                        query: to.query,
                        meta: { ...to.meta, isRoleRedirect: true }
                    })
    }

    const userRole = userInfo.roles[0];

    switch (userRole) {
        case 'USER': {
            const toName = to.name;
            switch (toName) {
                case 'Occasions': {
                    return next({
                        name: 'OccasionsForUser',
                        params: to.params,
                        query: to.query,
                        meta: { ...to.meta, isRoleRedirect: true }
                    });
                }
                case 'Activities': {
                    return next();
                }
                case 'Milestones': {
                    return next();
                }
                case 'Contestants': {
                    return next();
                }
            }
        }
        case 'SUPERADMIN': {
            const toName = to.name;
            switch (toName) {
                case 'Occasions': {
                    return next({
                        name: 'OccasionList',
                        params: to.params,
                        query: to.query,
                        meta: { ...to.meta, isRoleRedirect: true }
                    });
                }
                default: {
                  return next();
                }
            }
        }
        case 'ADMINISTRATOR': {
            const toName = to.name;
            switch (toName) {
                case 'Occasions': {
                    return next({
                        name: 'OccasionList',
                        params: to.params,
                        query: to.query,
                        meta: { ...to.meta, isRoleRedirect: true }
                    });
                }
                default: {
                  return next();
                }
            }
        }
        case 'ANNOUNCER': {
            const toName = to.name;
            switch (toName) {
                case 'Occasions': {
                    return next({
                        name: 'OccasionsForUser',
                        params: to.params,
                        query: to.query,
                        meta: { ...to.meta, isRoleRedirect: true }
                    });
                }
                case 'Activities': {
                    return next();
                }
                case 'Milestones': {
                    return next();
                }
                case 'Contestants': {
                    return next();
                }
            }
        }
    }

    next();
})

export default router;