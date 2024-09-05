<template>
  <div class="homepage-container">
    <a-layout :style="{ background: '#fff' }">
      <a-layout-header class="home-layout-header">
        <div class="page-title">
          <router-link v-if="route.fullPath === '/'" to="/">分享乐</router-link>
          <router-link v-else to="/"><HomeTwoTone /></router-link>
        </div>
        <user-profile :user="user"></user-profile>
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
          ><GithubFilled
        /></a>
      </ALayoutFooter>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import UserProfile from '../components/UserProfile.vue'
import { GithubFilled } from '@ant-design/icons-vue'
import { HomeTwoTone } from '@ant-design/icons-vue'
import { useRoute } from 'vue-router'

const store = useStore<GlobalDataProps>()
const user = computed(() => store.state.user)
const route = useRoute()
</script>

<style lang="scss">
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
