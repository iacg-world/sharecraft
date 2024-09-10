<template>
  <div
    class="edit-wrapper"
    ref="editWrapper"
    :style="styles"
    :data-component-id="id"
    @click="onItemClick(id)"
    @mousedown="startMove"
    :class="{ active: active && isEditing && !isLocked, hidden: hidden }"
  >
    <slot></slot>
    <div class="resizers" v-if="active && isEditing && !isLocked">
      <div
        class="resizer top-left"
        @mousedown.stop="startResize('top-left')"
      ></div>
      <div
        class="resizer top-right"
        @mousedown.stop="startResize('top-right')"
      ></div>
      <div
        class="resizer bottom-left"
        @mousedown.stop="startResize('bottom-left')"
      ></div>
      <div
        class="resizer bottom-right"
        @mousedown.stop="startResize('bottom-right')"
      ></div>
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

type ResizeDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
interface OriginalPositions {
  left: number
  right: number
  top: number
  bottom: number
}

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    isLocked: Boolean,
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
      if (isEditing.value) {
        context.emit('set-active', id)
      }
    }
    const onChangeEditStatus = (id: string) => {
      store.commit('clearClickTimeout')
      store.commit('setEditStatus', !isEditing.value)
      if (!isEditing.value) {
        onItemClick(id)
      }
    }
    const removeEditComponent = (id: string) => {
      if (isEditing.value) {
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
      const container = document.querySelector('.preview-list') as HTMLElement
      const left = e.clientX - gap.x - container.offsetLeft
      const top = e.clientY - gap.y - container.offsetTop + container.scrollTop
      return {
        left,
        top,
      }
    }
    const startMove = (e: MouseEvent) => {
      if (props.isLocked || !isEditing.value) {
        return
      }
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
    const calculateSize = (
      direction: ResizeDirection,
      e: MouseEvent,
      positions: OriginalPositions
    ) => {
      const { clientX, clientY } = e
      const { left, right, top, bottom } = positions
      const container = document.querySelector('.preview-list') as HTMLElement
      const rightWidth = clientX - left
      const leftWidth = right - clientX
      const bottomHeight = clientY - top
      const topHeight = bottom - clientY
      const topOffset = clientY - container.offsetTop + container.scrollTop
      const leftOffset = clientX - container.offsetLeft
      const directionMap = {
        'top-left': () => {
          return {
            width: leftWidth,
            height: topHeight,
            top: topOffset,
            left: leftOffset,
          }
        },
        'top-right': () => {
          return {
            width: rightWidth,
            height: topHeight,
            top: topOffset,
            left: undefined,
          }
        },
        'bottom-left': () => {
          return {
            width: leftWidth,
            height: bottomHeight,
            top: undefined,
            left: leftOffset,
          }
        },
        'bottom-right': () => {
          return {
            width: rightWidth,
            height: bottomHeight,
            top: undefined,
            left: undefined,
          }
        },
      }
      return directionMap[direction]()
    }
    const startResize = (direction: ResizeDirection) => {
      const currentElement = editWrapper.value as HTMLElement
      const { left, right, top, bottom } =
        currentElement.getBoundingClientRect()
      const handleMove = (e: MouseEvent) => {
        const size = calculateSize(direction, e, { left, right, top, bottom })
        const { style } = currentElement
        if (size) {
          style.width = size.width + 'px'
          style.height = size.height + 'px'
          if (size.left) {
            style.left = size.left + 'px'
          }
          if (size.top) {
            style.top = size.top + 'px'
          }
        }
      }
      const handleMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', handleMove)
        const size = calculateSize(direction, e, { left, right, top, bottom })
        context.emit('update-position', { ...size, id: props.id })
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
      position: absolute !important;
      top: 0;
      z-index: -1;
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
