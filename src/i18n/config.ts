/**
 * i18n 配置
 * 多语言国际化配置
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入翻译资源
import zhCN from './locales/zh-CN/common.json'
import enUS from './locales/en-US/common.json'
import jaJP from './locales/ja-JP/common.json'
import koKR from './locales/ko-KR/common.json'

const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
  'ja-JP': {
    translation: jaJP,
  },
  'ko-KR': {
    translation: koKR,
  },
}

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 将 i18n 实例传递给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources,
    fallbackLng: 'zh-CN', // 默认语言
    lng: localStorage.getItem('i18n_language') || undefined, // 从 localStorage 读取语言偏好
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React 已经安全地转义了
    },

    detection: {
      // 语言检测顺序
      order: ['localStorage', 'navigator', 'htmlTag'],
      // 缓存语言选择
      caches: ['localStorage'],
      // localStorage 的 key
      lookupLocalStorage: 'i18n_language',
    },
  })

export default i18n
