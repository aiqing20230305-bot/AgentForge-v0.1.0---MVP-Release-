/**
 * OpenClaw 数据源适配器
 */

import { BaseAgentAdapter, AgentDataTransformer } from './AgentAdapter'
import type { AgentData, DataSource } from '../store/useDataSourceStore'
import { OpenClawAPIClient } from '../services/openclawApi'

export class OpenClawAdapter extends BaseAgentAdapter {
  readonly name = 'OpenClaw Adapter'
  readonly supportedTypes = ['openclaw']

  /**
   * 创建 OpenClaw API 客户端（公开方法，供任务和聊天功能使用）
   */
  public createClient(source: DataSource): OpenClawAPIClient {
    if (source.type !== 'openclaw') {
      throw new Error('Invalid source type for OpenClaw adapter')
    }

    const config = source.config as { gatewayUrl: string; authToken: string }
    return new OpenClawAPIClient({
      gatewayUrl: config.gatewayUrl,
      authToken: config.authToken,
      enabled: true
    })
  }

  /**
   * 测试 OpenClaw Gateway 连接
   */
  async testConnection(source: DataSource): Promise<{ success: boolean; message: string }> {
    try {
      const client = this.createClient(source)
      const result = await client.testConnection()
      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      }
    }
  }

  /**
   * 获取 OpenClaw Agent 列表
   */
  async fetchAgents(source: DataSource): Promise<AgentData[]> {
    try {
      const client = this.createClient(source)
      const agentStatuses = await client.getAgents()

      // 转换为标准 AgentData 格式
      return agentStatuses.map((status, index) => {
        const agentId = this.createAgentId(source, status.name || `agent_${index}`)
        const normalizedName = AgentDataTransformer.normalizeName(status.name)

        return {
          id: agentId,
          name: normalizedName,
          displayName: status.name,
          sourceId: source.id,
          sourceName: source.name,
          level: status.level || 50,
          exp: status.exp || 9500,
          maxExp: status.maxExp || 10000,
          role: status.role || 'Team Member',
          skills: status.skills || [],
          personality: status.personality || 'Professional and helpful',
          status: status.status,
          color: status.color || '#3b82f6',
          description: status.description || 'OpenClaw Agent',
          metadata: {
            lastActive: status.lastActive,
            currentTask: status.currentTask,
            openclawNative: true,
            originalName: status.name // 保存原始名称，用于API调用
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'Failed to fetch OpenClaw agents')
    }
  }

  /**
   * 获取单个 Agent 详情
   */
  async fetchAgentDetails(source: DataSource, agentId: string): Promise<AgentData | null> {
    try {
      const parsed = this.parseAgentId(agentId)
      if (!parsed) return null

      const client = this.createClient(source)
      const status = await client.getAgentStatus(parsed.originalId)

      if (!status) return null

      return {
        id: agentId,
        name: AgentDataTransformer.normalizeName(status.name),
        displayName: status.name,
        sourceId: source.id,
        sourceName: source.name,
        level: 50,
        exp: 9500,
        maxExp: 10000,
        role: 'Team Member',
        skills: [],
        personality: 'Professional and helpful',
        status: status.status,
        color: '#3b82f6',
        description: status.currentTask || 'OpenClaw Agent',
        metadata: {
          lastActive: status.lastActive,
          currentTask: status.currentTask,
          openclawNative: true
        }
      }
    } catch (error) {
      console.error('Failed to fetch agent details:', error)
      return null
    }
  }

  /**
   * 获取 Agent 状态
   */
  async getAgentStatus(
    source: DataSource,
    agentId: string
  ): Promise<{ status: 'online' | 'offline' | 'working' | 'idle' | 'unknown'; message?: string }> {
    try {
      const parsed = this.parseAgentId(agentId)
      if (!parsed) {
        return { status: 'offline', message: 'Invalid agent ID' }
      }

      const client = this.createClient(source)
      const agentStatus = await client.getAgentStatus(parsed.originalId)

      if (!agentStatus) {
        return { status: 'offline', message: 'Agent not found' }
      }

      return {
        status: agentStatus.status,
        message: agentStatus.currentTask
      }
    } catch (error) {
      return {
        status: 'offline',
        message: error instanceof Error ? error.message : 'Failed to get status'
      }
    }
  }
}
