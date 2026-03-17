/**
 * 语言切换器组件
 * Language switcher component with dropdown menu
 */

import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

// 支持的语言列表
const LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳', nativeName: '简体中文' },
  { code: 'en-US', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
] as const

export type LanguageCode = typeof LANGUAGES[number]['code']

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full'
  className?: string
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取当前语言
  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0]

  // 切换语言
  const handleLanguageChange = async (languageCode: LanguageCode) => {
    try {
      await i18n.changeLanguage(languageCode)
      // 保存到 localStorage
      localStorage.setItem('i18n_language', languageCode)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* 触发按钮 - 紧凑版 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          aria-label="Select language"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLanguage.code.split('-')[0].toUpperCase()}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 下拉菜单 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                    language.code === currentLanguage.code
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {language.nativeName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {language.name}
                    </div>
                  </div>
                  {language.code === currentLanguage.code && (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Full variant - 完整版带标题
  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Language / 语言
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              language.code === currentLanguage.code
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
          >
            <span className="text-2xl">{language.flag}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {language.nativeName}
              </div>
              {language.code === currentLanguage.code && (
                <div className="text-xs text-blue-500 mt-0.5">Current</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSwitcher
