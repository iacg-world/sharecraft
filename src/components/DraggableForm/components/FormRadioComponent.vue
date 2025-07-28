<template>
  <div class="form-radio-component">
    <a-form-item 
      :label="label" 
      :required="required"
      :validate-status="validateStatus"
      :help="errorMessage"
    >
      <a-radio-group
        :value="modelValue"
        :disabled="disabled"
        :size="size"
        :direction="direction"
        @change="handleChange"
      >
        <template v-if="direction === 'vertical'">
          <div v-for="option in options" :key="option.value" class="radio-option">
            <a-radio :value="option.value" :disabled="option.disabled">
              {{ option.label }}
            </a-radio>
          </div>
        </template>
        <template v-else>
          <a-radio 
            v-for="option in options" 
            :key="option.value" 
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </a-radio>
        </template>
      </a-radio-group>
    </a-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface RadioOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  label?: string
  required?: boolean
  disabled?: boolean
  size?: 'large' | 'middle' | 'small'
  direction?: 'horizontal' | 'vertical'
  fieldName: string
  options?: RadioOption[]
  formData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  label: '单选项',
  required: false,
  disabled: false,
  size: 'middle',
  direction: 'vertical',
  options: () => [
    { label: '选项1', value: 'option1' },
    { label: '选项2', value: 'option2' }
  ]
})

const emit = defineEmits<{
  update: [data: { fieldName: string, value: any }]
}>()

// 内部值状态
const internalValue = ref<string | number | undefined>(undefined)
const validateStatus = ref<'' | 'success' | 'warning' | 'error' | 'validating'>('')
const errorMessage = ref('')

// 计算属性：当前值
const modelValue = computed(() => {
  return props.formData?.[props.fieldName] !== undefined 
    ? props.formData[props.fieldName] 
    : internalValue.value
})

// 选择变化处理
const handleChange = (e: any) => {
  const value = e.target.value
  internalValue.value = value
  emit('update', { fieldName: props.fieldName, value })
  
  // 验证
  validateField(value)
}

// 字段验证
const validateField = (value: string | number | undefined) => {
  errorMessage.value = ''
  validateStatus.value = ''

  // 必填验证
  if (props.required && (value === undefined || value === null || value === '')) {
    validateStatus.value = 'error'
    errorMessage.value = `请选择${props.label}`
    return false
  }

  validateStatus.value = 'success'
  return true
}

// 监听外部数据变化
watch(() => props.formData?.[props.fieldName], (newValue) => {
  if (newValue !== internalValue.value) {
    internalValue.value = newValue
  }
}, { immediate: true })

// 监听选项变化，确保当前值在选项中
watch(() => props.options, (newOptions) => {
  if (internalValue.value !== undefined) {
    const hasValue = newOptions.some(option => option.value === internalValue.value)
    if (!hasValue) {
      internalValue.value = undefined
      emit('update', { fieldName: props.fieldName, value: undefined })
    }
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.form-radio-component {
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

  :deep(.ant-radio-group) {
    width: 100%;
  }

  .radio-option {
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.ant-radio-wrapper) {
    display: flex;
    align-items: center;
    margin-right: 16px;
    margin-bottom: 8px;
    
    &:last-child {
      margin-right: 0;
    }

    .ant-radio {
      margin-right: 8px;
    }

    &:hover {
      .ant-radio-inner {
        border-color: #1890ff;
      }
    }
  }

  :deep(.ant-radio-checked) {
    .ant-radio-inner {
      border-color: #1890ff;
      background-color: #1890ff;
      
      &::after {
        background-color: #fff;
      }
    }
  }
}
</style>