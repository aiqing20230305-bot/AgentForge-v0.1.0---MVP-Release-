/**
 * useClickOutside Hook
 * 点击外部区域Hook，用于关闭模态框、下拉菜单、弹出框等
 */

import { useEffect, useRef, RefObject } from 'react'

/**
 * 监听点击元素外部区域
 *
 * @param callback - 点击外部时的回调函数
 * @param enabled - 是否启用监听（默认true）
 * @returns ref
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false)
 * const ref = useClickOutside(() => setIsOpen(false))
 *
 * <div ref={ref}>
 *   {isOpen && <DropdownMenu />}
 * </div>
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  callback: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      const target = event.target as Node

      if (element && !element.contains(target)) {
        callbackRef.current(event)
      }
    }

    // 延迟绑定，避免立即触发
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [enabled])

  return ref
}

/**
 * 监听多个元素的外部点击
 *
 * @param callback - 点击外部时的回调函数
 * @param enabled - 是否启用监听
 * @returns refs数组
 *
 * @example
 * const [ref1, ref2] = useMultipleClickOutside(() => setIsOpen(false))
 *
 * <>
 *   <button ref={ref1}>Trigger</button>
 *   <div ref={ref2}>Dropdown</div>
 * </>
 */
export function useMultipleClickOutside<T extends HTMLElement = HTMLDivElement>(
  callback: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true,
  count: number = 2
): RefObject<T>[] {
  const refs = useRef<RefObject<T>[]>(
    Array.from({ length: count }, () => ({ current: null }))
  ).current

  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      // 检查是否点击在任何一个ref内
      const clickedInside = refs.some(
        (ref) => ref.current && ref.current.contains(target)
      )

      if (!clickedInside) {
        callbackRef.current(event)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [enabled, refs])

  return refs
}

/**
 * 带Escape键支持的点击外部Hook
 *
 * @param onClickOutside - 点击外部时的回调
 * @param onEscapeKey - 按Escape键时的回调（可选，默认与onClickOutside相同）
 * @param enabled - 是否启用监听
 * @returns ref
 *
 * @example
 * const ref = useClickOutsideWithEscape(
 *   () => setIsOpen(false),
 *   () => console.log('Escape pressed')
 * )
 */
export function useClickOutsideWithEscape<T extends HTMLElement = HTMLDivElement>(
  onClickOutside: (event: MouseEvent | TouchEvent) => void,
  onEscapeKey?: () => void,
  enabled: boolean = true
): RefObject<T> {
  const ref = useClickOutside<T>(onClickOutside, enabled)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onEscapeKey) {
          onEscapeKey()
        } else {
          // 创建假事件传递给onClickOutside
          const fakeEvent = new MouseEvent('mousedown')
          onClickOutside(fakeEvent)
        }
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClickOutside, onEscapeKey, enabled])

  return ref
}

/**
 * 带延迟的点击外部Hook（防止误触）
 *
 * @param callback - 点击外部时的回调
 * @param delay - 延迟时间（毫秒）
 * @param enabled - 是否启用监听
 * @returns ref
 *
 * @example
 * // 300ms后才触发关闭，避免快速点击误触
 * const ref = useClickOutsideWithDelay(() => setIsOpen(false), 300)
 */
export function useClickOutsideWithDelay<T extends HTMLElement = HTMLDivElement>(
  callback: (event: MouseEvent | TouchEvent) => void,
  delay: number = 200,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null)
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      const target = event.target as Node

      if (element && !element.contains(target)) {
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(event)
        }, delay)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [enabled, delay])

  return ref
}

/**
 * 带条件判断的点击外部Hook
 *
 * @param callback - 点击外部时的回调
 * @param shouldClose - 判断是否应该关闭的函数
 * @param enabled - 是否启用监听
 * @returns ref
 *
 * @example
 * const ref = useClickOutsideWithCondition(
 *   () => setIsOpen(false),
 *   (event) => {
 *     // 点击特定元素时不关闭
 *     const target = event.target as HTMLElement
 *     return !target.closest('.keep-open')
 *   }
 * )
 */
export function useClickOutsideWithCondition<T extends HTMLElement = HTMLDivElement>(
  callback: (event: MouseEvent | TouchEvent) => void,
  shouldClose: (event: MouseEvent | TouchEvent) => boolean,
  enabled: boolean = true
): RefObject<T> {
  const ref = useRef<T>(null)
  const callbackRef = useRef(callback)
  const shouldCloseRef = useRef(shouldClose)

  useEffect(() => {
    callbackRef.current = callback
    shouldCloseRef.current = shouldClose
  }, [callback, shouldClose])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      const target = event.target as Node

      if (element && !element.contains(target)) {
        if (shouldCloseRef.current(event)) {
          callbackRef.current(event)
        }
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [enabled])

  return ref
}

/**
 * 带焦点管理的点击外部Hook
 *
 * @param callback - 点击外部时的回调
 * @param returnFocusOnClose - 关闭时是否返回焦点到触发元素
 * @param enabled - 是否启用监听
 * @returns [ref, setTriggerElement]
 *
 * @example
 * const [ref, setTriggerElement] = useClickOutsideWithFocus(() => setIsOpen(false))
 *
 * <button ref={setTriggerElement} onClick={() => setIsOpen(true)}>
 *   Open
 * </button>
 * <div ref={ref}>Modal content</div>
 */
export function useClickOutsideWithFocus<T extends HTMLElement = HTMLDivElement>(
  callback: (event: MouseEvent | TouchEvent) => void,
  returnFocusOnClose: boolean = true,
  enabled: boolean = true
): [RefObject<T>, (element: HTMLElement | null) => void] {
  const ref = useRef<T>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      const target = event.target as Node

      if (element && !element.contains(target)) {
        callbackRef.current(event)

        // 返回焦点
        if (returnFocusOnClose && triggerRef.current) {
          triggerRef.current.focus()
        }
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [enabled, returnFocusOnClose])

  const setTriggerElement = (element: HTMLElement | null) => {
    triggerRef.current = element
  }

  return [ref, setTriggerElement]
}
