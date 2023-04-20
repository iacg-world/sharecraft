import { useStore } from 'vuex'
import { computed } from 'vue'
import { GlobalDataProps } from '../store/index'
import useHotKey from '../hooks/useHotKey'

export default function initHotKeys() {
  const store = useStore<GlobalDataProps>()
  const currentId = computed(() => store.state.editor.currentElementId)
  useHotKey('ctrl+c, command+c', () => {
    store.commit('copyComponent', currentId.value)
  })
  useHotKey('ctrl+v, command+v', () => {
    store.commit('pasteCopiedComponent')
  })
  useHotKey('backspace, delete', () => {
    store.commit('deleteComponent', currentId.value)
  })
  useHotKey('esc', () => {
    store.commit('setActive', '')
  })
}
