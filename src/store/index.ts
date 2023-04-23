import axios, { AxiosRequestConfig } from 'axios'
import { createStore, ActionContext } from 'vuex'
import templates, { TemplatesProps } from './templates'
import user, { UserProps } from './user'
import editor, { EditorProps } from './editor'
import global, { GlobalStatus } from './global'
export interface GlobalDataProps {
  user: UserProps
  templates: TemplatesProps
  editor: EditorProps
  global: GlobalStatus
}
export function actionWrapper(
  url: string,
  commitName: string,
  config: AxiosRequestConfig = { method: 'get' }
) {
  return async (context: ActionContext<any, any>, payload?: any) => {
    const newConfig = { ...config, data: payload, opName: commitName }
    const { data } = await axios(url, newConfig)
    context.commit(commitName, data)
    return data
  }
}
const store = createStore({
  modules: {
    user,
    templates,
    editor,
    global,
  },
})

export default store
