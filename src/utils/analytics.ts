/**
 * Google Analytics 4 集成
 * Phase 5: 数据分析和用户行为追踪
 */

// GA4配置
const GA_MEASUREMENT_ID = process.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

// 事件类型
export type AnalyticsEvent =
  | 'page_view'
  | 'agent_create'
  | 'agent_delete'
  | 'task_complete'
  | 'battle_start'
  | 'level_up'
  | 'share_click'
  | 'theme_change'
  | 'search'
  | 'error'

/**
 * 初始化Google Analytics
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return

  // 跳过开发环境
  if (import.meta.env.DEV) {
    console.log('[Analytics] Skipped in development mode')
    return
  }

  // 加载gtag.js
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // 初始化gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }

  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // 手动发送
    anonymize_ip: true // 匿名IP
  })

  // 暴露到window
  ;(window as any).gtag = gtag

  console.log('[Analytics] Initialized with ID:', GA_MEASUREMENT_ID)
}

/**
 * 发送页面浏览事件
 */
export function trackPageView(pagePath?: string) {
  if (!window.gtag) return

  const path = pagePath || window.location.pathname + window.location.search

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title
  })

  console.log('[Analytics] Page view:', path)
}

/**
 * 发送自定义事件
 */
export function trackEvent(
  eventName: AnalyticsEvent,
  params?: Record<string, any>
) {
  if (!window.gtag) {
    console.log('[Analytics] Event (not sent):', eventName, params)
    return
  }

  window.gtag('event', eventName, params)

  console.log('[Analytics] Event:', eventName, params)
}

/**
 * 追踪用户操作
 */
export const track = {
  // Agent相关
  agentCreate: (agentName: string, agentType: string) => {
    trackEvent('agent_create', { agent_name: agentName, agent_type: agentType })
  },

  agentDelete: (agentId: string) => {
    trackEvent('agent_delete', { agent_id: agentId })
  },

  agentLevelUp: (agentId: string, newLevel: number) => {
    trackEvent('level_up', { agent_id: agentId, level: newLevel })
  },

  // 任务相关
  taskComplete: (taskId: string, duration: number) => {
    trackEvent('task_complete', { task_id: taskId, duration_ms: duration })
  },

  // 战斗相关
  battleStart: (agentId: string, opponentId: string) => {
    trackEvent('battle_start', { agent_id: agentId, opponent_id: opponentId })
  },

  // 分享相关
  shareClick: (platform: 'twitter' | 'wechat' | 'copy' | 'download') => {
    trackEvent('share_click', { platform })
  },

  // 主题相关
  themeChange: (theme: 'light' | 'dark' | 'auto') => {
    trackEvent('theme_change', { theme })
  },

  // 搜索相关
  search: (query: string, resultCount: number) => {
    trackEvent('search', { search_term: query, result_count: resultCount })
  },

  // 错误相关
  error: (errorMessage: string, errorStack?: string) => {
    trackEvent('error', {
      error_message: errorMessage,
      error_stack: errorStack?.slice(0, 500) // 限制长度
    })
  }
}

/**
 * 设置用户属性
 */
export function setUserProperty(propertyName: string, value: any) {
  if (!window.gtag) return

  window.gtag('set', 'user_properties', {
    [propertyName]: value
  })
}

/**
 * 设置用户ID
 */
export function setUserId(userId: string) {
  if (!window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId
  })
}

// TypeScript类型扩展
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default {
  init: initAnalytics,
  trackPageView,
  trackEvent,
  track,
  setUserProperty,
  setUserId
}
