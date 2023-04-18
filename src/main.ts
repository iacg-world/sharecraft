import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css' // or 'ant-design-vue/dist/antd.less'
import * as Icons from '@ant-design/icons-vue'
import 'cropperjs/dist/cropper.css'

const app = createApp(App)
app.use(store).use(router).use(Antd).mount('#app')
const icons: any = Icons
for (const i in icons) {
  // 全局注册一下组件
  app.component(i, icons[i])
}
