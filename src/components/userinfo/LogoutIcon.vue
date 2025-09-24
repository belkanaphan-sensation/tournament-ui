<template>
    <div class="user-info">
        <button class="avatar-button" @click="handleAvatarClick">
            <div class="avatar-placeholder">
                <!-- <span>🚪</span> -->
                <!-- <span>🏃‍♂️‍➡️</span> -->
                <!-- <span>🚶‍♂️</span> -->
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
                localStorage.removeItem('userInfo');
                authApi.logout();

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