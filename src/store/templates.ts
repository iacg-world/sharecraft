import { RespListData } from '../respTypes'
import { Module } from 'vuex'
import { GlobalDataProps, actionWrapper } from './index'
import { PageData } from './editor'

export type TemplateProps = Required<Omit<PageData, 'props' | 'setting'>>

export interface TemplatesProps {
  data: TemplateProps[]
  totalTemplates: number
}
const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: [],
    totalTemplates: 0,
  },
  mutations: {
    fetchTemplates(state, rawData: RespListData<TemplateProps>) {
      const { count, list } = rawData.data
      state.data = [...state.data, ...list]
      state.totalTemplates = count
    },
  },
  actions: {
    fetchTemplates: actionWrapper('/templates', 'fetchTemplates'),
  },
  getters: {
    getTemplateById: (state, getters, rootState) => (id: number) => {
      return state.data.find((t) => t.id === id)
    },
  },
}
export default templates
