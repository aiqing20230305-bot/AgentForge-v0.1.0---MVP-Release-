/**
 * 本地脚本数据源适配器
 * 执行本地脚本获取 Agent 数据
 * 注意：Electron 环境需要配置 nodeIntegration
 */

import { BaseAgentAdapter, AgentDataTransformer } from './AgentAdapter'
import type { AgentData, DataSource } from '../store/useDataSourceStore'

export class LocalScriptAdapter extends BaseAgentAdapter {
  readonly name = 'Local Script Adapter'
  readonly supportedTypes = ['local-script']

  /**
   * 测试脚本连接（检查脚本是否存在）
   */
  async testConnection(source: DataSource): Promise<{ success: boolean; message: string }> {
    try {
      const config = source.config as {
        scriptPath: string
        interpreter?: string
      }

      // 在浏览器环境中，无法直接执行本地脚本
      // 需要通过 Electron IPC 或其他方式
      if (typeof window !== 'undefined' && !window.require) {
        return {
          success: false,
          message: '本地脚本适配器仅在 Electron 环境中可用'
        }
      }

      return {
        success: true,
        message: `脚本路径: ${config.scriptPath}`
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '测试失败'
      }
    }
  }

  /**
   * 执行脚本并获取 Agent 列表
   */
  async fetchAgents(source: DataSource): Promise<AgentData[]> {
    try {
      const config = source.config as {
        scriptPath: string
        interpreter?: string
        args?: string[]
      }

      // 检查是否在 Electron 环境
      if (typeof window !== 'undefined' && !window.require) {
        console.warn('Local script adapter requires Electron environment')
        return []
      }

      // 在实际实现中，这里应该通过 Electron IPC 调用主进程执行脚本
      // 示例返回格式
      const scriptOutput = await this.executeScript(
        config.scriptPath,
        config.interpreter || 'node',
        config.args || []
      )

      // 解析脚本输出（假设返回 JSON）
      const data = JSON.parse(scriptOutput)

      if (!data.agents || !Array.isArray(data.agents)) {
        throw new Error('Invalid script output format')
      }

      // 转换为标准格式
      return data.agents.map((agent: any) => {
        const agentId = this.createAgentId(source, agent.id || agent.name)

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
          personality: agent.personality || 'Script-based Agent',
          status: agent.status || 'unknown',
          color: agent.color || '#8b5cf6',
          description: agent.description || 'Local Script Agent',
          metadata: {
            ...agent.metadata,
            scriptPath: config.scriptPath,
            localScriptNative: true
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'Failed to execute local script')
    }
  }

  /**
   * 执行本地脚本（占位实现）
   */
  private async executeScript(
    _scriptPath: string,
    _interpreter: string,
    _args: string[]
  ): Promise<string> {
    // 在实际实现中，应该通过 Electron IPC 调用主进程
    // 这里返回模拟数据
    return JSON.stringify({
      agents: [
        {
          name: 'Local Agent',
          status: 'online',
          level: 1,
          role: 'Script Agent'
        }
      ]
    })
  }
}
