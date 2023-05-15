<template>
  <router-link to="/login" v-if="!user.isLogin">
    <a-button type="primary" class="user-profile-component"> 登录 </a-button>
  </router-link>
  <div v-else>
    <a-dropdown-button class="user-profile-component">
      <router-link to="/setting">{{ user.data.nickName }}</router-link>
      <template v-slot:overlay>
        <a-menu class="user-profile-dropdown">
          <a-menu-item key="0" @click="createDesign">创建作品</a-menu-item>
          <a-menu-item key="1"
            ><router-link to="/works">我的作品</router-link></a-menu-item
          >
          <a-menu-item key="2" @click="logout">登出</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserProps } from '../store/user'
import axios from 'axios'

export default defineComponent({
  name: 'user-profile',
  props: {
    user: {
      type: Object as PropType<UserProps>,
      required: true,
    },
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const logout = () => {
      store.commit('logout')
      message.success('退出登录成功', 2)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
    const createDesign = async () => {
      const payload = {
        title: '未命名作品',
        desc: '未命名作品',
        coverImg:
          'https://sharecraft-backend.oss-cn-shanghai.aliyuncs.com/sharecraft-test/20180421210121_KddAy.jpeg',
      }
      const { data } = await store.dispatch('createWork', {
        data: payload,
      })
      message.success('创建作品成功', 2)
      router.push(`/editor/${data.id}`)
    }
    return {
      logout,
      createDesign,
    }
  },
})
</script>
<style>
.user-profile-dropdown {
  border-radius: 2px !important;
}
.user-operation > * {
  margin-left: 30px !important;
}
</style>
