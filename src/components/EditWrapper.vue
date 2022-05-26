<template>
  <div
    class="edit-wrapper"
    @click="onItemClick(id)"
    @dblclick="onChangeEditStatus(id)"
    :class="{ active: active }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { GlobalDataProps } from '@/store'
import { defineComponent } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['set-active'],
  setup(props, context) {
    const store = useStore<GlobalDataProps>()

    const onItemClick = (id: string) => {
      if (store.state.editor.isEditing) {
        context.emit('set-active', id)
      }
    }
    const onChangeEditStatus = (id: string) => {
      const isEditing = store.state.editor.isEditing
      if (!isEditing) {
        onItemClick(id)
      }
      store.commit('clearClickTimeout')
      store.commit('setEditStatus', isEditing)
    }
    return {
      onItemClick,
      onChangeEditStatus,
    }
  },
})
</script>

<style>
.edit-wrapper {
  padding: 0px;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
}
.edit-wrapper:hover {
  border: 1px dashed #ccc;
}
.edit-wrapper.active {
  border: 1px solid #1890ff;
  user-select: none;
  z-index: 1500;
}
</style>
