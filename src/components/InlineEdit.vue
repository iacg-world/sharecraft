<template>
  <div class="inline-edit" @dblclick.stop="handleClick" ref="wrapper">
    <input
      v-model="innerValue"
      v-if="isEditing"
      placeholder="文本不能为空"
      ref="inputRef"
      :class="{ 'input-error': !validateCheck }"
      class="ant-input"
    />
    <slot v-else :text="innerValue"
      ><span>{{ innerValue }} <EditFilled /></span
    ></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import useKeyPress from '../hooks/useKeyPress'
import useClickOutside from '../hooks/useClickOutside'
import { EditFilled } from '@ant-design/icons-vue'

// 定义 props
interface Props {
  value?: string
}

const props = defineProps<Props>()

// 定义 emits
const emit = defineEmits<{
  change: [value: string]
}>()

const innerValue = ref(props.value)
watch(
  () => props.value,
  newValue => {
    innerValue.value = newValue
  },
)
const wrapper = ref<null | HTMLElement>(null)
const inputRef = ref<null | HTMLInputElement>(null)
const isOutside = useClickOutside(wrapper)
let cachedOldValue = ''
const isEditing = ref(false)

const handleClick = () => {
  isEditing.value = true
}

const validateCheck = computed(() => innerValue.value?.trim() !== '')

watch(isEditing, async isEditing => {
  if (isEditing) {
    cachedOldValue = innerValue.value || ''
    await nextTick()
    if (inputRef.value) {
      inputRef.value.focus()
    }
  }
})

watch(isOutside, newValue => {
  if (!validateCheck.value) {
    return
  }
  if (newValue && isEditing.value) {
    isEditing.value = false
    emit('change', innerValue.value || '')
  }
  isOutside.value = false
})

useKeyPress('Enter', () => {
  if (!validateCheck.value) {
    return
  }
  if (isEditing.value) {
    isEditing.value = false
    emit('change', innerValue.value || '')
  }
})

useKeyPress('Escape', () => {
  if (isEditing.value) {
    isEditing.value = false
    innerValue.value = cachedOldValue
  }
})
</script>

<style lang="scss">
.inline-edit {
  cursor: pointer;
  color: #f5deb3;
  input {
    color: black;
    height: 45px;
  }
}
.ant-input.input-error {
  border: 1px solid #f5222d;
}
.ant-input.input-error:focus {
  border-color: #f5222d;
}
.ant-input.input-error::placeholder {
  color: #f5222d;
}
</style>
