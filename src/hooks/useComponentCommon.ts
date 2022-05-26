import { computed } from 'vue'
import { pick } from 'lodash-es'
import { TextComponentProps } from '../defaultProps'

/* 
封装组件样式与事件功能，例如点击跳转
props参数集合
picks: fontSize，等样式数组
*/
const useComponentCommon = (
  props: Readonly<Partial<TextComponentProps>>,
  picks: string[]
) => {
  const styleProps = computed(() => pick(props, picks))
  const handleClick = () => {
    if (props.actionType === 'url' && props.url) {
      window.location.href = props.url
    }
  }
  return {
    styleProps,
    handleClick,
  }
}

export default useComponentCommon
