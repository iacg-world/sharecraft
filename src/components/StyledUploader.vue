<template>
  <c-uploader
    class="styled-uploader"
    action="utils/upload-img"
    :showUploadList="false"
    :beforeUpload="commonUploadCheck"
    @success="
      (data) => {
        handleUploadSuccess(data.resp, data.file.raw)
      }
    "
    @error="
      (data) => {
        handleUploadError(data.resp, data.file.raw)
      }
    "
  >
    <div class="uploader-container">
      <FileImageOutlined />
      <h4>{{ text }}</h4>
    </div>
    <template #loading>
      <div class="uploader-container">
        <LoadingOutlined spin />
        <h4>上传中</h4>
      </div>
    </template>
    <template #uploaded="dataProps">
      <div class="uploader-container">
        <img :src="dataProps.uploadedData.data.urls[0]" v-if="showUploaded" />
        <template v-else>
          <FileImageOutlined />
          <h4>{{ text }}</h4>
        </template>
      </div>
    </template>
  </c-uploader>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FileImageOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { commonUploadCheck } from '../helper'
import CUploader from './CUploader.vue'
export default defineComponent({
  props: {
    text: {
      type: String,
      default: '上传图片',
    },
    showUploaded: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CUploader,
    FileImageOutlined,
    LoadingOutlined,
  },
  emits: ['success', 'error'],
  setup(props, { emit }) {
    const handleUploadSuccess = (resp: any, file: File) => {
      emit('success', { resp, file })
    }
    const handleUploadError = (resp: any, file: File) => {
      emit('error', { resp, file })
    }
    return {
      commonUploadCheck,
      handleUploadSuccess,
      handleUploadError,
    }
  },
})
</script>

<style lang="scss">
.styled-uploader {
  .uploader-container {
    width: 100px;
    padding: 5px 10px;
    color: #ffffff;
    background: #75409a;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    &:hover {
      opacity: 0.8;
    }
    h4 {
      color: #ffffff;
      margin-bottom: 0;
      margin-left: 5px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
