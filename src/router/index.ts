import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/HomeView.vue'
import Editor from '../views/EditorView.vue'
import TemplateDetail from '../views/TemplateDetail.vue'
import Index from '../views/IndexView.vue'
import Login from '../views/LoginView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: Index,
    children: [
      { path: '', name: 'home', component: Home },
      { path: 'template/:id', name: 'template', component: TemplateDetail },
    ],
  },
  {
    path: '/editor',
    name: 'editor',
    component: Editor,
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
  },
]
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
