<template>
  <div class="app-container">
    <c-uploader
      action="https://service-97v3wgkr-1300321168.sh.apigw.tencentcs.com/release/UploadFileToCOSByAPIGW-1653728119"
    >
    </c-uploader>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CUploader from './components/CUploader.vue'
export default defineComponent({
  name: 'App',
  components: {
    CUploader,
  },
})
</script>

<style>
.page-title {
  color: #fff;
}
</style>
