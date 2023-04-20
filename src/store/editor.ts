import { Module } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import store, { GlobalDataProps } from './index'
import {
  TextComponentProps,
  AllComponentProps,
  imageDefaultProps,
  textDefaultProps,
} from '../defaultProps'
import { message } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'

export type MoveDirection = 'Up' | 'Down' | 'Left' | 'Right'
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

export interface PageData {
  props: { [key: string]: any } & PageProps
  title: string
}
export interface EditorProps {
  // 是否在编辑状态
  isEditing: boolean
  clickTimeout: number
  // 供中间编辑器渲染的数组
  components: ComponentData[]
  // 当前编辑的是哪个元素，uuid
  currentElementId: string
  page: PageData
  // 当前被复制的组件
  copiedComponent?: ComponentData
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
      width: '100px',
      height: '100px',
      backgroundColor: '#efefef',
      left: '10px',
      top: '10px',
    },
  },
  // {
  //   id: uuidv4(),
  //   name: 'c-text',
  //   layerName: '图层2',
  //   props: {
  //     ...textDefaultProps,
  //     text: 'hello2',
  //     fontSize: '10px',
  //     fontWeight: 'bold',
  //     lineHeight: '2',
  //     textAlign: 'left',
  //     fontFamily: '',
  //   },
  // },
  // {
  //   id: uuidv4(),
  //   name: 'c-text',
  //   layerName: '图层3',
  //   props: {
  //     ...textDefaultProps,
  //     text: 'hello3',
  //     fontSize: '15px',
  //     actionType: 'url',
  //     url: 'https://www.baidu.com',
  //     lineHeight: '3',
  //     textAlign: 'left',
  //     fontFamily: '',
  //   },
  // },
  // {
  //   id: uuidv4(),
  //   name: 'c-image',
  //   layerName: '图层4',
  //   props: {
  //     ...textDefaultProps,
  //     src: 'https://sharecraft-backend.oss-cn-shanghai.aliyuncs.com/sharecraft-test/LxdNjP.png',
  //     width: '450px',
  //   },
  // },
]

export interface PageProps {
  backgroundColor: string
  backgroundImage: string
  backgroundRepeat: string
  backgroundSize: string
  height: string
}
export type AllFormProps = PageProps & AllComponentProps

const pageDefaultProps = {
  backgroundColor: '#ffffff',
  backgroundImage: '',
  // backgroundImage:
  //   'url("https://sharecraft-backend.oss-cn-shanghai.aliyuncs.com/sharecraft-test/20180421210121_KddAy.jpeg")',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  height: '560px',
}

const editor: Module<EditorProps, GlobalDataProps> = {
  state: {
    isEditing: false,
    clickTimeout: 0,
    components: testComponents,
    currentElementId: '',
    page: {
      props: pageDefaultProps,
      title: 'test title',
    },
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
      component.layerName = '图层' + (state.components.length + 1)
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
      const updatedComponent = store.getters.getElement(id)

      if (updatedComponent) {
        if (isRoot) {
          // https://github.com/microsoft/TypeScript/issues/31663
          ;(updatedComponent as any)[key] = value
        } else {
          updatedComponent.props[key as keyof AllComponentProps] = value
        }
      }
    },
    updatePage(state, { key, value }) {
      state.page.props[key as keyof PageProps] = value
    },

    copyComponent(state, id) {
      const currentComponent = store.getters.getElement(id)
      if (currentComponent) {
        state.copiedComponent = currentComponent
        message.success('已拷贝当前图层', 1)
      }
    },
    pasteCopiedComponent(state) {
      if (state.copiedComponent) {
        const clone = cloneDeep(state.copiedComponent)
        clone.id = uuidv4()
        clone.layerName = clone.layerName + '副本'
        state.components.push(clone)
        message.success('已黏贴当前图层', 1)
      }
    },
    deleteComponent(state, id) {
      const currentComponent = store.getters.getElement(id)
      if (currentComponent) {
        state.components = state.components.filter(
          (component) => component.id !== id
        )
        message.success('删除当前图层成功', 1)
      }
    },
    moveComponent(
      state,
      data: { direction: MoveDirection; amount: number; id: string }
    ) {
      const currentComponent = store.getters.getElement(data.id)

      if (currentComponent) {
        const oldTop = parseInt(currentComponent.props.top || '0')
        const oldLeft = parseInt(currentComponent.props.left || '0')
        const { direction, amount } = data
        switch (direction) {
          case 'Up': {
            const newValue = oldTop - amount + 'px'
            store.commit('updateComponent', {
              key: 'top',
              value: newValue,
              id: data.id,
            })
            break
          }
          case 'Down': {
            const newValue = oldTop + amount + 'px'
            store.commit('updateComponent', {
              key: 'top',
              value: newValue,
              id: data.id,
            })
            break
          }
          case 'Left': {
            const newValue = oldLeft - amount + 'px'
            store.commit('updateComponent', {
              key: 'left',
              value: newValue,
              id: data.id,
            })
            break
          }
          case 'Right': {
            const newValue = oldLeft + amount + 'px'
            store.commit('updateComponent', {
              key: 'left',
              value: newValue,
              id: data.id,
            })
            break
          }

          default:
            break
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
    getElement: (state) => (id: string) => {
      return state.components.find(
        (component) => component.id === (id || state.currentElementId)
      )
    },
  },
}

export default editor
