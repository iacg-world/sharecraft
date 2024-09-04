<template>
  <div class="homepage-container">
    <a-layout :style="{ background: '#fff' }">
      <a-layout-header class="header">
        <div class="page-title">
          <router-link to="/">分享乐</router-link>
        </div>
        <user-profile :user="user"></user-profile>
      </a-layout-header>
      <a-layout-content class="home-layout">
        <router-view></router-view>
      </a-layout-content>
      <ALayoutFooter>
        © lc404 (sharecraft.lc404.com) 版权所有
        <a href="https://beian.miit.gov.cn/" target="_blank"
          >蜀ICP备2023012528号</a
        ></ALayoutFooter
      >
    </a-layout>
  </div>
</template>

<script lang="ts" scope>
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import UserProfile from '../components/UserProfile.vue'
import { LayoutFooter as ALayoutFooter } from 'ant-design-vue/es'
export default defineComponent({
  components: {
    UserProfile,
    ALayoutFooter,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const user = computed(() => store.state.user)
    return {
      user,
    }
  },
})
</script>

<style lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
