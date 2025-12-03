<template>
    <div class="user-info">
        <button class="avatar-button" @click="handleAvatarClick">
            <div class="avatar-placeholder">
                <span>👋</span>
            </div>
        </button>
    </div>
</template>

<script>
    import { useRouter } from 'vue-router'
    import { authApi } from '@/services/authApi.js';

    export default {
        name: 'LogoutIcon',
        setup(props) {
            const router = useRouter();
            
            const handleAvatarClick = () => {
                // Отключаем SSE перед логаутом
                if (window.$sse) {
                    window.$sse.disconnect();
                }
                
                // Очищаем localStorage
                localStorage.removeItem('userInfo');
                
                // Выполняем логаут на сервере
                authApi.logout();

                // Редирект на страницу логина
                router.push({
                    name: 'LoginPage'
                });
            };

            return {
                handleAvatarClick
            }
        }
    }
</script>

<style scoped>
.user-info {
    display: flex;
    align-items: center;
}

.avatar-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
}

.avatar-button:hover {
    transform: scale(1.1);
}

.avatar-button:active {
    transform: scale(0.95);
}

.avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.avatar-button:hover .avatar-placeholder {
    background: linear-gradient(135deg, #3dbcb3, #358f7d);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar-placeholder span {
    font-size: 20px;
    user-select: none;
}

/* Анимация пульсации при наведении */
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.avatar-button:hover .avatar-placeholder {
    animation: pulse 1.5s infinite;
}

/* Адаптивность */
@media (max-width: 768px) {
    .avatar-placeholder {
        width: 36px;
        height: 36px;
    }
    
    .avatar-placeholder span {
        font-size: 18px;
    }
}

@media (max-width: 480px) {
    .avatar-placeholder {
        width: 32px;
        height: 32px;
    }
    
    .avatar-placeholder span {
        font-size: 16px;
    }
}
</style>