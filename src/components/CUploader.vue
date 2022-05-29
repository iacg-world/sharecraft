<template>
  <div class="file-upload">
    <div
      class="upload-area"
      :class="{ 'is-dragover': drag && isDragOver }"
      v-on="events"
    >
      <slot v-if="isUploading" name="loading">
        <button disabled>正在上传</button>
      </slot>
      <slot
        name="uploaded"
        v-else-if="lastFileData && lastFileData.loaded"
        :uploadedData="lastFileData.data"
      >
        <button>点击上传</button>
      </slot>
      <slot v-else name="default">
        <button>点击上传</button>
      </slot>
    </div>
    <input
      ref="fileInput"
      type="file"
      :style="{ display: 'none' }"
      @change="handleFileChange"
    />
    <ul class="upload-list">
      <li
        :class="`uploaded-file upload-${file.status}`"
        v-for="file in filesList"
        :key="file.uid"
      >
        <span v-if="file.status === 'loading'" class="file-icon"
          ><LoadingOutlined
        /></span>
        <span v-else class="file-icon"><FileOutlined /></span>
        <span class="filename">{{ file.name }}</span>
        <span class="delete-icon" @click="removeFile(file.uid)"
          ><DeleteOutlined
        /></span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, computed, PropType } from 'vue'
import {
  DeleteOutlined,
  LoadingOutlined,
  FileOutlined,
} from '@ant-design/icons-vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { last } from 'lodash-es'
type UploadStatus = 'ready' | 'loading' | 'success' | 'error'
type CheckUpload = (file: File) => boolean | Promise<File>
export interface UploadFile {
  uid: string
  size: number
  name: string
  status: UploadStatus
  raw: File
  resp?: any
}
export default defineComponent({
  components: {
    DeleteOutlined,
    LoadingOutlined,
    FileOutlined,
  },
  props: {
    action: {
      type: String,
      required: true,
    },
    beforeUpload: {
      type: Function as PropType<CheckUpload>,
    },
    drag: {
      type: Boolean,
      default: false,
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const fileInput = ref<null | HTMLInputElement>(null)
    const filesList = ref<UploadFile[]>([])
    const isDragOver = ref(false)
    const isUploading = computed(() => {
      return filesList.value.some((file) => file.status === 'loading')
    })
    const lastFileData = computed(() => {
      const lastFile = last(filesList.value)
      if (lastFile) {
        return {
          loaded: lastFile.status === 'success',
          data: lastFile.resp,
        }
      }
      return false
    })
    const removeFile = (id: string) => {
      filesList.value = filesList.value.filter((file) => file.uid !== id)
    }

    const triggerUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    const postFile = (readyFile: UploadFile) => {
      const formData = new FormData()
      formData.append(readyFile.name, readyFile.raw)
      readyFile.status = 'loading'
      axios
        .post(props.action, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((resp) => {
          readyFile.status = 'success'
          readyFile.resp = resp.data
        })
        .catch(() => {
          readyFile.status = 'error'
        })
        .finally(() => {
          if (fileInput.value) {
            fileInput.value.value = ''
          }
        })
    }
    // addFileToList
    const addFileToList = (uploadedFile: File) => {
      const fileObj = reactive<UploadFile>({
        uid: uuidv4(),
        size: uploadedFile.size,
        name: uploadedFile.name,
        status: 'ready',
        raw: uploadedFile,
      })
      filesList.value.push(fileObj)
      if (props.autoUpload) {
        postFile(fileObj)
      }
    }
    const beforeUploadCheck = (files: null | FileList) => {
      if (files) {
        const uploadedFile = files[0]
        if (props.beforeUpload) {
          const result = props.beforeUpload(uploadedFile)
          if (result && result instanceof Promise) {
            result
              .then((processedFile) => {
                if (processedFile instanceof File) {
                  addFileToList(processedFile)
                } else {
                  throw new Error(
                    'beforeUpload Promise should return File object'
                  )
                }
              })
              .catch((e) => {
                console.error(e)
              })
          } else if (result === true) {
            addFileToList(uploadedFile)
          }
        } else {
          addFileToList(uploadedFile)
        }
      }
    }
    const uploadFiles = () => {
      filesList.value
        .filter((file) => file.status === 'ready')
        .forEach((readyFile) => postFile(readyFile))
    }

    let events: { [key: string]: (e: any) => void } = {
      click: triggerUpload,
    }
    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      beforeUploadCheck(target.files)
    }
    const handleDrag = (e: DragEvent, over: boolean) => {
      e.preventDefault()
      isDragOver.value = over
    }
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      isDragOver.value = false
      if (e.dataTransfer) {
        beforeUploadCheck(e.dataTransfer.files)
      }
    }
    if (props.drag) {
      events = {
        ...events,
        dragover: (e: DragEvent) => {
          handleDrag(e, true)
        },
        dragleave: (e: DragEvent) => {
          handleDrag(e, false)
        },
        drop: handleDrop,
      }
    }
    return {
      fileInput,
      handleFileChange,
      isUploading,
      filesList,
      removeFile,
      lastFileData,
      isDragOver,
      events,
      uploadFiles,
    }
  },
})
</script>
<style lang="scss">
.upload-list {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
.upload-list li {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  font-size: 14px;
  line-height: 1.8;
  margin-top: 5px;
  box-sizing: border-box;
  border-radius: 4px;
  min-width: 200px;
  position: relative;
  &:first-child {
    margin-top: 10px;
  }
  .file-icon {
    svg {
      margin-right: 5px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  .filename {
    margin-left: 5px;
    margin-right: 40px;
  }
  &.upload-error {
    color: #f5222d;
    svg {
      color: #f5222d;
    }
  }
  .file-status {
    display: block;
    position: absolute;
    right: 5px;
    top: 0;
    line-height: inherit;
  }
  .delete-icon {
    display: none;
    position: absolute;
    right: 7px;
    top: 0;
    line-height: inherit;
    cursor: pointer;
  }
  &:hover {
    background-color: #efefef;
    .file-status {
      display: none;
    }
    .delete-icon {
      display: block;
    }
  }
}
</style>
