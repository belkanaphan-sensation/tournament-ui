<template>
    <div class="profile-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack"/>
            <LogoutIcon/>
        </div>

        <div v-if="userInfo" class="content-container">
            <div class="profile-card">
                <div class="profile-header">
                    <h2>Профиль пользователя</h2>
                </div>
                
                <div class="fields-grid">
                    <Field label="Логин" :value="userInfo.username"/>
                    <Field label="Имя" :value="userInfo?.person?.name"/>
                    <Field label="Отчество" :value="userInfo?.person?.secondName"/>
                    <Field label="Фамилия" :value="userInfo?.person?.surname"/>
                    <Field label="Email" :value="userInfo?.person?.email"/>
                    <Field label="Телефон" :value="userInfo?.person?.phoneNumber"/>
                    <Field label="Статус" :value="userInfo?.statusDisplayValue"/>
                    <Field label="Организация" :value="userInfo?.organizations?.[0]?.value"/>
                    <Field label="Роли" :value="userInfo?.roleDisplayValue"/>
                </div>

                <div class="snake-section">
                    <router-link to="/snake-game" class="snake-link">
                        🐍 Покушать
                    </router-link>
                </div>
            </div>
        </div>
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
            LogoutIcon,
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
        },

        methods: {
            getUserInitials() {
                const person = this.userInfo?.person;
                if (!person) return 'U';
                
                const first = person.name?.[0] || '';
                const last = person.surname?.[0] || '';
                return (first + last).toUpperCase() || 'U';
            }
        }
    }
</script>

<style scoped>
.profile-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
}

.header-container {
    background: white;
    padding: 15px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 30px 20px;
}

.profile-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    padding: 40px;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
}

.profile-card:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
}

.profile-header h2 {
    margin: 0;
    color: #333;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #007bff, #0056b3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #007bff, #0056b3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.fields-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.snake-section {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.snake-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #28a745, #218838);
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.snake-link:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
    background: linear-gradient(135deg, #218838, #1e7e34);
}

.snake-link:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

/* Анимация появления */
.profile-card {
    animation: cardAppear 0.6s ease-out;
}

@keyframes cardAppear {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Адаптивность */
@media (max-width: 768px) {
    .content-container {
        padding: 20px 15px;
    }
    
    .profile-card {
        padding: 30px 25px;
        border-radius: 12px;
    }
    
    .profile-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
    }
    
    .profile-header h2 {
        font-size: 1.75rem;
    }
    
    .user-avatar {
        width: 70px;
        height: 70px;
        font-size: 1.3rem;
    }
    
    .fields-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
}

@media (max-width: 480px) {
    .profile-card {
        padding: 25px 20px;
    }
    
    .profile-header h2 {
        font-size: 1.5rem;
    }
    
    .user-avatar {
        width: 60px;
        height: 60px;
        font-size: 1.1rem;
    }
    
    .snake-link {
        padding: 10px 20px;
        font-size: 0.9rem;
    }
}

/* Дополнительные стили для Field компонента (если нужно переопределить) */
:deep(.field-container) {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
}

:deep(.field-container:hover) {
    background: white;
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

:deep(.field-label) {
    font-weight: 600;
    color: #495057;
    margin-bottom: 5px;
    font-size: 0.9rem;
}

:deep(.field-value) {
    color: #333;
    font-size: 1rem;
    font-weight: 500;
}

.snake-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #28a745, #218838);
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.snake-link:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
    background: linear-gradient(135deg, #218838, #1e7e34);
}

.snake-link:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}
</style>