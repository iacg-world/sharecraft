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
  const pageIndex = ref(params.pageIndex)
  const requestParams = computed(() => {
    return {
      ...params,
      pageIndex: pageIndex.value,
    }
  })
  const loadMorePage = () => {
    pageIndex.value++
    store.dispatch(actionName, { searchParams: requestParams.value })
  }
  const loadPrevPage = () => {
    pageIndex.value--
    store.dispatch(actionName, { searchParams: requestParams.value })
  }
  const isFirstPage = computed(() => pageIndex.value === 0)
  const isLastPage = computed(() => {
    return Math.ceil(total.value / params.pageSize) === pageIndex.value + 1
  })
  return {
    loadMorePage,
    isLastPage,
    pageIndex,
    loadPrevPage,
    isFirstPage,
  }
}
export default useLoadMore
