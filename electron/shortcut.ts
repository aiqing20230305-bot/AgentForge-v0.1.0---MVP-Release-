/**
 * Global Shortcut Manager
 * 全局快捷键管理
 */

import { globalShortcut, BrowserWindow, app } from 'electron'
import Store from 'electron-store'

interface ShortcutConfig {
  key: string
  action: string
  enabled: boolean
  description: string
}

interface ShortcutStore {
  shortcuts: ShortcutConfig[]
}

export class ShortcutManager {
  private mainWindow: BrowserWindow | null = null
  private store: Store<ShortcutStore>
  private registeredShortcuts: Map<string, string> = new Map()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.store = new Store<ShortcutStore>({
      name: 'shortcuts',
      defaults: {
        shortcuts: this.getDefaultShortcuts(),
      },
    })
  }

  /**
   * Get default shortcuts
   * 获取默认快捷键
   */
  private getDefaultShortcuts(): ShortcutConfig[] {
    const isMac = process.platform === 'darwin'
    const modifier = isMac ? 'Command' : 'Control'

    return [
      {
        key: `${modifier}+Shift+Space`,
        action: 'toggle-window',
        enabled: true,
        description: 'Show/Hide AgentForge window',
      },
      {
        key: `${modifier}+Shift+N`,
        action: 'new-agent',
        enabled: true,
        description: 'Create new agent',
      },
      {
        key: `${modifier}+Shift+K`,
        action: 'global-search',
        enabled: true,
        description: 'Open global search',
      },
      {
        key: `${modifier}+Shift+S`,
        action: 'screenshot',
        enabled: true,
        description: 'Take screenshot',
      },
      {
        key: `${modifier}+Shift+C`,
        action: 'clipboard-watch',
        enabled: false,
        description: 'Toggle clipboard monitoring',
      },
      {
        key: `${modifier}+Shift+M`,
        action: 'mini-mode',
        enabled: false,
        description: 'Toggle mini window mode',
      },
    ]
  }

  /**
   * Register all shortcuts
   * 注册所有快捷键
   */
  registerAll() {
    const shortcuts = this.store.get('shortcuts')

    shortcuts.forEach((shortcut) => {
      if (shortcut.enabled) {
        this.register(shortcut.key, shortcut.action)
      }
    })

    console.log(`[ShortcutManager] Registered ${this.registeredShortcuts.size} shortcuts`)
  }

  /**
   * Register single shortcut
   * 注册单个快捷键
   */
  register(accelerator: string, action: string): boolean {
    try {
      // Unregister if already exists
      if (this.registeredShortcuts.has(accelerator)) {
        globalShortcut.unregister(accelerator)
      }

      // Register new shortcut
      const success = globalShortcut.register(accelerator, () => {
        this.handleShortcut(action)
      })

      if (success) {
        this.registeredShortcuts.set(accelerator, action)
        console.log(`[ShortcutManager] Registered: ${accelerator} -> ${action}`)
        return true
      } else {
        console.error(`[ShortcutManager] Failed to register: ${accelerator}`)
        return false
      }
    } catch (error) {
      console.error(`[ShortcutManager] Error registering ${accelerator}:`, error)
      return false
    }
  }

  /**
   * Unregister shortcut
   * 注销快捷键
   */
  unregister(accelerator: string) {
    if (this.registeredShortcuts.has(accelerator)) {
      globalShortcut.unregister(accelerator)
      this.registeredShortcuts.delete(accelerator)
      console.log(`[ShortcutManager] Unregistered: ${accelerator}`)
    }
  }

  /**
   * Unregister all shortcuts
   * 注销所有快捷键
   */
  unregisterAll() {
    globalShortcut.unregisterAll()
    this.registeredShortcuts.clear()
    console.log('[ShortcutManager] Unregistered all shortcuts')
  }

  /**
   * Handle shortcut action
   * 处理快捷键操作
   */
  private handleShortcut(action: string) {
    if (!this.mainWindow) return

    console.log(`[ShortcutManager] Triggered action: ${action}`)

    switch (action) {
      case 'toggle-window':
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide()
        } else {
          this.mainWindow.show()
          this.mainWindow.focus()
        }
        break

      case 'new-agent':
        this.mainWindow.show()
        this.mainWindow.focus()
        this.mainWindow.webContents.send('shortcut-action', 'new-agent')
        break

      case 'global-search':
        this.mainWindow.show()
        this.mainWindow.focus()
        this.mainWindow.webContents.send('shortcut-action', 'global-search')
        break

      case 'screenshot':
        this.mainWindow.webContents.send('shortcut-action', 'screenshot')
        break

      case 'clipboard-watch':
        this.mainWindow.webContents.send('shortcut-action', 'clipboard-watch')
        break

      case 'mini-mode':
        this.mainWindow.webContents.send('shortcut-action', 'mini-mode')
        break

      default:
        console.warn(`[ShortcutManager] Unknown action: ${action}`)
    }
  }

  /**
   * Update shortcut
   * 更新快捷键
   */
  updateShortcut(oldKey: string, newKey: string, action: string, enabled: boolean) {
    // Unregister old key
    this.unregister(oldKey)

    // Update store
    const shortcuts = this.store.get('shortcuts')
    const index = shortcuts.findIndex((s) => s.key === oldKey)
    if (index !== -1) {
      shortcuts[index] = {
        key: newKey,
        action,
        enabled,
        description: shortcuts[index].description,
      }
      this.store.set('shortcuts', shortcuts)
    }

    // Register new key if enabled
    if (enabled) {
      this.register(newKey, action)
    }
  }

  /**
   * Toggle shortcut
   * 切换快捷键启用状态
   */
  toggleShortcut(key: string) {
    const shortcuts = this.store.get('shortcuts')
    const index = shortcuts.findIndex((s) => s.key === key)

    if (index !== -1) {
      shortcuts[index].enabled = !shortcuts[index].enabled
      this.store.set('shortcuts', shortcuts)

      if (shortcuts[index].enabled) {
        this.register(key, shortcuts[index].action)
      } else {
        this.unregister(key)
      }
    }
  }

  /**
   * Get all shortcuts
   * 获取所有快捷键
   */
  getShortcuts(): ShortcutConfig[] {
    return this.store.get('shortcuts')
  }

  /**
   * Reset to defaults
   * 重置为默认值
   */
  resetToDefaults() {
    this.unregisterAll()
    this.store.set('shortcuts', this.getDefaultShortcuts())
    this.registerAll()
  }

  /**
   * Check if accelerator is valid
   * 检查快捷键是否有效
   */
  isValidAccelerator(accelerator: string): boolean {
    try {
      // Try to register and immediately unregister
      const success = globalShortcut.register(accelerator, () => {})
      if (success) {
        globalShortcut.unregister(accelerator)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * Get registered shortcuts count
   * 获取已注册的快捷键数量
   */
  getRegisteredCount(): number {
    return this.registeredShortcuts.size
  }
}

// Cleanup on app quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
