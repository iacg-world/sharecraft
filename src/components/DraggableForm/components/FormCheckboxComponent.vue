<template>
  <div class="form-checkbox-component">
    <a-form-item 
      :label="label" 
      :required="required"
      :validate-status="validateStatus"
      :help="errorMessage"
    >
      <a-checkbox-group
        :value="modelValue"
        :disabled="disabled"
        @change="handleChange"
      >
        <template v-if="direction === 'vertical'">
          <div v-for="option in options" :key="option.value" class="checkbox-option">
            <a-checkbox :value="option.value" :disabled="option.disabled">
              {{ option.label }}
            </a-checkbox>
          </div>
        </template>
        <template v-else>
          <a-checkbox 
            v-for="option in options" 
            :key="option.value" 
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </a-checkbox>
        </template>
      </a-checkbox-group>
    </a-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface CheckboxOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  label?: string
  required?: boolean
  disabled?: boolean
  direction?: 'horizontal' | 'vertical'
  minCount?: number
  maxCount?: number
  fieldName: string
  options?: CheckboxOption[]
  formData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  label: '多选项',
  required: false,
  disabled: false,
  direction: 'vertical',
  minCount: 0,
  maxCount: undefined,
  options: () => [
    { label: '选项1', value: 'option1' },
    { label: '选项2', value: 'option2' }
  ]
})

const emit = defineEmits<{
  update: [data: { fieldName: string, value: any }]
}>()

// 内部值状态
const internalValue = ref<(string | number)[]>([])
const validateStatus = ref<'' | 'success' | 'warning' | 'error' | 'validating'>('')
const errorMessage = ref('')

// 计算属性：当前值
const modelValue = computed(() => {
  const value = props.formData?.[props.fieldName]
  return Array.isArray(value) ? value : internalValue.value
})

// 选择变化处理
const handleChange = (checkedValues: (string | number)[]) => {
  internalValue.value = checkedValues
  emit('update', { fieldName: props.fieldName, value: checkedValues })
  
  // 验证
  validateField(checkedValues)
}

// 字段验证
const validateField = (values: (string | number)[]) => {
  errorMessage.value = ''
  validateStatus.value = ''

  // 必填验证
  if (props.required && values.length === 0) {
    validateStatus.value = 'error'
    errorMessage.value = `请至少选择一项${props.label}`
    return false
  }

  // 最小选择数量验证
  if (props.minCount && values.length < props.minCount) {
    validateStatus.value = 'error'
    errorMessage.value = `至少选择${props.minCount}项`
    return false
  }

  // 最大选择数量验证
  if (props.maxCount && values.length > props.maxCount) {
    validateStatus.value = 'error'
    errorMessage.value = `最多选择${props.maxCount}项`
    return false
  }

  validateStatus.value = 'success'
  return true
}

// 监听外部数据变化
watch(() => props.formData?.[props.fieldName], (newValue) => {
  if (Array.isArray(newValue) && JSON.stringify(newValue) !== JSON.stringify(internalValue.value)) {
    internalValue.value = newValue
  }
}, { immediate: true })

// 监听选项变化，过滤无效的选中值
watch(() => props.options, (newOptions) => {
  if (internalValue.value.length > 0) {
    const validValues = internalValue.value.filter(value => 
      newOptions.some(option => option.value === value)
    )
    if (validValues.length !== internalValue.value.length) {
      internalValue.value = validValues
      emit('update', { fieldName: props.fieldName, value: validValues })
    }
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.form-checkbox-component {
  width: 100%;

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.ant-form-item-label) {
    text-align: left;
    
    > label {
      color: #262626;
      font-weight: 500;
    }
  }

  :deep(.ant-checkbox-group) {
    width: 100%;
  }

  .checkbox-option {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.ant-checkbox-wrapper) {
    display: flex;
    align-items: center;
    margin-right: 16px;
    margin-bottom: 8px;
    
    &:last-child {
      margin-right: 0;
    }

    .ant-checkbox {
      margin-right: 8px;
    }

    &:hover {
      .ant-checkbox-inner {
        border-color: #1890ff;
      }
    }
  }

  :deep(.ant-checkbox-checked) {
    .ant-checkbox-inner {
      border-color: #1890ff;
      background-color: #1890ff;
      
      &::after {
        border-color: #fff;
      }
    }
  }

  :deep(.ant-checkbox-indeterminate) {
    .ant-checkbox-inner {
      border-color: #1890ff;
      background-color: #1890ff;
      
      &::after {
        background-color: #fff;
      }
    }
  }
}
</style>