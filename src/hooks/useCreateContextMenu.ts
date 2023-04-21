import { createVNode, render } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
export interface ActionItem {
  action: (cid?: string) => void
  text: string
  shortcut: string
}
const useCreateContextMenu = (
  actions: ActionItem[],
  triggerClass = 'edit-wrapper'
) => {
  const container = document.createElement('div')
  const options = {
    actions,
    triggerClass,
  }
  const vm = createVNode(ContextMenu, options)
  render(vm, container)
  document.body.appendChild(container)
}

export default useCreateContextMenu
