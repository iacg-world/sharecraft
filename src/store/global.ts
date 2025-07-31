import { Module } from 'vuex'
import { GlobalDataProps } from './index'
export interface GlobalStatus {
  opNames: { [key: string]: boolean }
  requestNumber: number
  loadingText: string
  error: {
    status: boolean
    message?: string
  }
}

const global: Module<GlobalStatus, GlobalDataProps> = {
  state: {
    requestNumber: 0,
    opNames: {},
    loadingText: '读取中',
    error: {
      status: false,
    },
  },
  mutations: {
    startLoading(state, { opName, loadingText }) {
      state.requestNumber++
      if (opName) {
        state.opNames[opName] = true
      }
      if (loadingText) {
        state.loadingText = loadingText
      }
    },
    finishLoading(state, { opName, init = false }) {
      setTimeout(() => {
        state.requestNumber--
        delete state.opNames[opName]
        if (init) {
          state.loadingText = '读取中'
        }
      }, 300)
    },
    setError(state, e) {
      state.error = e
    },
  },
  getters: {
    isLoading: state => {
      return state.requestNumber > 0
    },
    loadingText: state => {
      return state.loadingText
    },
    isOpLoading: state => (opName: string) => {
      return state.opNames[opName]
    },
  },
}

export default global
