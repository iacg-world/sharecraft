import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from './build/configAnt'
import 'ant-design-vue/dist/antd.css' // or 'ant-design-vue/dist/antd.less'
// import * as Icons from '@ant-design/icons-vue'
// import 'cropperjs/dist/cropper.css'
import 'iacg-block/dist/iacg-block.css'
import './assets/reset-style.scss'
import './axios'
import errorHandler from './errorHandler'

const app = createApp(App)

app.use(store).use(router).use(Antd).mount('#app')

app.config.errorHandler = errorHandler
