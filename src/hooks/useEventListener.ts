/**
 * useEventListener Hook
 * 事件监听Hook，简化DOM事件绑定和清理
 */

import { useEffect, useRef, RefObject, useState } from 'react'

/**
 * 添加事件监听器到元素
 *
 * @param eventName - 事件名称
 * @param handler - 事件处理函数
 * @param element - 目标元素（默认window）
 * @param options - 事件选项
 *
 * @example
 * useEventListener('resize', handleResize)
 * useEventListener('scroll', handleScroll, document.getElementById('container'))
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: boolean | AddEventListenerOptions
): void

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLDivElement
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: RefObject<T> | T | null,
  options?: boolean | AddEventListenerOptions
): void

export function useEventListener<
  K extends keyof DocumentEventMap,
  T extends Document = Document
>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: RefObject<T> | T | null,
  options?: boolean | AddEventListenerOptions
): void

export function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  KD extends keyof DocumentEventMap,
  T extends HTMLElement | Document | Window = HTMLElement | Document | Window
>(
  eventName: KW | KH | KD,
  handler: (
    event: WindowEventMap[KW] | HTMLElementEventMap[KH] | DocumentEventMap[KD] | Event
  ) => void,
  element?: RefObject<T> | T | Window | null,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // SSR 支持
    if (typeof window === 'undefined') {
      return
    }

    const targetElement =
      element == null
        ? window
        : 'current' in element
        ? element.current
        : element

    if (!targetElement?.addEventListener) {
      return
    }

    const eventListener = (event: Event) => {
      savedHandler.current(event as any)
    }

    targetElement.addEventListener(eventName as string, eventListener, options)

    return () => {
      targetElement.removeEventListener(eventName as string, eventListener, options)
    }
  }, [eventName, element, options])
}

/**
 * 监听多个事件
 *
 * @param eventNames - 事件名称数组
 * @param handler - 事件处理函数
 * @param element - 目标元素
 * @param options - 事件选项
 *
 * @example
 * useMultipleEventListener(
 *   ['mouseenter', 'focus'],
 *   () => setIsActive(true),
 *   buttonRef
 * )
 */
export function useMultipleEventListener<T extends HTMLElement = HTMLDivElement>(
  eventNames: string[],
  handler: (event: Event) => void,
  element?: RefObject<T> | T | Window | null,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const targetElement =
      element == null
        ? window
        : 'current' in element
        ? element.current
        : element

    if (!targetElement?.addEventListener) {
      return
    }

    const eventListener = (event: Event) => {
      savedHandler.current(event)
    }

    eventNames.forEach((eventName) => {
      targetElement.addEventListener(eventName, eventListener, options)
    })

    return () => {
      eventNames.forEach((eventName) => {
        targetElement.removeEventListener(eventName, eventListener, options)
      })
    }
  }, [eventNames, element, options])
}

/**
 * 带条件判断的事件监听
 *
 * @param eventName - 事件名称
 * @param handler - 事件处理函数
 * @param enabled - 是否启用
 * @param element - 目标元素
 * @param options - 事件选项
 *
 * @example
 * useConditionalEventListener(
 *   'scroll',
 *   handleScroll,
 *   isModalOpen, // 只在模态框打开时监听
 *   window
 * )
 */
export function useConditionalEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  enabled: boolean,
  element?: Window | null,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    const targetElement = element || window

    targetElement.addEventListener(eventName, handler as EventListener, options)

    return () => {
      targetElement.removeEventListener(eventName, handler as EventListener, options)
    }
  }, [eventName, handler, enabled, element, options])
}

/**
 * 键盘事件监听Hook
 *
 * @param key - 按键（如 'Escape', 'Enter'）
 * @param handler - 事件处理函数
 * @param options - 选项
 *
 * @example
 * useKeyPress('Escape', () => setIsOpen(false))
 * useKeyPress('/', () => focusSearch(), { ctrl: true })
 */
export interface KeyPressOptions {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  target?: HTMLElement | Document | Window
}

export function useKeyPress(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: KeyPressOptions = {}
) {
  const { ctrl = false, shift = false, alt = false, meta = false, target } = options

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const targetElement = target || window

    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.key === key &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        handler(event)
      }
    }

    targetElement.addEventListener('keydown', handleKeyPress as EventListener)

    return () => {
      targetElement.removeEventListener('keydown', handleKeyPress as EventListener)
    }
  }, [key, handler, ctrl, shift, alt, meta, target])
}

/**
 * 鼠标悬停监听Hook
 *
 * @param onEnter - 鼠标进入时的回调
 * @param onLeave - 鼠标离开时的回调
 * @returns ref
 *
 * @example
 * const ref = useHover(
 *   () => setIsHovered(true),
 *   () => setIsHovered(false)
 * )
 *
 * <div ref={ref}>Hover me</div>
 */
export function useHover<T extends HTMLElement = HTMLDivElement>(
  onEnter?: (event: MouseEvent) => void,
  onLeave?: (event: MouseEvent) => void
): RefObject<T> {
  const ref = useRef<T>(null)

  useEventListener('mouseenter', (event) => onEnter?.(event), ref)
  useEventListener('mouseleave', (event) => onLeave?.(event), ref)

  return ref
}

/**
 * 简化版悬停Hook（返回状态）
 *
 * @returns [ref, isHovered]
 *
 * @example
 * const [ref, isHovered] = useHoverState()
 *
 * <div ref={ref} style={{ background: isHovered ? 'blue' : 'gray' }}>
 *   Hover me
 * </div>
 */
export function useHoverState<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T>,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<T>(null)

  useEventListener('mouseenter', () => setIsHovered(true), ref)
  useEventListener('mouseleave', () => setIsHovered(false), ref)

  return [ref, isHovered]
}

/**
 * 焦点监听Hook
 *
 * @returns [ref, isFocused]
 *
 * @example
 * const [ref, isFocused] = useFocus()
 *
 * <input ref={ref} className={isFocused ? 'focused' : ''} />
 */
export function useFocus<T extends HTMLElement = HTMLInputElement>(): [
  RefObject<T>,
  boolean
] {
  const [isFocused, setIsFocused] = useState(false)
  const ref = useRef<T>(null)

  useEventListener('focus', () => setIsFocused(true), ref)
  useEventListener('blur', () => setIsFocused(false), ref)

  return [ref, isFocused]
}

/**
 * 长按监听Hook
 *
 * @param callback - 长按触发的回调
 * @param duration - 长按持续时间（毫秒）
 * @returns ref
 *
 * @example
 * const ref = useLongPress(() => {
 *   console.log('Long pressed!')
 * }, 1000)
 *
 * <button ref={ref}>Long press me</button>
 */
export function useLongPress<T extends HTMLElement = HTMLButtonElement>(
  callback: () => void,
  duration: number = 500
): RefObject<T> {
  const ref = useRef<T>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const isLongPress = useRef(false)

  const start = () => {
    isLongPress.current = false
    timerRef.current = setTimeout(() => {
      isLongPress.current = true
      callback()
    }, duration)
  }

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const click = (event: MouseEvent) => {
    if (isLongPress.current) {
      event.preventDefault()
    }
  }

  useEventListener('mousedown', start, ref)
  useEventListener('touchstart', start, ref)
  useEventListener('mouseup', cancel, ref)
  useEventListener('mouseleave', cancel, ref)
  useEventListener('touchend', cancel, ref)
  useEventListener('click', click, ref)

  return ref
}

/**
 * 双击监听Hook
 *
 * @param callback - 双击触发的回调
 * @param delay - 双击最大间隔（毫秒）
 * @returns ref
 *
 * @example
 * const ref = useDoubleClick(() => {
 *   console.log('Double clicked!')
 * })
 *
 * <div ref={ref}>Double click me</div>
 */
export function useDoubleClick<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  delay: number = 300
): RefObject<T> {
  const ref = useRef<T>(null)
  const clickCountRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout>()

  const handleClick = () => {
    clickCountRef.current++

    if (clickCountRef.current === 1) {
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, delay)
    } else if (clickCountRef.current === 2) {
      clearTimeout(timerRef.current)
      clickCountRef.current = 0
      callback()
    }
  }

  useEventListener('click', handleClick, ref)

  return ref
}
