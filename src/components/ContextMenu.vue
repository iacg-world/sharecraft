<template>
  <div class="context-menu-component menu-container" ref="menuRef">
    <ul class="ant-menu-light ant-menu-root ant-menu ant-menu-vertical">
      <li
        v-for="(action, index) in actions"
        :key="index"
        @click="action.action(componentId)"
        class="ant-menu-item"
      >
        <span class="item-text">{{ action.text }}</span>
        <span class="item-shortcut">{{ action.shortcut }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onUnmounted, PropType } from 'vue'
import { getParentElement } from '../helper'
import { ActionItem } from '@/hooks/useCreateContextMenu'

export default defineComponent({
  props: {
    actions: {
      type: Array as PropType<ActionItem[]>,
      required: true,
    },
    triggerClass: {
      type: String,
      default: 'edit-wrapper',
    },
  },
  setup(props) {
    const menuRef = ref<HTMLElement | null>(null)
    const componentId = ref('')
    const triggerContextMenu = (e: MouseEvent) => {
      const domElement = menuRef.value as HTMLElement
      const wrapperElement = getParentElement(
        e.target as HTMLElement,
        props.triggerClass
      )
      if (wrapperElement) {
        e.preventDefault()
        domElement.style.display = 'block'
        domElement.style.top = e.pageY + 'px'
        domElement.style.left = e.pageX + 'px'
        const cid = wrapperElement.dataset.componentId
        if (cid) {
          componentId.value = cid
        }
      }
    }
    const handleClick = () => {
      const domElement = menuRef.value as HTMLElement
      domElement.style.display = 'none'
    }
    onMounted(() => {
      document.addEventListener('contextmenu', triggerContextMenu)
      document.addEventListener('click', handleClick)
    })

    onUnmounted(() => {
      document.removeEventListener('contextmenu', triggerContextMenu)
      document.removeEventListener('click', handleClick)
    })
    return {
      menuRef,
      componentId,
    }
  },
})
</script>

<style>
.menu-container {
  display: none;
  position: absolute;
  background: #fff;
  z-index: 2000;
  border: 1px solid #ccc;
}
.menu-container .ant-menu-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
}
.menu-container .ant-menu-item:hover {
  background: #efefef;
}
.ant-menu-item .item-shortcut {
  color: #ccc;
}
</style>
