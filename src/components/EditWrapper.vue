<template>
  <div
    class="edit-wrapper"
    ref="editWrapper"
    :styles="styles"
    @click="onItemClick(id)"
    @dblclick="onChangeEditStatus(id)"
    @mousedown="startMove"
    :class="{ active: active && isEditing, hidden: hidden }"
  >
    <slot></slot>
    <div class="resizers">
      <div class="resizer top-left"></div>
      <div class="resizer top-right"></div>
      <div class="resizer bottom-left"></div>
      <div class="resizer bottom-right" @mousedown.stop="startResize"></div>
    </div>
    <!-- <close-circle-two-tone
      v-if="active && isEditing"
      @click="removeEditComponent(id)"
      :class="{
        'remove-edit_component-active': true,
        'remove-edit_component': true,
      }"
    /> -->
  </div>
</template>

<script lang="ts">
import { GlobalDataProps } from '@/store'
import { defineComponent, computed, ref, nextTick } from 'vue'
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
  emits: ['set-active', 'remove-component', 'update-position'],
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
    let isMoving = false
    const styles = computed(() =>
      pick(props.props, ['position', 'top', 'left', 'width', 'height'])
    )
    const calculateMovePosition = (e: MouseEvent) => {
      const container = document.getElementById('canvas-area') as HTMLElement
      const left = e.clientX - gap.x - container.offsetLeft
      const top = e.clientY - gap.y - container.offsetTop
      return {
        left,
        top,
      }
    }
    const startResize = (e: MouseEvent) => {
      const currentElement = editWrapper.value
      const handleMove = (e: MouseEvent) => {
        if (currentElement) {
          const { left, top } = currentElement.getBoundingClientRect()
          currentElement.style.height = e.clientY - top + 'px'
          currentElement.style.width = e.clientX - left + 'px'
        }
      }
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMove)
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    const startMove = (e: MouseEvent) => {
      const currentElement = editWrapper.value
      if (currentElement) {
        const { left, top } = currentElement.getBoundingClientRect()
        gap.x = e.clientX - left
        gap.y = e.clientY - top
      }
      const handleMove = (e: MouseEvent) => {
        const { left, top } = calculateMovePosition(e)
        isMoving = true
        if (currentElement) {
          currentElement.style.top = top + 'px'
          currentElement.style.left = left + 'px'
        }
      }
      const handleMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', handleMove)
        if (isMoving) {
          const { left, top } = calculateMovePosition(e)
          context.emit('update-position', { left, top, id: props.id })
          isMoving = false
        }
        nextTick(() => {
          document.removeEventListener('mouseup', handleMouseUp)
        })
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return {
      onItemClick,
      onChangeEditStatus,
      removeEditComponent,
      isEditing,
      styles,
      editWrapper,
      startMove,
      startResize,
    }
  },
})
</script>

<style lang="scss">
.edit-wrapper {
  position: relative;
  padding: 0px;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
  box-sizing: content-box !important;

  &:hover {
    border: 1px dashed #ccc;
  }
  &.active {
    border: 1px solid #1890ff;
    user-select: none;
    z-index: 1500;
    .resizers {
      display: block;
    }
    .resizers .resizer {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #fff;
      border: 3px solid #1890ff;
      position: absolute;
    }
  }
  &.hidden {
    display: none;
  }
  & > * {
    position: static !important;
    width: 100% !important;
    height: 100% !important;
  }

  .resizers {
    display: none;
    .resizer.top-left {
      left: -5px;
      top: -5px;
      cursor: nwse-resize;
    }
    .resizer.top-right {
      right: -5px;
      top: -5px;
      cursor: nesw-resize;
    }
    .resizer.bottom-left {
      left: -5px;
      bottom: -5px;
      cursor: nesw-resize;
    }
    .resizer.bottom-right {
      right: -5px;
      bottom: -5px;
      cursor: nwse-resize;
    }
  }
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
