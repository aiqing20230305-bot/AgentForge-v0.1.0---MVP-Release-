/**
 * 全局设置Store
 * 持久化保存用户偏好设置
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 用户设置接口
 */
export interface UserSettings {
  // 主题设置
  theme: 'dark' | 'light' | 'auto'

  // 音效设置
  audioEnabled: boolean
  masterVolume: number      // 主音量 0-100
  sfxVolume: number          // 音效音量 0-100
  musicVolume: number        // 背景音乐音量 0-100

  // 通知设置
  notificationsEnabled: boolean
  desktopNotifications: boolean
  soundNotifications: boolean

  // UI设置
  dailyQuestAutoShow: boolean     // 每日任务自动显示
  expBarVisible: boolean          // 经验条可见性
  particlesEnabled: boolean       // 粒子特效
  reducedMotion: boolean          // 减少动画

  // 面板布局
  panelLayout: 'default' | 'compact' | 'expanded'
  defaultTab: 'tasks' | 'energy' | 'skills' | 'achievements' | 'battle' | 'leaderboard' | 'invite'

  // 语言设置（预留）
  language: 'zh-CN' | 'en-US'

  // 性能设置
  fps: 30 | 60
  virtualScrollEnabled: boolean
  lazyLoadImages: boolean
}

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',

  audioEnabled: true,
  masterVolume: 70,
  sfxVolume: 70,
  musicVolume: 50,

  notificationsEnabled: true,
  desktopNotifications: true,
  soundNotifications: true,

  dailyQuestAutoShow: true,
  expBarVisible: true,
  particlesEnabled: true,
  reducedMotion: false,

  panelLayout: 'default',
  defaultTab: 'tasks',

  language: 'zh-CN',

  fps: 60,
  virtualScrollEnabled: true,
  lazyLoadImages: true
}

/**
 * 设置Store接口
 */
interface SettingsStore {
  settings: UserSettings

  // 更新设置
  updateSettings: (updates: Partial<UserSettings>) => void

  // 重置设置
  resetSettings: () => void

  // 获取单个设置
  getSetting: <K extends keyof UserSettings>(key: K) => UserSettings[K]

  // 导出设置
  exportSettings: () => string

  // 导入设置
  importSettings: (jsonString: string) => boolean
}

/**
 * 创建设置Store
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      /**
       * 更新设置
       */
      updateSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates
          }
        }))

        // 应用设置到全局
        applySettingsToDOM(get().settings)
      },

      /**
       * 重置设置
       */
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS })
        applySettingsToDOM(DEFAULT_SETTINGS)
      },

      /**
       * 获取单个设置
       */
      getSetting: (key) => {
        return get().settings[key]
      },

      /**
       * 导出设置为JSON字符串
       */
      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2)
      },

      /**
       * 从JSON字符串导入设置
       */
      importSettings: (jsonString) => {
        try {
          const imported = JSON.parse(jsonString)

          // 验证导入的数据
          if (typeof imported !== 'object' || imported === null) {
            return false
          }

          // 合并设置（保留默认值）
          set((state) => ({
            settings: {
              ...state.settings,
              ...imported
            }
          }))

          applySettingsToDOM(get().settings)
          return true
        } catch (error) {
          console.error('[Settings] Import failed:', error)
          return false
        }
      }
    }),
    {
      name: 'agentforge-settings',
      version: 1
    }
  )
)

/**
 * 应用设置到DOM
 */
function applySettingsToDOM(settings: UserSettings) {
  const root = document.documentElement

  // 应用主题
  if (settings.theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
  } else if (settings.theme === 'dark') {
    root.classList.remove('light')
    root.classList.add('dark')
  } else {
    // Auto theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
    root.classList.toggle('light', !prefersDark)
  }

  // 应用减少动画
  if (settings.reducedMotion) {
    root.classList.add('reduce-motion')
  } else {
    root.classList.remove('reduce-motion')
  }

  // 应用粒子特效
  root.style.setProperty('--particles-enabled', settings.particlesEnabled ? '1' : '0')

  // 应用FPS限制
  root.style.setProperty('--max-fps', settings.fps.toString())

  console.log('[Settings] Applied to DOM:', settings)
}

/**
 * 初始化设置（在应用启动时调用）
 */
export function initializeSettings() {
  const { settings } = useSettingsStore.getState()
  applySettingsToDOM(settings)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { settings } = useSettingsStore.getState()
    if (settings.theme === 'auto') {
      applySettingsToDOM(settings)
    }
  })

  console.log('[Settings] Initialized')
}

/**
 * 使用示例：
 *
 * // 1. 获取设置
 * const { settings } = useSettingsStore()
 *
 * // 2. 更新设置
 * const { updateSettings } = useSettingsStore()
 * updateSettings({ theme: 'dark', audioEnabled: false })
 *
 * // 3. 获取单个设置
 * const { getSetting } = useSettingsStore()
 * const theme = getSetting('theme')
 *
 * // 4. 重置设置
 * const { resetSettings } = useSettingsStore()
 * resetSettings()
 *
 * // 5. 导出/导入设置
 * const { exportSettings, importSettings } = useSettingsStore()
 * const json = exportSettings()
 * importSettings(json)
 */
