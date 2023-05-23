import { RespListData, RespData } from '../respTypes'
import { Module } from 'vuex'
import { GlobalDataProps, actionWrapper } from './index'
import { PageData } from './editor'
import router from '@/router'

export type TemplateProps = Required<Omit<PageData, 'props' | 'setting'>>

export interface TemplatesProps {
  data: TemplateProps[]
  totalTemplates: number
  works: TemplateProps[]
  totalWorks: number
}
const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: [],
    totalTemplates: 0,
    works: [],
    totalWorks: 0,
  },
  mutations: {
    fetchTemplates(
      state,
      rawData: RespListData<TemplateProps> & { isFirstPage: boolean }
    ) {
      const { count, list } = rawData.data

      state.data = rawData.isFirstPage ? list : [...state.data, ...list]
      state.totalTemplates = count
    },
    fetchWorks(state, rawData: RespListData<TemplateProps>) {
      const { count, list } = rawData.data
      state.works = list
      state.totalWorks = count
    },
    fetchTemplate(state, rawData: RespData<TemplateProps>) {
      state.data = [rawData.data]
    },
    deleteWork() {
      // no content
    },
  },
  actions: {
    createWork: actionWrapper('/works/', 'createWork', {
      method: 'post',
    }),
    fetchTemplates: actionWrapper('/templates', 'fetchTemplates'),
    fetchWorks: actionWrapper('/works', 'fetchWorks'),
    fetchTemplate: actionWrapper('/templates/:id', 'fetchTemplate'),
    copyWork: actionWrapper('/works/copy/:id', 'copyWork', {
      method: 'post',
    }),
    deleteWork: actionWrapper('/works/:id', 'deleteWork', {
      method: 'delete',
    }),

    copyWorkAndJump({ dispatch }, workId) {
      return dispatch('copyWork', { urlParams: { id: workId } }).then(
        ({ data }) => {
          router.push(`/editor/${data.id}`)
        }
      )
    },
    deleteWorkAndFetch({ dispatch }, { id, isTemplate }) {
      debugger
      return dispatch('deleteWork', { urlParams: { id } }).then(() => {
        const searchParams = {
          pageIndex: 0,
          pageSize: 4,
          isTemplate,
        }
        return dispatch('fetchWorks', { searchParams })
      })
    },
  },
  getters: {
    getTemplateById: (state) => (id: number) => {
      return state.data.find((t) => t.id === id)
    },
  },
}
export default templates
