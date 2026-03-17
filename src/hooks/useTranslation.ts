/**
 * useTranslation Hook Wrapper
 * 封装 react-i18next 的 useTranslation hook，提供类型安全的翻译功能
 */

import { useTranslation as useI18nTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

// 翻译键类型定义（基于 common.json 的结构）
export type TranslationKeys =
  | 'app_name'
  | 'welcome'
  | 'common.create'
  | 'common.delete'
  | 'common.edit'
  | 'common.save'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.close'
  | 'common.search'
  | 'common.filter'
  | 'common.refresh'
  | 'common.export'
  | 'common.import'
  | 'common.settings'
  | 'common.help'
  | 'common.logout'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.warning'
  | 'common.info'
  | 'agent.title'
  | 'agent.create'
  | 'agent.list'
  | 'agent.detail'
  | 'agent.name'
  | 'agent.avatar'
  | 'agent.level'
  | 'agent.experience'
  | 'agent.vitality'
  | 'agent.skills'
  | 'agent.status.active'
  | 'agent.status.idle'
  | 'agent.status.working'
  | 'agent.status.offline'
  | 'task.title'
  | 'task.create'
  | 'task.list'
  | 'task.detail'
  | 'task.name'
  | 'task.description'
  | 'task.priority.high'
  | 'task.priority.medium'
  | 'task.priority.low'
  | 'task.status.pending'
  | 'task.status.in_progress'
  | 'task.status.completed'
  | 'task.status.failed'
  | 'task.assign'
  | 'task.start'
  | 'task.complete'
  | 'subscription.free'
  | 'subscription.pro'
  | 'subscription.upgrade'
  | 'subscription.manage'
  | 'subscription.usage'
  | 'subscription.limit_reached'
  | 'subscription.unlimited'
  | 'features.ai_recommendation'
  | 'features.performance_optimization'
  | 'features.custom_theme'
  | 'features.advanced_analytics'
  | 'features.team_collaboration'
  | 'features.priority_support'

interface UseTranslationReturn {
  t: TFunction
  i18n: ReturnType<typeof useI18nTranslation>['i18n']
  ready: boolean
  currentLanguage: string
  changeLanguage: (lng: string) => Promise<void>
}

/**
 * useTranslation - 类型安全的翻译 Hook
 *
 * @example
 * const { t, currentLanguage, changeLanguage } = useTranslation()
 *
 * // 基本使用
 * t('common.create') // "创建" or "Create"
 *
 * // 带插值
 * t('welcome', { name: 'John' }) // "欢迎, John!"
 *
 * // 切换语言
 * changeLanguage('en-US')
 */
export function useTranslation(): UseTranslationReturn {
  const { t, i18n, ready } = useI18nTranslation()

  const currentLanguage = i18n.language

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng)
      localStorage.setItem('i18n_language', lng)
    } catch (error) {
      console.error('Failed to change language:', error)
      throw error
    }
  }

  return {
    t,
    i18n,
    ready,
    currentLanguage,
    changeLanguage,
  }
}

/**
 * 获取当前语言的本地化名称
 */
export function getLanguageNativeName(languageCode: string): string {
  const names: Record<string, string> = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ja-JP': '日本語',
    'ko-KR': '한국어',
  }
  return names[languageCode] || languageCode
}

/**
 * 获取当前语言的国旗 emoji
 */
export function getLanguageFlag(languageCode: string): string {
  const flags: Record<string, string> = {
    'zh-CN': '🇨🇳',
    'en-US': '🇺🇸',
    'ja-JP': '🇯🇵',
    'ko-KR': '🇰🇷',
  }
  return flags[languageCode] || '🌐'
}

export default useTranslation
