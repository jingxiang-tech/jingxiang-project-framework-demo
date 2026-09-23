import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Antd from 'ant-design-vue'
import App from '@/App.vue'
import { router } from '@/router'
import './index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(VueQueryPlugin, {
    queryClientConfig: {
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    },
})

app.mount('#app')
