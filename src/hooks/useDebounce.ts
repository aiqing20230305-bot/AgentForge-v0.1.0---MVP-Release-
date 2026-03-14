/**
 * useDebounce Hook
 * 防抖Hook，用于优化搜索、输入等高频操作
 */

import { useState, useEffect } from 'react'

/**
 * 防抖值Hook - 延迟更新值
 *
 * @param value - 要防抖的值
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的值
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 *
 * useEffect(() => {
 *   // 只在用户停止输入500ms后执行搜索
 *   searchAPI(debouncedSearchTerm)
 * }, [debouncedSearchTerm])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 防抖回调Hook - 延迟执行函数
 *
 * @param callback - 要防抖的回调函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * const debouncedSave = useDebouncedCallback(() => {
 *   saveToServer(data)
 * }, 1000)
 *
 * // 用户每次输入都会调用，但实际只在停止输入1秒后执行
 * <input onChange={() => debouncedSave()} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(newTimeoutId)
  }
}

/**
 * 带立即执行的防抖Hook
 *
 * @param value - 要防抖的值
 * @param delay - 延迟时间
 * @param immediate - 是否立即执行第一次
 * @returns [debouncedValue, isDebouncing]
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const [debouncedSearch, isSearching] = useDebounceWithImmediate(searchTerm, 500, true)
 *
 * {isSearching && <LoadingSpinner />}
 */
export function useDebounceWithImmediate<T>(
  value: T,
  delay: number = 500,
  immediate: boolean = false
): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    setIsDebouncing(true)

    if (immediate && debouncedValue === value) {
      setDebouncedValue(value)
      setIsDebouncing(false)
      return
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setIsDebouncing(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, immediate, debouncedValue])

  return [debouncedValue, isDebouncing]
}
