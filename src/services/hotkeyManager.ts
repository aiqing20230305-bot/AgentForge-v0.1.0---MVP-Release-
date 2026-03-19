/**
 * 快捷键管理器
 * Hotkey Manager - Global keyboard shortcut registration and management
 */

import hotkeys, { HotkeysEvent } from 'hotkeys-js'

// 快捷键定义接口
export interface HotkeyDefinition {
  key: string // 快捷键组合，如 'cmd+k', 'ctrl+s'
  description: string // 描述
  action: (event: KeyboardEvent, handler: HotkeysEvent) => void // 回调函数
  scope?: string // 作用域，默认'all'
  category?: string // 分类，如 'navigation', 'editing', 'view'
  enabled?: boolean // 是否启用
  priority?: number // 优先级，数字越大优先级越高
}

// 快捷键分类
export enum HotkeyCategory {
  NAVIGATION = 'navigation',
  EDITING = 'editing',
  VIEW = 'view',
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

// 快捷键存储键
const STORAGE_KEY = 'agentforge_hotkeys'

// 平台检测
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

// 快捷键管理器类
class HotkeyManager {
  private hotkeys: Map<string, HotkeyDefinition> = new Map()
  private customHotkeys: Map<string, string> = new Map() // 用户自定义快捷键映射

  constructor() {
    this.loadCustomHotkeys()
    // 设置过滤器，防止在输入框中触发快捷键
    hotkeys.filter = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const tagName = target.tagName
      const isInput =
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        target.isContentEditable

      // 允许 Escape 和 Cmd/Ctrl+K 在输入框中触发
      const allowedInInput = ['esc', 'escape', 'cmd+k', 'ctrl+k', 'meta+k']
      const pressedKey = hotkeys.getPressedKeyString().join('+').toLowerCase()

      if (isInput && !allowedInInput.includes(pressedKey)) {
        return false
      }

      return true
    }
  }

  /**
   * 注册快捷键
   */
  register(id: string, definition: HotkeyDefinition): void {
    // 检查是否有自定义快捷键
    const customKey = this.customHotkeys.get(id)
    const key = customKey || definition.key

    // 检查冲突
    if (this.hasConflict(key, id)) {
      console.warn(`[HotkeyManager] Conflict detected for key: ${key}`)
      return
    }

    // 注销旧的快捷键
    if (this.hotkeys.has(id)) {
      this.unregister(id)
    }

    // 注册新快捷键
    const scope = definition.scope || 'all'
    hotkeys(key, scope, definition.action)

    // 保存定义
    this.hotkeys.set(id, { ...definition, key })

    console.log(`[HotkeyManager] Registered: ${id} -> ${key}`)
  }

  /**
   * 注销快捷键
   */
  unregister(id: string): void {
    const definition = this.hotkeys.get(id)
    if (!definition) return

    hotkeys.unbind(definition.key, definition.scope)
    this.hotkeys.delete(id)

    console.log(`[HotkeyManager] Unregistered: ${id}`)
  }

  /**
   * 检查快捷键冲突
   */
  hasConflict(key: string, excludeId?: string): boolean {
    for (const [id, definition] of this.hotkeys.entries()) {
      if (id === excludeId) continue
      if (definition.key === key && definition.enabled !== false) {
        return true
      }
    }
    return false
  }

  /**
   * 获取所有快捷键
   */
  getAllHotkeys(): Map<string, HotkeyDefinition> {
    return new Map(this.hotkeys)
  }

  /**
   * 按分类获取快捷键
   */
  getHotkeysByCategory(category: string): HotkeyDefinition[] {
    return Array.from(this.hotkeys.values()).filter(
      (h) => h.category === category
    )
  }

  /**
   * 自定义快捷键
   */
  customize(id: string, newKey: string): boolean {
    const definition = this.hotkeys.get(id)
    if (!definition) {
      console.warn(`[HotkeyManager] Hotkey not found: ${id}`)
      return false
    }

    // 检查新快捷键是否冲突
    if (this.hasConflict(newKey, id)) {
      console.warn(`[HotkeyManager] Conflict: ${newKey} already in use`)
      return false
    }

    // 注销旧快捷键
    hotkeys.unbind(definition.key, definition.scope)

    // 注册新快捷键
    const scope = definition.scope || 'all'
    hotkeys(newKey, scope, definition.action)

    // 更新定义
    definition.key = newKey
    this.customHotkeys.set(id, newKey)

    // 保存到localStorage
    this.saveCustomHotkeys()

    console.log(`[HotkeyManager] Customized: ${id} -> ${newKey}`)
    return true
  }

  /**
   * 重置为默认快捷键
   */
  resetToDefault(id: string): void {
    this.customHotkeys.delete(id)
    this.saveCustomHotkeys()

    // 重新注册默认快捷键
    const definition = this.hotkeys.get(id)
    if (definition) {
      this.unregister(id)
      // 需要从原始定义重新注册，这里暂时简化处理
    }
  }

  /**
   * 重置所有快捷键
   */
  resetAllToDefault(): void {
    this.customHotkeys.clear()
    this.saveCustomHotkeys()
    console.log('[HotkeyManager] Reset all hotkeys to default')
  }

  /**
   * 启用/禁用快捷键
   */
  setEnabled(id: string, enabled: boolean): void {
    const definition = this.hotkeys.get(id)
    if (!definition) return

    definition.enabled = enabled

    if (!enabled) {
      hotkeys.unbind(definition.key, definition.scope)
    } else {
      const scope = definition.scope || 'all'
      hotkeys(definition.key, scope, definition.action)
    }
  }

  /**
   * 获取快捷键显示文本（适配平台）
   */
  getDisplayKey(key: string): string {
    if (isMac) {
      return key
        .replace(/cmd|command/gi, '⌘')
        .replace(/ctrl|control/gi, '⌃')
        .replace(/alt|option/gi, '⌥')
        .replace(/shift/gi, '⇧')
        .replace(/\+/g, ' ')
    } else {
      return key
        .replace(/cmd|command/gi, 'Ctrl')
        .replace(/ctrl|control/gi, 'Ctrl')
        .replace(/alt/gi, 'Alt')
        .replace(/shift/gi, 'Shift')
        .replace(/\+/g, ' + ')
    }
  }

  /**
   * 加载自定义快捷键
   */
  private loadCustomHotkeys(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        this.customHotkeys = new Map(Object.entries(data))
        console.log('[HotkeyManager] Loaded custom hotkeys:', data)
      }
    } catch (error) {
      console.error('[HotkeyManager] Failed to load custom hotkeys:', error)
    }
  }

  /**
   * 保存自定义快捷键
   */
  private saveCustomHotkeys(): void {
    try {
      const data = Object.fromEntries(this.customHotkeys)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('[HotkeyManager] Saved custom hotkeys')
    } catch (error) {
      console.error('[HotkeyManager] Failed to save custom hotkeys:', error)
    }
  }

  /**
   * 清理所有快捷键
   */
  cleanup(): void {
    hotkeys.unbind()
    this.hotkeys.clear()
    console.log('[HotkeyManager] Cleanup complete')
  }
}

// 单例实例
let hotkeyManagerInstance: HotkeyManager | null = null

/**
 * 获取快捷键管理器实例
 */
export function getHotkeyManager(): HotkeyManager {
  if (!hotkeyManagerInstance) {
    hotkeyManagerInstance = new HotkeyManager()
  }
  return hotkeyManagerInstance
}

/**
 * 规范化快捷键字符串（跨平台适配）
 */
export function normalizeHotkey(key: string): string {
  if (isMac) {
    return key.replace(/ctrl/gi, 'cmd')
  } else {
    return key.replace(/cmd|command/gi, 'ctrl')
  }
}

export default HotkeyManager
