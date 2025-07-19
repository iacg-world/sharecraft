import { ComponentData } from '@/store/editor'

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
  // 可配置不同的AI服务提供商
  provider: 'openai', // 'openai' | 'claude' | 'custom'
  apiKey: '', // 从环境变量获取
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  maxTokens: 1500,
  temperature: 0.7
}

// OpenAI API 调用示例
export async function callOpenAI(request: AIApiRequest): Promise<AIApiResponse> {
  try {
    const prompt = generatePrompt(request.message)
    
    const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are a UI/UX design assistant that generates page layouts based on user descriptions. Always respond with both a description and component data in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API call failed')
    }

    const aiReply = data.choices[0].message.content
    const parsedResult = parseAIResponse(aiReply)
    
    return {
      success: true,
      data: {
        reply: parsedResult.description,
        components: parsedResult.components,
        confidence: 0.8
      }
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        reply: '抱歉，AI服务暂时不可用，请稍后重试。',
        confidence: 0
      }
    }
  }
}

// Claude API 调用示例
export async function callClaude(request: AIApiRequest): Promise<AIApiResponse> {
  try {
    const prompt = generatePrompt(request.message)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: AI_CONFIG.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
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
        confidence: 0.9
      }
    }
  } catch (error) {
    console.error('Claude API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        reply: '抱歉，AI服务暂时不可用，请稍后重试。',
        confidence: 0
      }
    }
  }
}

// 生成AI提示词
function generatePrompt(userMessage: string): string {
  return `
作为一个专业的UI/UX设计师助手，请根据用户的描述生成页面组件。

用户需求：${userMessage}

请按照以下JSON格式返回结果：
{
  "description": "对生成页面的文字描述",
  "components": [
    {
      "id": "unique-id",
      "name": "c-text | c-image",
      "layerName": "组件名称",
      "props": {
        "text": "文本内容",
        "fontSize": "14px",
        "color": "#333",
        "left": "50px",
        "top": "50px",
        "width": "200px",
        "height": "30px",
        // 其他样式属性...
      }
    }
  ]
}

可用的组件类型：
- c-text: 文本组件，支持各种文字样式
- c-image: 图片组件，支持图片展示

可用的样式属性：
- 文字：fontSize, fontWeight, color, textAlign, lineHeight
- 布局：left, top, width, height, position
- 边框：borderStyle, borderColor, borderWidth, borderRadius
- 背景：backgroundColor
- 内边距：paddingLeft, paddingRight, paddingTop, paddingBottom
- 阴影：boxShadow
- 透明度：opacity

请确保返回有效的JSON格式，并且组件位置不要重叠。
`
}

// 解析AI返回的结果
function parseAIResponse(aiReply: string): { description: string; components: ComponentData[] } {
  try {
    // 尝试提取JSON部分
    const jsonMatch = aiReply.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        description: parsed.description || '已生成页面组件',
        components: parsed.components || []
      }
    }
    
    // 如果没有找到JSON，返回默认结果
    return {
      description: aiReply,
      components: []
    }
  } catch (error) {
    console.error('Parse AI response error:', error)
    return {
      description: '解析AI响应时出错，请重试。',
      components: []
    }
  }
}

// 主要的AI调用函数
export async function callAI(request: AIApiRequest): Promise<AIApiResponse> {
  // 检查是否配置了API Key
  if (!AI_CONFIG.apiKey) {
    console.warn('AI API Key not configured, using fallback')
    return {
      success: false,
      error: 'AI服务未配置',
      data: {
        reply: '请配置AI服务的API Key',
        confidence: 0
      }
    }
  }

  // 根据配置选择不同的AI服务
  switch (AI_CONFIG.provider) {
    case 'openai':
      return callOpenAI(request)
    case 'claude':
      return callClaude(request)
    default:
      return {
        success: false,
        error: 'Unsupported AI provider',
        data: {
          reply: '不支持的AI服务提供商',
          confidence: 0
        }
      }
  }
}

// 环境变量配置
export function configureAI() {
  // 从环境变量读取配置
  if (import.meta.env.VITE_AI_API_KEY) {
    AI_CONFIG.apiKey = import.meta.env.VITE_AI_API_KEY
  }
  
  if (import.meta.env.VITE_AI_PROVIDER) {
    AI_CONFIG.provider = import.meta.env.VITE_AI_PROVIDER
  }
  
  if (import.meta.env.VITE_AI_BASE_URL) {
    AI_CONFIG.baseUrl = import.meta.env.VITE_AI_BASE_URL
  }
}

// 初始化配置
configureAI()