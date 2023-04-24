import axios, { AxiosRequestConfig } from 'axios'
import { createStore, ActionContext } from 'vuex'
import templates, { TemplatesProps } from './templates'
import user, { UserProps } from './user'
import editor, { EditorProps } from './editor'
import global, { GlobalStatus } from './global'
import { compile } from 'path-to-regexp'
export interface GlobalDataProps {
  user: UserProps
  templates: TemplatesProps
  editor: EditorProps
  global: GlobalStatus
}

export interface ActionPayload {
  urlParams?: { [key: string]: any }
  data?: any
}
export function actionWrapper(
  url: string,
  commitName: string,
  config: AxiosRequestConfig = { method: 'get' }
) {
  return async (
    context: ActionContext<any, any>,
    payload: ActionPayload = {}
  ) => {
    const { urlParams, data } = payload
    const newConfig = { ...config, data, opName: commitName }
    let newURL = url
    if (urlParams) {
      const toPath = compile(url, { encode: encodeURIComponent })
      newURL = toPath(urlParams)
      console.log(newURL)
    }
    const resp = await axios(newURL, newConfig)
    context.commit(commitName, resp.data)
    return resp.data
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
