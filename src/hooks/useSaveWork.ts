import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { Modal } from 'ant-design-vue'
import { GlobalDataProps } from '../store/index'

function useSaveWork() {
  const route = useRoute()
  const currentWorkId = route.params.id
  const store = useStore<GlobalDataProps>()
  const saveIsLoading = computed(() => store.getters.isOpLoading('saveWork'))
  const components = computed(() => store.state.editor.components)
  const page = computed(() => store.state.editor.page)
  const isDirty = computed(() => store.state.editor.isDirty)
  // 保存函数
  const saveWork = () => {
    const { title, props, coverImg } = page.value
    const payload = {
      title,
      coverImg,
      content: {
        components: components.value,
        props,
      },
    }
    store.dispatch('saveWork', {
      data: payload,
      urlParams: { id: currentWorkId },
    })
  }
  // 自动保存
  let timer = 0
  onMounted(() => {
    timer = setInterval(() => {
      if (isDirty.value) {
        saveWork()
      }
    }, 1000 * 25)
  })
  onUnmounted(() => {
    clearInterval(timer)
  })
  onBeforeRouteLeave((to, from, next) => {
    if (isDirty.value) {
      Modal.confirm({
        title: '作品还未保存，是否保存？',
        okText: '保存',
        okType: 'primary',
        cancelText: '不保存',
        onOk: async () => {
          await saveWork()
          next()
        },
        onCancel: () => {
          next()
        },
      })
    } else {
      next()
    }
  })
  return {
    saveWork,
    saveIsLoading,
  }
}
export default useSaveWork
