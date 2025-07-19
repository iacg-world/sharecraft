import { callAI, AIApiRequest, AI_CONFIG } from './aiApi'

// AI API 测试工具
export async function testAIConnection(): Promise<void> {
  console.log('🧪 开始测试AI API连接...')
  
  // 检查配置
  console.log('📋 当前AI配置:')
  console.log('- Provider:', AI_CONFIG.provider)
  console.log('- Base URL:', AI_CONFIG.baseUrl)
  console.log('- Model:', AI_CONFIG.model)
  console.log('- Has API Key:', !!AI_CONFIG.apiKey)
  console.log('- Max Tokens:', AI_CONFIG.maxTokens)
  console.log('- Temperature:', AI_CONFIG.temperature)
  
  if (!AI_CONFIG.apiKey) {
    console.error('❌ API Key未配置，请检查.env文件')
    return
  }
  
  // 测试简单请求
  const testRequest: AIApiRequest = {
    message: '创建一个简单的按钮组件',
    userId: 'test-user',
    sessionId: 'test-session'
  }
  
  try {
    console.log('📤 发送测试请求...')
    const response = await callAI(testRequest)
    
    if (response.success) {
      console.log('✅ AI API连接成功!')
      console.log('📝 响应描述:', response.data.reply)
      console.log('🎨 生成组件数量:', response.data.components?.length || 0)
      
      if (response.data.components && response.data.components.length > 0) {
        console.log('🔍 第一个组件预览:')
        const firstComponent = response.data.components[0]
        console.log('- ID:', firstComponent.id)
        console.log('- 名称:', firstComponent.name)
        console.log('- 图层:', firstComponent.layerName)
        console.log('- 主要属性:', {
          text: firstComponent.props.text,
          left: firstComponent.props.left,
          top: firstComponent.props.top,
          width: firstComponent.props.width,
          height: firstComponent.props.height
        })
      }
    } else {
      console.error('❌ AI API调用失败:')
      console.error('错误信息:', response.error)
      console.error('响应详情:', response.data.reply)
    }
  } catch (error) {
    console.error('💥 AI API测试出现异常:')
    console.error(error)
  }
}

// 在浏览器控制台中可以调用的测试函数
if (typeof window !== 'undefined') {
  // 添加到全局对象，方便在控制台调用
  ;(window as any).testAI = testAIConnection
  console.log('💡 在控制台输入 testAI() 可以测试AI API连接')
}

// 验证配置的函数
export function validateAIConfig(): boolean {
  const issues: string[] = []
  
  if (!AI_CONFIG.apiKey) {
    issues.push('API Key未配置')
  }
  
  if (!AI_CONFIG.provider || !['openai', 'claude', 'custom'].includes(AI_CONFIG.provider)) {
    issues.push('Provider配置无效，必须是 openai、claude 或 custom')
  }
  
  if (!AI_CONFIG.baseUrl) {
    issues.push('Base URL未配置')
  }
  
  if (!AI_CONFIG.model) {
    issues.push('Model未配置')
  }
  
  if (AI_CONFIG.maxTokens <= 0 || AI_CONFIG.maxTokens > 4000) {
    issues.push('Max Tokens配置无效，应该在1-4000之间')
  }
  
  if (AI_CONFIG.temperature < 0 || AI_CONFIG.temperature > 1) {
    issues.push('Temperature配置无效，应该在0-1之间')
  }
  
  if (issues.length > 0) {
    console.error('❌ AI配置验证失败:')
    issues.forEach(issue => console.error('  -', issue))
    return false
  }
  
  console.log('✅ AI配置验证通过')
  return true
}

// 生成配置建议
export function getConfigSuggestions(): void {
  console.log('💡 AI配置建议:')
  
  if (AI_CONFIG.provider === 'openai') {
    console.log('🤖 OpenAI配置建议:')
    console.log('- 推荐模型: gpt-3.5-turbo (性价比高)')
    console.log('- 高质量模型: gpt-4 (成本较高)')
    console.log('- 建议温度: 0.7 (平衡创意和准确性)')
    console.log('- 建议Token数: 1500 (足够生成页面组件)')
  } else if (AI_CONFIG.provider === 'claude') {
    console.log('🤖 Claude配置建议:')
    console.log('- 推荐模型: claude-3-sonnet-20240229')
    console.log('- 高质量模型: claude-3-opus-20240229')
    console.log('- 建议温度: 0.7')
    console.log('- 建议Token数: 1500')
  }
  
  console.log('📊 性能优化建议:')
  console.log('- 开发环境使用较小的模型以节省成本')
  console.log('- 生产环境可以使用更高质量的模型')
  console.log('- 合理设置Token限制以控制成本')
  console.log('- 考虑缓存常用的生成结果')
} 