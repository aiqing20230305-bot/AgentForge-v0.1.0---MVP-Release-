/**
 * OpenClaw WebSocket Client
 *
 * 完整的OpenClaw Gateway WebSocket连接管理
 * 支持认证、心跳、自动重连、实时消息
 */

export interface OpenClawConfig {
  url: string
  token: string
}

export interface OpenClawAgent {
  id: string
  name: string
  status: 'online' | 'offline' | 'working' | 'idle'
  model?: string
  workspace?: string
  [key: string]: any
}

export interface WebSocketMessage {
  type: string
  [key: string]: any
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export class OpenClawWebSocketClient {
  private ws: WebSocket | null = null
  private config: OpenClawConfig | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connectionStatus: ConnectionStatus = 'disconnected'
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private statusListeners: Set<(status: ConnectionStatus, error?: string) => void> = new Set()

  /**
   * 连接到OpenClaw Gateway
   */
  async connect(config: OpenClawConfig): Promise<boolean> {
    console.log('[OpenClawWS] Connecting to', config.url)
    this.config = config
    this.setStatus('connecting')

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(config.url)

        // 连接成功
        this.ws.onopen = () => {
          console.log('[OpenClawWS] ✅ WebSocket connected')
          this.reconnectAttempts = 0

          // 发送认证消息
          this.sendAuth(config.token)

          // 启动心跳
          this.startHeartbeat()

          this.setStatus('connected')
          resolve(true)
        }

        // 接收消息
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        // 连接关闭
        this.ws.onclose = (event) => {
          console.log('[OpenClawWS] Connection closed', event.code, event.reason)
          this.stopHeartbeat()
          this.setStatus('disconnected')

          // 自动重连
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => this.reconnect(), this.reconnectDelay)
          }
        }

        // 连接错误
        this.ws.onerror = (error) => {
          console.error('[OpenClawWS] ❌ WebSocket error:', error)
          this.setStatus('error', 'Connection failed')
          reject(new Error('WebSocket connection failed'))
        }

        // 超时处理
        setTimeout(() => {
          if (this.connectionStatus === 'connecting') {
            reject(new Error('Connection timeout'))
          }
        }, 10000)

      } catch (error) {
        console.error('[OpenClawWS] ❌ Failed to create WebSocket:', error)
        this.setStatus('error', String(error))
        reject(error)
      }
    })
  }

  /**
   * 发送认证消息
   */
  private sendAuth(token: string) {
    this.send({
      type: 'auth',
      token: token
    })
  }

  /**
   * 启动心跳
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000) // 每30秒一次心跳
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 自动重连
   */
  private async reconnect() {
    if (!this.config) return

    this.reconnectAttempts++
    console.log(`[OpenClawWS] 🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    try {
      await this.connect(this.config)
    } catch (error) {
      console.error('[OpenClawWS] Reconnect failed:', error)
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string) {
    try {
      const message: WebSocketMessage = JSON.parse(data)
      console.log('[OpenClawWS] 📨 Received:', message.type)

      // 调用对应的消息处理器
      const handler = this.messageHandlers.get(message.type)
      if (handler) {
        handler(message)
      }

      // 处理pong响应
      if (message.type === 'pong') {
        // 心跳响应，连接正常
      }

    } catch (error) {
      console.error('[OpenClawWS] Failed to parse message:', error)
    }
  }

  /**
   * 发送消息
   */
  private send(data: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      console.log('[OpenClawWS] 📤 Sent:', data.type)
    } else {
      console.warn('[OpenClawWS] Cannot send, WebSocket not connected')
    }
  }

  /**
   * 获取Agent列表
   */
  async getAgents(): Promise<OpenClawAgent[]> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageHandlers.delete('agents_response')
        reject(new Error('Request timeout'))
      }, 5000)

      // 注册响应处理器
      this.messageHandlers.set('agents_response', (data) => {
        clearTimeout(timeout)
        this.messageHandlers.delete('agents_response')
        resolve(data.agents || [])
      })

      // 发送请求
      this.send({ type: 'get_agents' })
    })
  }

  /**
   * 发送消息给Agent
   */
  async sendMessageToAgent(agentId: string, message: string): Promise<void> {
    this.send({
      type: 'send_message',
      agent_id: agentId,
      message: message
    })
  }

  /**
   * 订阅Agent状态更新
   */
  onAgentUpdate(callback: (agents: OpenClawAgent[]) => void) {
    this.messageHandlers.set('agent_update', (data) => {
      callback(data.agents || [])
    })
  }

  /**
   * 监听连接状态变化
   */
  onStatusChange(callback: (status: ConnectionStatus, error?: string) => void) {
    this.statusListeners.add(callback)
    // 立即调用一次当前状态
    callback(this.connectionStatus)
  }

  /**
   * 移除状态监听器
   */
  offStatusChange(callback: (status: ConnectionStatus, error?: string) => void) {
    this.statusListeners.delete(callback)
  }

  /**
   * 设置连接状态
   */
  private setStatus(status: ConnectionStatus, error?: string) {
    this.connectionStatus = status
    this.statusListeners.forEach(listener => listener(status, error))
  }

  /**
   * 获取当前连接状态
   */
  getStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  /**
   * 断开连接
   */
  disconnect() {
    console.log('[OpenClawWS] Disconnecting...')
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.setStatus('disconnected')
    this.messageHandlers.clear()
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.connectionStatus === 'connected'
  }
}

// 单例实例
let instance: OpenClawWebSocketClient | null = null

/**
 * 获取OpenClaw WebSocket客户端实例
 */
export function getOpenClawWSClient(): OpenClawWebSocketClient {
  if (!instance) {
    instance = new OpenClawWebSocketClient()
  }
  return instance
}
