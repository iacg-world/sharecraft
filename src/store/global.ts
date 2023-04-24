import { Module } from 'vuex'
import { GlobalDataProps } from './index'
export interface GlobalStatus {
  opNames: { [key: string]: boolean }
  requestNumber: number
  error: {
    status: boolean
    message?: string
  }
}

const global: Module<GlobalStatus, GlobalDataProps> = {
  state: {
    requestNumber: 0,
    opNames: {},
    error: {
      status: false,
    },
  },
  mutations: {
    startLoading(state, { opName }) {
      state.requestNumber++
      if (opName) {
        state.opNames[opName] = true
      }
    },
    finishLoading(state, { opName }) {
      setTimeout(() => {
        state.requestNumber--
        delete state.opNames[opName]
      }, 1000)
    },
    setError(state, e) {
      state.error = e
    },
  },
  getters: {
    isLoading: (state) => {
      return state.requestNumber > 0
    },
    isOpLoading: (state) => (opName: string) => {
      return state.opNames[opName]
    },
  },
}

export default global
