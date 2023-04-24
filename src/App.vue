<template>
  <div class="app-container">
    <a-spin v-if="showLoading" tip="读取中" class="global-spinner" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
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
<style>
.app-container .global-spinner {
  position: fixed;
  top: 10px;
  right: 50%;
}
</style>
