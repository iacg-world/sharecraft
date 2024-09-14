<template>
  <div class="app-container">
    <a-config-provider
      :theme="{
        token: {
          colorPrimary: '#75409A',
        },
      }"
    >
      <a-spin v-if="showLoading" :tip="loadingText" wrapperClassName="global-spinner" class="global-spinner" />
      <router-view />
    </a-config-provider>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue/es'
import { GlobalDataProps } from './store/index'

const store = useStore<GlobalDataProps>()
const route = useRoute()
const isLoading = computed(() => store.getters.isLoading)
const loadingText = computed(() => store.getters.loadingText)
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

</script>
<style lang="scss">
.app-container .global-spinner {
  position: absolute;
  z-index: 999;
  width: 100vw;
  color: #fff;
  z-index: 99;
  background: rgb(0, 21, 41, 0.6);
  .ant-spin-dot-item {
    background-color: #fff;
  }
}
</style>
