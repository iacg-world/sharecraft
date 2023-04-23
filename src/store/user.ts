import { Module, ActionContext } from 'vuex'
import { GlobalDataProps, actionWrapper } from './index'
import { RespData } from '@/respTypes'
import axios, { AxiosRequestConfig } from 'axios'
export interface UserDataProps {
  username?: string
  id?: string
  phoneNumber?: string
  nickName?: string
  description?: string
  updatedAt?: string
  createdAt?: string
  iat?: number
  exp?: number
  picture?: string
  gender?: string
}

export interface UserProps {
  isLogin: boolean
  token?: string
  data: UserDataProps
}

const user: Module<UserProps, GlobalDataProps> = {
  state: {
    isLogin: false,
    data: {},
  },
  mutations: {
    login(state, rawData: RespData<{ token: string }>) {
      const { token } = rawData.data
      state.token = token
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    fetchCurrentUser(state, rawData: RespData<UserDataProps>) {
      state.isLogin = true
      state.data = { ...rawData.data }
    },
    logout(state) {
      state.isLogin = false
    },
  },
  actions: {
    // login({ commit }, payload) {
    //   return axios
    //     .post('/users/loginByPhoneNumber', payload)
    //     .then((rawData) => {
    //       commit('login', rawData.data)
    //     })
    // },
    login: actionWrapper('/users/loginByPhoneNumber', 'login', {
      method: 'post',
    }),
    fetchCurrentUser({ commit }) {
      return axios.get('/users/getUserInfo').then((rawData) => {
        commit('fetchCurrentUser', rawData.data)
      })
    },
    loginAndFetch({ dispatch }, loginData) {
      return dispatch('login', loginData).then(() => {
        return dispatch('fetchCurrentUser')
      })
    },
  },
}

export default user
