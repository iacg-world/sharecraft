<template>
  <div class="create-component-list">
    <div
      v-for="(item, index) in (list as Array<object>)"
      :key="index"
      class="component-item"
      @click="onItemClick(item)"
    >
      <c-text v-bind="item"></c-text>
    </div>
  </div>
  <StyledUploader @success="onImageUploaded"></StyledUploader>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CText from '../components/CText.vue'
import StyledUploader from '../components/StyledUploader.vue'
export default defineComponent({
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  emits: ['on-item-click'],
  name: 'components-list',
  components: {
    CText,
    StyledUploader,
  },
  setup(props, context) {
    const onItemClick = (data: any) => {
      context.emit('on-item-click', data)
    }
    const onImageUploaded = (data: any) => {
      console.log('onImageUploaded')
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
</style>
