export interface FigmaUserSettings {
  accessToken: string
  lastUsedUrl?: string
  autoImport?: boolean
  preferredCanvasIndex?: number
}

const FIGMA_SETTINGS_KEY = 'sharecraft_figma_settings'

/**
 * 获取用户的Figma设置
 */
export function getFigmaUserSettings(): FigmaUserSettings {
  try {
    const stored = localStorage.getItem(FIGMA_SETTINGS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('读取Figma设置失败:', error)
  }
  
  // 返回默认设置
  return {
    accessToken: '',
    autoImport: false,
    preferredCanvasIndex: 0
  }
}

/**
 * 保存用户的Figma设置
 */
export function saveFigmaUserSettings(settings: Partial<FigmaUserSettings>): void {
  try {
    const current = getFigmaUserSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(FIGMA_SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('保存Figma设置失败:', error)
  }
}

/**
 * 验证Figma访问令牌格式
 */
export function validateFigmaToken(token: string): boolean {
  // Figma访问令牌通常是64字符的字符串
  return typeof token === 'string' && token.length >= 40 && /^[a-zA-Z0-9_-]+$/.test(token)
}

/**
 * 清除Figma设置
 */
export function clearFigmaSettings(): void {
  try {
    localStorage.removeItem(FIGMA_SETTINGS_KEY)
  } catch (error) {
    console.error('清除Figma设置失败:', error)
  }
}

/**
 * 检查是否已配置Figma
 */
export function isFigmaConfigured(): boolean {
  const settings = getFigmaUserSettings()
  return !!settings.accessToken && validateFigmaToken(settings.accessToken)
}