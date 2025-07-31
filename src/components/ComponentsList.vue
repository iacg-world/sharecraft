<template>
  <div class="create-component-list">
    <div
      v-for="(item, index) in list as Array<object>"
      :key="index"
      class="component-item"
      @click="onItemClick(item)"
    >
      <CText v-bind="item"></CText>
    </div>
    <StyledUploader
      class="component-item"
      @success="onImageUploaded"
    ></StyledUploader>
  </div>
</template>

<script lang="ts">
import { RespUploadData } from '@/respTypes'
import { message } from 'ant-design-vue/es'
import { CText } from 'iacg-block'
import { v4 as uuidv4 } from 'uuid'
import { defineComponent } from 'vue'
import StyledUploader from '../components/StyledUploader.vue'
import { imageDefaultProps, TextComponentProps } from '../defaultProps'
import { getImageDimensions } from '../helper'
import { ComponentData } from '../store/editor'
export default defineComponent({
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  emits: ['on-item-click'],
  name: 'ComponentsList',
  components: {
    CText,
    StyledUploader,
  },
  setup(props, context) {
    const onItemClick = (props: TextComponentProps) => {
      const componentData: ComponentData = {
        name: 'c-text',
        id: uuidv4(),
        props,
      }
      context.emit('on-item-click', componentData)
    }
    const onImageUploaded = (data: { resp: RespUploadData; file: File }) => {
      const { resp, file } = data
      const componentData: ComponentData = {
        name: 'c-image',
        id: uuidv4(),
        props: {
          ...imageDefaultProps,
        },
      }
      message.success('上传成功')
      componentData.props.src =
        resp.data.url || (resp.data.urls ? resp.data.urls[0] : '')

      getImageDimensions(file).then(({ width }) => {
        const maxWidth = 373
        componentData.props.width = (width > maxWidth ? maxWidth : width) + 'px'
        context.emit('on-item-click', componentData)
      })
    }
    return {
      onItemClick,
      onImageUploaded,
    }
  },
})
</script>

<style>
.component-item {
  width: 100px;
  margin: 0 auto;
  margin-bottom: 15px;
}
.component-item > * {
  position: static !important;
}
</style>
