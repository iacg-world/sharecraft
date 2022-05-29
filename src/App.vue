<template>
  <div class="app-container">
    <c-uploader
      action="https://service-97v3wgkr-1300321168.sh.apigw.tencentcs.com/release/UploadFileToCOSByAPIGW-1653728119"
      drag
      :autoUpload="false"
      ref="uploader"
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
    <button @click="callUpload">手动上传</button>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance } from 'vue'
import axios from 'axios'
import CUploader from './components/CUploader.vue'
export default defineComponent({
  name: 'App',
  components: {
    CUploader,
  },
  data() {
    return {
      test: 0,
    }
  },
  setup() {
    const uploader = ref()
    const internal = getCurrentInstance()
    console.log('internal instance', internal)
    const callUpload = () => {
      uploader.value.uploadFiles()
    }
    console.log('inner component instance', uploader)
    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const files = target.files
      if (files) {
        const uploadedFile = files[0]
        const formData = new FormData()
        formData.append(uploadedFile.name, uploadedFile)
        axios
          .post('http://local.test:7001/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((resp) => {
            console.log(resp.data)
          })
      }
    }
    return {
      handleFileChange,
      uploader,
      callUpload,
    }
  },
})
</script>

<style lang="scss">
.page-title {
  color: #fff;
}
.file-upload .upload-area {
  background: #efefef;
  border: 1px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  padding: 20px;
  width: 360px;
  height: 180px;
  text-align: center;
  &:hover {
    border: 1px dashed #1890ff;
  }
  &.is-dragover {
    border: 2px dashed #1890ff;
    background: rgba(#1890ff, 0.2);
  }
}
.uploaded-area img {
  height: 100px;
}
</style>
