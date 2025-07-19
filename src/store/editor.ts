import { Module, Mutation } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import store, { actionWrapper, GlobalDataProps } from './index'
import { AllComponentProps, textDefaultProps } from '../defaultProps'
import { message } from 'ant-design-vue/es'
import { cloneDeep, debounce } from 'lodash-es'
import { insertAt } from '../helper'
import { RespData, RespListData, RespWorkData } from '@/respTypes'
import { CSSProperties } from 'vue'

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
  id?: number
  props?: PageProps
  title?: string
  desc?: string
  coverImg?: string
  uuid?: string
  setting?: { [key: string]: any }
  isTemplate?: boolean
  isPublic?: boolean
  isHot?: boolean
  isNew?: boolean
  author?: string
  copiedCount?: number
  status?: number
  user?: {
    gender: string
    nickName: string
    picture: string
    username: string
  }
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

export interface ChannelProps {
  id: number
  name: string
  workId: number
  status: number
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
  // 开始更新时的缓存值
  cachedOldValues: any
  // 最大保存历史数
  maxHistoryNumber: number
  // 是否有修改
  isDirty: boolean
  // 当前 work 的 channels
  channels: ChannelProps[]
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

export interface PageProps extends CSSProperties {
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
  backgroundSize: 'contain',
  height: '560px',
}
const pushHistory = (state: EditorProps, historyRecord: HistoryProps) => {
  if (state.historyIndex !== -1) {
    // 有新纪录时，先删除指针后面所有记录
    state.histories = state.histories.slice(0, state.historyIndex)
    // 置空指针
    state.historyIndex = -1
  }
  if (state.histories.length < state.maxHistoryNumber) {
    state.histories.push(historyRecord)
  } else {
    // 超过最大保存历史数后先出队最早的历史记录
    state.histories.shift()
    state.histories.push(historyRecord)
  }
}
const pushModifyHistory = (
  state: EditorProps,
  { key, value, id }: UpdateComponentData
) => {
  pushHistory(state, {
    id: uuidv4(),
    componentId: id || state.currentElementId,
    type: 'modify',
    data: { oldValue: state.cachedOldValues, newValue: value, key },
  })
  state.cachedOldValues = null
}
// 只会推入防抖时间内最后一次的新值
const pushHistoryDebounce = debounce(pushModifyHistory, 350)

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

// 脏数据标记
const setDirtyWrapper = (callback: Mutation<EditorProps>) => {
  return (state: EditorProps, payload: any) => {
    state.isDirty = true
    callback(state, payload)
  }
}

const editor: Module<EditorProps, GlobalDataProps> = {
  state: {
    isEditing: true,
    clickTimeout: 0,
    components: [],
    currentElementId: '',
    page: {
      id: 1,
      props: pageDefaultProps,
      title: '双击编辑标题',
    },
    histories: [],
    historyIndex: -1,
    cachedOldValues: null,
    maxHistoryNumber: 9,
    isDirty: false,
    channels: [],
  },
  mutations: {
    setEditStatus(state, newStatus) {
      state.isEditing = newStatus
    },
    clearClickTimeout(state) {
      clearTimeout(state.clickTimeout)
      state.clickTimeout = 0
    },
    setClickTimeout(state, event, delay = 300) {
      clearTimeout(state.clickTimeout)
      state.clickTimeout = window.setTimeout(event, delay)
    },
    // 给画布添加组件渲染
    addComponent: setDirtyWrapper((state, component: ComponentData) => {
      component.layerName = '图层' + (state.components.length + 1)
      state.components.push(component)
      pushHistory(state, {
        id: uuidv4(),
        componentId: component.id,
        type: 'add',
        data: cloneDeep(component),
      })
    }),
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
    updateComponent: setDirtyWrapper(
      (state, { key, value, id, isRoot }: UpdateComponentData) => {
        const updatedComponent = store.getters.getElement(id)

        if (updatedComponent) {
          if (isRoot) {
            // https://github.com/microsoft/TypeScript/issues/31663
            ;(updatedComponent as any)[key as string] = value
          } else {
            const oldValue = Array.isArray(key)
              ? key.map((key) => updatedComponent.props[key])
              : updatedComponent.props[key] // 先存储当前状态
            if (!state.cachedOldValues) {
              state.cachedOldValues = oldValue
            }
            pushHistoryDebounce(state, { key, value, id })
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
      }
    ),
    updatePage: setDirtyWrapper((state, { key, value, isRoot, isSetting }) => {
      if (isRoot) {
        state.page[key as keyof PageData] = value
      } else if (isSetting) {
        state.page.setting = {
          ...state.page.setting,
          [key]: value,
        }
      } else {
        if (state.page.props) {
          state.page.props[key] = value
        }
      }
    }),

    copyComponent(state, id) {
      const currentComponent = store.getters.getElement(id)
      if (currentComponent) {
        state.copiedComponent = currentComponent
        message.success('已拷贝当前图层', 1)
      }
    },
    pasteCopiedComponent: setDirtyWrapper((state) => {
      if (state.copiedComponent) {
        const clone = cloneDeep(state.copiedComponent)
        clone.id = uuidv4()
        clone.layerName = clone.layerName + '副本'
        state.components.push(clone)
        message.success('已黏贴当前图层', 1)
        pushHistory(state, {
          id: uuidv4(),
          componentId: clone.id,
          type: 'add',
          data: cloneDeep(clone),
        })
      }
    }),
    deleteComponent: setDirtyWrapper((state, id) => {
      const currentComponent = store.getters.getElement(id)
      if (currentComponent) {
        const currentIndex = state.components.findIndex(
          (component) => component.id === id
        )
        state.components = state.components.filter(
          (component) => component.id !== id
        )
        pushHistory(state, {
          id: uuidv4(),
          componentId: currentComponent.id,
          type: 'delete',
          data: currentComponent,
          index: currentIndex,
        })
        message.success('删除当前图层成功', 1)
      }
    }),
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
    fetchWork(state, { data }: RespWorkData) {
      const { content, ...rest } = data
      if (!content) {
        return
      }
      state.page = { ...state.page, ...rest }
      state.page.props = content.props
      state.components = content.components
    },
    saveWork(state) {
      state.isDirty = false
    },
    fetchChannels(state, { data }: RespListData<ChannelProps>) {
      state.channels = data.list
    },
    createChannel(state, { data }: RespData<ChannelProps>) {
      state.channels = [...state.channels, data]
    },
    setComponents: setDirtyWrapper((state, components: ComponentData[]) => {
      state.components = components
      // 清空当前选中
      state.currentElementId = ''
      // 清空历史记录
      state.histories = []
      state.historyIndex = -1
    }),
  },
  actions: {
    fetchWork: actionWrapper('/works/:id', 'fetchWork'),
    saveWork: actionWrapper('/works/:id', 'saveWork', { method: 'patch' }),
    publishWork: actionWrapper('/works/publish/:id', 'publishWork', {
      method: 'post',
    }),
    publishTemplate: actionWrapper(
      '/works/publish-template/:id/:isPublic',
      'publishWork',
      {
        method: 'post',
      }
    ),
    fetchChannels: actionWrapper(
      '/channel/getWorkChannels/:id',
      'fetchChannels'
    ),
    createChannel: actionWrapper('/channel/', 'createChannel', {
      method: 'post',
    }),
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
