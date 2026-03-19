/**
 * 主题切换器组件
 * 允许用户在5套预设主题之间切换
 */

import { useState } from 'react'
import { useThemeStore } from '../store/useThemeStore'
import { Palette, Check } from 'lucide-react'

export function ThemeSwitcher() {
  const { currentTheme, setTheme, getAvailableThemes } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  const themes = getAvailableThemes()

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-dark transition-all duration-200"
        title="切换主题"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">{currentTheme.name}</span>
      </button>

      {/* 主题选择面板 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 主题列表 */}
          <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border-dark rounded-lg shadow-lg overflow-hidden z-50">
            <div className="p-3 border-b border-border-dark">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Palette className="w-4 h-4" />
                选择主题
              </h3>
            </div>

            <div className="p-2 max-h-96 overflow-y-auto">
              {themes.map((theme) => {
                const isActive = currentTheme.id === theme.id

                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all duration-200
                      ${isActive
                        ? 'bg-accent-purple/20 border border-accent-purple'
                        : 'hover:bg-bg-tertiary border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 主题信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-text-primary">
                            {theme.name}
                          </h4>
                          {isActive && (
                            <Check className="w-4 h-4 text-accent-purple flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {theme.description}
                        </p>
                      </div>

                      {/* 颜色预览 */}
                      <div className="flex gap-1 flex-shrink-0">
                        <div
                          className="w-6 h-6 rounded border border-border-dark"
                          style={{ backgroundColor: theme.colors.bgPrimary }}
                          title="背景色"
                        />
                        <div
                          className="w-6 h-6 rounded border border-border-dark"
                          style={{ backgroundColor: theme.colors.accentPrimary }}
                          title="主色调"
                        />
                        <div
                          className="w-6 h-6 rounded border border-border-dark"
                          style={{ backgroundColor: theme.colors.accentSecondary }}
                          title="副色调"
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* 底部提示 */}
            <div className="p-3 border-t border-border-dark bg-bg-tertiary/50">
              <p className="text-xs text-text-muted text-center">
                主题偏好已自动保存到本地
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * 紧凑版主题切换器（仅图标）
 */
export function ThemeSwitcherCompact() {
  const { currentTheme, setTheme, getAvailableThemes } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  const themes = getAvailableThemes()

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-dark transition-all duration-200"
        title={`当前主题: ${currentTheme.name}`}
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* 主题选择面板 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 主题网格 */}
          <div className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-border-dark rounded-lg shadow-lg overflow-hidden z-50">
            <div className="p-3 border-b border-border-dark">
              <h3 className="text-xs font-semibold text-text-primary">
                主题
              </h3>
            </div>

            <div className="p-2 grid grid-cols-2 gap-2">
              {themes.map((theme) => {
                const isActive = currentTheme.id === theme.id

                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id)
                      setIsOpen(false)
                    }}
                    className={`
                      p-3 rounded-lg text-left transition-all duration-200
                      ${isActive
                        ? 'ring-2 ring-accent-purple'
                        : 'hover:bg-bg-tertiary'
                      }
                    `}
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.bgPrimary}, ${theme.colors.bgSecondary})`
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: theme.colors.textPrimary }}>
                          {theme.name}
                        </span>
                        {isActive && (
                          <Check className="w-3 h-3" style={{ color: theme.colors.accentPrimary }} />
                        )}
                      </div>
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.accentPrimary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.accentSecondary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.accentTertiary }}
                        />
                      </div>
                    </div>
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

export default ThemeSwitcher
