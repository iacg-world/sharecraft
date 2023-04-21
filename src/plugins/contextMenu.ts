import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import createContextMenu, { ActionItem } from '@/hooks/useCreateContextMenu'
const initContextMenu = () => {
  const store = useStore()
  const testActions: ActionItem[] = [
    {
      shortcut: 'Backspace / Delete',
      text: '删除图层',
      action: (cid) => {
        store.commit('deleteComponent', cid)
      },
    },
  ]

  const testActions2: ActionItem[] = [
    {
      shortcut: 'Ctrl+C',
      text: '复制配置',
      action: (e) => {
        console.log(e)
      },
    },
  ]

  onMounted(() => {
    createContextMenu(testActions)
    createContextMenu(testActions2, 'settings-panel')
  })
}

export default initContextMenu
