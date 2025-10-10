import { createApp } from 'vue'
import { createPinia } from 'pinia'

<<<<<<< HEAD
// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入全局样式
import './assets/styles/global.scss'

=======
>>>>>>> 8288dbe540b89ef5495d00e47bb32151c33fee87
import App from './App.vue'
import router from './router'

const app = createApp(App)

<<<<<<< HEAD
// 使用 Element Plus
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

=======
>>>>>>> 8288dbe540b89ef5495d00e47bb32151c33fee87
app.use(createPinia())
app.use(router)

app.mount('#app')
