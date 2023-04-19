<template>
  <div class="background-processer">
    <styled-uploader v-if="!value"></styled-uploader>
    <image-processer v-else :value="value"> </image-processer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ImageProcesser from './ImageProcesser.vue'
import StyledUploader from './StyledUploader.vue'

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  components: {
    ImageProcesser,
    StyledUploader,
  },
})
</script>

<style></style>
