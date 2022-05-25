import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Button, Layout, Card, Col, Row } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css' // or 'ant-design-vue/dist/antd.less'

createApp(App)
  .use(store)
  .use(router)
  .use(Button)
  .use(Layout)
  .use(Card)
  .use(Col)
  .use(Row)
  .mount('#app')
