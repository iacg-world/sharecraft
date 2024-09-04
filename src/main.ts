import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue/es'
import 'ant-design-vue/dist/reset.css'
import 'iacg-block/dist/iacg-block.css'
import './assets/reset-style.scss'
import './axios'
import errorHandler from './errorHandler'

const app = createApp(App)

app.use(store).use(router).use(Antd).mount('#app')

app.config.errorHandler = errorHandler
