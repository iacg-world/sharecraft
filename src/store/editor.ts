import { Module } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import store, { GlobalDataProps } from './index'
import { AllComponentProps, textDefaultProps } from '../defaultProps'
import { message } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'
import { insertAt } from '../helper'

export type MoveDirection = 'Up' | 'Down' | 'Left' | 'Right'
export interface ComponentData {
  // 这个元素的 属性，属性请详见下面
  props: Partial<AllComponentProps>
  // id，uuid v4 生成
  id: string
  // 业务组件库名称 c-text，c-image 等等
  name: 'c-text' | 'c-image' | 'c-shape'
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

export interface UpdateComponentData {
  key: keyof AllComponentProps | Array<keyof AllComponentProps>
  value: string | string[]
  id: string
  isRoot?: boolean
}

export interface HistoryProps {
  id: string
  componentId: string
  type: 'add' | 'delete' | 'modify'
  data: any
  index?: number
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
  // 当前操作的历史记录
  histories: HistoryProps[]
  // 当前历史记录的操作位置
  historyIndex: number
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
      left: '100px',
      top: '150px',
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
const modifyHistory = (
  state: EditorProps,
  history: HistoryProps,
  type: 'undo' | 'redo'
) => {
  const { componentId, data } = history
  const { key, oldValue, newValue } = data
  const newKey = key as keyof AllComponentProps | Array<keyof AllComponentProps>
  const updatedComponent = state.components.find(
    (component) => component.id === componentId
  )
  if (updatedComponent) {
    // check if key is array
    if (Array.isArray(newKey)) {
      newKey.forEach((keyName, index) => {
        updatedComponent.props[keyName] =
          type === 'undo' ? oldValue[index] : newValue[index]
      })
    } else {
      updatedComponent.props[newKey] = type === 'undo' ? oldValue : newValue
    }
  }
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
    histories: [],
    historyIndex: -1,
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
      state.histories.push({
        id: uuidv4(),
        componentId: component.id,
        type: 'add',
        data: cloneDeep(component),
      })
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
    updateComponent(state, { key, value, id, isRoot }: UpdateComponentData) {
      const updatedComponent = store.getters.getElement(id)

      if (updatedComponent) {
        if (isRoot) {
          // https://github.com/microsoft/TypeScript/issues/31663
          ;(updatedComponent as any)[key as string] = value
        } else {
          const oldValue = Array.isArray(key)
            ? key.map((key) => updatedComponent.props[key])
            : updatedComponent.props[key] // 先存储当前状态
          state.histories.push({
            id: uuidv4(),
            componentId: id || state.currentElementId,
            type: 'modify',
            data: { oldValue, newValue: value, key },
          })
          if (Array.isArray(key) && Array.isArray(value)) {
            // 若是数组，批量更新
            key.forEach((keyName, index) => {
              updatedComponent.props[keyName] = value[index]
            })
          } else if (typeof key === 'string' && typeof value === 'string') {
            updatedComponent.props[key] = value
          }
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
        state.histories.push({
          id: uuidv4(),
          componentId: clone.id,
          type: 'add',
          data: cloneDeep(clone),
        })
      }
    },
    deleteComponent(state, id) {
      const currentComponent = store.getters.getElement(id)
      if (currentComponent) {
        const currentIndex = state.components.findIndex(
          (component) => component.id === id
        )
        state.components = state.components.filter(
          (component) => component.id !== id
        )
        state.histories.push({
          id: uuidv4(),
          componentId: currentComponent.id,
          type: 'delete',
          data: currentComponent,
          index: currentIndex,
        })
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
    undo(state) {
      if (state.historyIndex === -1) {
        // 没有操作历史，撤销最后一个元素
        state.historyIndex = state.histories.length - 1
      } else {
        // 指正后移
        state.historyIndex--
      }
      // get the history record
      const history = state.histories[state.historyIndex]
      switch (history.type) {
        case 'add':
          // 如果上一步是添加元素，撤销添加===删除
          state.components = state.components.filter(
            (component) => component.id !== history.componentId
          )
          break
        case 'delete':
          // 如果上一步是删除元素，撤销删除===添加
          state.components = insertAt(
            state.components,
            history.index as number,
            history.data
          )
          break
        case 'modify': {
          // 如果上一步是修改元素，还原修改元素时所记录的历史值
          modifyHistory(state, history, 'undo')
          break
        }
        default:
          break
      }
    },
    redo(state) {
      if (state.historyIndex === -1) {
        return
      }
      const history = state.histories[state.historyIndex]
      switch (history.type) {
        case 'add':
          state.components.push(history.data)
          break
        case 'delete':
          state.components = state.components.filter(
            (component) => component.id !== history.componentId
          )
          break
        case 'modify': {
          modifyHistory(state, history, 'redo')
          break
        }
        default:
          break
      }
      state.historyIndex++
    },
    resetEditor(state) {
      state.components = []
      state.currentElementId = ''
      state.historyIndex = -1
      state.histories = []
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
    getComponentsLength: (state) => {
      return state.components.length
    },
    checkUndoDisable: (state) => {
      // 1 没有历史元素
      // 2 已经是第一个元素
      if (state.histories.length === 0 || state.historyIndex === 0) {
        return true
      }
      return false
    },
    checkRedoDisable: (state) => {
      // 1 没有历史元素
      // 2 指针指向最后
      // 3 之前从未撤销过
      if (
        state.histories.length === 0 ||
        state.historyIndex === state.histories.length ||
        state.historyIndex === -1
      ) {
        return true
      }
      return false
    },
  },
}

export default editor
