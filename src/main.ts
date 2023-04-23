import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css' // or 'ant-design-vue/dist/antd.less'
import * as Icons from '@ant-design/icons-vue'
import 'cropperjs/dist/cropper.css'

import axios from 'axios'

const app = createApp(App)
const baseBackendURL = process.env.VUE_APP_BASE_URL
console.log(process.env)

axios.defaults.baseURL = `${baseBackendURL}/api/`
app.use(store).use(router).use(Antd).mount('#app')
const icons: any = Icons
for (const i in icons) {
  // 全局注册一下组件
  app.component(i, icons[i])
}
