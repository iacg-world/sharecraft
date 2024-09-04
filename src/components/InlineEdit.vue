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

<script lang="ts">
import { defineComponent, ref, watch, computed, nextTick } from 'vue'
import useKeyPress from '../hooks/useKeyPress'
import useClickOutside from '../hooks/useClickOutside'
import { EditFilled } from '@ant-design/icons-vue'
export default defineComponent({
  name: 'inline-edit',
  components: {
    EditFilled,
  },
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  emits: ['change'],
  setup(props, context) {
    const innerValue = ref(props.value)
    watch(
      () => props.value,
      (newValue) => {
        innerValue.value = newValue
      }
    )
    const wrapper = ref<null | HTMLElement>(null)
    const inputRef = ref<null | HTMLInputElement>(null)
    const isOutside = useClickOutside(wrapper)
    let cachedOldValue = ''
    const isEditing = ref(false)

    const handleClick = () => {
      isEditing.value = true
    }
    const validateCheck = computed(() => innerValue.value.trim() !== '')
    watch(isEditing, async (isEditing) => {
      if (isEditing) {
        cachedOldValue = innerValue.value
        await nextTick()
        if (inputRef.value) {
          inputRef.value.focus()
        }
      }
    })
    watch(isOutside, (newValue) => {
      if (!validateCheck.value) {
        return
      }
      if (newValue && isEditing.value) {
        isEditing.value = false
        context.emit('change', innerValue.value)
      }
      isOutside.value = false
    })
    useKeyPress('Enter', () => {
      if (!validateCheck.value) {
        return
      }
      if (isEditing.value) {
        isEditing.value = false
        context.emit('change', innerValue.value)
      }
    })
    useKeyPress('Escape', () => {
      if (isEditing.value) {
        isEditing.value = false
        innerValue.value = cachedOldValue
      }
    })
    return {
      handleClick,
      innerValue,
      isEditing,
      wrapper,
      inputRef,
      validateCheck,
    }
  },
})
</script>

<style lang="scss">
.inline-edit {
  cursor: pointer;
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
