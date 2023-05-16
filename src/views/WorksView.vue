<template>
  <div class="mywork-container content-container">
    <a-row
      type="flex"
      justify="space-between"
      align="middle"
      class="poster-title"
    >
      <h2>我的作品和模版</h2>
    </a-row>
    <a-tabs @change="changeCategory">
      <a-tab-pane key="0" tab="我的作品"> </a-tab-pane>
      <a-tab-pane key="1" tab="我的模版"> </a-tab-pane>
    </a-tabs>
    <a-empty v-if="works.length === 0 && !isLoading">
      <template v-slot:description>
        <span> 还没有任何作品 </span>
      </template>
      <a-button type="primary" size="large"> 创建你的第一个设计 🎉 </a-button>
    </a-empty>

    <works-list
      :list="works"
      @on-delete="onDelete"
      @on-copy="onCopy"
      @on-publish="publishTemplate"
      :loading="isLoading"
    >
    </works-list>
    <a-row type="flex" justify="end" align="middle">
      <ul class="ant-pagination">
        <li
          class="ant-pagination-prev"
          :class="{ 'ant-pagination-disabled': isFirstPage }"
        >
          <a-button
            size="normal"
            @click="loadPrevPage"
            v-if="!isFirstPage"
            :loading="isLoading"
            >上一页</a-button
          >
        </li>
        <li
          v-for="item in totalPage"
          :key="item"
          class="ant-pagination-item"
          :class="{ 'ant-pagination-item-active': pageIndex + 1 === item }"
        >
          <a @click.prevent="goToPage(item - 1)">{{ item }}</a>
        </li>
        <li
          class="ant-pagination-next"
          :class="{ 'ant-pagination-disabled': isLastPage }"
        >
          <a-button
            size="normal"
            @click="loadMorePage"
            v-if="!isLastPage"
            :loading="isLoading"
            >下一页</a-button
          >
        </li>
      </ul>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { GlobalDataProps } from '../store/index'
import WorksList from '../components/WorksList.vue'
import useLoadMore from '../hooks/useLoadMore'
import { message } from 'ant-design-vue'
export default defineComponent({
  components: {
    WorksList,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const router = useRouter()
    const works = computed(() => store.state.templates.works)
    const total = computed(() => store.state.templates.totalWorks)
    const isLoading = computed(() => store.getters.isOpLoading('fetchWorks'))
    const isTemplate = ref(0)
    const searchParams = computed(() => ({
      pageIndex: 0,
      pageSize: 4,
    }))
    onMounted(() => {
      store.dispatch('fetchWorks', { searchParams: searchParams.value })
    })
    const {
      isLastPage,
      loadMorePage,
      isFirstPage,
      loadPrevPage,
      pageIndex,
      requestParams,
      goToPage,
      totalPage,
    } = useLoadMore('fetchWorks', total, searchParams.value)
    const onDelete = async (id: number, isTemplate: number) => {
      await store.dispatch('deleteWorkAndFetch', { id, isTemplate })
      message.success('删除成功')
    }
    const onCopy = async (id: number) => {
      await store.dispatch('copyWorkAndJump', id)
      message.success('复制成功')
    }
    const changeCategory = (key: any) => {
      isTemplate.value = key
      pageIndex.value = 0
      requestParams.isTemplate = key
      nextTick(() => {
        store.dispatch('fetchWorks', { searchParams: searchParams.value })
      })
    }

    const publishTemplate = async (id: number, isPublic: 0 | 1) => {
      const urlParams = { id, isPublic }

      await store.dispatch('publishTemplate', { urlParams })
      message.success('模板发布成功', 1)
      store.dispatch('fetchWorks', { searchParams: searchParams.value })
    }

    const onChange = (val: any) => {
      console.log(val)
    }
    return {
      works,
      onDelete,
      onCopy,
      isLoading,
      total,
      changeCategory,
      loadMorePage,
      isLastPage,
      isFirstPage,
      loadPrevPage,
      pageIndex,
      goToPage,
      totalPage,
      publishTemplate,
      onChange,
    }
  },
})
</script>

<style>
.mywork-container .ant-input-search {
  width: 30%;
}
.searchResult {
  display: flex;
  align-items: center;
}
#main-chart {
  position: relative;
}
.chart-loading {
  position: absolute;
  left: 50%;
  top: 50%;
}
</style>
