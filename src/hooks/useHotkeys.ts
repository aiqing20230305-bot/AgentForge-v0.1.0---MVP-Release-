/**
 * useHotkeys Hook
 * 全局快捷键管理系统
 * 支持跨平台（Mac/Windows/Linux）快捷键
 */

import { useEffect, useCallback, useRef } from 'react'

// 快捷键配置类型
export interface HotkeyConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Command key on Mac
  description?: string
  enabled?: boolean
  preventDefault?: boolean
  global?: boolean // 是否在所有元素上生效（包括input）
}

export interface HotkeyHandler {
  (event: KeyboardEvent): void
}

// 快捷键管理器
class HotkeyManager {
  private handlers: Map<string, { handler: HotkeyHandler; config: HotkeyConfig }[]> = new Map()
  private listening: boolean = false

  // 生成快捷键的唯一标识符
  private getKeyId(config: HotkeyConfig): string {
    const modifiers = []
    if (config.ctrl) modifiers.push('ctrl')
    if (config.shift) modifiers.push('shift')
    if (config.alt) modifiers.push('alt')
    if (config.meta) modifiers.push('meta')

    return [...modifiers, config.key.toLowerCase()].join('+')
  }

  // 检查是否在输入元素中
  private isInputElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false

    const tagName = target.tagName.toLowerCase()
    const isContentEditable = target.isContentEditable

    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      isContentEditable
    )
  }

  // 检查快捷键是否匹配
  private matches(event: KeyboardEvent, config: HotkeyConfig): boolean {
    // 检查修饰键
    if (config.ctrl !== undefined && event.ctrlKey !== config.ctrl) return false
    if (config.shift !== undefined && event.shiftKey !== config.shift) return false
    if (config.alt !== undefined && event.altKey !== config.alt) return false
    if (config.meta !== undefined && event.metaKey !== config.meta) return false

    // 检查键值
    const eventKey = event.key.toLowerCase()
    const configKey = config.key.toLowerCase()

    return eventKey === configKey
  }

  // 全局键盘事件处理器
  private handleKeyDown = (event: KeyboardEvent) => {
    // 检查是否在输入元素中
    const isInput = this.isInputElement(event.target)

    // 遍历所有注册的处理器
    this.handlers.forEach((handlerList) => {
      handlerList.forEach(({ handler, config }) => {
        // 检查是否启用
        if (config.enabled === false) return

        // 如果在输入元素中且不是全局快捷键，跳过
        if (isInput && !config.global) return

        // 检查是否匹配
        if (this.matches(event, config)) {
          if (config.preventDefault !== false) {
            event.preventDefault()
          }
          handler(event)
        }
      })
    })
  }

  // 注册快捷键
  register(config: HotkeyConfig, handler: HotkeyHandler): () => void {
    const keyId = this.getKeyId(config)

    if (!this.handlers.has(keyId)) {
      this.handlers.set(keyId, [])
    }

    const handlerList = this.handlers.get(keyId)!
    handlerList.push({ handler, config })

    // 启动监听
    this.startListening()

    // 返回取消注册函数
    return () => {
      const index = handlerList.findIndex((h) => h.handler === handler)
      if (index !== -1) {
        handlerList.splice(index, 1)
      }

      // 如果没有处理器了，移除键ID
      if (handlerList.length === 0) {
        this.handlers.delete(keyId)
      }

      // 如果没有任何处理器了，停止监听
      if (this.handlers.size === 0) {
        this.stopListening()
      }
    }
  }

  // 开始监听
  private startListening() {
    if (this.listening) return

    window.addEventListener('keydown', this.handleKeyDown, { capture: true })
    this.listening = true
  }

  // 停止监听
  private stopListening() {
    if (!this.listening) return

    window.removeEventListener('keydown', this.handleKeyDown, { capture: true })
    this.listening = false
  }

  // 获取所有注册的快捷键
  getAllHotkeys(): Array<{ keyId: string; config: HotkeyConfig }> {
    const result: Array<{ keyId: string; config: HotkeyConfig }> = []

    this.handlers.forEach((handlerList, keyId) => {
      handlerList.forEach(({ config }) => {
        result.push({ keyId, config })
      })
    })

    return result
  }

  // 检查快捷键冲突
  checkConflicts(config: HotkeyConfig): boolean {
    const keyId = this.getKeyId(config)
    return this.handlers.has(keyId) && this.handlers.get(keyId)!.length > 0
  }

  // 清除所有快捷键
  clear() {
    this.handlers.clear()
    this.stopListening()
  }
}

// 全局单例
const hotkeyManager = new HotkeyManager()

/**
 * 使用快捷键Hook
 *
 * @param config - 快捷键配置
 * @param handler - 处理函数
 * @param deps - 依赖数组
 *
 * @example
 * // 基础用法
 * useHotkey({ key: 'k', meta: true }, () => {
 *   console.log('Cmd+K pressed')
 * })
 *
 * @example
 * // 跨平台支持
 * useHotkey({ key: 's', ctrl: true, meta: true }, () => {
 *   // Ctrl+S on Windows/Linux, Cmd+S on Mac
 *   handleSave()
 * })
 *
 * @example
 * // 全局快捷键（在输入框中也生效）
 * useHotkey({ key: 'Escape', global: true }, () => {
 *   closeModal()
 * })
 */
export function useHotkey(
  config: HotkeyConfig,
  handler: HotkeyHandler,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(handler)

  // 更新处理器引用
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  // 注册快捷键
  useEffect(() => {
    const wrappedHandler = (event: KeyboardEvent) => {
      handlerRef.current(event)
    }

    const unregister = hotkeyManager.register(config, wrappedHandler)

    return unregister
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key, config.ctrl, config.shift, config.alt, config.meta, config.enabled, ...deps])
}

/**
 * 批量注册快捷键
 *
 * @param hotkeys - 快捷键配置数组
 *
 * @example
 * useHotkeys([
 *   { key: 'k', meta: true, handler: openSearch },
 *   { key: 'n', meta: true, handler: createNew },
 *   { key: 'p', meta: true, handler: togglePause }
 * ])
 */
export function useHotkeys(
  hotkeys: Array<HotkeyConfig & { handler: HotkeyHandler }>,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unregisterFns = hotkeys.map(({ handler, ...config }) => {
      return hotkeyManager.register(config, handler)
    })

    return () => {
      unregisterFns.forEach((fn) => fn())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps])
}

/**
 * 获取所有注册的快捷键
 */
export function useGetAllHotkeys() {
  return useCallback(() => {
    return hotkeyManager.getAllHotkeys()
  }, [])
}

/**
 * 检查快捷键冲突
 */
export function useCheckHotkeyConflict() {
  return useCallback((config: HotkeyConfig) => {
    return hotkeyManager.checkConflicts(config)
  }, [])
}

/**
 * 获取平台特定的修饰键符号
 */
export function getPlatformModifierKey(): 'Cmd' | 'Ctrl' {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
  return isMac ? 'Cmd' : 'Ctrl'
}

/**
 * 格式化快捷键显示
 *
 * @param config - 快捷键配置
 * @returns 格式化的快捷键字符串
 *
 * @example
 * formatHotkey({ key: 'k', meta: true }) // "⌘K" on Mac, "Ctrl+K" on Windows
 */
export function formatHotkey(config: HotkeyConfig): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
  const parts: string[] = []

  if (config.ctrl) {
    parts.push(isMac ? '⌃' : 'Ctrl')
  }
  if (config.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }
  if (config.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (config.meta) {
    parts.push(isMac ? '⌘' : 'Win')
  }

  // 键名格式化
  let keyName = config.key
  if (keyName.length === 1) {
    keyName = keyName.toUpperCase()
  } else {
    // 特殊键名
    const specialKeys: Record<string, string> = {
      escape: 'Esc',
      enter: '↵',
      backspace: '⌫',
      delete: '⌦',
      tab: '⇥',
      space: 'Space',
      arrowup: '↑',
      arrowdown: '↓',
      arrowleft: '←',
      arrowright: '→',
    }
    keyName = specialKeys[keyName.toLowerCase()] || keyName
  }

  parts.push(keyName)

  return isMac ? parts.join('') : parts.join('+')
}

// 导出单例管理器（用于调试和高级用法）
export { hotkeyManager }
