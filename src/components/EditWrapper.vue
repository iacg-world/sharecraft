<template>
  <div
    class="edit-wrapper"
    @click="onItemClick(id)"
    @dblclick="onChangeEditStatus(id)"
    :class="{ active: active && isEditing, hidden: hidden }"
  >
    <slot></slot>
    <close-circle-two-tone
      v-if="active && isEditing"
      @click="removeEditComponent(id)"
      :class="{
        'remove-edit_component-active': true,
        'remove-edit_component': true,
      }"
    />
  </div>
</template>

<script lang="ts">
import { GlobalDataProps } from '@/store'
import { defineComponent, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { pick } from 'lodash-es'

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
    hidden: {
      type: Boolean,
      default: false,
    },
    props: {
      type: Object,
    },
  },
  emits: ['set-active', 'remove-component'],
  setup(props, context) {
    const store = useStore<GlobalDataProps>()
    const isEditing = computed(() => store.state.editor.isEditing)
    const editWrapper = ref<null | HTMLElement>(null)

    const onItemClick = (id: string) => {
      if (store.state.editor.isEditing) {
        context.emit('set-active', id)
      }
    }
    const onChangeEditStatus = (id: string) => {
      const isEditing = store.state.editor.isEditing
      store.commit('clearClickTimeout')
      store.commit('setEditStatus', isEditing)
      if (!isEditing) {
        onItemClick(id)
      }
    }
    const removeEditComponent = (id: string) => {
      if (store.state.editor.isEditing) {
        context.emit('remove-component', id)
      }
    }

    const gap = {
      x: 0,
      y: 0,
    }
    const styles = computed(() =>
      pick(props.props, ['position', 'top', 'left', 'width', 'height'])
    )
    const startMove = (e: MouseEvent) => {
      const currentElement = editWrapper.value
      if (currentElement) {
        const { left, top } = currentElement.getBoundingClientRect()
        gap.x = e.clientX - left
        gap.y = e.clientY - top
        console.log(gap)
      }
    }
    return {
      onItemClick,
      onChangeEditStatus,
      removeEditComponent,
      isEditing,
      styles,
      editWrapper,
      startMove,
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
.edit-wrapper.hidden {
  display: none;
}
.edit-wrapper > * {
  position: static !important;
}
.remove-edit_component {
  position: absolute;
  right: 0;
  top: 0;
}
.remove-edit_component-active:hover {
  transform: scale(1.1);
}
</style>
