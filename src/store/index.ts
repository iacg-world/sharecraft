import { createStore } from 'vuex'

export interface UserProps {
  isLogin: boolean
  userName?: string
}

export interface TemplateProps {
  id: number
  title: string
  coverImg: string
  author: string
  copiedCount: number
}

export interface GlobalDataProps {
  user: UserProps
  templates: TemplateProps[]
}

const testData: TemplateProps[] = [
  {
    id: 1,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'viking',
    copiedCount: 1,
  },
  {
    id: 2,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'viking',
    copiedCount: 1,
  },
  {
    id: 3,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'viking',
    copiedCount: 1,
  },
  {
    id: 4,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'viking',
    copiedCount: 1,
  },
  {
    id: 5,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'viking',
    copiedCount: 1,
  },
  {
    id: 6,
    coverImg:
      'https://static.jiebao.zhenai.com/seeyou/home/topic-activity/topic_activity-top_bg.png',
    title: 'iacg落地页海报',
    author: 'viking',
    copiedCount: 1,
  },
]

const store = createStore<GlobalDataProps>({
  state: {
    templates: testData,
    user: { isLogin: false },
  },
})

export default store
