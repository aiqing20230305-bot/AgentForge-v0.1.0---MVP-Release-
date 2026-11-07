/**
 * 本地化工具函数
 * v2.2.0 - 日期、货币、数字格式化
 */

/**
 * 格式化日期
 */
export function formatDate(
  date: Date,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

/**
 * 格式化货币
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * 格式化数字
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * 格式化相对时间
 */
export interface LocalizationConfig {
  currency: string
  timezone: string
  locale: string
}

const LOCALIZATION_STORAGE_KEY = 'localization_config'

const CURRENCIES: Array<{ code: string; symbol: string; name: string }> = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

const REGION_CURRENCY: Record<string, string> = {
  US: 'USD',
  CN: 'CNY',
  JP: 'JPY',
  KR: 'KRW',
  GB: 'GBP',
  HK: 'HKD',
  SG: 'SGD',
  AU: 'AUD',
  CA: 'CAD',
  TW: 'TWD',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
}

function defaultConfig(): LocalizationConfig {
  return {
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
  }
}

export function getConfig(): LocalizationConfig {
  try {
    const raw = localStorage.getItem(LOCALIZATION_STORAGE_KEY)
    if (!raw) return defaultConfig()
    return { ...defaultConfig(), ...JSON.parse(raw) }
  } catch {
    return defaultConfig()
  }
}

export function updateConfig(updates: Partial<LocalizationConfig>): LocalizationConfig {
  const next = { ...getConfig(), ...updates }
  localStorage.setItem(LOCALIZATION_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function detectCurrency(): string {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
  const region = locale.split('-')[1]?.toUpperCase()
  return (region && REGION_CURRENCY[region]) || 'USD'
}

export function getSupportedCurrencies() {
  return CURRENCIES
}

export function detectTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function formatDateTime(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const value = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(getConfig().locale, {
    timeZone: getConfig().timezone,
    ...options,
  }).format(value)
}

export function utcToLocal(utcDate: Date | string | number): Date {
  return utcDate instanceof Date ? new Date(utcDate.getTime()) : new Date(utcDate)
}

export function localToUtc(localDate: Date): Date {
  return new Date(localDate.getTime())
}

export function formatRelativeTime(
  date: Date | number | string,
  locale: string = 'en-US'
): string {
  const value = date instanceof Date ? date : new Date(date)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = Date.now() - value.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}
