import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/card.css'
import './assets/container.css'
import './assets/base.css'
import './assets/userInfo.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
    .use(router)
    .use(createPinia().use(piniaPluginPersistedstate));

app.config.devtools = false
app.config.performance = false

app.mount('#app')