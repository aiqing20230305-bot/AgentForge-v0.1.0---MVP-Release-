/**
 * 适配器管理器
 * 注册和管理所有数据源适配器
 */

import type { IAgentAdapter } from './AgentAdapter'
import type { AgentData, DataSource } from '../store/useDataSourceStore'
import { OpenClawAdapter } from './OpenClawAdapter'
import { CustomAPIAdapter } from './CustomAPIAdapter'
import { LocalScriptAdapter } from './LocalScriptAdapter'

/**
 * 适配器管理器单例
 */
export class AdapterManager {
  private static instance: AdapterManager
  private adapters: Map<string, IAgentAdapter> = new Map()

  private constructor() {
    // 注册内置适配器
    this.registerAdapter(new OpenClawAdapter())
    this.registerAdapter(new CustomAPIAdapter())
    this.registerAdapter(new LocalScriptAdapter())
  }

  /**
   * 获取管理器实例
   */
  static getInstance(): AdapterManager {
    if (!AdapterManager.instance) {
      AdapterManager.instance = new AdapterManager()
    }
    return AdapterManager.instance
  }

  /**
   * 注册适配器
   */
  registerAdapter(adapter: IAgentAdapter): void {
    for (const type of adapter.supportedTypes) {
      this.adapters.set(type, adapter)
    }
    console.log(
      `[AdapterManager] Registered adapter: ${adapter.name} for types: ${adapter.supportedTypes.join(', ')}`
    )
  }

  /**
   * 获取适配器
   */
  getAdapter(type: string): IAgentAdapter | undefined {
    return this.adapters.get(type)
  }

  /**
   * 获取数据源的适配器
   */
  getAdapterForSource(source: DataSource): IAgentAdapter | undefined {
    return this.getAdapter(source.type)
  }

  /**
   * 测试数据源连接
   */
  async testConnection(source: DataSource): Promise<{ success: boolean; message: string }> {
    const adapter = this.getAdapterForSource(source)
    if (!adapter) {
      return {
        success: false,
        message: `不支持的数据源类型: ${source.type}`
      }
    }

    try {
      return await adapter.testConnection(source)
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '测试失败'
      }
    }
  }

  /**
   * 获取数据源的 Agent 列表
   */
  async fetchAgents(source: DataSource): Promise<AgentData[]> {
    const adapter = this.getAdapterForSource(source)
    if (!adapter) {
      console.error(`No adapter found for source type: ${source.type}`)
      return []
    }

    try {
      return await adapter.fetchAgents(source)
    } catch (error) {
      console.error(`Failed to fetch agents from source ${source.name}:`, error)
      return []
    }
  }

  /**
   * 批量获取多个数据源的 Agent
   */
  async fetchAgentsFromSources(sources: DataSource[]): Promise<AgentData[]> {
    const results = await Promise.allSettled(sources.map(source => this.fetchAgents(source)))

    const agents: AgentData[] = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        agents.push(...result.value)
      } else {
        console.error(`Failed to fetch from source ${sources[index].name}:`, result.reason)
      }
    })

    return agents
  }

  /**
   * 获取 Agent 详情
   */
  async fetchAgentDetails(source: DataSource, agentId: string): Promise<AgentData | null> {
    const adapter = this.getAdapterForSource(source)
    if (!adapter || !adapter.fetchAgentDetails) {
      return null
    }

    try {
      return await adapter.fetchAgentDetails(source, agentId)
    } catch (error) {
      console.error('Failed to fetch agent details:', error)
      return null
    }
  }

  /**
   * 执行 Agent 命令
   */
  async executeCommand(
    source: DataSource,
    agentId: string,
    command: string,
    args?: any
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const adapter = this.getAdapterForSource(source)
    if (!adapter || !adapter.executeCommand) {
      return {
        success: false,
        error: 'Command execution not supported'
      }
    }

    try {
      return await adapter.executeCommand(source, agentId, command, args)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Command failed'
      }
    }
  }

  /**
   * 获取 Agent 状态
   */
  async getAgentStatus(
    source: DataSource,
    agentId: string
  ): Promise<{ status: 'online' | 'offline' | 'working' | 'idle' | 'unknown'; message?: string }> {
    const adapter = this.getAdapterForSource(source)
    if (!adapter || !adapter.getAgentStatus) {
      return {
        status: 'offline',
        message: 'Status check not supported'
      }
    }

    try {
      return await adapter.getAgentStatus(source, agentId)
    } catch (error) {
      return {
        status: 'offline',
        message: error instanceof Error ? error.message : 'Failed to get status'
      }
    }
  }

  /**
   * 获取所有支持的数据源类型
   */
  getSupportedTypes(): string[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * 检查是否支持某个数据源类型
   */
  isTypeSupported(type: string): boolean {
    return this.adapters.has(type)
  }
}

// 导出单例实例
export const adapterManager = AdapterManager.getInstance()
