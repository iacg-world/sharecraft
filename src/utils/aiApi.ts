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
  provider: 'openai', // 从环境变量获取
  apiKey: '', // 从环境变量获取
  baseURL: 'https://api.openai.com/v1',
  maxTokens: 1500,
  temperature: 0,
}

// OpenAI API 调用示例
export async function callOpenAI(request: AIApiRequest): Promise<AIApiResponse> {
  try {
    const prompt = generatePrompt(request.message)

    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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
      console.error('❌ OpenAI API 错误:', data)
      throw new Error(data.error?.message || 'API call failed')
    }

    const aiReply = data.choices[0].message.content
    console.log('✅ OpenAI API 响应成功')
    console.log('📄 原始响应长度:', aiReply.length, '字符')
    console.log('📄 原始响应内容:', aiReply.substring(0, 200) + '...')
    
    const parsedResult = parseAIResponse(aiReply)
    
    console.log('🎨 解析结果:', {
      description: parsedResult.description,
      componentCount: parsedResult.components.length
    })
    
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
  return `你是一个专业的UI/UX设计师助手，专门帮助用户创建网页组件。请根据用户的描述生成相应的页面组件数据。

用户需求：${userMessage}

请严格按照以下JSON格式返回结果，不要包含任何其他文字：

{
  "description": "对生成页面的文字描述",
  "components": [
    {
      "id": "组件的唯一ID",
      "name": "c-text | c-image",
      "layerName": "组件名称",
      "props": {
        "text": "文本内容（只有c-text需要）",
        "src": "图片地址（只有c-image需要）",
        "fontSize": "14px",
        "fontWeight": "normal | bold",
        "color": "#333333",
        "backgroundColor": "#ffffff",
        "textAlign": "left | center | right",
        "lineHeight": "1.5",
        "borderStyle": "none | solid",
        "borderColor": "#000000",
        "borderWidth": "0px",
        "borderRadius": "0px",
        "paddingLeft": "0px",
        "paddingRight": "0px", 
        "paddingTop": "0px",
        "paddingBottom": "0px",
        "left": "位置x坐标（如：50px）",
        "top": "位置y坐标（如：50px）",
        "width": "组件宽度（如：200px）",
        "height": "组件高度（如：30px）",
        "position": "absolute",
        "opacity": "1"
      }
    }
  ]
}

重要要求：
1. 组件类型只能是 "c-text" 或 "c-image"
2. 每个组件必须有唯一的id（使用uuid格式）
3. 合理安排组件位置，避免重叠
4. 文本组件使用c-text，图片组件使用c-image
5. 所有尺寸和位置值必须包含px单位
6. 返回的必须是有效的JSON格式

请根据用户需求生成合适的组件布局。`
}

// 解析AI返回的结果
function parseAIResponse(aiReply: string): { description: string; components: ComponentData[] } {
  try {
    // 清理AI返回的内容，移除可能的markdown代码块标记
    let cleanedReply = aiReply.trim()
    
    // 移除可能的markdown代码块
    cleanedReply = cleanedReply.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
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
        id: comp.id || `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: comp.name === 'c-image' ? 'c-image' : 'c-text', // 默认为c-text
        layerName: comp.layerName || '组件',
        props: {
          // 基础属性
          position: 'absolute',
          ...comp.props
        },
        isHidden: comp.isHidden || false,
        isLocked: comp.isLocked || false
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
      components
    }
  } catch (error) {
    console.error('Parse AI response error:', error)
    console.error('AI response content:', aiReply)
    
    return {
      description: '解析AI响应时出错，请重试。原始回复：' + aiReply.substring(0, 200),
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
    AI_CONFIG.temperature = parseFloat(process.env.VUE_APP_AI_TEMPERATURE) || 0.7
  }
  
}

// 初始化配置
configureAI()