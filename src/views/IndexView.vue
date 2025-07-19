<template>
  <div class="homepage-container">
    <a-layout :style="{ background: '#fff' }">
      <a-layout-header class="home-layout-header">
        <div class="page-title page-icon">
          <a
            v-if="route.fullPath === '/'"
            href="https://github.com/iacg-world/sharecraft"
            target="_blank"
            >分享乐<GithubFilled style="margin-left: 5px"
          /></a>
          <router-link v-else to="/"><HomeOutlined /></router-link>
        </div>
        <UserProfile :user="user"></UserProfile>
      </a-layout-header>
      <a-layout-content class="home-layout-content">
        <router-view></router-view>
      </a-layout-content>
      <ALayoutFooter class="home-layout-footer">
        © lc404 (sharecraft.lc404.com) 版权所有
        <a href="https://beian.miit.gov.cn/" target="_blank"
          >蜀ICP备2023012528号</a
        >
        <a
          style="color: white; font-size: 20px; margin-left: 10px"
          href="https://github.com/iacg-world/sharecraft"
          target="_blank"
        ></a>
      </ALayoutFooter>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import UserProfile from '../components/UserProfile.vue'
import { GithubFilled, HomeOutlined } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'

const store = useStore<GlobalDataProps>()
const user = computed(() => store.state.user)
const route = useRoute()
</script>

<style lang="scss">
.page-icon {
  display: flex;
  align-items: center;
}
.home-layout-header {
  height: 10vh !important;
  line-height: unset !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.home-layout-content {
  height: 85vh;
  overflow-y: auto;
}
.home-layout-footer {
  height: 5vh !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  box-sizing: border-box !important;
}
</style>
