<template>
  <div class="radio-property-panel">
    <a-form layout="vertical">
      <a-form-item label="组件标签">
        <a-input 
          v-model:value="localProps.label" 
          placeholder="请输入标签名称"
          @change="handleUpdate"
        />
      </a-form-item>

      <a-form-item label="字段名称">
        <a-input 
          v-model:value="localProps.fieldName" 
          placeholder="请输入字段名称"
          @change="handleUpdate"
        />
      </a-form-item>

      <a-form-item label="排列方向">
        <a-radio-group 
          v-model:value="localProps.direction" 
          @change="handleUpdate"
        >
          <a-radio value="vertical">垂直</a-radio>
          <a-radio value="horizontal">水平</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="尺寸">
        <a-radio-group 
          v-model:value="localProps.size" 
          @change="handleUpdate"
        >
          <a-radio value="small">小</a-radio>
          <a-radio value="middle">中</a-radio>
          <a-radio value="large">大</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="设置">
        <a-checkbox 
          v-model:checked="localProps.required" 
          @change="handleUpdate"
        >
          必填
        </a-checkbox>
        <br />
        <a-checkbox 
          v-model:checked="localProps.disabled" 
          @change="handleUpdate"
        >
          禁用
        </a-checkbox>
      </a-form-item>

      <a-form-item label="选项配置">
        <div class="options-config">
          <div v-for="(option, index) in localProps.options" :key="index" class="option-item">
            <div class="option-header">
              <span class="option-index">选项 {{ index + 1 }}</span>
              <a-button 
                type="text" 
                danger 
                size="small"
                @click="removeOption(index)"
                :disabled="localProps.options.length <= 1"
              >
                删除
              </a-button>
            </div>
            
            <a-input 
              v-model:value="option.label" 
              placeholder="显示文本"
              style="margin-bottom: 8px;"
              @change="handleUpdate"
            />
            
            <a-input 
              v-model:value="option.value" 
              placeholder="选项值"
              style="margin-bottom: 8px;"
              @change="handleUpdate"
            />
            
            <a-checkbox 
              v-model:checked="option.disabled" 
              @change="handleUpdate"
            >
              禁用此选项
            </a-checkbox>
          </div>
          
          <a-button 
            type="dashed" 
            size="small" 
            @click="addOption"
            style="width: 100%"
          >
            + 添加选项
          </a-button>
        </div>
      </a-form-item>

      <a-form-item label="默认值">
        <a-select 
          v-model:value="defaultValue" 
          placeholder="选择默认值"
          allow-clear
          @change="handleDefaultValueChange"
        >
          <a-select-option 
            v-for="option in localProps.options" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface RadioOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface ComponentData {
  id: string
  type: string
  props: {
    label: string
    fieldName: string
    required: boolean
    disabled: boolean
    size: string
    direction: string
    options: RadioOption[]
  }
}

const props = defineProps<{
  modelValue: ComponentData
}>()

const emit = defineEmits<{
  update: []
}>()

// 本地属性副本
const localProps = reactive({ ...props.modelValue.props })

// 默认值
const defaultValue = ref<string | number | undefined>(undefined)

// 处理更新
const handleUpdate = () => {
  // 更新原始数据
  Object.assign(props.modelValue.props, localProps)
  emit('update')
}

// 添加选项
const addOption = () => {
  const newIndex = localProps.options.length + 1
  localProps.options.push({
    label: `选项${newIndex}`,
    value: `option${newIndex}`,
    disabled: false
  })
  handleUpdate()
}

// 删除选项
const removeOption = (index: number) => {
  if (localProps.options.length <= 1) return
  
  const removedOption = localProps.options[index]
  localProps.options.splice(index, 1)
  
  // 如果删除的是默认值，清空默认值
  if (defaultValue.value === removedOption.value) {
    defaultValue.value = undefined
    handleDefaultValueChange(undefined)
  }
  
  handleUpdate()
}

// 处理默认值变化
const handleDefaultValueChange = (value: string | number | undefined) => {
  defaultValue.value = value
  // 这里可以设置表单的初始值
  // 可以通过emit发送事件给父组件处理
  handleUpdate()
}

// 监听modelValue变化
watch(() => props.modelValue.props, (newProps) => {
  Object.assign(localProps, newProps)
}, { immediate: true, deep: true })

// 验证选项值的唯一性
watch(() => localProps.options, (options) => {
  const values = options.map(opt => opt.value)
  const uniqueValues = [...new Set(values)]
  
  if (values.length !== uniqueValues.length) {
    console.warn('选项值应该保持唯一')
  }
}, { deep: true })

// 同步属性到组件数据
Object.assign(props.modelValue.props, localProps)
</script>

<style scoped lang="scss">
.radio-property-panel {
  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 4px;
    
    > label {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .options-config {
    .option-item {
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
      margin-bottom: 8px;
      border: 1px solid #e8e8e8;

      .option-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .option-index {
          font-size: 12px;
          color: #8c8c8c;
          font-weight: 500;
        }
      }
    }
  }

  :deep(.ant-checkbox-wrapper) {
    margin-bottom: 8px;
  }
}
</style>