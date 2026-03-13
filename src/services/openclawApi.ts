/**
 * OpenClaw Gateway API 客户端
 * 连接到 OpenClaw Gateway 获取实时 Agent 状态和任务信息
 *
 * 支持多实例管理 - 通过 DataSource Store 统一管理
 */

import type { DataSource, AgentData } from '../store/useDataSourceStore'

export interface OpenClawConfig {
  gatewayUrl: string
  authToken: string
  enabled: boolean
}

export interface AgentStatus {
  name: string
  status: 'online' | 'offline' | 'working' | 'idle'
  currentTask?: string
  lastActive?: string
}

export interface TaskInfo {
  id: string
  title: string
  agentId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  description?: string
}

export class OpenClawAPIClient {
  private config: OpenClawConfig
  private baseUrl: string

  constructor(config: OpenClawConfig) {
    this.config = config
    this.baseUrl = config.gatewayUrl.replace(/\/$/, '')
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request('/api/ping')
      return {
        success: response.ok,
        message: response.ok ? '连接成功' : '连接失败'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      }
    }
  }

  /**
   * 获取 Agent 列表
   */
  async getAgents(): Promise<AgentStatus[]> {
    try {
      const response = await this.request('/api/agents')
      const data = await response.json()
      return data.agents || []
    } catch (error) {
      console.error('获取 Agent 列表失败:', error)
      return []
    }
  }

  /**
   * 获取指定 Agent 的状态
   */
  async getAgentStatus(agentId: string): Promise<AgentStatus | null> {
    try {
      const response = await this.request(`/api/agents/${agentId}/status`)
      const data = await response.json()
      return data.agent || null
    } catch (error) {
      console.error(`获取 Agent ${agentId} 状态失败:`, error)
      return null
    }
  }

  /**
   * 获取任务列表
   */
  async getTasks(agentId?: string): Promise<TaskInfo[]> {
    try {
      const url = agentId ? `/api/tasks?agentId=${agentId}` : '/api/tasks'
      const response = await this.request(url)
      const data = await response.json()
      return data.tasks || []
    } catch (error) {
      console.error('获取任务列表失败:', error)
      return []
    }
  }

  /**
   * 创建新任务
   */
  async createTask(task: {
    title: string
    description?: string
    agentId?: string
    priority?: 'low' | 'medium' | 'high'
  }): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const response = await this.request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
      })
      const data = await response.json()
      return {
        success: response.ok,
        taskId: data.taskId,
        error: data.error
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建任务失败'
      }
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.request(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      return {
        success: response.ok,
        error: data.error
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新任务状态失败'
      }
    }
  }

  /**
   * 发送消息给 Agent
   *
   * 注意：当前OpenClaw Gateway可能不支持直接消息发送
   * 这个方法会尝试调用API，如果失败则返回友好提示
   */
  async sendMessage(
    agentId: string,
    message: string
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      // 尝试调用sendMessage API
      const response = await this.request(`/api/agents/${agentId}/message`, {
        method: 'POST',
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        // API返回错误状态
        if (response.status === 404) {
          // 404说明API endpoint不存在
          return {
            success: false,
            error: 'API_NOT_IMPLEMENTED',
            response: `📢 消息已记录：「${message}」\n\n🚧 OpenClaw Gateway 当前版本暂不支持直接消息通信。\n\n💡 建议：\n• 通过飞书与 ${agentId} 交互\n• 或等待 Gateway 功能更新`
          }
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        response: data.response || data.message || '收到消息'
      }
    } catch (error) {
      console.error('发送消息失败:', error)

      // 检查是否是网络错误或API不存在
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        return {
          success: false,
          error: 'API_NOT_IMPLEMENTED',
          response: `📢 消息已记录：「${message}」\n\n🚧 OpenClaw Gateway 当前版本暂不支持直接消息通信。\n\n💡 建议：\n• 通过飞书与 ${agentId} 交互\n• 或等待 Gateway 功能更新`
        }
      }

      return {
        success: false,
        error: errorMessage,
        response: `发送失败：${errorMessage}`
      }
    }
  }

  /**
   * 通用请求方法
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`

    const headers = new Headers(options.headers || {})
    headers.set('Authorization', `Bearer ${this.config.authToken}`)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(url, {
      ...options,
      headers
    })

    return response
  }
}

/**
 * 获取本地 OpenClaw 配置
 */
export function getLocalOpenClawConfig(): OpenClawConfig {
  const saved = localStorage.getItem('openclaw-config')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // 解析失败，使用默认配置
    }
  }

  // 默认配置（OpenClaw API 桥接服务 - 上海小龙虾🦞）
  return {
    gatewayUrl: 'http://localhost:18790', // 使用桥接服务端口
    authToken: 'e4d645acd59df43f1032fa5bcee1540238c01e9796296266',
    enabled: true // 默认启用，连接真实 OpenClaw Agent
  }
}

/**
 * 保存 OpenClaw 配置
 */
export function saveOpenClawConfig(config: OpenClawConfig): void {
  localStorage.setItem('openclaw-config', JSON.stringify(config))
}

/**
 * 创建 API 客户端实例
 */
export function createOpenClawClient(): OpenClawAPIClient | null {
  const config = getLocalOpenClawConfig()
  if (!config.enabled) {
    return null
  }
  return new OpenClawAPIClient(config)
}

/**
 * 从 DataSource 创建 OpenClaw 客户端
 */
export function createOpenClawClientFromSource(source: DataSource): OpenClawAPIClient | null {
  if (source.type !== 'openclaw' || !source.enabled) {
    return null
  }

  const config = source.config as { gatewayUrl: string; authToken: string }
  return new OpenClawAPIClient({
    gatewayUrl: config.gatewayUrl,
    authToken: config.authToken,
    enabled: true
  })
}

/**
 * 获取指定数据源的 Agent 列表（转换为标准格式）
 */
export async function fetchAgentsFromSource(source: DataSource): Promise<AgentData[]> {
  const client = createOpenClawClientFromSource(source)
  if (!client) {
    return []
  }

  try {
    const agentStatuses = await client.getAgents()

    // 转换为标准 AgentData 格式
    return agentStatuses.map((status, index) => ({
      id: `${source.id}_agent_${index}`,
      name: status.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: status.name,
      sourceId: source.id,
      sourceName: source.name,
      level: 50, // 默认等级，实际应从 status 中获取
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
        currentTask: status.currentTask
      }
    }))
  } catch (error) {
    console.error(`获取数据源 ${source.name} 的 Agent 失败:`, error)
    return []
  }
}

/**
 * 批量获取多个数据源的 Agent
 */
export async function fetchAgentsFromSources(sources: DataSource[]): Promise<AgentData[]> {
  const results = await Promise.all(sources.map(source => fetchAgentsFromSource(source)))
  return results.flat()
}
