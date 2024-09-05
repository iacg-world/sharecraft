<template>
  <div class="app-container">
    <a-config-provider
      :theme="{
        token: {
          colorPrimary: '#75409A',
        },
      }"
    >
      <a-spin v-if="showLoading" tip="读取中" class="global-spinner" />
      <router-view />
    </a-config-provider>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue/es'
import { GlobalDataProps } from './store/index'
export default defineComponent({
  name: 'App',
  setup() {
    const store = useStore<GlobalDataProps>()
    const route = useRoute()
    const isLoading = computed(() => store.getters.isLoading)
    const showLoading = computed(
      () => isLoading.value && !route.meta.disableLoading
    )
    const error = computed(() => store.state.global.error)
    watch(
      () => error.value.status,
      (errorValue) => {
        if (errorValue) {
          message.error(error.value.message || '未知错误', 2)
        }
      }
    )
    return {
      showLoading,
    }
  },
})
</script>
<style lang="scss">
.app-container .global-spinner {
  position: fixed;
  width: 100vw;
  top: 5px;
  color: #fff;
  z-index: 99;
  .ant-spin-dot-item {
    background-color: #fff;
  }
}
</style>
