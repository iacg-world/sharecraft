<template>
  <div class="content-container">
    <a-row :gutter="16">
      <template-list :list="testData"></template-list>
    </a-row>
    <a-row type="flex" justify="center">
      <a-button
        type="primary"
        size="large"
        @click="loadMorePage"
        v-if="!isLastPage"
        :loading="isLoading"
        >加载更多</a-button
      >
    </a-row>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import useLoadMore from '../hooks/useLoadMore'
import TemplateList from '../components/TemplateList.vue'
export default defineComponent({
  components: {
    TemplateList,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const testData = computed(() => store.state.templates.data)
    const total = computed(() => store.state.templates.totalTemplates)
    const isLoading = computed(() =>
      store.getters.isOpLoading('fetchTemplates')
    )
    const { loadMorePage, isLastPage } = useLoadMore('fetchTemplates', total, {
      pageIndex: 0,
      pageSize: 4,
    })
    onMounted(() => {
      store.dispatch('fetchTemplates', {
        searchParams: { pageIndex: 0, pageSize: 4 },
      })
    })
    return {
      testData,
      isLoading,
      loadMorePage,
      isLastPage,
    }
  },
})
</script>

<style>
.page-title {
  color: #fff;
}
.content-container {
  background: #fff;
  padding: 0 24px 24px 30px;
  min-height: 85vh;
  max-width: 1200px;
  margin: 50px auto;
  width: 100%;
}
</style>
