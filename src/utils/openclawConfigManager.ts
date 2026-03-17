/**
 * OpenClaw Configuration Manager
 *
 * 配置导入/导出、验证、存储管理
 */

import type { OpenClawConfig } from '../services/openclawWebSocket'

const STORAGE_KEY = 'openclaw_configs'
const ACTIVE_CONFIG_KEY = 'openclaw_active_config'

export interface SavedConfig extends OpenClawConfig {
  id: string
  name: string
  createdAt: string
  lastUsed?: string
}

/**
 * 保存配置到本地存储
 */
export function saveConfig(config: OpenClawConfig, name: string): SavedConfig {
  const savedConfig: SavedConfig = {
    ...config,
    id: generateConfigId(),
    name,
    createdAt: new Date().toISOString(),
  }

  const configs = getAllConfigs()
  configs.push(savedConfig)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))

  console.log('[ConfigManager] ✅ Config saved:', name)
  return savedConfig
}

/**
 * 获取所有保存的配置
 */
export function getAllConfigs(): SavedConfig[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[ConfigManager] Failed to load configs:', error)
    return []
  }
}

/**
 * 获取指定配置
 */
export function getConfig(id: string): SavedConfig | null {
  const configs = getAllConfigs()
  return configs.find(c => c.id === id) || null
}

/**
 * 删除配置
 */
export function deleteConfig(id: string): boolean {
  const configs = getAllConfigs()
  const filtered = configs.filter(c => c.id !== id)

  if (filtered.length === configs.length) {
    return false // 未找到
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  console.log('[ConfigManager] 🗑️ Config deleted:', id)
  return true
}

/**
 * 更新配置
 */
export function updateConfig(id: string, updates: Partial<OpenClawConfig>): SavedConfig | null {
  const configs = getAllConfigs()
  const index = configs.findIndex(c => c.id === id)

  if (index === -1) {
    return null
  }

  configs[index] = {
    ...configs[index],
    ...updates,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  console.log('[ConfigManager] ✏️ Config updated:', id)
  return configs[index]
}

/**
 * 设置活跃配置
 */
export function setActiveConfig(id: string) {
  localStorage.setItem(ACTIVE_CONFIG_KEY, id)

  // 更新lastUsed时间
  const configs = getAllConfigs()
  const index = configs.findIndex(c => c.id === id)
  if (index !== -1) {
    configs[index].lastUsed = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  }
}

/**
 * 获取活跃配置
 */
export function getActiveConfig(): SavedConfig | null {
  const id = localStorage.getItem(ACTIVE_CONFIG_KEY)
  return id ? getConfig(id) : null
}

/**
 * 导出配置为JSON文件
 */
export function exportConfigToFile(config: SavedConfig): void {
  const dataStr = JSON.stringify(config, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `openclaw-config-${config.name}-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  console.log('[ConfigManager] 📥 Config exported:', config.name)
}

/**
 * 从JSON文件导入配置
 */
export function importConfigFromFile(): Promise<SavedConfig> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      try {
        const text = await file.text()
        const config = JSON.parse(text) as SavedConfig

        // 验证配置格式
        if (!config.url || !config.token) {
          throw new Error('Invalid config format: missing url or token')
        }

        // 生成新ID（避免冲突）
        config.id = generateConfigId()
        config.createdAt = new Date().toISOString()

        // 保存到本地
        const configs = getAllConfigs()
        configs.push(config)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))

        console.log('[ConfigManager] 📤 Config imported:', config.name)
        resolve(config)
      } catch (error) {
        console.error('[ConfigManager] Import failed:', error)
        reject(error)
      }
    }

    input.click()
  })
}

/**
 * 导出所有配置
 */
export function exportAllConfigs(): void {
  const configs = getAllConfigs()
  const dataStr = JSON.stringify(configs, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `openclaw-configs-backup-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  console.log('[ConfigManager] 📥 All configs exported')
}

/**
 * 导入多个配置
 */
export function importAllConfigs(): Promise<SavedConfig[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      try {
        const text = await file.text()
        const importedConfigs = JSON.parse(text) as SavedConfig[]

        if (!Array.isArray(importedConfigs)) {
          throw new Error('Invalid format: expected array of configs')
        }

        // 验证并生成新ID
        const validConfigs = importedConfigs
          .filter(c => c.url && c.token)
          .map(c => ({
            ...c,
            id: generateConfigId(),
            createdAt: new Date().toISOString(),
          }))

        // 合并到现有配置
        const existingConfigs = getAllConfigs()
        const allConfigs = [...existingConfigs, ...validConfigs]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs))

        console.log('[ConfigManager] 📤 Imported', validConfigs.length, 'configs')
        resolve(validConfigs)
      } catch (error) {
        console.error('[ConfigManager] Import failed:', error)
        reject(error)
      }
    }

    input.click()
  })
}

/**
 * 清空所有配置
 */
export function clearAllConfigs(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ACTIVE_CONFIG_KEY)
  console.log('[ConfigManager] 🗑️ All configs cleared')
}

/**
 * 生成配置ID
 */
function generateConfigId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证配置格式
 */
export function validateConfig(config: Partial<OpenClawConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.url) {
    errors.push('URL不能为空')
  } else if (!config.url.startsWith('ws://') && !config.url.startsWith('wss://')) {
    errors.push('URL必须以ws://或wss://开头')
  }

  if (!config.token) {
    errors.push('Token不能为空')
  } else if (config.token.length < 10) {
    errors.push('Token长度不足（至少10个字符）')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 克隆配置
 */
export function cloneConfig(id: string, newName: string): SavedConfig | null {
  const config = getConfig(id)
  if (!config) {
    return null
  }

  const cloned: SavedConfig = {
    ...config,
    id: generateConfigId(),
    name: newName,
    createdAt: new Date().toISOString(),
    lastUsed: undefined,
  }

  const configs = getAllConfigs()
  configs.push(cloned)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))

  console.log('[ConfigManager] 📋 Config cloned:', newName)
  return cloned
}

/**
 * 获取配置统计
 */
export function getConfigStats() {
  const configs = getAllConfigs()
  return {
    total: configs.length,
    active: getActiveConfig()?.id || null,
    mostRecent: configs.sort((a, b) =>
      new Date(b.lastUsed || b.createdAt).getTime() -
      new Date(a.lastUsed || a.createdAt).getTime()
    )[0],
  }
}
