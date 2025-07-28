<template>
  <div class="form-input-component">
    <a-form-item 
      :label="label" 
      :required="required"
      :validate-status="validateStatus"
      :help="errorMessage"
    >
      <a-input
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        :show-count="showCount"
        :size="size"
        :type="inputType"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
      />
    </a-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  showCount?: boolean
  size?: 'large' | 'middle' | 'small'
  inputType?: string
  fieldName: string
  formData?: Record<string, any>
  validateRules?: Array<any>
}

const props = withDefaults(defineProps<Props>(), {
  label: '输入框',
  placeholder: '请输入内容',
  required: false,
  disabled: false,
  showCount: false,
  size: 'middle',
  inputType: 'text',
  validateRules: () => []
})

const emit = defineEmits<{
  update: [data: { fieldName: string, value: any }]
}>()

// 内部值状态
const internalValue = ref('')
const validateStatus = ref<'' | 'success' | 'warning' | 'error' | 'validating'>('')
const errorMessage = ref('')

// 计算属性：当前值
const modelValue = computed(() => {
  return props.formData?.[props.fieldName] || internalValue.value
})

// 输入处理
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  internalValue.value = value
  emit('update', { fieldName: props.fieldName, value })
  
  // 实时验证
  validateField(value)
}

// 变化处理
const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  validateField(value)
}

// 失焦处理
const handleBlur = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  validateField(value)
}

// 字段验证
const validateField = (value: string) => {
  errorMessage.value = ''
  validateStatus.value = ''

  // 必填验证
  if (props.required && !value.trim()) {
    validateStatus.value = 'error'
    errorMessage.value = `${props.label}不能为空`
    return false
  }

  // 长度验证
  if (props.maxLength && value.length > props.maxLength) {
    validateStatus.value = 'error'
    errorMessage.value = `${props.label}不能超过${props.maxLength}个字符`
    return false
  }

  // 自定义验证规则
  for (const rule of props.validateRules) {
    if (rule.pattern && !rule.pattern.test(value)) {
      validateStatus.value = 'error'
      errorMessage.value = rule.message || '格式不正确'
      return false
    }
  }

  validateStatus.value = 'success'
  return true
}

// 监听外部数据变化
watch(() => props.formData?.[props.fieldName], (newValue) => {
  if (newValue !== internalValue.value) {
    internalValue.value = newValue || ''
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.form-input-component {
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

  :deep(.ant-input) {
    border-radius: 6px;
    
    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}
</style>