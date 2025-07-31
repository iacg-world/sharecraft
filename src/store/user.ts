import { Module } from 'vuex'
import { GlobalDataProps, actionWrapper } from './index'
import { RespData } from '@/respTypes'
import axios from 'axios'
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
    token: localStorage.getItem('token') || '',
  },
  mutations: {
    login(state, rawData: RespData<{ token: string }>) {
      const { token } = rawData.data
      state.token = token
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      localStorage.setItem('token', token)
    },
    fetchCurrentUser(state, rawData: RespData<UserDataProps>) {
      state.isLogin = true
      state.data = { ...rawData.data }
    },
    logout(state) {
      state.isLogin = false
      state.token = ''
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    },
    signUpByEmail() {
      // no content
    },
    genVeriCode() {
      // no content
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
    genVeriCode: actionWrapper('/users/genVeriCode', 'genVeriCode', {
      method: 'post',
    }),
    login: actionWrapper('/users/loginByPhoneNumber', 'login', {
      method: 'post',
    }),
    loginByEmail: actionWrapper('/users/loginByEmail', 'login', {
      method: 'post',
    }),
    signUpByEmail: actionWrapper('/users/create', 'signUpByEmail', {
      method: 'post',
    }),
    fetchCurrentUser({ commit }) {
      return axios.get('/users/getUserInfo').then(rawData => {
        commit('fetchCurrentUser', rawData.data)
      })
    },
    loginAndFetch({ dispatch }, loginData) {
      return dispatch('login', loginData).then(() => {
        return dispatch('fetchCurrentUser')
      })
    },
    loginByEmailAndFetch({ dispatch }, loginData) {
      return dispatch('loginByEmail', loginData).then(() => {
        return dispatch('fetchCurrentUser')
      })
    },
    signUpAndLoginByEmail({ dispatch }, loginData) {
      const delayLogin = () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(dispatch('loginByEmailAndFetch', loginData))
          }, 500)
        })
      const promiseArr = [dispatch('signUpByEmail', loginData), delayLogin()]
      return Promise.all(promiseArr)
    },
  },
}

export default user
