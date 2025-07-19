/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends ComponentPublicInstance {}
    interface ElementAttributesProperty {
      $props: any
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}

import type { VNode, ComponentPublicInstance } from 'vue'
