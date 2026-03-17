/**
 * 主题定义
 * 支持5套预设主题：Dark, Light, Neon, Forest, Ocean
 */

export interface ThemeColors {
  // 背景色
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string

  // 文本色
  textPrimary: string
  textSecondary: string
  textMuted: string

  // 主色调
  accentPrimary: string
  accentSecondary: string
  accentTertiary: string

  // 边框色
  borderPrimary: string
  borderSecondary: string

  // 阴影效果
  shadowPrimary: string
  shadowSecondary: string
  shadowGlow: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
}

/**
 * Dark 主题 - 默认深色主题
 */
export const darkTheme: Theme = {
  id: 'dark',
  name: '暗夜模式',
  description: '经典深色主题，适合夜间使用',
  colors: {
    bgPrimary: '#0a0a0f',
    bgSecondary: '#12121a',
    bgTertiary: '#1a1a24',

    textPrimary: '#e5e5e5',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',

    accentPrimary: '#8b5cf6',
    accentSecondary: '#00d4ff',
    accentTertiary: '#fbbf24',

    borderPrimary: '#2a2a3a',
    borderSecondary: '#4a4a6a',

    shadowPrimary: 'rgba(0, 0, 0, 0.5)',
    shadowSecondary: 'rgba(0, 0, 0, 0.3)',
    shadowGlow: 'rgba(139, 92, 246, 0.3)'
  }
}

/**
 * Light 主题 - 明亮主题
 */
export const lightTheme: Theme = {
  id: 'light',
  name: '明亮模式',
  description: '清新明亮主题，适合日间使用',
  colors: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#e8e8e8',

    textPrimary: '#1a1a1a',
    textSecondary: '#4a4a4a',
    textMuted: '#8a8a8a',

    accentPrimary: '#7c3aed',
    accentSecondary: '#0ea5e9',
    accentTertiary: '#f59e0b',

    borderPrimary: '#d1d1d1',
    borderSecondary: '#b0b0b0',

    shadowPrimary: 'rgba(0, 0, 0, 0.1)',
    shadowSecondary: 'rgba(0, 0, 0, 0.05)',
    shadowGlow: 'rgba(124, 58, 237, 0.2)'
  }
}

/**
 * Neon 主题 - 霓虹赛博朋克主题
 */
export const neonTheme: Theme = {
  id: 'neon',
  name: '霓虹模式',
  description: '炫酷赛博朋克风格，充满未来感',
  colors: {
    bgPrimary: '#0d0221',
    bgSecondary: '#1a0b3d',
    bgTertiary: '#2d1b59',

    textPrimary: '#f0f0ff',
    textSecondary: '#c7c7e8',
    textMuted: '#8a8aaa',

    accentPrimary: '#ff006e',
    accentSecondary: '#00f5ff',
    accentTertiary: '#ffbe0b',

    borderPrimary: '#7209b7',
    borderSecondary: '#b5179e',

    shadowPrimary: 'rgba(255, 0, 110, 0.5)',
    shadowSecondary: 'rgba(0, 245, 255, 0.3)',
    shadowGlow: 'rgba(255, 0, 110, 0.6)'
  }
}

/**
 * Forest 主题 - 森林自然主题
 */
export const forestTheme: Theme = {
  id: 'forest',
  name: '森林模式',
  description: '自然清新风格，让眼睛放松',
  colors: {
    bgPrimary: '#0f1a13',
    bgSecondary: '#1a2e1f',
    bgTertiary: '#2a4430',

    textPrimary: '#e8f5e8',
    textSecondary: '#b8d8b8',
    textMuted: '#708a70',

    accentPrimary: '#4ade80',
    accentSecondary: '#34d399',
    accentTertiary: '#fbbf24',

    borderPrimary: '#2d5a3d',
    borderSecondary: '#3d7a4d',

    shadowPrimary: 'rgba(0, 0, 0, 0.5)',
    shadowSecondary: 'rgba(0, 0, 0, 0.3)',
    shadowGlow: 'rgba(74, 222, 128, 0.4)'
  }
}

/**
 * Ocean 主题 - 深海主题
 */
export const oceanTheme: Theme = {
  id: 'ocean',
  name: '深海模式',
  description: '平静深邃风格，如同海洋深处',
  colors: {
    bgPrimary: '#0a1628',
    bgSecondary: '#132f4c',
    bgTertiary: '#1e4976',

    textPrimary: '#e3f2fd',
    textSecondary: '#90caf9',
    textMuted: '#5c8db8',

    accentPrimary: '#00b4d8',
    accentSecondary: '#0077b6',
    accentTertiary: '#48cae4',

    borderPrimary: '#1a5490',
    borderSecondary: '#2a6ba8',

    shadowPrimary: 'rgba(0, 0, 0, 0.5)',
    shadowSecondary: 'rgba(0, 0, 0, 0.3)',
    shadowGlow: 'rgba(0, 180, 216, 0.4)'
  }
}

/**
 * 所有主题列表
 */
export const themes: Theme[] = [
  darkTheme,
  lightTheme,
  neonTheme,
  forestTheme,
  oceanTheme
]

/**
 * 根据ID获取主题
 */
export function getThemeById(id: string): Theme {
  return themes.find(theme => theme.id === id) || darkTheme
}

/**
 * 获取默认主题
 */
export function getDefaultTheme(): Theme {
  return darkTheme
}
