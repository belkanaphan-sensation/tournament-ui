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
import Rounds from '../components/round/Rounds.vue'
import RoundDetail from '../components/round/RoundDetail.vue'
import UserDetails from '../components/userinfo/UserDetails.vue'
import Contestants from '../components/contestant/Contestants.vue'
import Test from '../components/test/Test.vue'

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
  }, {
    path: '/test',
    name: 'Test',
    component: Test
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



    // // Если уже на странице логина и пользователь авторизован - редирект на главную


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
                    // return next({
                    //     name: 'ActivitiesUser', // ДОЛЖЕН БЫТЬ ДРУГОЙ МАРШРУТ!
                    //     params: to.params,
                    //     query: to.query,
                    //     meta: { ...to.meta, isRoleRedirect: true }
                    // });
                    return next();
                }
                case 'Milestones': {
                    // return next({
                    //     name: 'MilestonesUser', // ДОЛЖЕН БЫТЬ ДРУГОЙ МАРШРУТ!
                    //     params: to.params,
                    //     query: to.query,
                    //     meta: { ...to.meta, isRoleRedirect: true }
                    // });
                    return next();
                }
                case 'Contestants': {
                    // return next({
                    //     name: 'ContestantsUser', // ДОЛЖЕН БЫТЬ ДРУГОЙ МАРШРУТ!
                    //     params: to.params,
                    //     query: to.query,
                    //     meta: { ...to.meta, isRoleRedirect: true }
                    // });
                    return next();
                }
                // Если маршрут уже для USER - пропускаем
                // default:
                //     return next();
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
    }

    next();
})

export default router;