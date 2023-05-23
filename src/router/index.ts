import { message } from 'ant-design-vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/HomeView.vue'
import TemplateDetail from '../views/TemplateDetail.vue'
import Index from '../views/IndexView.vue'
import Works from '../views/WorksView.vue'
import store from '@/store'
import axios from 'axios'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: Index,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: { title: '欢迎来到分享乐' },
      },
      {
        path: 'template/:id',
        name: 'template',
        component: TemplateDetail,
        meta: { title: '模板详情' },
      },
      {
        path: 'works',
        name: 'works',
        component: Works,
        meta: {
          title: '我的作品',
          requiredLogin: true,
        },
      },
    ],
  },
  {
    path: '/editor/:id',
    name: 'editor',
    component: () =>
      import(/* webpackChunkName: "EditorView" */ '@/views/EditorView.vue'),
    meta: { requiredLogin: true, title: '编辑我的设计' },
  },
  {
    path: '/Login',
    name: 'Login',
    component: () =>
      import(/* webpackChunkName: "LoginView" */ '@/views/LoginView.vue'),
    meta: { requiredLogin: true, title: '登录到分享乐', disableLoading: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const { user } = store.state
  const { token, isLogin } = user
  const { redirectAlreadyLogin, requiredLogin, title } = to.meta
  if (title) {
    document.title = title as string
  }
  const pageMeta = document.getElementById('iacg-page-id')
  pageMeta?.setAttribute('iacg-page-id', to.fullPath)
  if (!isLogin) {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      try {
        await store.dispatch('fetchCurrentUser')
        if (redirectAlreadyLogin) {
          return '/'
        }
      } catch {
        message.error('登陆状态已过期 请重新登陆', 2)
        store.commit('logout')
        return '/login'
      }
    } else {
      if (requiredLogin && to.path !== '/login') {
        return '/login'
      }
    }
  } else {
    if (redirectAlreadyLogin) {
      return '/'
    }
  }
})

export default router
