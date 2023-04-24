import { message } from 'ant-design-vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/HomeView.vue'
import Editor from '../views/EditorView.vue'
import TemplateDetail from '../views/TemplateDetail.vue'
import Index from '../views/IndexView.vue'
import Login from '../views/LoginView.vue'
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
    ],
  },
  {
    path: '/editor/:id',
    name: 'editor',
    component: Editor,
    meta: { requiredLogin: true, title: '编辑我的设计' },
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: { requiredLogin: true, title: '登录到分享乐', disableLoading: true },
  },
]
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  const { user } = store.state
  const { token, isLogin } = user
  const { redirectAlreadyLogin, requiredLogin, title } = to.meta
  if (title) {
    document.title = title as string
  }
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
