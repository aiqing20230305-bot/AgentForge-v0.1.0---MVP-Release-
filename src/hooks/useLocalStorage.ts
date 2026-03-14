/**
 * useLocalStorage Hook
 * 带类型安全和SSR支持的LocalStorage Hook
 */

import { useState, useEffect, useCallback } from 'react'

type SetValue<T> = T | ((val: T) => T)

/**
 * 使用 localStorage 存储状态
 *
 * @param key - localStorage key
 * @param initialValue - 初始值
 * @returns [value, setValue, removeValue]
 *
 * @example
 * const [name, setName, removeName] = useLocalStorage('username', 'Guest')
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // 获取初始值
  const readValue = useCallback((): T => {
    // SSR支持
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  // 设置值
  const setValue = useCallback(
    (value: SetValue<T>) => {
      // SSR支持
      if (typeof window === 'undefined') {
        console.warn(`Cannot set localStorage key "${key}" during SSR`)
        return
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value

        window.localStorage.setItem(key, JSON.stringify(newValue))
        setStoredValue(newValue)

        // 触发自定义事件以便其他Hook实例同步
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, newValue }
          })
        )
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // 删除值
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(`Cannot remove localStorage key "${key}" during SSR`)
      return
    }

    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)

      window.dispatchEvent(
        new CustomEvent('local-storage', {
          detail: { key, newValue: initialValue }
        })
      )
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // 监听storage事件（跨标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e && e.key && e.key !== key) {
        return
      }

      if (e instanceof StorageEvent) {
        if (e.key !== key || e.storageArea !== window.localStorage) {
          return
        }

        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue
          setStoredValue(newValue)
        } catch (error) {
          console.warn('Error parsing storage event:', error)
        }
      } else {
        // CustomEvent (同页面其他实例)
        const detail = (e as CustomEvent).detail
        if (detail.key === key) {
          setStoredValue(detail.newValue)
        }
      }
    }

    // 监听原生storage事件（跨标签页）
    window.addEventListener('storage', handleStorageChange as EventListener)

    // 监听自定义事件（同页面）
    window.addEventListener('local-storage', handleStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener)
      window.removeEventListener('local-storage', handleStorageChange as EventListener)
    }
  }, [key, initialValue])

  // 组件挂载时读取最新值
  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  return [storedValue, setValue, removeValue]
}

/**
 * 带过期时间的 localStorage Hook
 */
interface StorageWithExpiry<T> {
  value: T
  expiry: number
}

export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryMs: number = 24 * 60 * 60 * 1000 // 默认24小时
): [T, (value: SetValue<T>) => void, () => void, boolean] {
  const [isExpired, setIsExpired] = useState(false)

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const data: StorageWithExpiry<T> = JSON.parse(item)
      const now = Date.now()

      if (now > data.expiry) {
        window.localStorage.removeItem(key)
        setIsExpired(true)
        return initialValue
      }

      setIsExpired(false)
      return data.value
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') return

      try {
        const newValue = value instanceof Function ? value(storedValue) : value
        const data: StorageWithExpiry<T> = {
          value: newValue,
          expiry: Date.now() + expiryMs
        }

        window.localStorage.setItem(key, JSON.stringify(data))
        setStoredValue(newValue)
        setIsExpired(false)
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, expiryMs]
  )

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
      setIsExpired(false)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue, isExpired]
}
