/**
 * 插件管理器
 * 负责插件的安装、卸载、启用、禁用和生命周期管理
 */

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  homepage?: string
  repository?: string
  license: string
  main: string // 入口文件
  icon?: string
  keywords: string[]
  dependencies?: Record<string, string>
  permissions: PluginPermission[]
  minVersion: string // 最低AgentForge版本
  maxVersion?: string // 最高AgentForge版本
}

export type PluginPermission =
  | 'storage' // 访问localStorage
  | 'network' // 网络请求
  | 'notifications' // 发送通知
  | 'agents' // 访问Agent数据
  | 'tasks' // 访问Task数据
  | 'ui' // 修改UI

export interface Plugin {
  manifest: PluginManifest
  installed: boolean
  enabled: boolean
  installedAt?: Date
  updatedAt?: Date
  instance?: any
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private loadedPlugins: Map<string, any> = new Map()

  constructor() {
    this.loadInstalledPlugins()
  }

  /**
   * 安装插件
   */
  async installPlugin(url: string): Promise<void> {
    try {
      // 1. 下载插件包
      const pluginData = await this.downloadPlugin(url)

      // 2. 验证manifest
      const manifest = await this.validateManifest(pluginData.manifest)

      // 3. 检查版本兼容性
      this.checkVersionCompatibility(manifest)

      // 4. 检查依赖
      await this.checkDependencies(manifest)

      // 5. 保存插件
      await this.savePlugin(manifest, pluginData.code)

      // 6. 标记为已安装
      this.plugins.set(manifest.id, {
        manifest,
        installed: true,
        enabled: false,
        installedAt: new Date(),
      })

      this.savePluginRegistry()

      console.log(`[PluginManager] Plugin ${manifest.name} installed successfully`)
    } catch (error) {
      console.error('[PluginManager] Failed to install plugin:', error)
      throw new Error(`Failed to install plugin: ${error.message}`)
    }
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    // 1. 禁用插件
    if (plugin.enabled) {
      await this.disablePlugin(pluginId)
    }

    // 2. 删除插件文件
    await this.deletePluginFiles(pluginId)

    // 3. 从注册表移除
    this.plugins.delete(pluginId)
    this.loadedPlugins.delete(pluginId)

    this.savePluginRegistry()

    console.log(`[PluginManager] Plugin ${plugin.manifest.name} uninstalled`)
  }

  /**
   * 启用插件
   */
  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (plugin.enabled) {
      console.warn(`[PluginManager] Plugin ${pluginId} is already enabled`)
      return
    }

    try {
      // 1. 加载插件代码
      const pluginInstance = await this.loadPlugin(plugin.manifest)

      // 2. 初始化插件
      if (pluginInstance.activate) {
        await pluginInstance.activate()
      }

      // 3. 标记为已启用
      plugin.enabled = true
      plugin.instance = pluginInstance
      this.loadedPlugins.set(pluginId, pluginInstance)

      this.savePluginRegistry()

      console.log(`[PluginManager] Plugin ${plugin.manifest.name} enabled`)
    } catch (error) {
      console.error('[PluginManager] Failed to enable plugin:', error)
      throw new Error(`Failed to enable plugin: ${error.message}`)
    }
  }

  /**
   * 禁用插件
   */
  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)

    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (!plugin.enabled) {
      console.warn(`[PluginManager] Plugin ${pluginId} is already disabled`)
      return
    }

    try {
      // 1. 调用插件的停用方法
      if (plugin.instance?.deactivate) {
        await plugin.instance.deactivate()
      }

      // 2. 标记为已禁用
      plugin.enabled = false
      plugin.instance = undefined
      this.loadedPlugins.delete(pluginId)

      this.savePluginRegistry()

      console.log(`[PluginManager] Plugin ${plugin.manifest.name} disabled`)
    } catch (error) {
      console.error('[PluginManager] Failed to disable plugin:', error)
      throw new Error(`Failed to disable plugin: ${error.message}`)
    }
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter(p => p.enabled)
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * 检查插件是否已安装
   */
  isInstalled(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * 检查插件是否已启用
   */
  isEnabled(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)
    return plugin?.enabled || false
  }

  /**
   * 下载插件
   */
  private async downloadPlugin(url: string): Promise<{ manifest: PluginManifest; code: string }> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to download plugin: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      manifest: data.manifest,
      code: data.code,
    }
  }

  /**
   * 验证manifest
   */
  private async validateManifest(manifest: any): Promise<PluginManifest> {
    const required = ['id', 'name', 'version', 'description', 'author', 'license', 'main', 'permissions']

    for (const field of required) {
      if (!manifest[field]) {
        throw new Error(`Invalid manifest: missing field ${field}`)
      }
    }

    // 验证ID格式
    if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      throw new Error('Invalid plugin ID: only lowercase letters, numbers, and hyphens are allowed')
    }

    // 验证版本格式
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      throw new Error('Invalid version format: must be semver (e.g., 1.0.0)')
    }

    return manifest as PluginManifest
  }

  /**
   * 检查版本兼容性
   */
  private checkVersionCompatibility(manifest: PluginManifest): void {
    const currentVersion = import.meta.env.VITE_APP_VERSION || '1.4.0'

    if (this.compareVersions(currentVersion, manifest.minVersion) < 0) {
      throw new Error(
        `Plugin requires AgentForge ${manifest.minVersion} or higher (current: ${currentVersion})`
      )
    }

    if (manifest.maxVersion && this.compareVersions(currentVersion, manifest.maxVersion) > 0) {
      throw new Error(
        `Plugin is not compatible with AgentForge ${currentVersion} (max: ${manifest.maxVersion})`
      )
    }
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(manifest: PluginManifest): Promise<void> {
    if (!manifest.dependencies) return

    for (const [depId, depVersion] of Object.entries(manifest.dependencies)) {
      const depPlugin = this.plugins.get(depId)

      if (!depPlugin) {
        throw new Error(`Missing dependency: ${depId}`)
      }

      if (!this.isVersionSatisfied(depPlugin.manifest.version, depVersion)) {
        throw new Error(
          `Dependency version mismatch: ${depId} ${depVersion} required, but ${depPlugin.manifest.version} installed`
        )
      }
    }
  }

  /**
   * 保存插件
   */
  private async savePlugin(manifest: PluginManifest, code: string): Promise<void> {
    const pluginKey = `plugin:${manifest.id}`

    localStorage.setItem(pluginKey, JSON.stringify({
      manifest,
      code,
    }))
  }

  /**
   * 删除插件文件
   */
  private async deletePluginFiles(pluginId: string): Promise<void> {
    const pluginKey = `plugin:${pluginId}`
    localStorage.removeItem(pluginKey)
  }

  /**
   * 加载插件
   */
  private async loadPlugin(manifest: PluginManifest): Promise<any> {
    const pluginKey = `plugin:${manifest.id}`
    const stored = localStorage.getItem(pluginKey)

    if (!stored) {
      throw new Error(`Plugin ${manifest.id} not found in storage`)
    }

    const { code } = JSON.parse(stored)

    // 创建沙箱并执行插件代码
    const sandbox = this.createSandbox(manifest)
    const pluginModule = this.executeInSandbox(code, sandbox)

    return pluginModule
  }

  /**
   * 创建沙箱
   */
  private createSandbox(manifest: PluginManifest): any {
    const sandbox: any = {
      console: {
        log: (...args: any[]) => console.log(`[Plugin:${manifest.name}]`, ...args),
        warn: (...args: any[]) => console.warn(`[Plugin:${manifest.name}]`, ...args),
        error: (...args: any[]) => console.error(`[Plugin:${manifest.name}]`, ...args),
      },
    }

    // 根据权限提供API
    if (manifest.permissions.includes('storage')) {
      sandbox.storage = this.createStorageAPI(manifest.id)
    }

    if (manifest.permissions.includes('notifications')) {
      sandbox.notifications = this.createNotificationsAPI()
    }

    // 更多权限API...

    return sandbox
  }

  /**
   * 在沙箱中执行代码
   */
  private executeInSandbox(code: string, sandbox: any): any {
    const sandboxProxy = new Proxy(sandbox, {
      has: () => true,
      get: (target, key) => {
        if (key === Symbol.unscopables) return undefined
        return target[key]
      },
    })

    const func = new Function('sandbox', `with (sandbox) { ${code}; return exports; }`)
    return func(sandboxProxy)
  }

  /**
   * 创建Storage API
   */
  private createStorageAPI(pluginId: string) {
    const prefix = `plugin:${pluginId}:data:`

    return {
      get: (key: string) => localStorage.getItem(prefix + key),
      set: (key: string, value: string) => localStorage.setItem(prefix + key, value),
      remove: (key: string) => localStorage.removeItem(prefix + key),
      clear: () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
        keys.forEach(k => localStorage.removeItem(k))
      },
    }
  }

  /**
   * 创建Notifications API
   */
  private createNotificationsAPI() {
    return {
      show: (title: string, message: string, type: string = 'info') => {
        // 集成现有的通知系统
        console.log('[Plugin Notification]', title, message, type)
      },
    }
  }

  /**
   * 加载已安装的插件
   */
  private loadInstalledPlugins(): void {
    const registryData = localStorage.getItem('plugin-registry')

    if (!registryData) return

    try {
      const registry = JSON.parse(registryData)

      for (const pluginData of registry) {
        this.plugins.set(pluginData.manifest.id, {
          ...pluginData,
          installedAt: new Date(pluginData.installedAt),
          updatedAt: pluginData.updatedAt ? new Date(pluginData.updatedAt) : undefined,
        })
      }
    } catch (error) {
      console.error('[PluginManager] Failed to load plugin registry:', error)
    }
  }

  /**
   * 保存插件注册表
   */
  private savePluginRegistry(): void {
    const registry = Array.from(this.plugins.values()).map(plugin => ({
      manifest: plugin.manifest,
      installed: plugin.installed,
      enabled: plugin.enabled,
      installedAt: plugin.installedAt?.toISOString(),
      updatedAt: plugin.updatedAt?.toISOString(),
    }))

    localStorage.setItem('plugin-registry', JSON.stringify(registry))
  }

  /**
   * 比较版本
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1
      if (parts1[i] < parts2[i]) return -1
    }

    return 0
  }

  /**
   * 检查版本是否满足
   */
  private isVersionSatisfied(actual: string, required: string): boolean {
    // 简化版本检查，实际应该支持 ^1.0.0, ~1.0.0 等语法
    return this.compareVersions(actual, required) >= 0
  }
}

// 单例
export const pluginManager = new PluginManager()
