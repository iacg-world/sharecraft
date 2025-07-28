<template>
  <div class="input-property-panel">
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

      <a-form-item label="占位符">
        <a-input 
          v-model:value="localProps.placeholder" 
          placeholder="请输入占位符"
          @change="handleUpdate"
        />
      </a-form-item>

      <a-form-item label="输入类型">
        <a-select 
          v-model:value="localProps.inputType" 
          placeholder="选择输入类型"
          @change="handleUpdate"
        >
          <a-select-option value="text">文本</a-select-option>
          <a-select-option value="number">数字</a-select-option>
          <a-select-option value="email">邮箱</a-select-option>
          <a-select-option value="tel">电话</a-select-option>
          <a-select-option value="url">网址</a-select-option>
          <a-select-option value="password">密码</a-select-option>
        </a-select>
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

      <a-form-item label="最大长度">
        <a-input-number 
          v-model:value="localProps.maxLength" 
          :min="1"
          :max="1000"
          placeholder="最大字符数"
          style="width: 100%"
          @change="handleUpdate"
        />
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
        <br />
        <a-checkbox 
          v-model:checked="localProps.showCount" 
          @change="handleUpdate"
        >
          显示字符计数
        </a-checkbox>
      </a-form-item>

      <a-form-item label="验证规则">
        <div class="validation-rules">
          <div v-for="(rule, index) in validationRules" :key="index" class="rule-item">
            <a-select 
              v-model:value="rule.type" 
              placeholder="规则类型"
              style="width: 100%; margin-bottom: 8px;"
              @change="updateValidationRules"
            >
              <a-select-option value="email">邮箱格式</a-select-option>
              <a-select-option value="phone">手机号格式</a-select-option>
              <a-select-option value="idcard">身份证格式</a-select-option>
              <a-select-option value="custom">自定义正则</a-select-option>
            </a-select>
            
            <a-input 
              v-if="rule.type === 'custom'"
              v-model:value="rule.pattern" 
              placeholder="请输入正则表达式"
              style="margin-bottom: 8px;"
              @change="updateValidationRules"
            />
            
            <a-input 
              v-model:value="rule.message" 
              placeholder="错误提示信息"
              style="margin-bottom: 8px;"
              @change="updateValidationRules"
            />
            
            <a-button 
              type="text" 
              danger 
              size="small"
              @click="removeValidationRule(index)"
            >
              删除规则
            </a-button>
          </div>
          
          <a-button 
            type="dashed" 
            size="small" 
            @click="addValidationRule"
            style="width: 100%"
          >
            + 添加验证规则
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface ValidationRule {
  type: string
  pattern?: string
  message: string
}

interface ComponentData {
  id: string
  type: string
  props: {
    label: string
    fieldName: string
    placeholder: string
    inputType: string
    size: string
    maxLength?: number
    required: boolean
    disabled: boolean
    showCount: boolean
    validateRules?: any[]
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

// 验证规则
const validationRules = ref<ValidationRule[]>([])

// 预定义的验证规则模式
const rulePatterns: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^1[3-9]\d{9}$/,
  idcard: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
}

// 处理更新
const handleUpdate = () => {
  // 更新原始数据
  Object.assign(props.modelValue.props, localProps)
  emit('update')
}

// 添加验证规则
const addValidationRule = () => {
  validationRules.value.push({
    type: 'email',
    message: '格式不正确'
  })
  updateValidationRules()
}

// 删除验证规则
const removeValidationRule = (index: number) => {
  validationRules.value.splice(index, 1)
  updateValidationRules()
}

// 更新验证规则
const updateValidationRules = () => {
  const rules = validationRules.value.map(rule => {
    const result: any = {
      message: rule.message
    }
    
    if (rule.type === 'custom') {
      if (rule.pattern) {
        try {
          result.pattern = new RegExp(rule.pattern)
        } catch (e) {
          console.warn('Invalid regex pattern:', rule.pattern)
        }
      }
    } else {
      result.pattern = rulePatterns[rule.type]
    }
    
    return result
  }).filter(rule => rule.pattern)
  
  localProps.validateRules = rules
  handleUpdate()
}

// 监听modelValue变化
watch(() => props.modelValue.props, (newProps) => {
  Object.assign(localProps, newProps)
  
  // 初始化验证规则
  if (newProps.validateRules) {
    validationRules.value = newProps.validateRules.map((rule: any) => {
      const ruleType = Object.keys(rulePatterns).find(type => 
        rulePatterns[type].toString() === rule.pattern?.toString()
      ) || 'custom'
      
      return {
        type: ruleType,
        pattern: ruleType === 'custom' ? rule.pattern?.source : undefined,
        message: rule.message || '格式不正确'
      }
    })
  }
}, { immediate: true, deep: true })

// 同步属性到组件数据
Object.assign(props.modelValue.props, localProps)
</script>

<style scoped lang="scss">
.input-property-panel {
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

  .validation-rules {
    .rule-item {
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
      margin-bottom: 8px;
      border: 1px solid #e8e8e8;
    }
  }

  :deep(.ant-checkbox-wrapper) {
    margin-bottom: 8px;
  }
}
</style>