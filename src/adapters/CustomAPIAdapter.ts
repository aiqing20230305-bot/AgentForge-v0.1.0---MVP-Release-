/**
 * 自定义 API 数据源适配器
 * 支持任何符合标准格式的 REST API
 */

import { BaseAgentAdapter, AgentDataTransformer } from './AgentAdapter'
import type { AgentData, DataSource } from '../store/useDataSourceStore'

/**
 * 自定义 API 响应格式
 */
interface CustomAPIResponse {
  agents: Array<{
    id: string
    name: string
    status?: 'online' | 'offline' | 'working' | 'idle'
    level?: number
    role?: string
    skills?: string[]
    description?: string
    metadata?: Record<string, any>
  }>
}

export class CustomAPIAdapter extends BaseAgentAdapter {
  readonly name = 'Custom API Adapter'
  readonly supportedTypes = ['custom-api']

  /**
   * 创建请求头
   */
  private createHeaders(source: DataSource): HeadersInit {
    const config = source.config as {
      headers?: Record<string, string>
      authType?: 'bearer' | 'basic' | 'apikey' | 'none'
      authValue?: string
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    // 添加认证头
    if (config.authType && config.authValue) {
      switch (config.authType) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${config.authValue}`
          break
        case 'basic':
          headers['Authorization'] = `Basic ${btoa(config.authValue)}`
          break
        case 'apikey':
          headers['X-API-Key'] = config.authValue
          break
      }
    }

    return headers
  }

  /**
   * 发送 API 请求
   */
  private async request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      this.handleError(error, 'API request failed')
    }
  }

  /**
   * 测试自定义 API 连接
   */
  async testConnection(source: DataSource): Promise<{ success: boolean; message: string }> {
    try {
      const config = source.config as { apiEndpoint: string }
      const headers = this.createHeaders(source)

      // 尝试获取 Agent 列表
      const response = await this.request<CustomAPIResponse>(config.apiEndpoint, {
        method: 'GET',
        headers
      })

      if (response.agents && Array.isArray(response.agents)) {
        return {
          success: true,
          message: `连接成功，找到 ${response.agents.length} 个 Agent`
        }
      }

      return {
        success: false,
        message: 'API 响应格式不正确'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      }
    }
  }

  /**
   * 获取自定义 API Agent 列表
   */
  async fetchAgents(source: DataSource): Promise<AgentData[]> {
    try {
      const config = source.config as { apiEndpoint: string }
      const headers = this.createHeaders(source)

      const response = await this.request<CustomAPIResponse>(config.apiEndpoint, {
        method: 'GET',
        headers
      })

      if (!response.agents || !Array.isArray(response.agents)) {
        throw new Error('Invalid API response format')
      }

      // 转换为标准 AgentData 格式
      return response.agents.map(agent => {
        const agentId = this.createAgentId(source, agent.id)

        return {
          id: agentId,
          name: AgentDataTransformer.normalizeName(agent.name),
          displayName: agent.name,
          sourceId: source.id,
          sourceName: source.name,
          level: agent.level || 1,
          exp: 0,
          maxExp: 100,
          role: agent.role || 'Agent',
          skills: agent.skills || [],
          personality: 'Custom API Agent',
          status: agent.status || 'unknown',
          color: '#10b981',
          description: agent.description || 'Custom API Agent',
          metadata: {
            ...agent.metadata,
            customApiNative: true
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'Failed to fetch custom API agents')
    }
  }

  /**
   * 获取单个 Agent 详情
   */
  async fetchAgentDetails(source: DataSource, agentId: string): Promise<AgentData | null> {
    try {
      const parsed = this.parseAgentId(agentId)
      if (!parsed) return null

      const config = source.config as { apiEndpoint: string }
      const headers = this.createHeaders(source)

      // 尝试调用详情端点
      const detailUrl = `${config.apiEndpoint}/${parsed.originalId}`
      const agent = await this.request<any>(detailUrl, {
        method: 'GET',
        headers
      })

      return {
        id: agentId,
        name: AgentDataTransformer.normalizeName(agent.name),
        displayName: agent.name,
        sourceId: source.id,
        sourceName: source.name,
        level: agent.level || 1,
        exp: agent.exp || 0,
        maxExp: agent.maxExp || 100,
        role: agent.role || 'Agent',
        skills: agent.skills || [],
        personality: agent.personality || 'Custom API Agent',
        status: agent.status || 'unknown',
        color: agent.color || '#10b981',
        description: agent.description || 'Custom API Agent',
        metadata: {
          ...agent.metadata,
          customApiNative: true
        }
      }
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
    try {
      const parsed = this.parseAgentId(agentId)
      if (!parsed) {
        return { success: false, error: 'Invalid agent ID' }
      }

      const config = source.config as { apiEndpoint: string }
      const headers = this.createHeaders(source)

      const commandUrl = `${config.apiEndpoint}/${parsed.originalId}/command`
      const result = await this.request<any>(commandUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ command, args })
      })

      return {
        success: true,
        result
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Command execution failed'
      }
    }
  }
}
