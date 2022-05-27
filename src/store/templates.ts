import { Module } from 'vuex'
import { GlobalDataProps } from './index'
export interface TemplateProps {
  id: number
  title: string
  coverImg: string
  author: string
  copiedCount: number
}

export const testData: TemplateProps[] = [
  {
    id: 1,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'lc',
    copiedCount: 1,
  },
  {
    id: 2,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'lc',
    copiedCount: 1,
  },
  {
    id: 3,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'lc',
    copiedCount: 1,
  },
  {
    id: 4,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'lc',
    copiedCount: 1,
  },
  {
    id: 5,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'lc',
    copiedCount: 1,
  },
  {
    id: 6,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'lc',
    copiedCount: 1,
  },
]

export interface TemplatesProps {
  data: TemplateProps[]
}

const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: testData,
  },
  getters: {
    getTemplateById: (state, getters, rootState) => (id: number) => {
      return state.data.find((t) => t.id === id)
    },
  },
}
export default templates
