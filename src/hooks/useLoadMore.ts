import { ref, computed, ComputedRef } from 'vue'
import { useStore } from 'vuex'
interface LoadParams {
  pageIndex: number
  pageSize: number
  [key: string]: any
}

const useLoadMore = (
  actionName: string,
  total: ComputedRef<number>,
  params: LoadParams = { pageIndex: 0, pageSize: 8 }
) => {
  const store = useStore()
  // 变化的参数
  const pageIndex = ref(params.pageIndex)
  // 请求的参数，根据变化的参数进行更新
  const requestParams = computed(() => {
    return {
      ...params,
      pageIndex: pageIndex.value + 1,
    }
  })
  const loadMorePage = () => {
    store
      .dispatch(actionName, { searchParams: requestParams.value })
      .then(() => {
        pageIndex.value++
      })
  }
  const isLastPage = computed(() => {
    return Math.ceil(total.value / params.pageSize) === pageIndex.value + 1
  })
  return {
    loadMorePage,
    isLastPage,
    pageIndex,
  }
}
export default useLoadMore
