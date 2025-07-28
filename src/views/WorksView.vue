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
      <a-button type="primary" size="large" @click="createDesign">
        创建你的第一个设计 🎉
      </a-button>
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
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="totalWorks"
        @change="(current: number) => goToPage(current - 1)"
        show-less-items
      >
        <template #itemRender="{ type, originalElement }">
          <a v-if="type === 'prev'">上一页</a>
          <a v-else-if="type === 'next'">下一页</a>
          <component :is="originalElement" v-else></component>
        </template>
      </a-pagination>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { GlobalDataProps } from '../store/index'
import WorksList from '../components/WorksList.vue'
import useLoadMore from '../hooks/useLoadMore'
import { message } from 'ant-design-vue/es'

const store = useStore<GlobalDataProps>()
const router = useRouter()
const works = computed(() => store.state.templates.works)
const total = computed(() => store.state.templates.totalWorks)
const isLoading = computed(() => store.getters.isOpLoading('fetchWorks'))
const isTemplate = ref(0)
const searchParams = ref({
  pageIndex: 0,
  pageSize: 8,
})
onMounted(() => {
  store.dispatch('fetchWorks', { searchParams: searchParams.value })
})
const {
  isLastPage,
  loadMorePage,
  isFirstPage,
  loadPrevPage,
  pageIndex,
  currentPage,
  pageSize,
  requestParams,
  goToPage,
  totalPage,
  totalWorks,
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
  requestParams.isTemplate = key
  searchParams.value.pageIndex = 0
  goToPage(searchParams.value.pageIndex)
}

const publishTemplate = async (id: number, isPublic: 0 | 1) => {
  const urlParams = { id, isPublic }

  await store.dispatch('publishTemplate', { urlParams })
  message.success('模板发布成功', 1)
  store.dispatch('fetchWorks', { searchParams: searchParams.value })
}
const createDesign = async () => {
  const payload = {
    title: '未命名作品',
    desc: '未命名作品',
    coverImg: '',
  }
  const { data } = await store.dispatch('createWork', {
    data: payload,
  })
  message.success('创建作品成功', 2)
  router.push(`/editor/${data.id}`)
}
const onChange = (val: any) => {
  console.log(val)
}
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
