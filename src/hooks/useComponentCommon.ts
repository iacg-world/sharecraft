import { computed } from 'vue'
import { pick } from 'lodash-es'
import { TextComponentProps } from '../defaultProps'
import { useStore } from 'vuex'
import { GlobalDataProps } from '@/store'

/* 
封装组件样式与事件功能，例如点击跳转
props参数集合
picks: fontSize，等样式数组
*/
const useComponentCommon = (
  props: Readonly<Partial<TextComponentProps>>,
  picks: string[]
) => {
  const store = useStore<GlobalDataProps>()

  const styleProps = computed(() => pick(props, picks))

  const clickTimeout = () => {
    if (store.state.editor.isEditing) {
      return
    }

    if (props.actionType === 'url' && props.url) {
      window.location.href = props.url
    }
  }
  const handleClick = () => {
    store.commit('setClickTimeout', clickTimeout)
  }

  return {
    styleProps,
    handleClick,
  }
}

export default useComponentCommon
