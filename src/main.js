import './assets/main.css'

import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 处理路由重定向
const redirect = sessionStorage.getItem('redirect')
if (redirect) {
    sessionStorage.removeItem('redirect')
    router.push(redirect).catch(err => {
        console.error('重定向失败:', err)
        router.push('/')
    })
}

app.use(router)
app.mount('#app')
