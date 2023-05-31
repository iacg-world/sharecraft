import axios, { AxiosRequestConfig } from 'axios'
import { createStore, ActionContext } from 'vuex'
import templates, { TemplatesProps } from './templates'
import user, { UserProps } from './user'
import editor, { EditorProps } from './editor'
import global, { GlobalStatus } from './global'
import { compile } from 'path-to-regexp'
import { forEach } from 'lodash-es'
import router from '@/router'
export interface GlobalDataProps {
  user: UserProps
  templates: TemplatesProps
  editor: EditorProps
  global: GlobalStatus
}

export interface ActionPayload {
  urlParams?: { [key: string]: any }
  data?: any
  searchParams?: { [key: string]: any }
  props?: object
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
    const { urlParams, data, searchParams, props } = payload
    const newConfig = { ...config, data, opName: commitName }
    let newURL = url
    if (urlParams) {
      const toPath = compile(url, { encode: encodeURIComponent })
      newURL = toPath(urlParams)
    }
    if (searchParams) {
      const search = new URLSearchParams()
      forEach(searchParams, (value, key) => {
        search.append(key, value)
      })
      newURL += '?' + search.toString()
    }
    const resp = await axios(newURL, newConfig)
    if (resp.data.errno === 101005) {
      router.push('/')
    }

    context.commit(commitName, { ...resp.data, ...props })
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
