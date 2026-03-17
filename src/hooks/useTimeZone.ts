/**
 * 时区管理Hook
 * 提供时区检测、设置和时间转换功能
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getConfig,
  updateConfig,
  detectTimezone,
  formatDateTime,
  formatRelativeTime,
  utcToLocal,
  localToUtc,
} from '../utils/localization'

export interface UseTimeZoneResult {
  timezone: string
  setTimezone: (timezone: string) => void
  detectAndSetTimezone: () => void
  formatDate: (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  formatRelative: (date: Date | number | string) => string
  toLocal: (utcDate: Date | string | number) => Date
  toUtc: (localDate: Date) => Date
  supportedTimezones: string[]
}

// 常用时区列表
const COMMON_TIMEZONES = [
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Toronto',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
]

/**
 * 时区管理Hook
 */
export function useTimeZone(): UseTimeZoneResult {
  const [timezone, setTimezoneState] = useState<string>(() => {
    return getConfig().timezone
  })

  // 监听配置变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'localization_config' && e.newValue) {
        try {
          const config = JSON.parse(e.newValue)
          setTimezoneState(config.timezone)
        } catch (error) {
          console.error('Failed to parse localization config:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  /**
   * 设置时区
   */
  const setTimezone = useCallback((newTimezone: string) => {
    updateConfig({ timezone: newTimezone })
    setTimezoneState(newTimezone)
  }, [])

  /**
   * 自动检测并设置时区
   */
  const detectAndSetTimezone = useCallback(() => {
    const detectedTimezone = detectTimezone()
    setTimezone(detectedTimezone)
  }, [setTimezone])

  /**
   * 格式化日期（使用当前时区）
   */
  const formatDate = useCallback(
    (date: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      return formatDateTime(date, options)
    },
    [timezone] // 依赖timezone，确保时区变化时重新格式化
  )

  /**
   * 格式化相对时间
   */
  const formatRelative = useCallback((date: Date | number | string) => {
    return formatRelativeTime(date)
  }, [])

  /**
   * UTC转本地时间
   */
  const toLocal = useCallback(
    (utcDate: Date | string | number) => {
      return utcToLocal(utcDate)
    },
    [timezone]
  )

  /**
   * 本地时间转UTC
   */
  const toUtc = useCallback((localDate: Date) => {
    return localToUtc(localDate)
  }, [])

  return {
    timezone,
    setTimezone,
    detectAndSetTimezone,
    formatDate,
    formatRelative,
    toLocal,
    toUtc,
    supportedTimezones: COMMON_TIMEZONES,
  }
}

/**
 * 本地时间Hook - 自动转换UTC时间到本地时间并格式化显示
 * @param utcDate UTC时间
 * @param options 格式化选项
 */
export function useLocalTime(
  utcDate: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const { formatDate } = useTimeZone()

  return utcDate ? formatDate(utcDate, options) : ''
}

/**
 * 相对时间Hook - 显示相对时间并自动更新
 * @param date 日期
 * @param updateInterval 更新间隔（毫秒），默认60秒
 */
export function useRelativeTime(
  date: Date | string | number | null | undefined,
  updateInterval: number = 60000
): string {
  const { formatRelative } = useTimeZone()
  const [relativeTime, setRelativeTime] = useState<string>(() => {
    return date ? formatRelative(date) : ''
  })

  useEffect(() => {
    if (!date) {
      setRelativeTime('')
      return
    }

    // 立即更新一次
    setRelativeTime(formatRelative(date))

    // 定期更新相对时间
    const intervalId = setInterval(() => {
      setRelativeTime(formatRelative(date))
    }, updateInterval)

    return () => clearInterval(intervalId)
  }, [date, formatRelative, updateInterval])

  return relativeTime
}
