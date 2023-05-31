import { RespData } from './respTypes'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import store from './store'
import router from './router'
const NODE_ENV = process.env.NODE_ENV
const isProduction = NODE_ENV === 'production'
const baseBackendURL = process.env.VUE_APP_BASE_URL
export const baseH5URL = process.env.VUE_APP_BASE_H5_URL

export type ICustomAxiosConfig = AxiosRequestConfig & {
  opName?: string
}

axios.defaults.baseURL = `${baseBackendURL}/api/`

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
    if (errno && errno !== 0) {
      if (resp.data.errno === 101005) {
        router.push('/login')
      }
      store.commit('setError', { status: true, message })
      return Promise.reject(data)
    }
    return resp
  },
  (e: AxiosError) => {
    const newConfig = e.config as ICustomAxiosConfig
    store.commit('setError', { status: true, message: '服务器错误' })
    store.commit('finishLoading', { opName: newConfig.opName })
    console.log(e)

    return Promise.reject(e)
  }
)
