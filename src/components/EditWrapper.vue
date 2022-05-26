<template>
  <div
    class="edit-wrapper"
    @click="onItemClick(id)"
    @dblclick="onChangeEditStatus(id)"
    :class="{ active: active }"
  >
    <slot></slot>
    <close-circle-two-tone
      v-if="active"
      @click="removeEditComponent(id)"
      :class="{
        'remove-edit_component-active': active,
        'remove-edit_component': true,
      }"
    />
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
  emits: ['set-active', 'remove-component'],
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
    const removeEditComponent = (id: string) => {
      if (store.state.editor.isEditing) {
        context.emit('remove-component', id)
      }
    }
    return {
      onItemClick,
      onChangeEditStatus,
      removeEditComponent,
    }
  },
})
</script>

<style>
.edit-wrapper {
  position: relative;
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
.remove-edit_component {
  position: absolute;
  right: 0;
  top: 0;
}
.remove-edit_component:hover {
  color: red;
}
</style>
