import { computed, nextTick, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { GlobalDataProps } from '@/store/index'
import useSaveWork from './useSaveWork'
import { takeScreenshotAndUpload } from '@/helper'

function usePublishWork() {
  const { saveWork } = useSaveWork(true)
  const route = useRoute()
  const currentWorkId = route.params.id
  const store = useStore<GlobalDataProps>()
  const channels = computed(() => store.state.editor.channels)
  const isPublishing = ref(false)

  const publishWork = async (el: HTMLElement) => {
    try {
      isPublishing.value = true
      store.commit('startLoading', { opName: 'prePublish', loadingText: '发布中' })
      const timer = setTimeout(() => {
        store.commit('finishLoading', { opName: 'prePublish'})
        store.commit('startLoading', { opName: 'prePublish', loadingText: '发布中, 三方字体渲染较慢，请耐心等待' })

      }, 2000)
      store.commit('setEditStatus', false)
      await nextTick()
      const resp = await takeScreenshotAndUpload(el)
      clearTimeout(timer)
      if (resp) {
        store.commit('updatePage', {
          key: 'coverImg',
          value: resp.data.url || (resp.data.urls ? resp.data.urls[0] : ''),
          isRoot: true,
        })
        await saveWork()
        await store.dispatch('publishWork', {
          urlParams: { id: currentWorkId },
        })
        await store.dispatch('fetchChannels', {
          urlParams: { id: currentWorkId },
        })
        if (channels.value.length === 0) {
          await store.dispatch('createChannel', {
            data: { name: '默认', workId: parseInt(currentWorkId as string) },
          })
        }
        store.commit('finishLoading', { opName: 'prePublish', init: true})

      }
    } catch (e) {
      console.error(e)
    } finally {
      isPublishing.value = false
    }
  }
  return {
    publishWork,
    isPublishing,
  }
}

export default usePublishWork
