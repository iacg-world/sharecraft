<template>
  <div class="create-component-list">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="component-item"
      @click="onItemClick(item)"
    >
      <c-text v-bind="item"></c-text>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CText from '../components/CText.vue'
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
  },
  setup(props, context) {
    const onItemClick = (data: any) => {
      context.emit('on-item-click', data)
    }
    return {
      onItemClick,
    }
  },
})
</script>

<style>
/* .create-component-list {
  margin: 0 auto;
} */
.component-item {
  width: 100px;
  margin: 0 auto;
  margin-bottom: 15px;
}
</style>
