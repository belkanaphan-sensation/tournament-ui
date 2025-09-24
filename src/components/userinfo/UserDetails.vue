<template>
    <div class="header-container container-background">
        <ControlPanel @back="handleBack"/>
        <LogoutIcon/>
    </div>

    <div class="content-container container-background">
        <Field class="white-font-color" label="Логин" :value="userInfo.username"/>
        <Field class="white-font-color" label="Имя" :value="userInfo?.person?.name"/>
        <Field class="white-font-color" label="Отчество" :value="userInfo?.person?.secondName"/>
        <Field class="white-font-color" label="Фамилия" :value="userInfo?.person?.surname"/>
        <Field class="white-font-color" label="email" :value="userInfo?.person?.email"/>
        <Field class="white-font-color" label="Телeфон" :value="userInfo?.person?.phoneNumber"/>
        <Field class="white-font-color" label="Статус" :value="userInfo?.statusDisplayValue"/>
        <Field class="white-font-color" label="Организация" :value="userInfo?.organizations?.organizations[0].value"/>
        <Field class="white-font-color" label="Роли" :value="userInfo?.roles?.roles[0]"/>
    </div>
</template>

<script>
    import ControlPanel from '../common/ControlPanel.vue';
    import Field from '../common/Field.vue'
    import { useRouter } from 'vue-router'
    import { userStatusEnum } from '../../utils/EnumLocalizator.js'
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
            }

            userInfo.statusDisplayValue = userStatusEnum[userInfo?.status];

            return {
                handleBack,
                userInfo
            }
        }
    }
</script>