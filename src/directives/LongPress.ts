// Vue3长按自定义指令
export default {
  mounted(el: HTMLElement, binding: any) {
    if (typeof binding.value !== 'function') {
      throw 'v-longpress 必须绑定函数';
    }
    const { value } = binding
    const cb = value
    let timer: any = null
    el.addEventListener('mousedown', (e: MouseEvent) => {
      timer = setTimeout(() => {
        cb(e)
      }, 150)
    })
    el.addEventListener('mouseup', (e: MouseEvent) => {
      clearTimeout(timer)
    })
  },
}