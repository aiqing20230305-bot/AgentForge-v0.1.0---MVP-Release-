/**
 * 数据源管理 Store
 * 支持多个 OpenClaw 实例和其他 Agent 数据源
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 数据源类型
export type DataSourceType = 'openclaw' | 'custom-api' | 'local-script' | 'ssh-remote'

// OpenClaw 配置
export interface OpenClawSourceConfig {
  gatewayUrl: string
  authToken: string
}

// 自定义 API 配置
export interface CustomAPISourceConfig {
  apiEndpoint: string
  headers?: Record<string, string>
  authType?: 'bearer' | 'basic' | 'apikey' | 'none'
  authValue?: string
}

// 本地脚本配置
export interface LocalScriptSourceConfig {
  scriptPath: string
  interpreter?: string // node, python, bash, etc.
  args?: string[]
}

// SSH 远程配置
export interface SSHRemoteSourceConfig {
  host: string
  port: number
  username: string
  authMethod: 'password' | 'privatekey'
  password?: string
  privateKeyPath?: string
  openclawPath?: string // remote openclaw installation path
}

// 统一配置类型
export type DataSourceConfig =
  | { type: 'openclaw'; config: OpenClawSourceConfig }
  | { type: 'custom-api'; config: CustomAPISourceConfig }
  | { type: 'local-script'; config: LocalScriptSourceConfig }
  | { type: 'ssh-remote'; config: SSHRemoteSourceConfig }

// 数据源定义
export interface DataSource {
  id: string
  name: string
  description?: string
  type: DataSourceType
  config:
    | OpenClawSourceConfig
    | CustomAPISourceConfig
    | LocalScriptSourceConfig
    | SSHRemoteSourceConfig
  enabled: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
  // 连接状态
  status?: 'online' | 'offline' | 'error' | 'unknown'
  lastChecked?: string
  errorMessage?: string
}

// Agent 数据（从数据源获取的标准格式）
export interface AgentData {
  id: string
  name: string
  displayName: string
  sourceId: string // 来自哪个数据源
  sourceName: string
  level: number
  exp: number
  maxExp: number
  role: string
  skills: string[]
  personality?: string
  status: 'online' | 'offline' | 'working' | 'idle' | 'unknown'
  color?: string
  avatar?: string
  description?: string
  metadata?: Record<string, any> // 额外的自定义字段
}

interface DataSourceStore {
  // 数据源列表
  sources: DataSource[]
  // 当前选中的数据源 ID
  activeSourceId: string | null
  // 从所有数据源获取的 Agent 数据（缓存）
  agentsCache: AgentData[]

  // 添加数据源
  addSource: (source: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>) => string
  // 更新数据源
  updateSource: (id: string, updates: Partial<Omit<DataSource, 'id' | 'createdAt'>>) => void
  // 删除数据源
  removeSource: (id: string) => void
  // 切换数据源启用状态
  toggleSourceEnabled: (id: string) => void
  // 设置默认数据源
  setDefaultSource: (id: string) => void
  // 设置当前活跃数据源
  setActiveSource: (id: string | null) => void

  // 获取指定数据源
  getSource: (id: string) => DataSource | undefined
  // 获取默认数据源
  getDefaultSource: () => DataSource | undefined
  // 获取所有启用的数据源
  getEnabledSources: () => DataSource[]
  // 获取指定类型的数据源
  getSourcesByType: (type: DataSourceType) => DataSource[]

  // Agent 缓存管理
  updateAgentsCache: (agents: AgentData[]) => void
  getAgentsBySource: (sourceId: string) => AgentData[]
  clearAgentsCache: () => void
}

export const useDataSourceStore = create<DataSourceStore>()(
  persist(
    (set, get) => ({
      sources: [],
      activeSourceId: null,
      agentsCache: [],

      addSource: source => {
        const id = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()

        // 如果是第一个数据源，自动设为默认
        const isFirstSource = get().sources.length === 0

        const newSource: DataSource = {
          ...source,
          id,
          createdAt: now,
          updatedAt: now,
          isDefault: isFirstSource || source.isDefault,
          status: 'unknown'
        }

        // 如果设置为默认，取消其他数据源的默认状态
        set(state => ({
          sources: [
            ...state.sources.map(s => (newSource.isDefault ? { ...s, isDefault: false } : s)),
            newSource
          ],
          // 如果是第一个数据源，自动设为活跃
          activeSourceId: isFirstSource ? id : state.activeSourceId
        }))

        return id
      },

      updateSource: (id, updates) => {
        set(state => ({
          sources: state.sources.map(source =>
            source.id === id
              ? {
                  ...source,
                  ...updates,
                  updatedAt: new Date().toISOString()
                }
              : source
          )
        }))
      },

      removeSource: id => {
        set(state => {
          const remainingSources = state.sources.filter(s => s.id !== id)
          const wasDefault = state.sources.find(s => s.id === id)?.isDefault

          // 如果删除的是默认数据源，将第一个启用的数据源设为默认
          if (wasDefault && remainingSources.length > 0) {
            const newDefault = remainingSources.find(s => s.enabled) || remainingSources[0]
            newDefault.isDefault = true
          }

          return {
            sources: remainingSources,
            // 如果删除的是当前活跃数据源，清空活跃状态
            activeSourceId: state.activeSourceId === id ? null : state.activeSourceId,
            // 清除该数据源的 Agent 缓存
            agentsCache: state.agentsCache.filter(agent => agent.sourceId !== id)
          }
        })
      },

      toggleSourceEnabled: id => {
        set(state => ({
          sources: state.sources.map(source =>
            source.id === id
              ? { ...source, enabled: !source.enabled, updatedAt: new Date().toISOString() }
              : source
          )
        }))
      },

      setDefaultSource: id => {
        set(state => ({
          sources: state.sources.map(source => ({
            ...source,
            isDefault: source.id === id,
            updatedAt: source.id === id ? new Date().toISOString() : source.updatedAt
          }))
        }))
      },

      setActiveSource: id => {
        set({ activeSourceId: id })
      },

      getSource: id => {
        return get().sources.find(s => s.id === id)
      },

      getDefaultSource: () => {
        return get().sources.find(s => s.isDefault)
      },

      getEnabledSources: () => {
        return get().sources.filter(s => s.enabled)
      },

      getSourcesByType: type => {
        return get().sources.filter(s => s.type === type)
      },

      updateAgentsCache: agents => {
        set({ agentsCache: agents })
      },

      getAgentsBySource: sourceId => {
        return get().agentsCache.filter(agent => agent.sourceId === sourceId)
      },

      clearAgentsCache: () => {
        set({ agentsCache: [] })
      }
    }),
    {
      name: 'agent-data-source-store'
    }
  )
)

/**
 * 初始化默认数据源（如果没有）
 */
export function initializeDefaultDataSources(): void {
  const store = useDataSourceStore.getState()

  // 如果已有数据源，不初始化
  if (store.sources.length > 0) {
    return
  }

  // 添加默认的本地 OpenClaw 数据源
  store.addSource({
    name: '本地 OpenClaw',
    description: '本地 OpenClaw 桥接服务（上海小龙虾）',
    type: 'openclaw',
    config: {
      gatewayUrl: 'http://localhost:18790',
      authToken: 'e4d645acd59df43f1032fa5bcee1540238c01e9796296266'
    },
    enabled: true,
    isDefault: true
  })
}
