import { ComponentData } from '@/store/editor'
import { getAIUserSettings, type AIUserSettings } from './aiSettings'

export interface AIApiRequest {
  message: string
  context?: string
  userId?: string
  sessionId?: string
}

export interface AIApiResponse {
  success: boolean
  data: {
    reply: string
    components?: ComponentData[]
    confidence: number
  }
  error?: string
}

// AI API配置
export const AI_CONFIG = {
  provider: 'openai', // 从环境变量获取
  apiKey: '', // 从环境变量获取
  baseURL: 'https://api.openai.com/v1',
  maxTokens: 1500,
  temperature: 0,
}

// OpenAI API 调用示例
export async function callOpenAI(
  request: AIApiRequest,
): Promise<AIApiResponse> {
  try {
    const prompt = generatePrompt(request.message)

    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a UI/UX design assistant that generates page layouts based on user descriptions. Always respond with both a description and component data in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ OpenAI API 错误:', data)
      throw new Error(data.error?.message || 'API call failed')
    }

    const aiReply = data.choices[0].message.content

    const parsedResult = parseAIResponse(aiReply)

    return {
      success: true,
      data: {
        reply: parsedResult.description,
        components: parsedResult.components,
        confidence: 0.8,
      },
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        reply: '抱歉，AI服务暂时不可用，请稍后重试。',
        confidence: 0,
      },
    }
  }
}

// Claude API 调用示例
export async function callClaude(
  request: AIApiRequest,
): Promise<AIApiResponse> {
  try {
    const prompt = generatePrompt(request.message)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: AI_CONFIG.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'API call failed')
    }

    const aiReply = data.content[0].text
    const parsedResult = parseAIResponse(aiReply)

    return {
      success: true,
      data: {
        reply: parsedResult.description,
        components: parsedResult.components,
        confidence: 0.9,
      },
    }
  } catch (error) {
    console.error('Claude API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        reply: '抱歉，AI服务暂时不可用，请稍后重试。',
        confidence: 0,
      },
    }
  }
}

// 画布边界常量
const CANVAS_CONSTRAINTS = {
  width: 375,
  minComponentWidth: 20,
  maxComponentWidth: 373,
  minComponentHeight: 20,
  edgeDistance: 2,
} as const

// 生成AI提示词
function generatePrompt(userMessage: string): string {
  return `你是 ShareCraft 零代码建站平台的 UI/UX 设计师助手，专门帮助用户创建移动端活动页/落地页/分享页的组件布局。

## 用户需求
${userMessage}

## 画布约束条件
- 画布宽度：${CANVAS_CONSTRAINTS.width}px（移动端标准宽度）
- 组件宽度范围：${CANVAS_CONSTRAINTS.minComponentWidth}px ~ ${CANVAS_CONSTRAINTS.maxComponentWidth}px
- 组件最小高度：${CANVAS_CONSTRAINTS.minComponentHeight}px
- 边缘安全距离：${CANVAS_CONSTRAINTS.edgeDistance}px
- left 取值范围：0px ~ ${CANVAS_CONSTRAINTS.width - CANVAS_CONSTRAINTS.minComponentWidth}px
- 组件不能超出画布右边界：left + width <= ${CANVAS_CONSTRAINTS.width - CANVAS_CONSTRAINTS.edgeDistance}px

## 组件类型说明
仅支持两种组件类型：
1. **c-text**：文本组件，用于标题、正文、按钮、标签、链接等所有文字内容
2. **c-image**：图片组件，用于展示图片、图标、背景图等

## 返回格式要求
请严格返回以下 JSON 格式，不要包含任何其他文字或 markdown 标记：

{
  "description": "对生成页面的简要描述",
  "components": [
    {
      "id": "uuid-v4格式的唯一标识",
      "name": "c-text",
      "layerName": "组件在图层面板中的显示名称",
      "props": {
        "text": "文本内容（c-text必填）",
        "fontSize": "字号，如 14px、16px、24px",
        "fontWeight": "normal | bold",
        "fontStyle": "normal | italic",
        "fontFamily": "字体族，可为空",
        "letterSpacing": "字间距，如 1px",
        "textDecoration": "none | underline | line-through",
        "lineHeight": "行高，如 1、1.5、2",
        "textAlign": "left | center | right",
        "color": "文字颜色，如 #333333",
        "backgroundColor": "背景色，如 #ffffff 或空字符串表示透明",
        "opacity": "透明度，0~1 之间",
        "borderStyle": "none | solid | dashed | dotted",
        "borderColor": "边框颜色，如 #000000",
        "borderWidth": "边框宽度，如 0、1px、2px",
        "borderRadius": "圆角，如 0、4px、8px、50%",
        "boxShadow": "阴影，如 0 2px 8px rgba(0,0,0,0.1) 或 0 0 0 #000000",
        "paddingTop": "内边距，如 0px、8px、12px",
        "paddingBottom": "内边距",
        "paddingLeft": "内边距",
        "paddingRight": "内边距",
        "position": "absolute（固定值）",
        "left": "x坐标，如 0px、50px",
        "top": "y坐标，如 0px、100px",
        "width": "宽度，如 200px、318px",
        "height": "高度，如 30px、40px",
        "actionType": "点击行为类型，可选值：'' | 'url'",
        "url": "跳转链接（actionType为url时生效）"
      }
    },
    {
      "id": "uuid-v4格式",
      "name": "c-image",
      "layerName": "图片组件名称",
      "props": {
        "src": "图片URL地址（c-image必填）",
        "width": "宽度",
        "height": "高度",
        "left": "x坐标",
        "top": "y坐标",
        "position": "absolute",
        "borderRadius": "圆角",
        "opacity": "透明度",
        "boxShadow": "阴影"
      }
    }
  ]
}

## 设计规范
1. **布局原则**
   - 组件从上到下依次排列，top 值递增
   - 相邻组件间保持合理间距（建议 8px~24px）
   - 同类内容水平对齐
   - 重要信息放在视觉焦点位置

2. **尺寸规范**
   - 标题字号：20px~28px，fontWeight: bold
   - 副标题：16px~18px
   - 正文：14px~16px
   - 辅助文字：12px~14px，颜色偏灰如 #666666 或 #999999
   - 按钮高度：36px~48px，圆角 4px~8px
   - 图片宽度：建议 318px 或 ${CANVAS_CONSTRAINTS.maxComponentWidth}px 以适应画布

3. **配色建议**
   - 主色调：#1890ff（蓝色）、#52c41a（绿色）、#ff4d4f（红色）
   - 正文颜色：#333333 或 #000000
   - 次要文字：#666666
   - 辅助文字：#999999
   - 背景色：#ffffff、#f5f5f5、#fafafa

4. **交互元素**
   - 可点击按钮设置 actionType: 'url' 和对应 url
   - 按钮样式：backgroundColor 使用主题色，color 为 #ffffff
   - 链接文字可使用 textDecoration: 'underline'

5. **ID格式**
   - 使用 UUID v4 格式，如：550e8400-e29b-41d4-a716-446655440000

## 禁止事项
- 不要生成 c-text 和 c-image 以外的组件类型
- 不要遗漏 position: "absolute" 属性
- 不要让组件超出画布边界（left + width > ${CANVAS_CONSTRAINTS.width - CANVAS_CONSTRAINTS.edgeDistance}px）
- 不要使用不带 px 单位的尺寸值（除了 lineHeight、opacity）
- 不要返回空的 components 数组
- 不要在 JSON 外添加任何说明文字

请根据用户需求生成合适的组件布局。`
}

// 解析AI返回的结果
function parseAIResponse(aiReply: string): {
  description: string
  components: ComponentData[]
} {
  try {
    // 清理AI返回的内容，移除可能的markdown代码块标记
    let cleanedReply = aiReply.trim()

    // 移除可能的markdown代码块
    cleanedReply = cleanedReply
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')

    // 尝试直接解析整个响应
    let parsed: any
    try {
      parsed = JSON.parse(cleanedReply)
    } catch {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = cleanedReply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found')
      }
    }

    // 验证和处理组件数据
    const components = (parsed.components || []).map((comp: any) => {
      // 确保组件有必需的字段
      const component: ComponentData = {
        id:
          comp.id ||
          `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: comp.name === 'c-image' ? 'c-image' : 'c-text', // 默认为c-text
        layerName: comp.layerName || '组件',
        props: {
          // 基础属性
          position: 'absolute',
          ...comp.props,
        },
        isHidden: comp.isHidden || false,
        isLocked: comp.isLocked || false,
      }

      // 确保文本组件有text属性
      if (component.name === 'c-text' && !component.props.text) {
        component.props.text = '文本内容'
      }

      // 确保图片组件有src属性
      if (component.name === 'c-image' && !component.props.src) {
        component.props.src = 'https://via.placeholder.com/200x150?text=Image'
      }

      return component
    })

    return {
      description: parsed.description || '已生成页面组件',
      components,
    }
  } catch (error) {
    console.error('Parse AI response error:', error)
    console.error('AI response content:', aiReply)

    return {
      description:
        '解析AI响应时出错，请重试。原始回复：' + aiReply.substring(0, 200),
      components: [],
    }
  }
}

// 主要的AI调用函数
export async function callAI(request: AIApiRequest): Promise<AIApiResponse> {
  // 优先使用用户配置，如果没有则使用环境变量配置
  const userSettings = getAIUserSettings()
  const config = {
    provider: userSettings.apiKey ? userSettings.provider : AI_CONFIG.provider,
    apiKey: userSettings.apiKey || AI_CONFIG.apiKey,
    baseUrl: userSettings.baseUrl || AI_CONFIG.baseURL,
    model: userSettings.model || 'gpt-3.5-turbo',
    maxTokens: userSettings.maxTokens || AI_CONFIG.maxTokens,
    temperature: userSettings.temperature || AI_CONFIG.temperature,
  }

  // 检查是否配置了API Key
  if (!config.apiKey) {
    console.warn('AI API Key not configured, using fallback')
    return {
      success: false,
      error: 'AI服务未配置',
      data: {
        reply: '请在AI设置中配置API Key，或在环境变量中配置',
        confidence: 0,
      },
    }
  }

  // 根据配置选择不同的AI服务
  switch (config.provider) {
    case 'openai':
      return callOpenAIWithConfig(request, config)
    case 'claude':
      return callClaudeWithConfig(request, config)
    default:
      return {
        success: false,
        error: 'Unsupported AI provider',
        data: {
          reply: '不支持的AI服务提供商',
          confidence: 0,
        },
      }
  }
}

// 环境变量配置
export function configureAI() {
  // 从环境变量读取配置
  if (process.env.VUE_APP_AI_API_KEY) {
    AI_CONFIG.apiKey = process.env.VUE_APP_AI_API_KEY
  }
  if (process.env.VUE_APP_AI_PROVIDER) {
    AI_CONFIG.provider = process.env.VUE_APP_AI_PROVIDER
  }

  if (process.env.VUE_APP_AI_BASE_URL) {
    AI_CONFIG.baseURL = process.env.VUE_APP_AI_BASE_URL
  }

  if (process.env.VUE_APP_AI_MAX_TOKENS) {
    AI_CONFIG.maxTokens = parseInt(process.env.VUE_APP_AI_MAX_TOKENS) || 1500
  }

  if (process.env.VUE_APP_AI_TEMPERATURE) {
    AI_CONFIG.temperature =
      parseFloat(process.env.VUE_APP_AI_TEMPERATURE) || 0.7
  }
}

// 带自定义配置的OpenAI API调用
export async function callOpenAIWithConfig(
  request: AIApiRequest,
  config: any,
): Promise<AIApiResponse> {
  try {
    const prompt = generatePrompt(request.message)

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a UI/UX design assistant that generates page layouts based on user descriptions. Always respond with both a description and component data in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ OpenAI API 错误:', data)
      throw new Error(data.error?.message || 'API call failed')
    }

    const aiReply = data.choices[0].message.content

    const parsedResult = parseAIResponse(aiReply)

    return {
      success: true,
      data: {
        reply: parsedResult.description,
        components: parsedResult.components,
        confidence: 0.8,
      },
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        reply: '抱歉，AI服务暂时不可用，请稍后重试。',
        confidence: 0,
      },
    }
  }
}

// 带自定义配置的Claude API调用
export async function callClaudeWithConfig(
  request: AIApiRequest,
  config: any,
): Promise<AIApiResponse> {
  try {
    const prompt = generatePrompt(request.message)

    const response = await fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Claude API 错误:', data)
      throw new Error(data.error?.message || 'API call failed')
    }

    const aiReply = data.content[0].text

    const parsedResult = parseAIResponse(aiReply)

    return {
      success: true,
      data: {
        reply: parsedResult.description,
        components: parsedResult.components,
        confidence: 0.9,
      },
    }
  } catch (error) {
    console.error('Claude API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        reply: '抱歉，AI服务暂时不可用，请稍后重试。',
        confidence: 0,
      },
    }
  }
}

// 初始化配置
configureAI()
