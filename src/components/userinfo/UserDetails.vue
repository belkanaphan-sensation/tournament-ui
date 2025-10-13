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
        <Field label="Организация" :value="userInfo?.organizations?.[0].value"/>
        <Field label="Роли" :value="userInfo?.roleDisplayValue"/>
    </div>
</template>

<script>
    import ControlPanel from '../common/ControlPanel.vue';
    import Field from '../common/Field.vue'
    import { useRouter } from 'vue-router'
    import { userStatusEnum, roleEnum } from '../../utils/EnumLocalizator.js'
    import LogoutIcon from './LogoutIcon.vue'

    export default {
        name: 'UserDetails',
        components: {
            ControlPanel,
            Field,
            LogoutIcon
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

            return {
                handleBack,
                userInfo
            }
        }
    }
</script>