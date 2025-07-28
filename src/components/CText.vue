<template>
  <component
    :is="tag"
    :style="styleProps"
    contenteditable="true"
    class="c-text-component"
    @click="handleClick"
    @input="onChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    {{ isFocus ? innerText : text }}
  </component>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import useComponentCommon from '../hooks/useComponentCommon'
import {
  transformToComponentProps,
  textDefaultProps,
  textStylePropNames,
} from '../defaultProps'
const defaultProps = transformToComponentProps(textDefaultProps)

// array that contains style props
export default defineComponent({
  name: 'c-text',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    ...defaultProps,
  },
  emits: ['change'],
  setup(props, context) {
    let isFocus = ref(false)
    let innerText = ref(props.text)
    // 重用并且简化
    // 抽离并且获得 styleProps
    const { styleProps, handleClick } = useComponentCommon(
      props,
      textStylePropNames
    )
    const onChange = (e: Event) => {
      const text = (e.target as HTMLParagraphElement).innerText
      context.emit('change', {
        key: 'text',
        value: text,
      })
    }
    const handleFocus = () => {
      innerText.value = props.text
      isFocus.value = true
    }
    const handleBlur = () => {
      isFocus.value = false
    }
    return {
      styleProps,
      handleClick,
      onChange,
      handleFocus,
      handleBlur,
      innerText,
      isFocus,
    }
  },
})
</script>

<style>
h2.c-text-component,
p.c-text-component {
  margin-bottom: 0;
  overflow: hidden;
}
button.c-text-component {
  padding: 5px 10px;
  cursor: pointer;
}
.c-text-component {
  box-sizing: border-box;
  white-space: pre-wrap;
  position: relative;
}
</style>
