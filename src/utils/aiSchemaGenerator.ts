import { v4 as uuidv4 } from 'uuid'
import { ComponentData } from '@/store/editor'
import { textDefaultProps, imageDefaultProps } from '@/defaultProps'
import { callAI, AIApiRequest } from './aiApi'

export interface AIGenerateResult {
  description: string
  components: ComponentData[]
}

// 预定义的页面模板
const PAGE_TEMPLATES = {
  login: {
    keywords: ['登录', '登陆', 'login', '用户名', '密码', '账号'],
    generate: (): ComponentData[] => [
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '登录标题',
        props: {
          ...textDefaultProps,
          text: '用户登录',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1890ff',
          left: '100px',
          top: '50px',
          width: '200px',
          height: '40px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '用户名标签',
        props: {
          ...textDefaultProps,
          text: '用户名:',
          fontSize: '14px',
          color: '#333',
          left: '50px',
          top: '120px',
          width: '80px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '用户名输入框',
        props: {
          ...textDefaultProps,
          text: '请输入用户名',
          fontSize: '14px',
          color: '#999',
          backgroundColor: '#f8f8f8',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: '#d9d9d9',
          borderRadius: '4px',
          paddingLeft: '12px',
          paddingTop: '8px',
          paddingBottom: '8px',
          left: '140px',
          top: '120px',
          width: '200px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '密码标签',
        props: {
          ...textDefaultProps,
          text: '密码:',
          fontSize: '14px',
          color: '#333',
          left: '50px',
          top: '170px',
          width: '80px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '密码输入框',
        props: {
          ...textDefaultProps,
          text: '请输入密码',
          fontSize: '14px',
          color: '#999',
          backgroundColor: '#f8f8f8',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: '#d9d9d9',
          borderRadius: '4px',
          paddingLeft: '12px',
          paddingTop: '8px',
          paddingBottom: '8px',
          left: '140px',
          top: '170px',
          width: '200px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '登录按钮',
        props: {
          ...textDefaultProps,
          text: '登录',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: '#1890ff',
          borderRadius: '4px',
          textAlign: 'center',
          paddingTop: '12px',
          paddingBottom: '12px',
          left: '140px',
          top: '230px',
          width: '200px',
          height: '40px',
          actionType: 'url',
          url: '/dashboard'
        }
      }
    ]
  },
  
  product: {
    keywords: ['产品', '商品', 'product', '展示', '卡片', 'card'],
    generate: (): ComponentData[] => [
      {
        id: uuidv4(),
        name: 'c-image',
        layerName: '产品图片',
        props: {
          ...imageDefaultProps,
          src: 'https://via.placeholder.com/300x200?text=Product+Image',
          left: '50px',
          top: '50px',
          width: '300px',
          height: '200px',
          borderRadius: '8px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '产品标题',
        props: {
          ...textDefaultProps,
          text: '产品名称',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          left: '50px',
          top: '270px',
          width: '300px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '产品描述',
        props: {
          ...textDefaultProps,
          text: '这里是产品的详细描述信息，介绍产品的特点和优势。',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.6',
          left: '50px',
          top: '310px',
          width: '300px',
          height: '60px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '产品价格',
        props: {
          ...textDefaultProps,
          text: '¥199.00',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#ff4d4f',
          left: '50px',
          top: '380px',
          width: '150px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '购买按钮',
        props: {
          ...textDefaultProps,
          text: '立即购买',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: '#52c41a',
          borderRadius: '6px',
          textAlign: 'center',
          paddingTop: '12px',
          paddingBottom: '12px',
          left: '220px',
          top: '380px',
          width: '130px',
          height: '40px',
          actionType: 'url',
          url: '/buy'
        }
      }
    ]
  },

  contact: {
    keywords: ['联系', '联系我们', 'contact', '地址', '电话', '邮箱'],
    generate: (): ComponentData[] => [
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '联系我们标题',
        props: {
          ...textDefaultProps,
          text: '联系我们',
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1890ff',
          left: '100px',
          top: '50px',
          width: '200px',
          height: '40px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '公司地址',
        props: {
          ...textDefaultProps,
          text: '📍 公司地址：北京市朝阳区xxx路xxx号',
          fontSize: '16px',
          color: '#333',
          left: '50px',
          top: '120px',
          width: '350px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '联系电话',
        props: {
          ...textDefaultProps,
          text: '📞 联系电话：400-123-4567',
          fontSize: '16px',
          color: '#333',
          left: '50px',
          top: '160px',
          width: '350px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '邮箱地址',
        props: {
          ...textDefaultProps,
          text: '📧 邮箱地址：contact@company.com',
          fontSize: '16px',
          color: '#333',
          left: '50px',
          top: '200px',
          width: '350px',
          height: '30px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '工作时间',
        props: {
          ...textDefaultProps,
          text: '🕘 工作时间：周一至周五 9:00-18:00',
          fontSize: '16px',
          color: '#333',
          left: '50px',
          top: '240px',
          width: '350px',
          height: '30px'
        }
      }
    ]
  },

  news: {
    keywords: ['新闻', '文章', 'news', 'article', '资讯', '博客'],
    generate: (): ComponentData[] => [
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '文章标题',
        props: {
          ...textDefaultProps,
          text: '新闻文章标题',
          fontSize: '26px',
          fontWeight: 'bold',
          color: '#333',
          lineHeight: '1.3',
          left: '50px',
          top: '50px',
          width: '400px',
          height: '40px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '文章信息',
        props: {
          ...textDefaultProps,
          text: '发布时间：2024-01-15 | 作者：编辑部 | 阅读：1.2k',
          fontSize: '12px',
          color: '#999',
          left: '50px',
          top: '100px',
          width: '400px',
          height: '20px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-image',
        layerName: '文章配图',
        props: {
          ...imageDefaultProps,
          src: 'https://via.placeholder.com/400x250?text=News+Image',
          left: '50px',
          top: '130px',
          width: '400px',
          height: '250px',
          borderRadius: '8px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '文章摘要',
        props: {
          ...textDefaultProps,
          text: '这里是文章的摘要内容，简要介绍文章的主要内容和要点...',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.6',
          left: '50px',
          top: '400px',
          width: '400px',
          height: '60px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '阅读更多',
        props: {
          ...textDefaultProps,
          text: '阅读全文',
          fontSize: '14px',
          color: '#1890ff',
          textDecoration: 'underline',
          left: '50px',
          top: '480px',
          width: '100px',
          height: '20px',
          actionType: 'url',
          url: '/article/detail'
        }
      }
    ]
  }
}

// 自然语言关键词匹配
function matchTemplate(input: string): string | null {
  const lowerInput = input.toLowerCase()
  
  for (const [templateName, template] of Object.entries(PAGE_TEMPLATES)) {
    if (template.keywords.some(keyword => lowerInput.includes(keyword))) {
      return templateName
    }
  }
  
  return null
}

// 从用户输入中提取样式信息
function extractStyleInfo(input: string) {
  const styleInfo: any = {}
  
  // 颜色匹配
  const colorMatch = input.match(/(?:颜色|color).*?(红色|蓝色|绿色|黄色|黑色|白色|灰色|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/i)
  if (colorMatch) {
    const colorMap: { [key: string]: string } = {
      '红色': '#ff4d4f',
      '蓝色': '#1890ff',
      '绿色': '#52c41a',
      '黄色': '#faad14',
      '黑色': '#000000',
      '白色': '#ffffff',
      '灰色': '#666666'
    }
    styleInfo.color = colorMap[colorMatch[1]] || colorMatch[1]
  }
  
  // 字体大小匹配
  const sizeMatch = input.match(/(?:字体|字号|大小).*?(\d+)(?:px|像素|号)/i)
  if (sizeMatch) {
    styleInfo.fontSize = `${sizeMatch[1]}px`
  }
  
  // 位置信息匹配
  const positionMatch = input.match(/(左边|右边|中间|居中|顶部|底部)/i)
  if (positionMatch) {
    switch (positionMatch[1]) {
      case '左边':
        styleInfo.textAlign = 'left'
        break
      case '右边':
        styleInfo.textAlign = 'right'
        break
      case '中间':
      case '居中':
        styleInfo.textAlign = 'center'
        break
    }
  }
  
  return styleInfo
}

// 生成自定义组件
function generateCustomComponents(input: string): ComponentData[] {
  const components: ComponentData[] = []
  const styleInfo = extractStyleInfo(input)
  
  // 简单的文本组件生成
  if (input.includes('标题') || input.includes('title')) {
    components.push({
      id: uuidv4(),
      name: 'c-text',
      layerName: '标题',
      props: {
        ...textDefaultProps,
        text: '页面标题',
        fontSize: styleInfo.fontSize || '24px',
        fontWeight: 'bold',
        color: styleInfo.color || '#333',
        textAlign: styleInfo.textAlign || 'center',
        left: '100px',
        top: '50px',
        width: '200px',
        height: '40px'
      }
    })
  }
  
  if (input.includes('按钮') || input.includes('button')) {
    components.push({
      id: uuidv4(),
      name: 'c-text',
      layerName: '按钮',
      props: {
        ...textDefaultProps,
        text: '点击按钮',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: styleInfo.color || '#1890ff',
        borderRadius: '6px',
        textAlign: 'center',
        paddingTop: '12px',
        paddingBottom: '12px',
        left: '150px',
        top: '150px',
        width: '100px',
        height: '40px'
      }
    })
  }
  
  if (input.includes('图片') || input.includes('image')) {
    components.push({
      id: uuidv4(),
      name: 'c-image',
      layerName: '图片',
      props: {
        ...imageDefaultProps,
        src: 'https://via.placeholder.com/200x150?text=Image',
        left: '100px',
        top: '100px',
        width: '200px',
        height: '150px',
        borderRadius: '8px'
      }
    })
  }
  
  if (input.includes('文本') || input.includes('内容') || input.includes('text')) {
    components.push({
      id: uuidv4(),
      name: 'c-text',
      layerName: '文本内容',
      props: {
        ...textDefaultProps,
        text: '这里是文本内容',
        fontSize: styleInfo.fontSize || '14px',
        color: styleInfo.color || '#333',
        textAlign: styleInfo.textAlign || 'left',
        lineHeight: '1.6',
        left: '50px',
        top: '200px',
        width: '300px',
        height: '100px'
      }
    })
  }
  
  return components
}

// 主要的生成函数
export async function generatePageSchema(input: string): Promise<AIGenerateResult> {
  try {
    // 优先尝试调用真实AI API
    const apiRequest: AIApiRequest = {
      message: input,
      userId: 'user-' + Date.now(), // 可以从用户状态获取
      sessionId: 'session-' + Date.now()
    }
    
    const apiResponse = await callAI(apiRequest)
    
    if (apiResponse.success && apiResponse.data.components && apiResponse.data.components.length > 0) {
      // 处理AI返回的组件数据，确保符合我们的格式
      const processedComponents = apiResponse.data.components.map(component => {
        // 确保每个组件都有必需的字段
        return {
          id: component.id || uuidv4(),
          name: component.name || 'c-text',
          layerName: component.layerName || '组件',
          props: {
            ...textDefaultProps, // 使用默认props作为基础
            ...component.props   // 覆盖AI提供的props
          },
          isHidden: component.isHidden || false,
          isLocked: component.isLocked || false
        }
      })
      
      return {
        description: apiResponse.data.reply,
        components: processedComponents
      }
    }
  } catch (error) {
    console.warn('AI API调用失败，使用本地模板:', error)
  }
  
  // 如果API调用失败，回退到本地模板匹配
  console.log('使用本地模板生成页面...')
  
  // 尝试匹配预定义模板
  const templateMatch = matchTemplate(input)
  
  if (templateMatch && PAGE_TEMPLATES[templateMatch as keyof typeof PAGE_TEMPLATES]) {
    const template = PAGE_TEMPLATES[templateMatch as keyof typeof PAGE_TEMPLATES]
    const components = template.generate()
    
    return {
      description: `根据您的描述，我为您生成了一个${getTemplateName(templateMatch)}页面。页面包含了${components.length}个组件，布局合理，样式美观。您可以点击"应用到编辑器"按钮将其添加到您的设计中，然后根据需要进行调整。`,
      components
    }
  }
  
  // 如果没有匹配到模板，生成自定义组件
  const customComponents = generateCustomComponents(input)
  
  if (customComponents.length > 0) {
    return {
      description: `根据您的描述，我为您生成了${customComponents.length}个页面组件。这些组件根据您的需求进行了初步配置，您可以进一步调整样式和位置。`,
      components: customComponents
    }
  }
  
  // 默认生成一个简单的页面
  return {
    description: '我为您生成了一个简单的页面布局作为起点。您可以基于此进行进一步的设计和调整。',
    components: [
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '默认标题',
        props: {
          ...textDefaultProps,
          text: '页面标题',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#333',
          left: '100px',
          top: '50px',
          width: '200px',
          height: '40px'
        }
      },
      {
        id: uuidv4(),
        name: 'c-text',
        layerName: '默认内容',
        props: {
          ...textDefaultProps,
          text: '这里是页面内容',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.6',
          left: '50px',
          top: '120px',
          width: '300px',
          height: '60px'
        }
      }
    ]
  }
}

function getTemplateName(templateKey: string): string {
  const nameMap: { [key: string]: string } = {
    login: '登录',
    product: '产品展示',
    contact: '联系我们',
    news: '新闻文章'
  }
  return nameMap[templateKey] || '自定义'
}

// 导出模板列表供其他地方使用
export const getAvailableTemplates = () => {
  return Object.keys(PAGE_TEMPLATES).map(key => ({
    key,
    name: getTemplateName(key),
    keywords: PAGE_TEMPLATES[key as keyof typeof PAGE_TEMPLATES].keywords
  }))
}