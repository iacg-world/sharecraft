<template>
  <div class="draggable-form-builder">
    <div class="form-builder-header">
      <h3>表单构建器</h3>
      <div class="form-actions">
        <a-button type="primary" @click="addComponent">添加组件</a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleAddComponent">
              <a-menu-item key="input">
                <FormOutlined />
                输入框
              </a-menu-item>
              <a-menu-item key="radio">
                <CheckCircleOutlined />
                单选项
              </a-menu-item>
              <a-menu-item key="checkbox">
                <CheckSquareOutlined />
                多选项
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            组件库
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <div class="form-builder-content">
      <div class="component-library">
        <div class="library-title">组件库</div>
        <div class="component-items">
          <div 
            v-for="componentType in componentTypes" 
            :key="componentType.type"
            class="component-item"
            @click="addFormComponent(componentType.type)"
          >
            <component :is="componentType.icon" />
            <span>{{ componentType.label }}</span>
          </div>
        </div>
      </div>

      <div class="form-canvas">
        <div class="canvas-title">表单预览</div>
        <div class="form-container">
          <draggable
            v-model="formComponents"
            :group="{ name: 'form-components' }"
            :animation="200"
            handle=".drag-handle"
            item-key="id"
            class="draggable-list"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div class="form-component-wrapper" :class="{ 'dragging': isDragging }">
                <div class="component-toolbar">
                  <div class="drag-handle">
                    <HolderOutlined />
                  </div>
                  <div class="component-info">
                    <span class="component-label">{{ getComponentLabel(element.type) }}</span>
                  </div>
                  <div class="component-actions">
                    <a-button 
                      type="text" 
                      size="small" 
                      @click="editComponent(index)"
                      :icon="h(SettingOutlined)"
                    />
                    <a-button 
                      type="text" 
                      size="small" 
                      danger
                      @click="removeComponent(index)"
                      :icon="h(DeleteOutlined)"
                    />
                  </div>
                </div>
                <div class="component-content">
                  <component 
                    :is="getComponentName(element.type)" 
                    v-bind="element.props"
                    :form-data="formData"
                    @update="updateComponentData"
                  />
                </div>
              </div>
            </template>
          </draggable>

          <div v-if="formComponents.length === 0" class="empty-canvas">
            <PlusOutlined style="font-size: 48px; color: #d9d9d9;" />
            <p>从左侧拖拽组件到这里开始构建表单</p>
          </div>
        </div>
      </div>

      <div class="property-panel" v-if="selectedComponent !== null">
        <div class="panel-title">属性设置</div>
        <div class="property-content">
          <component 
            :is="getPropertyPanelName(formComponents[selectedComponent]?.type)"
            v-model="formComponents[selectedComponent]"
            @update="updateComponent"
          />
        </div>
      </div>
    </div>

    <!-- 表单数据预览 -->
    <div class="form-data-preview" v-if="Object.keys(formData).length > 0">
      <a-divider>表单数据</a-divider>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { message } from 'ant-design-vue'
import draggable from 'vuedraggable'
import {
  FormOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  DownOutlined,
  HolderOutlined,
  SettingOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import FormInputComponent from './components/FormInputComponent.vue'
import FormRadioComponent from './components/FormRadioComponent.vue'
import FormCheckboxComponent from './components/FormCheckboxComponent.vue'
import InputPropertyPanel from './property-panels/InputPropertyPanel.vue'
import RadioPropertyPanel from './property-panels/RadioPropertyPanel.vue'
import CheckboxPropertyPanel from './property-panels/CheckboxPropertyPanel.vue'

interface FormComponent {
  id: string
  type: string
  props: Record<string, any>
}

// 组件类型定义
const componentTypes = [
  { type: 'input', label: '输入框', icon: FormOutlined },
  { type: 'radio', label: '单选项', icon: CheckCircleOutlined },
  { type: 'checkbox', label: '多选项', icon: CheckSquareOutlined }
]

// 表单组件列表
const formComponents = ref<FormComponent[]>([])

// 表单数据
const formData = reactive<Record<string, any>>({})

// 拖拽状态
const isDragging = ref(false)

// 当前选中的组件索引
const selectedComponent = ref<number | null>(null)

// 生成唯一ID
const generateId = () => {
  return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 获取组件标签
const getComponentLabel = (type: string) => {
  const componentType = componentTypes.find(c => c.type === type)
  return componentType?.label || type
}

// 获取组件名称
const getComponentName = (type: string) => {
  const componentMap: Record<string, string> = {
    'input': 'FormInputComponent',
    'radio': 'FormRadioComponent',
    'checkbox': 'FormCheckboxComponent'
  }
  return componentMap[type] || 'div'
}

// 获取属性面板组件名称
const getPropertyPanelName = (type: string) => {
  const panelMap: Record<string, string> = {
    'input': 'InputPropertyPanel',
    'radio': 'RadioPropertyPanel',
    'checkbox': 'CheckboxPropertyPanel'
  }
  return panelMap[type] || 'div'
}

// 添加表单组件
const addFormComponent = (type: string) => {
  const defaultProps: Record<string, any> = {
    input: {
      label: '输入框',
      placeholder: '请输入内容',
      required: false,
      fieldName: `input_${Date.now()}`
    },
    radio: {
      label: '单选项',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ],
      required: false,
      fieldName: `radio_${Date.now()}`
    },
    checkbox: {
      label: '多选项',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ],
      required: false,
      fieldName: `checkbox_${Date.now()}`
    }
  }

  const newComponent: FormComponent = {
    id: generateId(),
    type,
    props: defaultProps[type] || {}
  }

  formComponents.value.push(newComponent)
  selectedComponent.value = formComponents.value.length - 1
  message.success(`已添加${getComponentLabel(type)}组件`)
}

// 处理下拉菜单点击
const handleAddComponent = ({ key }: { key: string }) => {
  addFormComponent(key)
}

// 添加组件按钮点击
const addComponent = () => {
  addFormComponent('input')
}

// 编辑组件
const editComponent = (index: number) => {
  selectedComponent.value = index
}

// 删除组件
const removeComponent = (index: number) => {
  const component = formComponents.value[index]
  if (component?.props.fieldName) {
    delete formData[component.props.fieldName]
  }
  formComponents.value.splice(index, 1)
  if (selectedComponent.value === index) {
    selectedComponent.value = null
  } else if (selectedComponent.value !== null && selectedComponent.value > index) {
    selectedComponent.value--
  }
  message.success('组件已删除')
}

// 更新组件
const updateComponent = () => {
  // 属性面板会直接修改组件数据，这里可以添加额外的处理逻辑
}

// 更新组件数据
const updateComponentData = ({ fieldName, value }: { fieldName: string, value: any }) => {
  formData[fieldName] = value
}

// 拖拽开始
const onDragStart = () => {
  isDragging.value = true
}

// 拖拽结束
const onDragEnd = () => {
  isDragging.value = false
}
</script>

<style scoped lang="scss">
.draggable-form-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .form-builder-header {
    background: white;
    padding: 16px 24px;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #262626;
    }

    .form-actions {
      display: flex;
      gap: 8px;
    }
  }

  .form-builder-content {
    flex: 1;
    display: flex;
    min-height: 0;

    .component-library {
      width: 240px;
      background: white;
      border-right: 1px solid #e8e8e8;
      display: flex;
      flex-direction: column;

      .library-title {
        padding: 16px;
        border-bottom: 1px solid #e8e8e8;
        font-weight: 500;
        color: #262626;
      }

      .component-items {
        flex: 1;
        padding: 8px;

        .component-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          margin-bottom: 4px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #f0f0f0;
          }

          span {
            font-size: 14px;
            color: #595959;
          }
        }
      }
    }

    .form-canvas {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      margin: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .canvas-title {
        padding: 16px 24px;
        border-bottom: 1px solid #e8e8e8;
        font-weight: 500;
        color: #262626;
      }

      .form-container {
        flex: 1;
        padding: 24px;

        .draggable-list {
          min-height: 400px;
        }

        .form-component-wrapper {
          margin-bottom: 16px;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          transition: all 0.2s;

          &:hover {
            border-color: #1890ff;
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
          }

          &.dragging {
            opacity: 0.5;
          }

          .component-toolbar {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: #fafafa;
            border-bottom: 1px solid #e8e8e8;
            border-radius: 6px 6px 0 0;

            .drag-handle {
              cursor: move;
              color: #8c8c8c;
              margin-right: 8px;
            }

            .component-info {
              flex: 1;

              .component-label {
                font-size: 12px;
                color: #8c8c8c;
              }
            }

            .component-actions {
              display: flex;
              gap: 4px;
            }
          }

          .component-content {
            padding: 16px;
          }
        }

        .empty-canvas {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #8c8c8c;

          p {
            margin-top: 16px;
            font-size: 14px;
          }
        }
      }
    }

    .property-panel {
      width: 300px;
      background: white;
      border-left: 1px solid #e8e8e8;
      display: flex;
      flex-direction: column;

      .panel-title {
        padding: 16px;
        border-bottom: 1px solid #e8e8e8;
        font-weight: 500;
        color: #262626;
      }

      .property-content {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
      }
    }
  }

  .form-data-preview {
    background: white;
    border-top: 1px solid #e8e8e8;
    padding: 16px 24px;
    max-height: 200px;
    overflow-y: auto;

    pre {
      background: #f6f8fa;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      margin: 0;
    }
  }
}
</style>