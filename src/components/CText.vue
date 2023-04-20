<template>
  <component
    :is="tag"
    :style="styleProps"
    class="c-text-component"
    @click="handleClick"
  >
    {{ text }}
  </component>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
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
  setup(props) {
    // 重用并且简化
    // 抽离并且获得 styleProps
    const { styleProps, handleClick } = useComponentCommon(
      props,
      textStylePropNames
    )
    return {
      styleProps,
      handleClick,
    }
  },
})
</script>

<style scoped>
h2.c-text-component,
p.c-text-component {
  margin-bottom: 0;
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
