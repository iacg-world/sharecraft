import { createVNode, render } from 'vue'
import ContextMenu from '@/components/ContextMenu.vue'
export interface ActionItem {
  action: () => void
  text: string
  shortcut: string
}
const useCreateContextMenu = (actions: ActionItem[]) => {
  const container = document.createElement('div')
  const options = {
    actions,
  }
  const vm = createVNode(ContextMenu, options)
  render(vm, container)
  document.body.appendChild(container)
}

export default useCreateContextMenu
