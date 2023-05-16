<template>
  <div class="editor-container">
    <a-modal
      title="发布成功"
      v-model:visible="showPublishForm"
      width="700px"
      :footer="null"
    >
      <publish-form />
    </a-modal>
    <preview-form
      v-model:visible="showPreviewForm"
      v-if="showPreviewForm"
    ></preview-form>
    <a-layout>
      <a-layout-header class="header">
        <div class="page-title">
          <router-link to="/">
            <home-two-tone style="font-size: 26px" />
          </router-link>
          <inline-edit :value="page.title" @change="titleChange" />
        </div>
        <a-menu
          :selectable="false"
          theme="dark"
          mode="horizontal"
          :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="1">
            <a-button type="primary" @click="preview">预览和设置</a-button>
          </a-menu-item>
          <a-menu-item key="2">
            <a-button type="primary" @click="saveWork" :loading="saveIsLoading"
              >保存</a-button
            >
          </a-menu-item>
          <a-menu-item key="3">
            <a-button type="primary" @click="publish" :loading="isPublishing"
              >发布</a-button
            >
          </a-menu-item>
          <a-menu-item key="4">
            <user-profile :user="userInfo"></user-profile>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
    </a-layout>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <div class="sidebar-container">
          组件列表
          <components-list
            :list="defaultTextTemplates"
            @onItemClick="addItem"
          />
          <img id="test-image" :style="{ width: '300px' }" />
        </div>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-layout-content class="preview-container">
          <p>画布区域</p>
          <history-area></history-area>
          <div
            class="preview-list"
            id="canvas-area"
            :class="{ 'canvas-fix': canvasFix }"
          >
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
        width="320"
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
          </a-tab-pane>
          <a-tab-pane key="layer" tab="图层设置">
            <layer-list
              :list="components"
              :selectedId="(currentElement && currentElement.id) || ''"
              @change="handleChange"
              @drop="removeComponent"
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
import { CText, CImage } from 'iacg-block'
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
import InlineEdit from '../components/InlineEdit.vue'
import UserProfile from '../components/UserProfile.vue'
import useSaveWork from '@/hooks/useSaveWork'
import usePublishWork from '@/hooks/usePublishWork'
import PublishForm from './PublishForm.vue'
import PreviewForm from './editor/PreviewForm.vue'
import { HomeTwoTone } from '@ant-design/icons-vue'

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
    InlineEdit,
    UserProfile,
    PublishForm,
    PreviewForm,
    HomeTwoTone,
  },
  setup() {
    initHotKeys()
    initContextMenu()
    const route = useRoute()
    const currentWorkId = route.params.id as string
    const store = useStore<GlobalDataProps>()
    const activePanel = ref<TabType>('component')
    const components = computed(() => store.state.editor.components)
    const isEditing = computed(() => store.state.editor.isEditing)
    const currentElement = computed<ComponentData | null>(
      () => store.getters.getCurrentElement
    )
    const page = computed(() => store.state.editor.page)
    const userInfo = computed(() => store.state.user)

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
      store.commit('updatePage', e)
    }
    const titleChange = (newTitle: string) => {
      store.commit('updatePage', {
        key: 'title',
        value: newTitle,
        isRoot: true,
      })
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
    const { saveWork, saveIsLoading } = useSaveWork()
    onMounted(() => {
      if (currentWorkId) {
        store.dispatch('fetchWork', { urlParams: { id: currentWorkId } })
      }
    })
    const canvasFix = ref(false)
    const showPublishForm = ref(false)

    const { publishWork, isPublishing } = usePublishWork()
    const publish = async () => {
      store.commit('setActive', '')
      const el = document.getElementById('canvas-area') as HTMLElement
      canvasFix.value = true
      try {
        await publishWork(el)
        showPublishForm.value = true
      } catch (e) {
        console.error(e)
      } finally {
        canvasFix.value = false
      }
    }

    const showPreviewForm = ref(false)
    const preview = async () => {
      await saveWork()
      showPreviewForm.value = true
    }
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
      titleChange,
      userInfo,
      saveWork,
      saveIsLoading,
      publish,
      canvasFix,
      isPublishing,
      showPublishForm,
      preview,
      showPreviewForm,
    }
  },
})
</script>

<style lang="scss">
.editor-container {
  .header {
    display: flex;
    .ant-menu {
      flex: 1;
      justify-content: flex-end;
    }
  }
}
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
.page-title {
  display: flex;

  a {
    color: #ffffffff;
    font-weight: 600;
    font-size: 20px;
    vertical-align: bottom;
    display: flex;
    align-items: center;
  }
}
.page-title .inline-edit span {
  font-weight: 500;
  margin-left: 10px;
  font-size: 16px;
}

.logo-img {
  width: 18px;
  height: 18px;
}
.preview-list.canvas-fix .edit-wrapper > * {
  box-shadow: none !important;
}
.preview-list.canvas-fix {
  position: absolute;
  max-height: none;
}
</style>
