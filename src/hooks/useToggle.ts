/**
 * useToggle Hook
 * 布尔值切换Hook，简化开关状态管理
 */

import { useState, useCallback, Dispatch, SetStateAction } from 'react'

/**
 * 基础Toggle Hook
 *
 * @param initialValue - 初始值（默认false）
 * @returns [value, toggle, setTrue, setFalse, setValue]
 *
 * @example
 * const [isOpen, toggle, open, close] = useToggle()
 *
 * <button onClick={toggle}>Toggle</button>
 * <button onClick={open}>Open</button>
 * <button onClick={close}>Close</button>
 */
export function useToggle(
  initialValue: boolean = false
): [
  boolean,
  () => void,
  () => void,
  () => void,
  Dispatch<SetStateAction<boolean>>
] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return [value, toggle, setTrue, setFalse, setValue]
}

/**
 * 带回调的Toggle Hook
 *
 * @param initialValue - 初始值
 * @param onToggle - 切换时的回调函数
 * @returns [value, toggle]
 *
 * @example
 * const [isOpen, toggle] = useToggleWithCallback(false, (newValue) => {
 *   console.log('Toggled to:', newValue)
 *   trackEvent('modal_toggle', { open: newValue })
 * })
 */
export function useToggleWithCallback(
  initialValue: boolean = false,
  onToggle?: (value: boolean) => void
): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => {
      const newValue = !prev
      onToggle?.(newValue)
      return newValue
    })
  }, [onToggle])

  return [value, toggle]
}

/**
 * 自动重置的Toggle Hook
 *
 * @param initialValue - 初始值
 * @param resetDelay - 自动重置延迟（毫秒）
 * @returns [value, toggle]
 *
 * @example
 * // 点击后2秒自动关闭
 * const [isVisible, show] = useAutoResetToggle(false, 2000)
 *
 * <button onClick={show}>Show Notification</button>
 * {isVisible && <Notification />}
 */
export function useAutoResetToggle(
  initialValue: boolean = false,
  resetDelay: number = 3000
): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(true)

    const timeoutId = setTimeout(() => {
      setValue(false)
    }, resetDelay)

    return () => clearTimeout(timeoutId)
  }, [resetDelay])

  return [value, toggle]
}

/**
 * 多状态Toggle Hook（循环切换多个状态）
 *
 * @param values - 状态数组
 * @param initialIndex - 初始索引（默认0）
 * @returns [currentValue, next, prev, reset, setIndex]
 *
 * @example
 * const [theme, nextTheme, prevTheme] = useMultiToggle(['light', 'dark', 'auto'])
 *
 * <button onClick={nextTheme}>
 *   Current theme: {theme}
 * </button>
 */
export function useMultiToggle<T>(
  values: readonly T[],
  initialIndex: number = 0
): [T, () => void, () => void, () => void, (index: number) => void] {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % values.length)
  }, [values.length])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + values.length) % values.length)
  }, [values.length])

  const reset = useCallback(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const setIndex = useCallback((index: number) => {
    if (index >= 0 && index < values.length) {
      setCurrentIndex(index)
    }
  }, [values.length])

  return [values[currentIndex], next, prev, reset, setIndex]
}

/**
 * 带加载状态的Toggle Hook
 *
 * @param initialValue - 初始值
 * @returns [value, toggle, isToggling]
 *
 * @example
 * const [isEnabled, toggle, isToggling] = useToggleWithLoading()
 *
 * const handleToggle = async () => {
 *   toggle()
 *   await updateSettings({ enabled: !isEnabled })
 * }
 *
 * <button onClick={handleToggle} disabled={isToggling}>
 *   {isToggling ? 'Updating...' : isEnabled ? 'Disable' : 'Enable'}
 * </button>
 */
export function useToggleWithLoading(
  initialValue: boolean = false
): [boolean, () => void, boolean] {
  const [value, setValue] = useState(initialValue)
  const [isToggling, setIsToggling] = useState(false)

  const toggle = useCallback(() => {
    setIsToggling(true)
    setValue((prev) => !prev)

    // 模拟异步操作完成
    setTimeout(() => {
      setIsToggling(false)
    }, 0)
  }, [])

  return [value, toggle, isToggling]
}

/**
 * 带条件判断的Toggle Hook
 *
 * @param initialValue - 初始值
 * @param canToggle - 判断是否可以切换的函数
 * @returns [value, toggle]
 *
 * @example
 * const [isEnabled, toggle] = useConditionalToggle(
 *   false,
 *   (currentValue, nextValue) => {
 *     if (nextValue && !hasPermission) {
 *       alert('No permission')
 *       return false
 *     }
 *     return true
 *   }
 * )
 */
export function useConditionalToggle(
  initialValue: boolean = false,
  canToggle: (currentValue: boolean, nextValue: boolean) => boolean
): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => {
      const nextValue = !prev
      if (canToggle(prev, nextValue)) {
        return nextValue
      }
      return prev
    })
  }, [canToggle])

  return [value, toggle]
}

/**
 * 计数的Toggle Hook（记录切换次数）
 *
 * @param initialValue - 初始值
 * @returns [value, toggle, count, reset]
 *
 * @example
 * const [isOpen, toggle, toggleCount, resetCount] = useCountedToggle()
 *
 * <div>Toggled {toggleCount} times</div>
 */
export function useCountedToggle(
  initialValue: boolean = false
): [boolean, () => void, number, () => void] {
  const [value, setValue] = useState(initialValue)
  const [count, setCount] = useState(0)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
    setCount((prev) => prev + 1)
  }, [])

  const reset = useCallback(() => {
    setCount(0)
  }, [])

  return [value, toggle, count, reset]
}

/**
 * 受控的Toggle Hook（可外部控制）
 *
 * @param value - 受控值
 * @param onChange - 变化回调
 * @returns [value, toggle]
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false)
 * const [value, toggle] = useControlledToggle(isOpen, setIsOpen)
 *
 * // 可以通过toggle或setIsOpen控制
 */
export function useControlledToggle(
  value: boolean,
  onChange: (value: boolean) => void
): [boolean, () => void] {
  const toggle = useCallback(() => {
    onChange(!value)
  }, [value, onChange])

  return [value, toggle]
}

/**
 * 带延迟的Toggle Hook
 *
 * @param initialValue - 初始值
 * @param delay - 延迟时间（毫秒）
 * @returns [value, toggleWithDelay, cancelToggle, isPending]
 *
 * @example
 * // 500ms后才真正切换状态
 * const [isOpen, toggle, cancel, isPending] = useDelayedToggle(false, 500)
 *
 * <button onClick={toggle}>Open (delayed)</button>
 * <button onClick={cancel}>Cancel</button>
 * {isPending && <span>Pending...</span>}
 */
export function useDelayedToggle(
  initialValue: boolean = false,
  delay: number = 500
): [boolean, () => void, () => void, boolean] {
  const [value, setValue] = useState(initialValue)
  const [pendingValue, setPendingValue] = useState<boolean | null>(null)
  const timeoutRef = useState<NodeJS.Timeout>()

  const toggleWithDelay = useCallback(() => {
    const nextValue = !value

    setPendingValue(nextValue)

    const timeoutId = setTimeout(() => {
      setValue(nextValue)
      setPendingValue(null)
    }, delay)

    timeoutRef[0] = timeoutId
  }, [value, delay])

  const cancelToggle = useCallback(() => {
    if (timeoutRef[0]) {
      clearTimeout(timeoutRef[0])
      setPendingValue(null)
    }
  }, [])

  return [value, toggleWithDelay, cancelToggle, pendingValue !== null]
}

/**
 * 分组Toggle Hook（多个相关的toggle）
 *
 * @param initialValues - 初始值对象
 * @returns [values, togglers, setters]
 *
 * @example
 * const [flags, toggles, sets] = useGroupedToggle({
 *   showMenu: false,
 *   showSidebar: true,
 *   showNotifications: false
 * })
 *
 * <button onClick={toggles.showMenu}>Toggle Menu</button>
 * <button onClick={sets.showSidebar.setTrue}>Show Sidebar</button>
 */
export function useGroupedToggle<T extends Record<string, boolean>>(
  initialValues: T
): [
  T,
  Record<keyof T, () => void>,
  Record<keyof T, { setTrue: () => void; setFalse: () => void }>
] {
  const [values, setValues] = useState(initialValues)

  const togglers = Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = () => {
      setValues((prev) => ({
        ...prev,
        [key]: !prev[key]
      }))
    }
    return acc
  }, {} as Record<keyof T, () => void>)

  const setters = Object.keys(initialValues).reduce((acc, key) => {
    acc[key as keyof T] = {
      setTrue: () => {
        setValues((prev) => ({ ...prev, [key]: true }))
      },
      setFalse: () => {
        setValues((prev) => ({ ...prev, [key]: false }))
      }
    }
    return acc
  }, {} as Record<keyof T, { setTrue: () => void; setFalse: () => void }>)

  return [values, togglers, setters]
}
