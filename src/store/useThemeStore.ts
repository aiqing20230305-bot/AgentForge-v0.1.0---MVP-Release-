/**
 * 主题状态管理 Store
 * 使用 Zustand + 本地存储持久化
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme, themes, getThemeById, getDefaultTheme } from '../themes/themeDefinitions'

/**
 * 主题 Store 接口
 */
interface ThemeStore {
  // 当前主题
  currentTheme: Theme

  // 切换主题
  setTheme: (themeId: string) => void

  // 获取所有可用主题
  getAvailableThemes: () => Theme[]

  // 重置为默认主题
  resetTheme: () => void
}

/**
 * 创建主题 Store
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: getDefaultTheme(),

      /**
       * 切换主题
       */
      setTheme: (themeId: string) => {
        const theme = getThemeById(themeId)
        set({ currentTheme: theme })
        applyThemeToDOM(theme)
        console.log('[Theme] Theme changed to:', theme.name)
      },

      /**
       * 获取所有可用主题
       */
      getAvailableThemes: () => {
        return themes
      },

      /**
       * 重置为默认主题
       */
      resetTheme: () => {
        const defaultTheme = getDefaultTheme()
        set({ currentTheme: defaultTheme })
        applyThemeToDOM(defaultTheme)
        console.log('[Theme] Theme reset to default:', defaultTheme.name)
      }
    }),
    {
      name: 'agentforge-theme',
      version: 1
    }
  )
)

/**
 * 应用主题到 DOM（通过 CSS Variables）
 */
function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement
  const { colors } = theme

  // 设置 CSS 变量
  root.style.setProperty('--color-bg-primary', colors.bgPrimary)
  root.style.setProperty('--color-bg-secondary', colors.bgSecondary)
  root.style.setProperty('--color-bg-tertiary', colors.bgTertiary)

  root.style.setProperty('--color-text-primary', colors.textPrimary)
  root.style.setProperty('--color-text-secondary', colors.textSecondary)
  root.style.setProperty('--color-text-muted', colors.textMuted)

  root.style.setProperty('--color-accent-primary', colors.accentPrimary)
  root.style.setProperty('--color-accent-secondary', colors.accentSecondary)
  root.style.setProperty('--color-accent-tertiary', colors.accentTertiary)

  root.style.setProperty('--color-border-primary', colors.borderPrimary)
  root.style.setProperty('--color-border-secondary', colors.borderSecondary)

  root.style.setProperty('--shadow-primary', colors.shadowPrimary)
  root.style.setProperty('--shadow-secondary', colors.shadowSecondary)
  root.style.setProperty('--shadow-glow', colors.shadowGlow)

  // 添加主题标识符类名
  root.setAttribute('data-theme', theme.id)

  console.log('[Theme] Applied to DOM:', theme.id)
}

/**
 * 初始化主题（在应用启动时调用）
 */
export function initializeTheme() {
  const { currentTheme } = useThemeStore.getState()
  applyThemeToDOM(currentTheme)
  console.log('[Theme] Initialized with:', currentTheme.name)
}

/**
 * 使用示例：
 *
 * // 1. 在组件中使用当前主题
 * const { currentTheme } = useThemeStore()
 *
 * // 2. 切换主题
 * const { setTheme } = useThemeStore()
 * setTheme('neon')
 *
 * // 3. 获取所有可用主题
 * const { getAvailableThemes } = useThemeStore()
 * const themes = getAvailableThemes()
 *
 * // 4. 重置主题
 * const { resetTheme } = useThemeStore()
 * resetTheme()
 */
