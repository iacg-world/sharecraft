/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { nextTick } from 'vue'
const m = window.IacgMonitor

export default (err, vm, info) => {
  nextTick(async () => {
    await m.sendError({
      errorType: 2, // 错误类型: 1接口报错 2代码报错
      errorInfo: err.toString(),
      note: `组件：${vm.$.vnode.type.__file} \n发生错误：${err} \n所在生命周期：${info}`,
    })
  })
}
