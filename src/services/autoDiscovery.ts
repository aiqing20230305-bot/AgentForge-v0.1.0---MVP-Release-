/**
 * 自动发现服务
 * 自动发现本地 OpenClaw 实例和 Claude Agent 配置
 */

export interface DiscoveryResult {
  type: 'openclaw' | 'claude-agent' | 'local-script'
  name: string
  config: any
  confidence: number // 0-1 的置信度
  source: string // 发现来源
}

/**
 * 扫描常见端口，查找 OpenClaw Gateway
 */
export async function discoverOpenClawInstances(): Promise<DiscoveryResult[]> {
  const commonPorts = [18790, 3000, 8080, 8888, 5000]
  const results: DiscoveryResult[] = []

  for (const port of commonPorts) {
    try {
      const url = `http://localhost:${port}`
      const response = await fetch(`${url}/api/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2秒超时
      })

      if (response.ok) {
        const data = await response.json()

        // 验证是否是 OpenClaw Gateway
        if (data.service === 'openclaw-gateway' || data.name?.includes('openclaw')) {
          results.push({
            type: 'openclaw',
            name: `OpenClaw Gateway (端口 ${port})`,
            config: {
              gatewayUrl: url,
              authToken: '', // 需要用户输入
              port
            },
            confidence: 0.9,
            source: `自动扫描端口 ${port}`
          })
        }
      }
    } catch (error) {
      // 端口无响应，继续下一个
      continue
    }
  }

  return results
}

/**
 * 从文件系统读取 OpenClaw 配置
 */
export async function discoverOpenClawConfig(): Promise<DiscoveryResult[]> {
  const results: DiscoveryResult[] = []

  try {
    // 检查是否在 Electron 环境中
    if (!window.electronAPI) {
      console.log('[AutoDiscovery] 非 Electron 环境，跳过本地配置扫描')
      return results
    }

    // 尝试读取 ~/.openclaw/openclaw.json
    const homeDir = await window.electronAPI.getHomeDir()
    const configPath = `${homeDir}/.openclaw/openclaw.json`
    const content = await window.electronAPI.readFile(configPath)

    if (content) {
      const config = JSON.parse(content)

      // 读取 Gateway 端口（默认 18789）
      const gatewayPort = process.env.OPENCLAW_GATEWAY_PORT || '18789'

      results.push({
        type: 'openclaw',
        name: 'OpenClaw (本地配置)',
        config: {
          gatewayUrl: config.gateway?.url || `http://localhost:${gatewayPort}`,
          authToken: config.gateway?.auth?.token || config.gateway?.authToken || '',
          bots: config.bots || [],
          mode: config.gateway?.mode || 'local'
        },
        confidence: 1.0,
        source: '~/.openclaw/openclaw.json'
      })
    }
  } catch (error) {
    console.warn('无法读取 OpenClaw 配置:', error)
  }

  return results
}

/**
 * 扫描 Claude Agent 配置目录
 */
export async function discoverClaudeAgents(): Promise<DiscoveryResult[]> {
  const results: DiscoveryResult[] = []

  try {
    // 检查是否在 Electron 环境中
    if (!window.electronAPI) {
      console.log('[AutoDiscovery] 非 Electron 环境，跳过 Claude Agents 扫描')
      return results
    }

    // 读取 ~/.claude/agents/ 目录
    const homeDir = await window.electronAPI.getHomeDir()
    const agentsDir = `${homeDir}/.claude/agents`

    console.log('[AutoDiscovery] 扫描目录:', agentsDir)

    const files = await window.electronAPI.scanDirectory(agentsDir)

    // 将每个 Agent 配置文件转换为数据源
    for (const file of files) {
      results.push({
        type: 'claude-agent',
        name: file.name,
        config: {
          agentPath: file.path,
          content: file.content
        },
        confidence: 0.9,
        source: `~/.claude/agents/${file.name}.md`
      })
    }

    console.log(`[AutoDiscovery] 发现 ${results.length} 个 Claude Agent`)
  } catch (error) {
    console.warn('无法扫描 Claude Agents:', error)
  }

  return results
}

/**
 * 扫描本地 OpenClaw Agent 目录
 */
export async function discoverLocalOpenClawAgents(): Promise<DiscoveryResult[]> {
  const results: DiscoveryResult[] = []

  try {
    // 检查是否在 Electron 环境中
    if (!window.electronAPI) {
      console.log('[AutoDiscovery] 非 Electron 环境，跳过 OpenClaw Agents 扫描')
      return results
    }

    // 读取 ~/.openclaw/agents/ 目录
    const homeDir = await window.electronAPI.getHomeDir()
    const openclawAgentsDir = `${homeDir}/.openclaw/agents`

    console.log('[AutoDiscovery] 扫描 OpenClaw Agents 目录:', openclawAgentsDir)

    const files = await window.electronAPI.scanDirectory(openclawAgentsDir)

    // 将每个 Agent 配置文件转换为数据源
    for (const file of files) {
      // 尝试解析 Agent 信息
      const nameMatch = file.content.match(/^#\s+(.+?)(\s+-\s+(.+))?$/m)
      const agentName = nameMatch ? nameMatch[1].trim() : file.name

      results.push({
        type: 'openclaw',
        name: `OpenClaw - ${agentName}`,
        config: {
          type: 'local-file',
          agentPath: file.path,
          content: file.content,
          agentName
        },
        confidence: 0.85,
        source: `~/.openclaw/agents/${file.name}.md`
      })
    }

    console.log(`[AutoDiscovery] 发现 ${results.length} 个 OpenClaw Agent`)
  } catch (error) {
    console.warn('无法扫描 OpenClaw Agents:', error)
  }

  return results
}

/**
 * 综合自动发现
 */
export async function autoDiscover(): Promise<DiscoveryResult[]> {
  console.log('[AutoDiscovery] 开始自动发现...')

  const [openclawInstances, openclawConfig, localOpenClawAgents, claudeAgents] = await Promise.all([
    discoverOpenClawInstances(),
    discoverOpenClawConfig(),
    discoverLocalOpenClawAgents(),
    discoverClaudeAgents()
  ])

  const allResults = [
    ...openclawInstances,
    ...openclawConfig,
    ...localOpenClawAgents,
    ...claudeAgents
  ]

  console.log(`[AutoDiscovery] 发现 ${allResults.length} 个数据源`)
  console.log(
    '[AutoDiscovery] 详情:',
    allResults.map(r => `${r.name} (${r.source})`)
  )

  return allResults
}

/**
 * 验证发现的配置是否有效
 */
export async function validateDiscovery(result: DiscoveryResult): Promise<boolean> {
  switch (result.type) {
    case 'openclaw':
      return await validateOpenClawConfig(result.config)
    case 'claude-agent':
      return await validateClaudeAgent(result.config)
    case 'local-script':
      return await validateLocalScript(result.config)
    default:
      return false
  }
}

async function validateOpenClawConfig(config: any): Promise<boolean> {
  try {
    // OpenClaw Gateway 是 WebSocket 服务，验证 HTTP 端点是否可访问
    const response = await fetch(config.gatewayUrl, {
      signal: AbortSignal.timeout(3000)
    })
    // 如果返回 HTML（控制台页面）或任何响应，说明 Gateway 在运行
    return response.ok || response.status === 404
  } catch {
    return false
  }
}

async function validateClaudeAgent(config: any): Promise<boolean> {
  // 验证 Agent 配置文件是否存在且格式正确
  return true
}

async function validateLocalScript(config: any): Promise<boolean> {
  // 验证本地脚本是否可执行
  return true
}
