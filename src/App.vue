<template>
  <div class="app-container">
    <c-uploader
      action="https://service-97v3wgkr-1300321168.sh.apigw.tencentcs.com/release/UploadFileToCOSByAPIGW-1653728119"
    >
      <div class="uploader-container">
        <h4>上传图片</h4>
      </div>
      <template #loading>
        <div class="uploader-container">
          <h4>上传中</h4>
        </div>
      </template>
      <!-- <template #uploaded="{ uploadedData }">
        <div class="uploaded-area">
          <img :src="uploadedData.data.url" />
          <h3>点击重新上传</h3>
        </div>
      </template> -->
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
