/**
 * Agent 适配器接口
 * 定义标准的 Agent 数据获取接口，支持不同数据源
 */

import type { AgentData, DataSource } from '../store/useDataSourceStore'

/**
 * Agent 适配器抽象接口
 * 所有数据源适配器必须实现此接口
 */
export interface IAgentAdapter {
  /**
   * 适配器名称
   */
  readonly name: string

  /**
   * 支持的数据源类型
   */
  readonly supportedTypes: string[]

  /**
   * 测试连接
   */
  testConnection(source: DataSource): Promise<{ success: boolean; message: string }>

  /**
   * 获取 Agent 列表
   */
  fetchAgents(source: DataSource): Promise<AgentData[]>

  /**
   * 获取单个 Agent 详情（可选）
   */
  fetchAgentDetails?(source: DataSource, agentId: string): Promise<AgentData | null>

  /**
   * 执行 Agent 命令（可选）
   */
  executeCommand?(
    source: DataSource,
    agentId: string,
    command: string,
    args?: any
  ): Promise<{ success: boolean; result?: any; error?: string }>

  /**
   * 获取 Agent 状态（可选）
   */
  getAgentStatus?(
    source: DataSource,
    agentId: string
  ): Promise<{ status: 'online' | 'offline' | 'working' | 'idle' | 'unknown'; message?: string }>
}

/**
 * Agent 适配器基类
 * 提供通用功能实现
 */
export abstract class BaseAgentAdapter implements IAgentAdapter {
  abstract readonly name: string
  abstract readonly supportedTypes: string[]

  abstract testConnection(source: DataSource): Promise<{ success: boolean; message: string }>
  abstract fetchAgents(source: DataSource): Promise<AgentData[]>

  /**
   * 检查数据源是否支持
   */
  supports(source: DataSource): boolean {
    return this.supportedTypes.includes(source.type)
  }

  /**
   * 创建标准 Agent ID
   */
  protected createAgentId(source: DataSource, originalId: string): string {
    return `${source.id}_${originalId}`
  }

  /**
   * 解析 Agent ID
   */
  protected parseAgentId(agentId: string): { sourceId: string; originalId: string } | null {
    const parts = agentId.split('_')
    if (parts.length < 2) return null
    return {
      sourceId: parts[0],
      originalId: parts.slice(1).join('_')
    }
  }

  /**
   * 处理错误
   */
  protected handleError(error: any, context: string): never {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[${this.name}] ${context}:`, error)
    throw new Error(`${context}: ${message}`)
  }

  /**
   * 默认不支持获取详情
   */
  fetchAgentDetails?(_source: DataSource, _agentId: string): Promise<AgentData | null> {
    return Promise.resolve(null)
  }

  /**
   * 默认不支持执行命令
   */
  executeCommand?(
    _source: DataSource,
    _agentId: string,
    _command: string,
    _args?: any
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    return Promise.resolve({
      success: false,
      error: 'Command execution not supported by this adapter'
    })
  }

  /**
   * 默认不支持获取状态
   */
  getAgentStatus?(
    _source: DataSource,
    _agentId: string
  ): Promise<{ status: 'online' | 'offline' | 'working' | 'idle' | 'unknown'; message?: string }> {
    return Promise.resolve({
      status: 'unknown',
      message: 'Status check not supported by this adapter'
    })
  }
}

/**
 * 数据转换工具
 */
export class AgentDataTransformer {
  /**
   * 标准化 Agent 名称（用于 ID）
   */
  static normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-')
  }

  /**
   * 创建默认 Agent 数据
   */
  static createDefaultAgentData(
    source: DataSource,
    originalId: string,
    displayName: string
  ): Partial<AgentData> {
    return {
      id: `${source.id}_${originalId}`,
      name: this.normalizeName(displayName),
      displayName,
      sourceId: source.id,
      sourceName: source.name,
      level: 1,
      exp: 0,
      maxExp: 100,
      role: 'Agent',
      skills: [],
      personality: 'Default personality',
      status: 'unknown' as any,
      color: '#6b7280',
      metadata: {}
    }
  }

  /**
   * 合并 Agent 数据（用于更新部分字段）
   */
  static mergeAgentData(base: Partial<AgentData>, updates: Partial<AgentData>): AgentData {
    return {
      ...this.createDefaultAgentData(
        { id: base.sourceId!, name: base.sourceName! } as DataSource,
        base.name!,
        base.displayName!
      ),
      ...base,
      ...updates
    } as AgentData
  }
}
