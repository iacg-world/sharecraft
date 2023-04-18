import { VNode, h } from 'vue'
import { AllComponentProps } from './defaultProps'
export interface PropToForm {
  component: string
  subComponent?: string
  extraProps?: { [key: string]: any }
  text?: string
  options?: { text: string | VNode; value: any }[]
  initalTransform?: (v: any) => any // 初始化输入转换，值传递到表单可能需要转换类型
  afterTransform?: (v: any) => any // 处理表单change事件传递输出的参数
  valueProp?: string
  eventName?: string
  color?: {
    component: string
    text: string
  }
}

export type PropsToForms = {
  [P in keyof AllComponentProps]?: PropToForm
}
const fontFamilyArr = [
  { text: '宋体', value: '"SimSun","STSong"' },
  { text: '黑体', value: '"SimHei","STHeiti"' },
  { text: '微软雅黑', value: '"Microsoft YaHei' },
  { text: '楷体', value: '"KaiTi","STKaiti"' },
  { text: '仿宋', value: '"FangSong","STFangsong"' },
  { text: 'Palatino Linotype', value: '"Palatino Linotype", "Book Antiqua"' },
  { text: 'Comic Sans MS', value: '"Comic Sans MS"' },
  { text: 'Impact', value: '"Impact"' },
]
const fontFamilyOptions = fontFamilyArr.map((font) => {
  return {
    value: font.value,
    text: (
      <span style={{ fontFamily: font.value }}>{font.text}</span>
    ) as VNode,
  }
})

const pxToNumberHandler: PropToForm = {
  component: 'a-input-number',
  initalTransform: (v: string) => parseInt(v),
  afterTransform: (e: number) => (e ? `${e}px` : ''),
}

export const mapPropsToForms: PropsToForms = {
  text: {
    text: '文本',
    component: 'a-textarea',
    extraProps: { rows: 3 },
    afterTransform: (e: any) => e.target.value,
  },
  fontSize: {
    text: '字号',
    ...pxToNumberHandler,
  },
  lineHeight: {
    text: '行高',
    component: 'a-slider',
    extraProps: { min: 0, max: 3, step: 0.1 },
    initalTransform: (v: string) => parseFloat(v),
    afterTransform: (e: number) => e.toString(),
  },
  textAlign: {
    component: 'a-radio-group',
    subComponent: 'a-radio-button',
    text: '对齐',
    options: [
      { value: 'left', text: '左' },
      { value: 'center', text: '中' },
      { value: 'right', text: '右' },
    ],
    afterTransform: (e: any) => e.target.value,
  },
  fontFamily: {
    component: 'a-select',
    extraProps: { style: 'min-width: 100px' },
    subComponent: 'a-select-option',
    text: '字体',
    options: [{ value: '', text: '无' }, ...fontFamilyOptions],
  },
  width: {
    text: '宽度',
    ...pxToNumberHandler,
  },
  color: {
    component: 'color-picker',
    text: '字体颜色',
  },
  src: {
    component: 'image-processer',
  },
  fontWeight: {
    component: 'a-radio-group',
    subComponent: 'a-radio-button',
    text: '加粗',
    options: [
      { value: 'lighter', text: '细' },
      { value: 'normal', text: '正常' },
      { value: 'bold', text: '粗' },
      { value: 'bolder', text: '加粗' },
    ],
    afterTransform: (e: any) => e.target.value,
  },
}
