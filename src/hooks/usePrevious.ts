/**
 * usePrevious Hook
 * 获取上一次渲染的值，用于比较和动画过渡
 */

import { useRef, useEffect } from 'react'

/**
 * 获取上一次的值
 *
 * @param value - 当前值
 * @returns 上一次的值
 *
 * @example
 * const [count, setCount] = useState(0)
 * const prevCount = usePrevious(count)
 *
 * useEffect(() => {
 *   console.log(`Count changed from ${prevCount} to ${count}`)
 * }, [count, prevCount])
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * 获取上一次的值（带初始值）
 *
 * @param value - 当前值
 * @param initialValue - 初始值
 * @returns 上一次的值
 *
 * @example
 * const prevCount = usePreviousWithInitial(count, 0)
 * // 首次渲染时 prevCount 为 0，而不是 undefined
 */
export function usePreviousWithInitial<T>(value: T, initialValue: T): T {
  const ref = useRef<T>(initialValue)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * 获取多个值的历史记录
 *
 * @param value - 当前值
 * @param maxHistory - 最大历史记录数（默认10）
 * @returns 历史记录数组（从旧到新）
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const searchHistory = useHistory(searchTerm, 5)
 *
 * // searchHistory: ['abc', 'abcd', 'abcde', 'abcdef', 'abcdefg']
 */
export function useHistory<T>(value: T, maxHistory: number = 10): T[] {
  const historyRef = useRef<T[]>([])

  useEffect(() => {
    historyRef.current = [...historyRef.current, value].slice(-maxHistory)
  }, [value, maxHistory])

  return historyRef.current
}

/**
 * 比较当前值和上一次的值
 *
 * @param value - 当前值
 * @param compareFn - 自定义比较函数（可选）
 * @returns [prevValue, hasChanged]
 *
 * @example
 * const [user, setUser] = useState({ id: 1, name: 'Alice' })
 * const [prevUser, userChanged] = useCompare(user, (a, b) => a?.id === b?.id)
 *
 * if (userChanged) {
 *   console.log('User changed!')
 * }
 */
export function useCompare<T>(
  value: T,
  compareFn?: (prev: T | undefined, current: T) => boolean
): [T | undefined, boolean] {
  const prevValue = usePrevious(value)

  const hasChanged = compareFn
    ? !compareFn(prevValue, value)
    : prevValue !== value

  return [prevValue, hasChanged]
}

/**
 * 深度比较对象变化
 *
 * @param value - 当前值
 * @returns [prevValue, hasChanged]
 *
 * @example
 * const [config, setConfig] = useState({ theme: 'dark', lang: 'en' })
 * const [prevConfig, configChanged] = useDeepCompare(config)
 *
 * // 只有实际内容变化时才为true，引用变化不触发
 */
export function useDeepCompare<T>(value: T): [T | undefined, boolean] {
  const prevValue = usePrevious(value)

  const hasChanged =
    JSON.stringify(prevValue) !== JSON.stringify(value)

  return [prevValue, hasChanged]
}

/**
 * 获取值变化的次数
 *
 * @param value - 当前值
 * @returns 变化次数
 *
 * @example
 * const changeCount = useChangeCount(searchTerm)
 * console.log(`Search term changed ${changeCount} times`)
 */
export function useChangeCount<T>(value: T): number {
  const countRef = useRef(0)
  const prevValue = usePrevious(value)

  if (prevValue !== value) {
    countRef.current++
  }

  return countRef.current
}

/**
 * 获取值首次变化的信息
 *
 * @param value - 当前值
 * @returns [isFirstChange, prevValue]
 *
 * @example
 * const [isFirstChange, prevValue] = useFirstChange(count)
 *
 * if (isFirstChange) {
 *   console.log('This is the first time count changed!')
 * }
 */
export function useFirstChange<T>(value: T): [boolean, T | undefined] {
  const prevValue = usePrevious(value)
  const isFirstChange = prevValue === undefined && value !== undefined

  return [isFirstChange, prevValue]
}

/**
 * 延迟获取上一次的值（防止过于频繁的比较）
 *
 * @param value - 当前值
 * @param delay - 延迟时间（毫秒）
 * @returns 延迟后的上一次值
 *
 * @example
 * // 500ms后才更新prevValue，避免高频更新时的性能问题
 * const prevValue = useDebouncedPrevious(scrollY, 500)
 */
export function useDebouncedPrevious<T>(value: T, delay: number = 500): T | undefined {
  const prevValue = usePrevious(value)
  const debouncedPrevRef = useRef<T | undefined>(prevValue)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      debouncedPrevRef.current = prevValue
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [prevValue, delay])

  return debouncedPrevRef.current
}

/**
 * 获取值变化的方向
 *
 * @param value - 当前数值
 * @returns 'increase' | 'decrease' | 'unchanged'
 *
 * @example
 * const direction = useValueDirection(score)
 *
 * if (direction === 'increase') {
 *   showAnimation('up')
 * } else if (direction === 'decrease') {
 *   showAnimation('down')
 * }
 */
export function useValueDirection(
  value: number
): 'increase' | 'decrease' | 'unchanged' {
  const prevValue = usePrevious(value)

  if (prevValue === undefined || prevValue === value) {
    return 'unchanged'
  }

  return value > prevValue ? 'increase' : 'decrease'
}

/**
 * 监听特定值变化
 *
 * @param value - 当前值
 * @param targetValue - 目标值
 * @returns 是否刚变成目标值
 *
 * @example
 * const justBecameActive = useValueTransition(status, 'active')
 *
 * if (justBecameActive) {
 *   playSound('activate')
 * }
 */
export function useValueTransition<T>(value: T, targetValue: T): boolean {
  const prevValue = usePrevious(value)

  return prevValue !== targetValue && value === targetValue
}

/**
 * 获取稳定的值（只在值真正改变时更新）
 *
 * @param value - 当前值
 * @param isEqual - 自定义相等判断函数
 * @returns 稳定的值
 *
 * @example
 * // 对象引用变化，但内容相同时不更新
 * const stableUser = useStableValue(user, (a, b) =>
 *   a?.id === b?.id && a?.name === b?.name
 * )
 */
export function useStableValue<T>(
  value: T,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b
): T {
  const stableRef = useRef<T>(value)

  if (!isEqual(stableRef.current, value)) {
    stableRef.current = value
  }

  return stableRef.current
}
