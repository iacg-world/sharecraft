<template>
  <div class="checkbox-property-panel">
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

      <a-form-item label="选择限制">
        <div class="selection-limits">
          <a-form-item label="最少选择" style="margin-bottom: 8px;">
            <a-input-number 
              v-model:value="localProps.minCount" 
              :min="0"
              :max="localProps.maxCount || 100"
              placeholder="最少选择数量"
              style="width: 100%"
              @change="handleUpdate"
            />
          </a-form-item>
          
          <a-form-item label="最多选择" style="margin-bottom: 0;">
            <a-input-number 
              v-model:value="localProps.maxCount" 
              :min="localProps.minCount || 1"
              :max="100"
              placeholder="最多选择数量"
              style="width: 100%"
              @change="handleUpdate"
            />
          </a-form-item>
        </div>
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
              <div class="option-actions">
                <a-checkbox 
                  v-model:checked="defaultSelectedValues[option.value]"
                  @change="handleDefaultSelectionChange"
                  size="small"
                >
                  默认选中
                </a-checkbox>
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

      <a-form-item label="全选设置" v-if="localProps.options.length > 2">
        <a-checkbox 
          v-model:checked="showSelectAll" 
          @change="handleSelectAllChange"
        >
          显示"全选"选项
        </a-checkbox>
        
        <div v-if="showSelectAll" style="margin-top: 8px;">
          <a-input 
            v-model:value="selectAllText" 
            placeholder="全选文本"
            @change="handleSelectAllTextChange"
          />
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface CheckboxOption {
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
    direction: string
    minCount: number
    maxCount?: number
    options: CheckboxOption[]
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

// 默认选中值
const defaultSelectedValues = ref<Record<string | number, boolean>>({})

// 全选设置
const showSelectAll = ref(false)
const selectAllText = ref('全选')

// 处理更新
const handleUpdate = () => {
  // 更新原始数据
  Object.assign(props.modelValue.props, localProps)
  emit('update')
}

// 添加选项
const addOption = () => {
  const newIndex = localProps.options.length + 1
  const newValue = `option${newIndex}`
  localProps.options.push({
    label: `选项${newIndex}`,
    value: newValue,
    disabled: false
  })
  defaultSelectedValues.value[newValue] = false
  handleUpdate()
}

// 删除选项
const removeOption = (index: number) => {
  if (localProps.options.length <= 1) return
  
  const removedOption = localProps.options[index]
  localProps.options.splice(index, 1)
  
  // 删除对应的默认选中状态
  delete defaultSelectedValues.value[removedOption.value]
  
  handleUpdate()
}

// 处理默认选中变化
const handleDefaultSelectionChange = () => {
  // 这里可以设置表单的初始值
  const selectedValues = Object.keys(defaultSelectedValues.value)
    .filter(key => defaultSelectedValues.value[key])
  
  console.log('默认选中值:', selectedValues)
  handleUpdate()
}

// 处理全选设置变化
const handleSelectAllChange = () => {
  if (!showSelectAll.value) {
    // 移除全选选项（如果存在）
    const selectAllIndex = localProps.options.findIndex(opt => opt.value === '__select_all__')
    if (selectAllIndex > -1) {
      localProps.options.splice(selectAllIndex, 1)
    }
  } else {
    // 添加全选选项
    localProps.options.unshift({
      label: selectAllText.value,
      value: '__select_all__',
      disabled: false
    })
  }
  handleUpdate()
}

// 处理全选文本变化
const handleSelectAllTextChange = () => {
  const selectAllOption = localProps.options.find(opt => opt.value === '__select_all__')
  if (selectAllOption) {
    selectAllOption.label = selectAllText.value
  }
  handleUpdate()
}

// 监听modelValue变化
watch(() => props.modelValue.props, (newProps) => {
  Object.assign(localProps, newProps)
  
  // 初始化默认选中状态
  localProps.options.forEach(option => {
    if (!(option.value in defaultSelectedValues.value)) {
      defaultSelectedValues.value[option.value] = false
    }
  })
}, { immediate: true, deep: true })

// 验证选项值的唯一性
watch(() => localProps.options, (options) => {
  const values = options.map(opt => opt.value)
  const uniqueValues = [...new Set(values)]
  
  if (values.length !== uniqueValues.length) {
    console.warn('选项值应该保持唯一')
  }
}, { deep: true })

// 监听最小/最大选择数量的合理性
watch([() => localProps.minCount, () => localProps.maxCount], ([minCount, maxCount]) => {
  if (maxCount && minCount > maxCount) {
    localProps.minCount = maxCount
    handleUpdate()
  }
})

// 同步属性到组件数据
Object.assign(props.modelValue.props, localProps)
</script>

<style scoped lang="scss">
.checkbox-property-panel {
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

  .selection-limits {
    :deep(.ant-form-item) {
      margin-bottom: 8px;
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

        .option-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }

  :deep(.ant-checkbox-wrapper) {
    margin-bottom: 8px;
  }
}
</style>