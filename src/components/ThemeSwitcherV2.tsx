/**
 * 主题切换器 V2
 * Light / Dark / Auto 三态切换
 * 支持跟随系统主题、日出日落自动切换
 */

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { ThemeMode, ContrastMode, applyThemeToDOM } from '../config/themeColors'

interface ThemeSwitcherV2Props {
  compact?: boolean
}

export function ThemeSwitcherV2({ compact = false }: ThemeSwitcherV2Props) {
  const [currentMode, setCurrentMode] = useState<ThemeMode>('auto')
  const [contrastMode, setContrastMode] = useState<ContrastMode>('normal')
  const [isOpen, setIsOpen] = useState(false)
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false)

  // 从 localStorage 读取偏好
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null
    const savedContrast = localStorage.getItem('theme-contrast') as ContrastMode | null
    const savedAutoSchedule = localStorage.getItem('theme-auto-schedule') === 'true'

    if (savedMode) setCurrentMode(savedMode)
    if (savedContrast) setContrastMode(savedContrast)
    if (savedAutoSchedule) setAutoScheduleEnabled(savedAutoSchedule)

    // 应用主题
    applyThemeToDOM(savedMode || 'auto', savedContrast || 'normal')
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    if (currentMode !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyThemeToDOM('auto', contrastMode)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [currentMode, contrastMode])

  // 日出日落自动切换
  useEffect(() => {
    if (!autoScheduleEnabled) return

    const updateThemeByTime = () => {
      const hour = new Date().getHours()
      // 日出 6:00 切换到浅色，日落 18:00 切换到深色
      const shouldBeDark = hour < 6 || hour >= 18

      if (shouldBeDark && currentMode !== 'dark') {
        handleModeChange('dark')
      } else if (!shouldBeDark && currentMode !== 'light') {
        handleModeChange('light')
      }
    }

    // 立即检查一次
    updateThemeByTime()

    // 每分钟检查一次
    const interval = setInterval(updateThemeByTime, 60000)

    return () => clearInterval(interval)
  }, [autoScheduleEnabled, currentMode])

  const handleModeChange = (mode: ThemeMode) => {
    setCurrentMode(mode)
    localStorage.setItem('theme-mode', mode)
    applyThemeToDOM(mode, contrastMode)
  }

  const handleContrastChange = (contrast: ContrastMode) => {
    setContrastMode(contrast)
    localStorage.setItem('theme-contrast', contrast)
    applyThemeToDOM(currentMode, contrast)
  }

  const handleAutoScheduleToggle = () => {
    const newValue = !autoScheduleEnabled
    setAutoScheduleEnabled(newValue)
    localStorage.setItem('theme-auto-schedule', newValue.toString())
  }

  const modes: Array<{ value: ThemeMode; icon: typeof Sun; label: string; description: string }> = [
    {
      value: 'light',
      icon: Sun,
      label: '浅色',
      description: '始终使用浅色主题',
    },
    {
      value: 'dark',
      icon: Moon,
      label: '深色',
      description: '始终使用深色主题',
    },
    {
      value: 'auto',
      icon: Monitor,
      label: '自动',
      description: '跟随系统主题设置',
    },
  ]

  const getCurrentIcon = () => {
    const mode = modes.find((m) => m.value === currentMode)
    if (!mode) return Monitor

    // Auto模式下根据实际主题显示对应图标
    if (currentMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? Moon : Sun
    }

    return mode.icon
  }

  const Icon = getCurrentIcon()

  // 紧凑模式
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-dark transition-all duration-200"
          title={`当前主题: ${modes.find((m) => m.value === currentMode)?.label}`}
        >
          <Icon className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-bg-secondary border border-border-dark rounded-lg shadow-lg overflow-hidden z-50">
              <div className="p-2">
                {modes.map((mode) => {
                  const ModeIcon = mode.icon
                  const isActive = currentMode === mode.value

                  return (
                    <button
                      key={mode.value}
                      onClick={() => {
                        handleModeChange(mode.value)
                        setIsOpen(false)
                      }}
                      className={`
                        w-full p-2 rounded-lg text-left transition-all duration-200 flex items-center gap-2
                        ${isActive ? 'bg-accent-purple/20 text-accent-purple' : 'hover:bg-bg-tertiary'}
                      `}
                    >
                      <ModeIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{mode.label}</span>
                      {isActive && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // 完整模式
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-dark transition-all duration-200"
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {modes.find((m) => m.value === currentMode)?.label}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border-dark rounded-lg shadow-xl overflow-hidden z-50">
            {/* 标题 */}
            <div className="p-4 border-b border-border-dark">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Icon className="w-4 h-4" />
                主题设置
              </h3>
            </div>

            {/* 主题模式选择 */}
            <div className="p-3">
              <label className="text-xs font-medium text-text-secondary block mb-2">
                主题模式
              </label>
              <div className="space-y-2">
                {modes.map((mode) => {
                  const ModeIcon = mode.icon
                  const isActive = currentMode === mode.value

                  return (
                    <button
                      key={mode.value}
                      onClick={() => handleModeChange(mode.value)}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all duration-200
                        ${isActive
                          ? 'bg-accent-purple/20 border border-accent-purple'
                          : 'bg-bg-tertiary hover:bg-bg-hover border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <ModeIcon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-accent-purple' : 'text-text-secondary'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${isActive ? 'text-accent-purple' : 'text-text-primary'}`}>
                              {mode.label}
                            </span>
                            {isActive && <Check className="w-4 h-4 text-accent-purple" />}
                          </div>
                          <p className="text-xs text-text-secondary">
                            {mode.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 高对比度选项 */}
            <div className="p-3 border-t border-border-dark">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-medium text-text-secondary block mb-0.5">
                    高对比度模式
                  </span>
                  <span className="text-xs text-text-muted">
                    提高可访问性（WCAG AAA）
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={contrastMode === 'high'}
                    onChange={(e) => handleContrastChange(e.target.checked ? 'high' : 'normal')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-bg-tertiary rounded-full peer-checked:bg-accent-purple transition-colors duration-200"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            {/* 日出日落自动切换 */}
            <div className="p-3 border-t border-border-dark">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-medium text-text-secondary block mb-0.5">
                    日出日落自动切换
                  </span>
                  <span className="text-xs text-text-muted">
                    6:00切换到浅色，18:00切换到深色
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={autoScheduleEnabled}
                    onChange={handleAutoScheduleToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-bg-tertiary rounded-full peer-checked:bg-accent-purple transition-colors duration-200"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>

            {/* 预览 */}
            <div className="p-3 border-t border-border-dark bg-bg-tertiary/50">
              <div className="text-xs text-text-muted text-center">
                主题偏好已自动保存
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeSwitcherV2
