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
    </a-layout>
    <a-layout-footer>
      © lc404 (sharecraft.lc404.com) 版权所有
      <a href="https://beian.miit.gov.cn/" target="_blank"
        >蜀ICP备2023012528号</a
      ></a-layout-footer
    >
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import UserProfile from '../components/UserProfile.vue'
export default defineComponent({
  components: {
    UserProfile,
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
