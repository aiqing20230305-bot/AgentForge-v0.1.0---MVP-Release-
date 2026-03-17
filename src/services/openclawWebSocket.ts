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

export interface ConnectionQuality {
  latency: number // ms
  status: 'excellent' | 'good' | 'fair' | 'poor'
  lastPing: number
  missedPings: number
}

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
  private errorListeners: Set<(error: string, details?: any) => void> = new Set()
  private qualityListeners: Set<(quality: ConnectionQuality) => void> = new Set()

  // Connection quality tracking
  private lastPingTime = 0
  private lastPongTime = 0
  private missedPings = 0
  private latencyHistory: number[] = []
  private connectionQuality: ConnectionQuality = {
    latency: 0,
    status: 'excellent',
    lastPing: 0,
    missedPings: 0,
  }

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
        this.lastPingTime = Date.now()
        this.send({ type: 'ping' })

        // 检查是否收到上次的pong
        if (this.lastPongTime < this.lastPingTime - 35000) {
          this.missedPings++
          console.warn(`[OpenClawWS] ⚠️ Missed pong (${this.missedPings})`)

          // 连续3次未收到pong，认为连接质量差
          if (this.missedPings >= 3) {
            console.error('[OpenClawWS] ❌ Too many missed pings, reconnecting...')
            this.reconnect()
          }
        }

        // 更新连接质量
        this.updateConnectionQuality()
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

    // 指数退避策略
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)
    console.log(`[OpenClawWS] Waiting ${delay}ms before reconnect...`)

    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      await this.connect(this.config)
    } catch (error) {
      console.error('[OpenClawWS] Reconnect failed:', error)
      this.notifyError('重连失败', error)

      // 达到最大重连次数
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.notifyError('已达到最大重连次数，请检查网络连接或手动重连')
      }
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string) {
    try {
      const message: WebSocketMessage = JSON.parse(data)
      console.log('[OpenClawWS] 📨 Received:', message.type)

      // 处理 'event' 类型消息（OpenClaw协议适配）
      if (message.type === 'event') {
        this.handleEventMessage(message)
        return
      }

      // 调用对应的消息处理器
      const handler = this.messageHandlers.get(message.type)
      if (handler) {
        handler(message)
      }

      // 处理pong响应
      if (message.type === 'pong') {
        // 心跳响应，连接正常
        this.lastPongTime = Date.now()
      }

    } catch (error) {
      console.error('[OpenClawWS] Failed to parse message:', error)
      this.notifyError('消息解析失败', error)
    }
  }

  /**
   * 处理event类型消息（OpenClaw协议）
   */
  private handleEventMessage(message: WebSocketMessage) {
    const eventType = message.event || message.eventType
    console.log('[OpenClawWS] 📨 Event:', eventType)

    // 根据event类型分发到对应的handler
    switch (eventType) {
      case 'agent_update':
      case 'agents_update':
        const handler = this.messageHandlers.get('agent_update')
        if (handler) {
          handler({ ...message, type: 'agent_update' })
        }
        break
      case 'agent_status':
        const statusHandler = this.messageHandlers.get('agent_status')
        if (statusHandler) {
          statusHandler(message)
        }
        break
      default:
        console.log('[OpenClawWS] Unknown event type:', eventType)
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

  /**
   * 更新连接质量
   */
  private updateConnectionQuality() {
    if (this.lastPongTime > 0 && this.lastPingTime > 0) {
      const latency = this.lastPongTime - this.lastPingTime
      this.latencyHistory.push(latency)

      // 只保留最近10次的延迟记录
      if (this.latencyHistory.length > 10) {
        this.latencyHistory.shift()
      }

      // 计算平均延迟
      const avgLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length

      // 判断连接质量
      let status: ConnectionQuality['status'] = 'excellent'
      if (avgLatency > 1000) {
        status = 'poor'
      } else if (avgLatency > 500) {
        status = 'fair'
      } else if (avgLatency > 200) {
        status = 'good'
      }

      this.connectionQuality = {
        latency: Math.round(avgLatency),
        status,
        lastPing: this.lastPingTime,
        missedPings: this.missedPings,
      }

      // 通知监听器
      this.qualityListeners.forEach(listener => listener(this.connectionQuality))
    }
  }

  /**
   * 获取连接质量
   */
  getConnectionQuality(): ConnectionQuality {
    return { ...this.connectionQuality }
  }

  /**
   * 监听连接质量变化
   */
  onQualityChange(callback: (quality: ConnectionQuality) => void) {
    this.qualityListeners.add(callback)
    // 立即调用一次
    callback(this.getConnectionQuality())
  }

  /**
   * 移除质量监听器
   */
  offQualityChange(callback: (quality: ConnectionQuality) => void) {
    this.qualityListeners.delete(callback)
  }

  /**
   * 监听错误
   */
  onError(callback: (error: string, details?: any) => void) {
    this.errorListeners.add(callback)
  }

  /**
   * 移除错误监听器
   */
  offError(callback: (error: string, details?: any) => void) {
    this.errorListeners.delete(callback)
  }

  /**
   * 通知错误
   */
  private notifyError(error: string, details?: any) {
    console.error('[OpenClawWS] Error:', error, details)
    this.errorListeners.forEach(listener => listener(error, details))
  }

  /**
   * 导出配置
   */
  exportConfig(): OpenClawConfig | null {
    return this.config ? { ...this.config } : null
  }

  /**
   * 手动重连
   */
  async manualReconnect(): Promise<boolean> {
    if (!this.config) {
      this.notifyError('无法重连：未保存配置')
      return false
    }

    console.log('[OpenClawWS] 🔄 Manual reconnect requested')
    this.reconnectAttempts = 0 // 重置重连计数
    this.disconnect()

    try {
      return await this.connect(this.config)
    } catch (error) {
      this.notifyError('手动重连失败', error)
      return false
    }
  }

  /**
   * 重置连接质量统计
   */
  resetQualityStats() {
    this.latencyHistory = []
    this.missedPings = 0
    this.connectionQuality = {
      latency: 0,
      status: 'excellent',
      lastPing: 0,
      missedPings: 0,
    }
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
