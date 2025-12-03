import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/card.css'
import './assets/container.css'
import './assets/base.css'
import './assets/userInfo.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ErrorModalPlugin from '@/plugins/errorModal'
import SSEPlugin from '@/plugins/ssePlugin'

const app = createApp(App)
    .use(router)
    .use(createPinia().use(piniaPluginPersistedstate))
    .use(ErrorModalPlugin)
    .use(SSEPlugin, {
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        endpoint: '/notifications/stream',
        autoConnect: true, // Автоматически подключаться при наличии userInfo
        autoReconnect: true,
        reconnectDelay: 5000
    });

app.config.devtools = false
app.config.performance = false

app.mount('#app')