import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import 'iacg-block/dist/iacg-block.css'
import './assets/reset-style.scss'
import './axios'
import errorHandler from './errorHandler'
import '@chinese-fonts/mzxst/dist/MZPXflat/result.css'
import '@chinese-fonts/hwmct/dist/汇文明朝体/result.css'
import LongPress from './directives/LongPress'

const app = createApp(App)

app.directive('longpress', LongPress);
app.use(store).use(router).use(Antd).mount('#app')
app.config.errorHandler = errorHandler
