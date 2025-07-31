/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare namespace JSX {
  interface Element extends React.ReactElement {}
  interface ElementClass extends React.Component {}
  interface IntrinsicElements {
    [elem: string]: any
  }
}
