<template>
  <div class="create-component-list">
    <div
      v-for="(item, index) in list as Array<object>"
      :key="index"
      class="component-item"
      draggable="true"
      @dragstart="onDragStart($event, item as TextComponentProps)"
      @dragend="onDragEnd"
    >
      <CText v-bind="item"></CText>
      <div class="drag-hint">拖拽到画布</div>
    </div>

    <div
      v-for="(img, index) in uploadedImages"
      :key="'img-' + index"
      class="component-item uploaded-image-item"
      draggable="true"
      @dragstart="onImageDragStart($event, img)"
      @dragend="onDragEnd"
    >
      <div class="image-preview">
        <img :src="img.src" :alt="'uploaded-' + index" />
        <CloseCircleOutlined
          class="remove-btn"
          @click.stop="removeImage(index)"
        />
      </div>
      <div class="drag-hint">拖拽到画布</div>
    </div>

    <StyledUploader
      class="component-item uploader-item"
      @success="onImageUploaded"
    ></StyledUploader>
  </div>
</template>

<script lang="ts">
import { RespUploadData } from '@/respTypes'
import { message } from 'ant-design-vue/es'
import { CText } from 'iacg-block'
import { v4 as uuidv4 } from 'uuid'
import { defineComponent, reactive } from 'vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue'
import StyledUploader from '../components/StyledUploader.vue'
import { imageDefaultProps, TextComponentProps } from '../defaultProps'
import { getImageDimensions } from '../helper'
import { ComponentData } from '../store/editor'

type UploadedImage = {
  src: string
  width: string
}

export default defineComponent({
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  emits: ['on-item-click', 'on-drag-component'],
  name: 'ComponentsList',
  components: {
    CText,
    StyledUploader,
    CloseCircleOutlined,
  },
  setup() {
    const uploadedImages = reactive<UploadedImage[]>([])

    const onDragStart = (event: DragEvent, itemProps: TextComponentProps) => {
      const componentData: ComponentData = {
        name: 'c-text',
        id: uuidv4(),
        props: { ...itemProps },
      }
      event.dataTransfer?.setData(
        'component-data',
        JSON.stringify(componentData),
      )
      event.dataTransfer!.effectAllowed = 'copy'
      document.body.classList.add('dragging-component')
    }

    const onImageDragStart = (event: DragEvent, img: UploadedImage) => {
      const componentData: ComponentData = {
        name: 'c-image',
        id: uuidv4(),
        props: {
          ...imageDefaultProps,
          src: img.src,
          width: img.width,
        },
      }
      event.dataTransfer?.setData(
        'component-data',
        JSON.stringify(componentData),
      )
      event.dataTransfer!.effectAllowed = 'copy'
      document.body.classList.add('dragging-component')
    }

    const onDragEnd = () => {
      document.body.classList.remove('dragging-component')
    }

    const onImageUploaded = (data: { resp: RespUploadData; file: File }) => {
      const { resp, file } = data
      const src = resp.data.url || (resp.data.urls ? resp.data.urls[0] : '')

      message.success('上传成功，拖拽图片到画布放置')

      getImageDimensions(file).then(({ width }) => {
        const maxWidth = 373
        const finalWidth = (width > maxWidth ? maxWidth : width) + 'px'
        uploadedImages.push({ src, width: finalWidth })
      })
    }

    const removeImage = (index: number) => {
      uploadedImages.splice(index, 1)
    }

    return {
      uploadedImages,
      onDragStart,
      onImageDragStart,
      onDragEnd,
      onImageUploaded,
      removeImage,
    }
  },
})
</script>

<style lang="scss">
.create-component-list {
  .component-item {
    width: 100px;
    margin: 0 auto;
    margin-bottom: 15px;
    cursor: grab;
    position: relative;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    border-radius: 4px;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      .drag-hint {
        opacity: 1;
      }
    }

    &:active {
      cursor: grabbing;
    }

    & > *:not(.drag-hint):not(.image-preview) {
      position: static !important;
      pointer-events: none;
    }
  }

  .uploaded-image-item {
    margin-bottom: 25px;

    .image-preview {
      position: relative;
      width: 100px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      border: 2px solid #75409a;
      background: #f5f5f5;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }

      .remove-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 16px;
        color: #ff4d4f;
        background: #fff;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.2);
        }
      }
    }
  }

  .uploader-item {
    cursor: pointer;

    &:hover {
      transform: none;
      box-shadow: none;
    }

    & > * {
      pointer-events: auto !important;
    }
  }

  .drag-hint {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
  }
}

body.dragging-component {
  cursor: grabbing !important;
}
</style>
