import { Module } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { GlobalDataProps } from './index'
import {
  TextComponentProps,
  AllComponentProps,
  imageDefaultProps,
  textDefaultProps,
} from '../defaultProps'

export interface ComponentData {
  // 这个元素的 属性，属性请详见下面
  props: Partial<AllComponentProps>
  // id，uuid v4 生成
  id: string
  // 业务组件库名称 c-text，c-image 等等
  name: 'c-text' | 'c-image' | 'l-shape'
  // 图层是否隐藏
  isHidden?: boolean
  // 图层是否锁定
  isLocked?: boolean
  // 图层名称
  layerName?: string
}

export interface EditorProps {
  // 是否在编辑状态
  isEditing: boolean
  clickTimeout: number
  // 供中间编辑器渲染的数组
  components: ComponentData[]
  // 当前编辑的是哪个元素，uuid
  currentElementId: string
  // 当然最后保存的时候还有有一些项目信息，这里并没有写出，等做到的时候再补充
}

export const testComponents: ComponentData[] = [
  {
    id: uuidv4(),
    name: 'c-text',
    layerName: '图层1',
    props: {
      ...textDefaultProps,
      text: 'hello',
      fontSize: '20px',
      color: 'red',
      lineHeight: '1',
      textAlign: 'left',
      fontFamily: '',
    },
  },
  {
    id: uuidv4(),
    name: 'c-text',
    layerName: '图层2',
    props: {
      ...textDefaultProps,
      text: 'hello2',
      fontSize: '10px',
      fontWeight: 'bold',
      lineHeight: '2',
      textAlign: 'left',
      fontFamily: '',
    },
  },
  {
    id: uuidv4(),
    name: 'c-text',
    layerName: '图层3',
    props: {
      ...textDefaultProps,
      text: 'hello3',
      fontSize: '15px',
      actionType: 'url',
      url: 'https://www.baidu.com',
      lineHeight: '3',
      textAlign: 'left',
      fontFamily: '',
    },
  },
  {
    id: uuidv4(),
    name: 'c-image',
    layerName: '图层4',
    props: {
      ...textDefaultProps,
      src: 'https://sharecraft-backend.oss-cn-shanghai.aliyuncs.com/sharecraft-test/LxdNjP.png',
      width: '450px',
    },
  },
]

const editor: Module<EditorProps, GlobalDataProps> = {
  state: {
    isEditing: false,
    clickTimeout: 0,
    components: testComponents,
    currentElementId: '',
  },
  mutations: {
    setEditStatus(state, status) {
      // status是当前的编辑状态
      state.isEditing = !status
    },
    clearClickTimeout(state) {
      clearTimeout(state.clickTimeout)
      state.clickTimeout = 0
    },
    setClickTimeout(state, event, delay = 300) {
      clearTimeout(state.clickTimeout)
      state.clickTimeout = setTimeout(event, delay)
    },
    // 给画布添加组件渲染
    addComponent(state, component: ComponentData) {
      state.components.push(component)
    },
    setActive(state, currentId: string) {
      state.currentElementId = currentId
    },
    removeComponent(state, targetId: string) {
      state.components = state.components.filter((item) => {
        if (item.id !== targetId) {
          return item
        }
      })
    },
    updateComponent(state, { key, value, id, isRoot }) {
      const updatedComponent = state.components.find(
        (component) => component.id === (id || state.currentElementId)
      )
      if (updatedComponent) {
        if (isRoot) {
          // https://github.com/microsoft/TypeScript/issues/31663
          ;(updatedComponent as any)[key] = value
        } else {
          updatedComponent.props[key as keyof AllComponentProps] = value
        }
      }
    },
  },
  getters: {
    getCurrentElement: (state) => {
      return state.components.find(
        (component) => component.id === state.currentElementId
      )
    },
  },
}

export default editor
