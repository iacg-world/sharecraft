import { textDefaultProps } from './defaultProps'

// 文本通用属性
export const defaultTextTemplates = [
  {
    text: '大标题',
    color: '#000000',
    fontSize: '30px',
    fontWeight: 'bold',
    tag: 'h2',
    width: '100px',
  },
  {
    text: '正文内容',
    color: '#000000',
    fontWeight: 'normal',
    tag: 'p',
    lineHeight: '1.5',
    letterSpacing: '1px',
    width: '100px',
  },
  {
    text: '链接内容',
    color: '#75409A',
    textDecoration: 'underline',
    fontWeight: 'normal',
    tag: 'p',
    width: '100px',
  },
  {
    text: '按钮内容',
    color: '#ffffff',
    backgroundColor: '#75409A',
    borderWidth: '1px',
    borderColor: '#75409A',
    borderStyle: 'solid',
    borderRadius: '2px',
    paddingLeft: '10px',
    paddingRight: '10px',
    paddingTop: '5px',
    paddingBottom: '5px',
    width: '100px',
    tag: 'button',
    textAlign: 'center',
    fontWeight: 'normal',
    position: 'absolute',
  },
]

export default defaultTextTemplates.map((template) => ({
  ...textDefaultProps,
  ...template,
}))
