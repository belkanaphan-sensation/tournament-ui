<template>
    <div class="header-container control-panel-background-container">
        <ControlPanel @back="handleBack"/>
        <LogoutIcon/>
    </div>

    <div v-if="userInfo" class="content-container">
        <Field label="Логин" :value="userInfo.username"/>
        <Field label="Имя" :value="userInfo?.person?.name"/>
        <Field label="Отчество" :value="userInfo?.person?.secondName"/>
        <Field label="Фамилия" :value="userInfo?.person?.surname"/>
        <Field label="email" :value="userInfo?.person?.email"/>
        <Field label="Телeфон" :value="userInfo?.person?.phoneNumber"/>
        <Field label="Статус" :value="userInfo?.statusDisplayValue"/>
        <Field label="Организация" :value="userInfo?.organizations?.[0]?.value"/>
        <Field label="Роли" :value="userInfo?.roleDisplayValue"/>
        <a href="#" @click.prevent="showSnakeGame = true" class="snake-link">
        Скучно 🐍
        </a>

        <!-- Компонент змейки -->
        <SnakeGame 
        :showSnakeGame="showSnakeGame" 
        @close="showSnakeGame = false" 
        />
    </div>
</template>

<script>
    import ControlPanel from '../common/ControlPanel.vue';
    import Field from '../common/Field.vue'
    import { useRouter } from 'vue-router'
    import { userStatusEnum, roleEnum } from '../../utils/EnumLocalizator.js'
    import LogoutIcon from './LogoutIcon.vue'
    import SnakeGame from './SnakeGame.vue'
    import { ref } from 'vue'

    export default {
        name: 'UserDetails',
        components: {
            ControlPanel,
            Field,
            LogoutIcon,
            SnakeGame,
        },
        props: {
            
        },
        setup(props) {
            const router = useRouter()
            const handleBack = () => {
                router.go(-1);
            }

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                router.push({
                    name: 'LoginPage'
                });
                return;
            }

            userInfo.statusDisplayValue = userStatusEnum[userInfo?.status];
            userInfo.roleDisplayValue = roleEnum[userInfo?.roles?.[0]];

            const showSnakeGame = ref(false)

            return {
                handleBack,
                userInfo,
                showSnakeGame
            }
        },
    }
</script>

<style scoped>
.main-app {
  padding: 20px;
  font-family: Arial, sans-serif;
  /* position: relative; */
  z-index: 1;
}

.bored-text {
  /* font-size: 16px; */
  color: #666;
  margin: 20px 0;
}

.text-link {
  color: black;
  /* text-decoration: none; */
  /* font-weight: 600; */
  /* border-bottom: 2px dotted #667eea; */
  padding-bottom: 2px;
  transition: all 0.3s ease;
}

.text-link:hover {
  color: #764ba2;
  border-bottom: 2px solid #764ba2;
  text-decoration: none;
}

</style>