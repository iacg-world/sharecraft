import { computed, ComputedRef, reactive, ref, toRef } from 'vue'
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
  const requestParams = reactive(params)
  const loadMorePage = () => {
    requestParams.pageIndex++
    store.dispatch(actionName, { searchParams: requestParams })
  }
  const goToPage = (index: number) => {
    requestParams.pageIndex = index
    store.dispatch(actionName, { searchParams: requestParams })
  }
  const loadPrevPage = () => {
    requestParams.pageIndex--
    store.dispatch(actionName, { searchParams: requestParams })
  }
  const isFirstPage = computed(() => requestParams.pageIndex === 0)
  const totalPage = computed(() => Math.ceil(total.value / params.pageSize))
  const isLastPage = computed(() => {
    return totalPage.value === requestParams.pageIndex + 1
  })
  const pageIndex = toRef(requestParams, 'pageIndex')
  const currentPage = computed(() => pageIndex.value + 1)
  return {
    loadMorePage,
    isLastPage,
    currentPage,
    pageIndex,
    pageSize: params.pageSize,
    loadPrevPage,
    isFirstPage,
    requestParams,
    goToPage,
    totalPage,
    totalWorks: computed(() => total.value),
  }
}
export default useLoadMore
