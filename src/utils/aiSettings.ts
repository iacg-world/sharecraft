export interface AIUserSettings {
  provider: 'openai' | 'claude' | 'custom'
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
}

// 默认设置
export const DEFAULT_AI_SETTINGS: AIUserSettings = {
  provider: 'openai',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  maxTokens: 1500,
  temperature: 0.7,
}

// 不同provider的预设配置
export const PROVIDER_PRESETS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (推荐)', cost: '低' },
      { value: 'gpt-4', label: 'GPT-4', cost: '中' },
      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo', cost: '中' },
      { value: 'gpt-4o', label: 'GPT-4o (最新)', cost: '中' },
    ],
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      {
        value: 'claude-3-haiku-20240307',
        label: 'Claude 3 Haiku (快速)',
        cost: '低',
      },
      {
        value: 'claude-3-sonnet-20240229',
        label: 'Claude 3 Sonnet (推荐)',
        cost: '中',
      },
      {
        value: 'claude-3-opus-20240229',
        label: 'Claude 3 Opus (最强)',
        cost: '高',
      },
    ],
  },
  custom: {
    baseUrl: '',
    models: [{ value: 'custom-model', label: '自定义模型', cost: '?' }],
  },
}

const STORAGE_KEY = 'ai_user_settings'

// 获取用户设置
export function getAIUserSettings(): AIUserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 合并默认设置，确保所有字段都存在
      return { ...DEFAULT_AI_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.warn('读取AI设置失败:', error)
  }
  return { ...DEFAULT_AI_SETTINGS }
}

// 保存用户设置
export function saveAIUserSettings(settings: Partial<AIUserSettings>): void {
  try {
    const currentSettings = getAIUserSettings()
    const newSettings = { ...currentSettings, ...settings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    console.log('AI设置已保存:', newSettings)
  } catch (error) {
    console.error('保存AI设置失败:', error)
  }
}

// 重置为默认设置
export function resetAIUserSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('重置AI设置失败:', error)
  }
}

// 验证设置是否有效
export function validateAIUserSettings(settings: AIUserSettings): string[] {
  const errors: string[] = []

  if (!settings.apiKey.trim()) {
    errors.push('API Key不能为空')
  }

  if (!settings.baseUrl.trim()) {
    errors.push('Base URL不能为空')
  } else {
    try {
      new URL(settings.baseUrl)
    } catch {
      errors.push('Base URL格式无效')
    }
  }

  if (!settings.model.trim()) {
    errors.push('模型不能为空')
  }

  if (settings.maxTokens <= 0 || settings.maxTokens > 8000) {
    errors.push('Max Tokens应该在1-8000之间')
  }

  if (settings.temperature < 0 || settings.temperature > 2) {
    errors.push('Temperature应该在0-2之间')
  }

  return errors
}

// 获取模型选项
export function getModelOptions(provider: string, baseURL: string) {
  return (
    PROVIDER_PRESETS[provider as keyof typeof PROVIDER_PRESETS]?.models || []
  )
}

// 根据provider更新baseUrl
export function getDefaultBaseUrl(provider: string): string {
  return (
    PROVIDER_PRESETS[provider as keyof typeof PROVIDER_PRESETS]?.baseUrl || ''
  )
}
