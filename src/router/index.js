import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Occasions from '../components/occasion/Occasions.vue'
import OccasionList from '../components/occasion/OccasionList.vue'
import OccasionDetail from '../components/occasion/OccasionDetail.vue'
import Activities from '../components/activity/Activities.vue'
import ActivityDetail from '../components/activity/ActivityDetail.vue'
import ActivityRegistrationDetail from '../components/activity/ActivityRegistrationDetail.vue'
import ActivityResultDetail from '../components/activity/ActivityResultDetail.vue'
import Milestones from '../components/milestone/Milestones.vue'
import MilestoneDetail from '../components/milestone/MilestoneDetail.vue'
import MilestoneResultDetail from '../components/milestone/MilestoneResultDetail.vue'
import MilestoneRoundConfig from '../components/milestone/MilestoneRoundConfig.vue'
import Rounds from '../components/round/Rounds.vue'
import RoundDetail from '../components/round/RoundDetail.vue'
import UserDetails from '../components/userinfo/UserDetails.vue'
import Contestants from '../components/contestant/Contestants.vue'
import ContestantsAnnouncer from '../components/contestant/ContestantsAnnouncer.vue'
import Test from '../components/test/Test.vue'
import SnakeGame from '../components/userinfo/SnakeGame.vue'
import Display from '../components/display/Display.vue'

const DEFAULT_TITLE = 'Sensation'

const routes = [
  {
    path: '/auth/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: { title: 'Вход' }
  }, {
    path: '/',
    // redirect: '/occasions',
    redirect: () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const role = userInfo?.roles?.[0];

        switch (role) {
            case 'TOURNAMENT_DISPLAY': {
              return { name: 'Display' };
            }
            default: {
              return { name: 'Occasions' };
            }
        }
    },
    meta: { title: DEFAULT_TITLE }
  }, {
    path: '/occasions',
    name: 'Occasions',
    // component: Occasions
    meta: { title: 'Мероприятия' }
  }, {
    path: '/occasions',
    name: 'OccasionsForUser',
    component: Occasions,
    meta: { title: 'Мероприятия' }
  }, {
    path: '/occasions',
    name: 'OccasionList',
    component: OccasionList,
    meta: { title: 'Мероприятия' }
  }, {
    path: '/occasionDetail/:occasionId',
    name: 'OccasionDetail',
    component: OccasionDetail,
    meta: { title: 'Мероприятие' }
  }, {
    path: '/activities/:occasionId',
    name: 'Activities',
    component: Activities,
    meta: { title: 'Активности' }
  }, {
    path: '/activityResultDetail/:activityId',
    name: 'ActivityResultDetail',
    component: ActivityResultDetail,
    meta: { title: 'Результаты активности' }
  }, {
    path: '/milestones/:activityId',
    name: 'Milestones',
    component: Milestones,
    meta: { title: 'Этапы' }
  }, {
    path: '/milestoneDetail/:milestoneId',
    name: 'MilestoneDetail',
    component: MilestoneDetail,
    meta: { title: 'Этап' }
  },   {
    path: '/milestoneResultDetail/:milestoneId',
    name: 'MilestoneResultDetail',
    component: MilestoneResultDetail,
    meta: { title: 'Результаты этапа' }
  }, {
    path: '/milestoneRoundConfig/:milestoneId',
    name: 'MilestoneRoundConfig',
    component: MilestoneRoundConfig,
    meta: { title: 'Конфигурация раундов' }
  }, {
    path: '/activityDetail/:activityId',
    name: 'ActivityDetail',
    component: ActivityDetail,
    meta: { title: 'Активность' }
  }, {
    path: '/activityRegistrationDetail/:activityId',
    name: 'ActivityRegistrationDetail',
    component: ActivityRegistrationDetail,
    meta: { title: 'Регистрация' }
  }, {
    path: '/rounds/:milestoneId',
    name: 'Rounds',
    component: Rounds,
    meta: { title: 'Раунды' }
  }, {
    path: '/roundDetail/:roundId',
    name: 'RoundDetail',
    component: RoundDetail,
    meta: { title: 'Раунд' }
  }, {
    path: '/userDetails',
    name: 'UserDetails',
    component: UserDetails,
    meta: { title: 'Профиль' }
  }, {
    path: '/contestants/:milestoneId/:roundId',
    name: 'Contestants',
    component: Contestants,
    props: true,
    meta: { title: 'Оценка' }
  },{
    path: '/contestantsAnnouncer/:milestoneId/:roundId',
    name: 'ContestantsAnnouncer',
    component: ContestantsAnnouncer,
    props: true,
    meta: { title: 'Объявление' }
  }, {
    path: '/test',
    name: 'Test',
    component: Test,
    meta: { title: 'Тест' }
  },
  {
    path: '/snake-game',
    name: 'SnakeGame',
    component: SnakeGame,
    meta: { title: 'Snake' }
  },
  {
    path: '/display',
    name: 'Display',
    component: Display,
    meta: { title: 'Табло' }
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

router.afterEach((to) => {
  document.title = to.meta?.title || DEFAULT_TITLE
})

router.beforeEach((to, from, next) => {
    if (to.name === 'LoginPage') {
        // При переходе на логин отключаем SSE
        if (window.$sse && window.$sse.connected) {
          window.$sse.disconnect()
        }
        return next();
    }

    // Если это уже редирект по роли - пропускаем
    if (!!to.meta?.isRoleRedirect) {
        return next();
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo && window.$sse && !window.$sse.connected) {
      // Если пользователь авторизован, но SSE не подключен
      setTimeout(() => {
        window.$sse.connect()
      }, 1000)
    }

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
        case 'JUDGE': {
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
        case 'REGISTRATOR': {
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