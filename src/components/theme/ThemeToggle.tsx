/**
 * 主题切换组件
 * 支持深色、浅色、自动跟随系统
 */
import React, { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme') as ThemeMode
    return saved || 'dark'
  })
  const [showMenu, setShowMenu] = useState(false)

  // 应用主题
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement

      if (theme === 'auto') {
        // 跟随系统
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
        root.classList.toggle('light', !prefersDark)
      } else {
        // 手动设置
        root.classList.toggle('dark', theme === 'dark')
        root.classList.toggle('light', theme === 'light')
      }
    }

    applyTheme()
    localStorage.setItem('theme', theme)

    // 监听系统主题变化
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = applyTheme
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  const themes = [
    {
      id: 'light' as ThemeMode,
      label: '浅色',
      icon: <Sun size={18} />,
      description: '明亮清晰的界面'
    },
    {
      id: 'dark' as ThemeMode,
      label: '深色',
      icon: <Moon size={18} />,
      description: '护眼舒适的界面'
    },
    {
      id: 'auto' as ThemeMode,
      label: '自动',
      icon: <Monitor size={18} />,
      description: '跟随系统设置'
    }
  ]

  const currentTheme = themes.find(t => t.id === theme)!

  return (
    <div className={`theme-toggle relative ${className}`}>
      {/* 触发按钮 */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        aria-label="切换主题"
      >
        <span className="text-gray-400">{currentTheme.icon}</span>
        <span className="text-sm text-white hidden sm:inline">{currentTheme.label}</span>
      </button>

      {/* 主题菜单 */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* 遮罩 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-64 z-50 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setShowMenu(false)
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    theme === t.id
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* 图标 */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === t.id
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        : 'bg-white/5'
                    }`}
                  >
                    <span className={theme === t.id ? 'text-white' : 'text-gray-400'}>
                      {t.icon}
                    </span>
                  </div>

                  {/* 文字 */}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      {t.label}
                      {theme === t.id && (
                        <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                          当前
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t.description}
                    </div>
                  </div>

                  {/* 选中标记 */}
                  {theme === t.id && (
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Hook: 获取当前实际应用的主题（解析auto）
 */
export function useActualTheme(): 'light' | 'dark' {
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme') as ThemeMode
    if (saved === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return (saved as 'light' | 'dark') || 'dark'
  })

  useEffect(() => {
    const updateTheme = () => {
      const root = document.documentElement
      setActualTheme(root.classList.contains('dark') ? 'dark' : 'light')
    }

    updateTheme()

    // 监听主题变化
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return actualTheme
}
