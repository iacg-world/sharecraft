<template>
  <router-link to="/">Home</router-link>
  <div class="editor-container">
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <div class="sidebar-container">
          组件列表
          <components-list
            :list="defaultTextTemplates"
            @onItemClick="addItem"
          />
        </div>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-layout-content class="preview-container">
          <p>画布区域</p>
          <history-area></history-area>
          <div class="preview-list" id="canvas-area">
            <div class="body-container" :style="page.props">
              <edit-wrapper
                @setActive="setActive"
                @removeComponent="removeComponent"
                @update-position="updatePosition"
                v-for="component in components"
                :key="component.id"
                :id="component.id"
                :active="component.id === (currentElement && currentElement.id)"
                :hidden="component.isHidden"
                :props="component.props"
              >
                <component :is="component.name" v-bind="component.props" />
              </edit-wrapper>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
      <a-layout-sider
        v-show="isEditing"
        width="300"
        style="background: #fff"
        class="settings-panel"
      >
        <a-tabs type="card" v-model:activeKey="activePanel">
          <a-tab-pane key="component" tab="属性设置" class="no-top-radius">
            <div v-if="currentElement">
              <edit-group
                v-if="!currentElement.isLocked"
                :props="currentElement.props"
                @change="handleChange"
              ></edit-group>
              <div v-else>
                <a-empty>
                  <template #description>
                    <p>该元素被锁定，无法编辑</p>
                  </template>
                </a-empty>
              </div>
            </div>
            <pre>
            {{ currentElement && currentElement.props }}
          </pre
            >
          </a-tab-pane>
          <a-tab-pane key="layer" tab="图层设置">
            <layer-list
              :list="components"
              :selectedId="currentElement && currentElement.id"
              @change="handleChange"
              @select="setActive"
            >
            </layer-list>
          </a-tab-pane>
          <a-tab-pane key="page" tab="页面设置">
            <props-table :props="page.props" @change="pageChange"></props-table>
          </a-tab-pane>
        </a-tabs>
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import CText from '../components/CText.vue'
import CImage from '../components/CImage.vue'
import ComponentsList from '../components/ComponentsList.vue'
import EditWrapper from '../components/EditWrapper.vue'
import PropsTable from '../components/PropsTable.vue'
import LayerList from '../components/LayerList.vue'
import EditGroup from '../components/EditGroup.vue'
import HistoryArea from './editor/HistoryArea.vue'
import { ComponentData } from '../store/editor'
import defaultTextTemplates from '../defaultTemplates'
import { pickBy } from 'lodash-es'
import initHotKeys from '@/plugins/hotKeys'
import initContextMenu from '../plugins/contextMenu'
import { useRoute } from 'vue-router'

export type TabType = 'component' | 'layer' | 'page'
export default defineComponent({
  components: {
    CText,
    CImage,
    ComponentsList,
    EditWrapper,
    PropsTable,
    LayerList,
    EditGroup,
    HistoryArea,
  },
  setup() {
    initHotKeys()
    initContextMenu()
    const route = useRoute()
    const currentWorkId = route.params.id
    const store = useStore<GlobalDataProps>()
    const activePanel = ref<TabType>('component')
    const components = computed(() => store.state.editor.components)
    const isEditing = computed(() => store.state.editor.isEditing)
    const currentElement = computed<ComponentData | null>(
      () => store.getters.getCurrentElement
    )
    const page = computed(() => store.state.editor.page)

    const addItem = (component: any) => {
      console.log('addItem: ', component)

      store.commit('addComponent', component)
    }
    const setActive = (id: string) => {
      store.commit('setActive', id)
    }
    const removeComponent = (id: string) => {
      store.commit('removeComponent', id)
    }
    const handleChange = (e: any) => {
      store.commit('updateComponent', e)
    }
    const pageChange = (e: any) => {
      console.log('page', e)
      store.commit('updatePage', e)
    }

    const updatePosition = (data: {
      left: number
      top: number
      id: string
    }) => {
      const { id } = data
      const updatedData = pickBy<number>(data, (v, k) => k !== 'id')
      // 将位置变化合并为数组传递
      const keysArr = Object.keys(updatedData)
      const valuesArr = Object.values(updatedData).map((v) => v + 'px')
      store.commit('updateComponent', { key: keysArr, value: valuesArr, id })
    }
    onMounted(() => {
      if (currentWorkId) {
        store.dispatch('fetchWork', { urlParams: { id: currentWorkId } })
      }
    })
    return {
      components,
      defaultTextTemplates,
      addItem,
      setActive,
      removeComponent,
      currentElement,
      handleChange,
      isEditing,
      activePanel,
      page,
      pageChange,
      updatePosition,
    }
  },
})
</script>

<style>
.editor-container .preview-container {
  padding: 24px;
  margin: 0;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.editor-container .preview-list {
  padding: 0;
  margin: 0;
  min-width: 375px;
  min-height: 200px;
  border: 1px solid #efefef;
  background: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  margin-top: 50px;
  max-height: 80vh;
}
</style>
