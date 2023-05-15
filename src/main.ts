import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from './build/configAnt'
// import 'ant-design-vue/dist/antd.css' // or 'ant-design-vue/dist/antd.less'
// import * as Icons from '@ant-design/icons-vue'
// import 'cropperjs/dist/cropper.css'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { RespData } from './respTypes'
import './assets/reset-style.scss'
const NODE_ENV = process.env.NODE_ENV
const isProduction = NODE_ENV === 'production'

export type ICustomAxiosConfig = AxiosRequestConfig & {
  opName?: string
}

axios.interceptors.request.use((config) => {
  const newConfig = config as ICustomAxiosConfig
  store.commit('setError', { status: false, message: '' })
  store.commit('startLoading', { opName: newConfig.opName })
  console.log(config)

  return config
})
axios.interceptors.response.use(
  (resp: AxiosResponse<RespData>) => {
    const { config, data } = resp
    const newConfig = config as ICustomAxiosConfig
    store.commit('finishLoading', { opName: newConfig.opName })
    const { errno, message } = data
    if (errno && errno !== 0) {
      store.commit('setError', { status: true, message })
      return Promise.reject(data)
    }
    return resp
  },
  (e: AxiosError) => {
    const newConfig = e.config as ICustomAxiosConfig
    store.commit('setError', { status: true, message: '服务器错误' })
    store.commit('finishLoading', { opName: newConfig.opName })
    return Promise.reject(e)
  }
)

const app = createApp(App)
const baseBackendURL = isProduction ? '' : process.env.VUE_APP_BASE_URL
export const baseH5URL = isProduction ? '' : process.env.VUE_APP_BASE_H5_URL

axios.defaults.baseURL = `${baseBackendURL}/api/`
app.use(store).use(router).use(Antd).mount('#app')
// const icons: any = Icons
// for (const i in icons) {
//   // 全局注册一下组件
//   app.component(i, icons[i])
// }
