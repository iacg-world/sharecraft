<template>
  <div class="content-container">
    <h1 v-if="isLoading">templates is Loading!</h1>
    <template-list :list="testData"></template-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import TemplateList from '../components/TemplateList.vue'
export default defineComponent({
  components: {
    TemplateList,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const testData = computed(() => store.state.templates.data)
    const isLoading = computed(() =>
      store.getters.isOpLoading('fetchTemplates')
    )

    onMounted(() => {
      store.dispatch('fetchTemplates')
    })
    return {
      testData,
      isLoading,
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
