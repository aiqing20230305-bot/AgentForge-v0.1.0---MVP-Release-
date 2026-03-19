/**
 * OpenClaw WebSocket Protocol Adapter
 *
 * 将OpenClaw Gateway的WebSocket消息转换为AgentData格式
 * 处理不同消息类型，错误处理和重试机制
 */

import type { AgentData } from '../store/useDataSourceStore'
import type { OpenClawAgent } from '../services/openclawWebSocket'

/**
 * 将OpenClaw Agent转换为AgentData格式
 */
export function convertOpenClawAgentToAgentData(
  openclawAgent: OpenClawAgent,
  sourceId: string = 'openclaw-default',
  sourceName: string = 'OpenClaw Gateway'
): AgentData {
  // 从OpenClaw Agent提取基础信息
  const agentId = openclawAgent.id || `openclaw-${Date.now()}`
  const agentName = openclawAgent.name || 'Unknown Agent'

  // 生成随机头像（如果没有提供）
  const avatarEmojis = ['🤖', '🦾', '🧠', '⚡', '🔮', '🎯', '🚀', '💎', '🌟', '✨']
  const avatar = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)]

  // 计算等级（基于status或随机）
  const level = calculateLevel(openclawAgent)
  const exp = level * 800 + Math.floor(Math.random() * 200)
  const maxExp = (level + 1) * 1000

  // 从模型字符串提取技能
  const skills = extractSkills(openclawAgent)

  // 映射状态
  const status = mapOpenClawStatus(openclawAgent.status)

  // 构建完整的AgentData
  const agentData: AgentData = {
    id: agentId,
    name: agentName.toLowerCase().replace(/\s+/g, '-'),
    displayName: agentName,
    sourceId: sourceId,
    sourceName: sourceName,
    avatar: avatar,
    level: level,
    exp: exp,
    maxExp: maxExp,
    role: openclawAgent.model || 'assistant',
    status: status,

    // 技能系统
    skills: skills,

    // 元数据
    metadata: {
      source: 'openclaw',
      openclawId: openclawAgent.id,
      model: openclawAgent.model,
      workspace: openclawAgent.workspace,
      lastSync: new Date().toISOString(),
      rawData: openclawAgent,
    },
  }

  return agentData
}

/**
 * 映射OpenClaw状态到AgentData状态
 */
function mapOpenClawStatus(openclawStatus: string): AgentData['status'] {
  switch (openclawStatus) {
    case 'online':
      return 'online'
    case 'working':
      return 'working'
    case 'idle':
      return 'idle'
    case 'offline':
      return 'offline'
    default:
      return 'unknown'
  }
}

/**
 * 计算Agent等级（基于状态和活动）
 */
function calculateLevel(agent: OpenClawAgent): number {
  // 简单映射：在线=较高等级，离线=较低等级
  const baseLevel = 10

  switch (agent.status) {
    case 'online':
      return baseLevel + Math.floor(Math.random() * 15) // 10-24
    case 'working':
      return baseLevel + Math.floor(Math.random() * 20) // 10-29
    case 'idle':
      return baseLevel + Math.floor(Math.random() * 10) // 10-19
    case 'offline':
      return Math.floor(Math.random() * 10) + 1 // 1-10
    default:
      return baseLevel
  }
}

/**
 * 从OpenClaw Agent提取技能
 */
function extractSkills(agent: OpenClawAgent): string[] {
  const skills: string[] = []

  // 从模型名称推断技能
  if (agent.model) {
    const model = agent.model.toLowerCase()

    if (model.includes('claude')) {
      skills.push('高级推理', '代码生成', '问题解决')
    }

    if (model.includes('opus')) {
      skills.push('复杂任务', '创意写作', '深度分析')
    } else if (model.includes('sonnet')) {
      skills.push('平衡性能', '快速响应', '多任务处理')
    } else if (model.includes('haiku')) {
      skills.push('快速执行', '高效处理', '轻量任务')
    }
  }

  // 从状态推断技能
  if (agent.status === 'working') {
    skills.push('任务执行', '专注工作')
  } else if (agent.status === 'online') {
    skills.push('随时待命', '快速响应')
  }

  // 至少返回一些默认技能
  if (skills.length === 0) {
    skills.push('基础处理', 'AI助手', '任务支持')
  }

  return skills
}


/**
 * 批量转换OpenClaw Agents
 */
export function convertOpenClawAgents(
  openclawAgents: OpenClawAgent[],
  sourceId: string = 'openclaw-default',
  sourceName: string = 'OpenClaw Gateway'
): AgentData[] {
  return openclawAgents.map(agent => convertOpenClawAgentToAgentData(agent, sourceId, sourceName))
}

/**
 * 更新已存在的AgentData（保留本地数据，只更新状态）
 */
export function updateExistingAgentData(
  existing: AgentData,
  openclawAgent: OpenClawAgent
): AgentData {
  // 只更新来自OpenClaw的实时数据
  const status = mapOpenClawStatus(openclawAgent.status)

  return {
    ...existing,
    status,
    metadata: {
      ...existing.metadata,
      lastSync: new Date().toISOString(),
      rawData: openclawAgent,
    },
  }
}

/**
 * 智能合并：如果Agent已存在则更新，否则新建
 */
export function mergeOpenClawAgents(
  existingAgents: AgentData[],
  openclawAgents: OpenClawAgent[],
  sourceId: string = 'openclaw-default',
  sourceName: string = 'OpenClaw Gateway'
): AgentData[] {
  const mergedAgents: AgentData[] = [...existingAgents]

  openclawAgents.forEach(openclawAgent => {
    // 检查是否已存在（通过metadata.openclawId匹配）
    const existingIndex = mergedAgents.findIndex(
      agent => agent.metadata?.openclawId === openclawAgent.id
    )

    if (existingIndex !== -1) {
      // 更新已存在的Agent
      mergedAgents[existingIndex] = updateExistingAgentData(
        mergedAgents[existingIndex],
        openclawAgent
      )
    } else {
      // 添加新Agent
      mergedAgents.push(convertOpenClawAgentToAgentData(openclawAgent, sourceId, sourceName))
    }
  })

  return mergedAgents
}

/**
 * 错误处理包装器
 */
export function safeConvertOpenClawAgent(
  openclawAgent: OpenClawAgent,
  sourceId?: string,
  sourceName?: string
): AgentData | null {
  try {
    return convertOpenClawAgentToAgentData(openclawAgent, sourceId, sourceName)
  } catch (error) {
    console.error('[OpenClawAdapter] Failed to convert agent:', error, openclawAgent)
    return null
  }
}

/**
 * 批量转换（安全版本，过滤失败的转换）
 */
export function safeConvertOpenClawAgents(
  openclawAgents: OpenClawAgent[],
  sourceId?: string,
  sourceName?: string
): AgentData[] {
  return openclawAgents
    .map(agent => safeConvertOpenClawAgent(agent, sourceId, sourceName))
    .filter((agent): agent is AgentData => agent !== null)
}
