<template>
    <div class="user-info">
        <button class="avatar-button" @click="handleAvatarClick">
            <div class="avatar-placeholder">
                <span>👤</span>
            </div>
        </button>
    </div>
</template>

<script>
    import { useRouter } from 'vue-router'

    export default {
        name: 'UserIcon',
        setup(props) {
            const router = useRouter();
            const handleAvatarClick = () => {
                router.push({
                    name: 'UserDetails'
                });
            };

            return {
                handleAvatarClick
            }
        }
    }
</script>