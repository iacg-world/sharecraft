import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css' // or 'ant-design-vue/dist/antd.less'
import * as Icons from '@ant-design/icons-vue'
import 'cropperjs/dist/cropper.css'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { RespData } from './respTypes'

export type ICustomAxiosConfig = AxiosRequestConfig & {
  opName?: string
}

axios.interceptors.request.use((config) => {
  const newConfig = config as ICustomAxiosConfig
  store.commit('setError', { status: false, message: '' })
  store.commit('startLoading', { opName: newConfig.opName })
  return config
})
axios.interceptors.response.use(
  (resp: AxiosResponse<RespData>) => {
    const { config, data } = resp
    const newConfig = config as ICustomAxiosConfig
    store.commit('finishLoading', { opName: newConfig.opName })
    const { errno, message } = data
    if (errno !== 0) {
      store.commit('setError', { status: true, message })
      return Promise.reject(data)
    }
    return resp
  },
  (e) => {
    store.commit('setError', { status: true, message: '服务器错误' })
    store.commit('finishLoading')
    return Promise.reject(e)
  }
)

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
