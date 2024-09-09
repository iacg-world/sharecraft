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
            <HomeOutlined />
          </router-link>
          <a>
            <LeftCircleOutlined @click="back" style="margin-left: 10px" />
          </a>
          <inline-edit :value="page.title" @change="titleChange" />
        </div>
        <div class="action_warp">
          <div class="action_buttons">
            <a-button type="primary" @click="preview">预览和设置</a-button>
            <a-button type="primary" @click="saveWork" :loading="saveIsLoading"
              >保存</a-button
            >
            <a-button type="primary" @click="publish" :loading="isPublishing"
              >发布</a-button
            >
          </div>
          <user-profile :user="userInfo"></user-profile>
        </div>
      </a-layout-header>
    </a-layout>
    <a-layout>
      <a-layout-sider width="160" style="background: #fff">
        <div class="sidebar-container">
          <h2>组件列表</h2>
          <components-list
            :list="defaultTextTemplates"
            @onItemClick="addItem"
          />
          <img id="test-image" :style="{ width: '300px' }" />
        </div>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px; position: relative">
        <a-layout-content class="preview-container">
          <p>画布区域</p>
          <history-area></history-area>
          <div class="preview-list" :class="{ 'canvas-fix': canvasFix }">
            <div class="body-container" id="canvas-area" :style="page.props">
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
                <component
                  :is="component.name"
                  @change="(data: any) => onchange({
                    id: component.id,
                    key: data.key,
                    value: data.value
                  })"
                  v-bind="component.props"
                  :isEditing="isEditing"
                />
              </edit-wrapper>
            </div>
          </div>
        </a-layout-content>
        <div class="switch_editing-btn" @click="switchEditStatus(isEditing)">
          <template v-if="isEditing">
            <DoubleRightOutlined />
            <div class="text">收起编辑</div>
          </template>
          <template v-else>
            <DoubleLeftOutlined />
            <div class="text">打开编辑</div>
          </template>
        </div>
      </a-layout>
      <a-layout-sider
        v-show="isEditing"
        width="320"
        style="background: #fff"
        class="settings-panel"
      >
        <a-tabs type="card" v-model:activeKey="activePanel">
          <a-tab-pane
            key="component"
            tab="属性设置"
            class="no-top-radius tab_pane_content"
          >
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
import { CImage } from 'iacg-block'
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
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  HomeOutlined,
  LeftCircleOutlined,
} from '@ant-design/icons-vue'
import { Empty as AEmpty } from 'ant-design-vue/es'
import router from '@/router'
import CText from '@/components/CText.vue'

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
    HomeOutlined,
    AEmpty,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    LeftCircleOutlined,
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

    const switchEditStatus = (status: boolean) => {
      store.commit('setEditStatus', !status)
    }
    const onchange = (data: { id: string; key: string; value: string }) => {
      handleChange(data)
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
      switchEditStatus,
      back: () => {
        router.back()
      },
      onchange,
    }
  },
})
</script>

<style lang="scss">
.editor-container {
  .header {
    display: flex;
    justify-content: space-between;
    .ant-menu {
      flex: 1;
      justify-content: flex-end;
    }
  }
  .preview-container {
    padding: 24px;
    margin: 0;
    min-height: 85vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .preview-list {
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
  .action_warp {
    display: flex;
  }
  .action_buttons {
    button {
      margin: 0 5px;
    }
  }
  .tab_pane_content {
    max-height: 80vh;
    overflow-y: auto;
  }
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
  .inline-edit > span {
    font-weight: 500;
    margin-left: 15px;
    font-size: 16px;
  }
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
.switch_editing-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  border-radius: 8px 0 0 8px;
  background-color: #75409a;
  color: #fff !important;

  .text {
    width: 14px;
    line-height: 18px;
    font-size: 12px;
  }
}
</style>
