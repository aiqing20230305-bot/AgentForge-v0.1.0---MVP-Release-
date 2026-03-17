/**
 * 本地化工具集
 * 提供时区检测、日期时间格式化、货币格式化、数字格式化等功能
 */

export interface LocalizationConfig {
  locale: string // 'zh-CN', 'en-US', 'ja-JP', 'ko-KR'
  timezone: string // IANA timezone, e.g., 'Asia/Shanghai'
  currency: string // ISO 4217, e.g., 'CNY', 'USD'
}

// 默认配置
const DEFAULT_CONFIG: LocalizationConfig = {
  locale: 'zh-CN',
  timezone: 'Asia/Shanghai',
  currency: 'CNY',
}

// 当前配置（从localStorage读取或使用默认值）
let currentConfig: LocalizationConfig = loadConfig()

/**
 * 从localStorage加载配置
 */
function loadConfig(): LocalizationConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG

  const saved = localStorage.getItem('localization_config')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse localization config:', e)
    }
  }

  // 自动检测
  return {
    locale: detectLocale(),
    timezone: detectTimezone(),
    currency: detectCurrency(),
  }
}

/**
 * 保存配置到localStorage
 */
function saveConfig(config: LocalizationConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('localization_config', JSON.stringify(config))
  currentConfig = config
}

/**
 * 自动检测用户时区
 * 使用Intl API获取IANA时区标识符
 */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    console.error('Failed to detect timezone:', e)
    return 'UTC'
  }
}

/**
 * 自动检测用户语言环境
 */
export function detectLocale(): string {
  if (typeof window === 'undefined') return 'zh-CN'

  const language = navigator.language || (navigator as any).userLanguage

  // 标准化语言代码
  if (language.startsWith('zh')) return 'zh-CN'
  if (language.startsWith('en')) return 'en-US'
  if (language.startsWith('ja')) return 'ja-JP'
  if (language.startsWith('ko')) return 'ko-KR'

  return 'zh-CN' // 默认中文
}

/**
 * 根据语言环境检测货币
 */
export function detectCurrency(): string {
  const locale = detectLocale()

  const currencyMap: Record<string, string> = {
    'zh-CN': 'CNY',
    'en-US': 'USD',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
  }

  return currencyMap[locale] || 'USD'
}

/**
 * 获取当前配置
 */
export function getConfig(): LocalizationConfig {
  return { ...currentConfig }
}

/**
 * 更新配置
 */
export function updateConfig(partial: Partial<LocalizationConfig>): void {
  currentConfig = { ...currentConfig, ...partial }
  saveConfig(currentConfig)
}

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @param options Intl.DateTimeFormat选项
 */
export function formatDateTime(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }

  try {
    return new Intl.DateTimeFormat(currentConfig.locale, {
      timeZone: currentConfig.timezone,
      ...options,
    }).format(dateObj)
  } catch (e) {
    console.error('Failed to format date:', e)
    return dateObj.toISOString()
  }
}

/**
 * 格式化相对时间（例如："3分钟前"、"2小时前"）
 * @param date 日期对象或时间戳
 */
export function formatRelativeTime(date: Date | number | string): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }

  const now = Date.now()
  const diffMs = now - dateObj.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  const { locale } = currentConfig

  // 未来时间
  if (diffMs < 0) {
    const absDiffSeconds = Math.abs(diffSeconds)
    const absDiffMinutes = Math.abs(diffMinutes)
    const absDiffHours = Math.abs(diffHours)
    const absDiffDays = Math.abs(diffDays)

    if (absDiffSeconds < 60) {
      return locale === 'zh-CN' ? '即将' :
             locale === 'ja-JP' ? 'まもなく' :
             locale === 'ko-KR' ? '곧' : 'soon'
    }
    if (absDiffMinutes < 60) {
      return locale === 'zh-CN' ? `${absDiffMinutes}分钟后` :
             locale === 'ja-JP' ? `${absDiffMinutes}分後` :
             locale === 'ko-KR' ? `${absDiffMinutes}분 후` :
             `in ${absDiffMinutes} minute${absDiffMinutes > 1 ? 's' : ''}`
    }
    if (absDiffHours < 24) {
      return locale === 'zh-CN' ? `${absDiffHours}小时后` :
             locale === 'ja-JP' ? `${absDiffHours}時間後` :
             locale === 'ko-KR' ? `${absDiffHours}시간 후` :
             `in ${absDiffHours} hour${absDiffHours > 1 ? 's' : ''}`
    }
    if (absDiffDays < 30) {
      return locale === 'zh-CN' ? `${absDiffDays}天后` :
             locale === 'ja-JP' ? `${absDiffDays}日後` :
             locale === 'ko-KR' ? `${absDiffDays}일 후` :
             `in ${absDiffDays} day${absDiffDays > 1 ? 's' : ''}`
    }
  }

  // 过去时间
  if (diffSeconds < 60) {
    return locale === 'zh-CN' ? '刚刚' :
           locale === 'ja-JP' ? 'たった今' :
           locale === 'ko-KR' ? '방금' : 'just now'
  }

  if (diffMinutes < 60) {
    return locale === 'zh-CN' ? `${diffMinutes}分钟前` :
           locale === 'ja-JP' ? `${diffMinutes}分前` :
           locale === 'ko-KR' ? `${diffMinutes}분 전` :
           `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }

  if (diffHours < 24) {
    return locale === 'zh-CN' ? `${diffHours}小时前` :
           locale === 'ja-JP' ? `${diffHours}時間前` :
           locale === 'ko-KR' ? `${diffHours}시간 전` :
           `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }

  if (diffDays === 1) {
    return locale === 'zh-CN' ? '昨天' :
           locale === 'ja-JP' ? '昨日' :
           locale === 'ko-KR' ? '어제' : 'yesterday'
  }

  if (diffDays < 7) {
    return locale === 'zh-CN' ? `${diffDays}天前` :
           locale === 'ja-JP' ? `${diffDays}日前` :
           locale === 'ko-KR' ? `${diffDays}일 전` :
           `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return locale === 'zh-CN' ? `${weeks}周前` :
           locale === 'ja-JP' ? `${weeks}週間前` :
           locale === 'ko-KR' ? `${weeks}주 전` :
           `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }

  if (diffMonths < 12) {
    return locale === 'zh-CN' ? `${diffMonths}个月前` :
           locale === 'ja-JP' ? `${diffMonths}ヶ月前` :
           locale === 'ko-KR' ? `${diffMonths}개월 전` :
           `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  }

  return locale === 'zh-CN' ? `${diffYears}年前` :
         locale === 'ja-JP' ? `${diffYears}年前` :
         locale === 'ko-KR' ? `${diffYears}년 전` :
         `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币代码（可选，使用当前配置的货币）
 * @param locale 语言环境（可选，使用当前配置的locale）
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string
): string {
  const currencyCode = currency || currentConfig.currency
  const localeCode = locale || currentConfig.locale

  try {
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch (e) {
    console.error('Failed to format currency:', e)
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

/**
 * 格式化数字（添加千位分隔符）
 * @param value 数字值
 * @param options Intl.NumberFormat选项
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(currentConfig.locale, options).format(value)
  } catch (e) {
    console.error('Failed to format number:', e)
    return value.toString()
  }
}

/**
 * 格式化百分比
 * @param value 百分比值（0-1之间）
 * @param decimals 小数位数（默认0）
 */
export function formatPercent(value: number, decimals: number = 0): string {
  try {
    return new Intl.NumberFormat(currentConfig.locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  } catch (e) {
    console.error('Failed to format percent:', e)
    return `${(value * 100).toFixed(decimals)}%`
  }
}

/**
 * 将UTC时间转换为本地时间
 * @param utcDate UTC日期
 */
export function utcToLocal(utcDate: Date | string | number): Date {
  const date = typeof utcDate === 'string' || typeof utcDate === 'number'
    ? new Date(utcDate)
    : utcDate

  return new Date(date.toLocaleString('en-US', { timeZone: currentConfig.timezone }))
}

/**
 * 将本地时间转换为UTC时间
 * @param localDate 本地日期
 */
export function localToUtc(localDate: Date): Date {
  return new Date(localDate.toISOString())
}

/**
 * 获取支持的语言环境列表
 */
export function getSupportedLocales(): Array<{ code: string; name: string; nativeName: string }> {
  return [
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
    { code: 'en-US', name: 'English (US)', nativeName: 'English' },
    { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  ]
}

/**
 * 获取支持的货币列表
 */
export function getSupportedCurrencies(): Array<{ code: string; symbol: string; name: string }> {
  return [
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ]
}
