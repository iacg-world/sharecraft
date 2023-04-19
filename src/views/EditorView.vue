<template>
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
          <div class="preview-list" id="canvas-area">
            <edit-wrapper
              @setActive="setActive"
              @removeComponent="removeComponent"
              v-for="component in components"
              :key="component.id"
              :id="component.id"
              :active="component.id === (currentElement && currentElement.id)"
            >
              <component :is="component.name" v-bind="component.props" />
            </edit-wrapper>
          </div>
        </a-layout-content>
      </a-layout>
      <a-layout-sider
        v-show="isEditing"
        width="300"
        style="background: #fff"
        class="settings-panel"
      >
        组件属性
        <props-table
          v-if="currentElement && currentElement.props"
          :props="currentElement.props"
          @change="handleChange"
        ></props-table>
        <pre>
        {{ currentElement && currentElement.props }}
      </pre
        >
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store/index'
import CText from '../components/CText.vue'
import CImage from '../components/CImage.vue'
import ComponentsList from '../components/ComponentsList.vue'
import EditWrapper from '../components/EditWrapper.vue'
import PropsTable from '../components/PropsTable.vue'
import { ComponentData } from '../store/editor'
import { defaultTextTemplates } from '../defaultTemplates'
export default defineComponent({
  components: {
    CText,
    CImage,
    ComponentsList,
    EditWrapper,
    PropsTable,
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const components = computed(() => store.state.editor.components)
    const isEditing = computed(() => store.state.editor.isEditing)
    const currentElement = computed<ComponentData | null>(
      () => store.getters.getCurrentElement
    )
    const addItem = (component: any) => {
      console.log(component)

      store.commit('addComponent', component)
    }
    const setActive = (id: string) => {
      store.commit('setActive', id)
    }
    const removeComponent = (id: string) => {
      store.commit('removeComponent', id)
    }
    const handleChange = (e: any) => {
      console.log('event', e)
      store.commit('updateComponent', e)
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
