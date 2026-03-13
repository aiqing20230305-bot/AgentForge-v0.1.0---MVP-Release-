// OpenClaw Agents 加载器
export interface OpenClawAgent {
  id: string
  name: string
  level: number
  exp: number
  maxExp: number
  role: string
  skills: string[]
  personality: string
  status: 'online' | 'offline' | 'working' | 'idle'
  color: string
  description?: string
  sourceId?: string
  sourceName?: string
  metadata?: {
    lastActive?: string
    currentTask?: string
    openclawNative?: boolean
    originalName?: string // 原始agent名称（用于API调用）
    [key: string]: any
  }
}

/**
 * 从 AGENT_PROFILES.md 解析 Agent 信息
 */
export function parseAgentProfiles(content: string): OpenClawAgent[] {
  const agents: OpenClawAgent[] = []

  // 匹配每个 Agent 块
  const agentBlocks = content.split('###').slice(1)

  for (const block of agentBlocks) {
    try {
      // 提取名称
      const nameMatch = block.match(/(\w+)\s*-\s*(.+?)\s*[🧙‍♂️🔒👑💼🤖]/u)
      if (!nameMatch) continue

      const name = nameMatch[1].trim()

      // 提取等级
      const levelMatch = block.match(/Lv\.(\d+)/)
      const level = levelMatch ? parseInt(levelMatch[1]) : 1

      // 提取经验
      const expMatch = block.match(/经验:\s*(\d+)\/(\d+)/)
      const exp = expMatch ? parseInt(expMatch[1]) : 0
      const maxExp = expMatch ? parseInt(expMatch[2]) : 1000

      // 提取职位
      const roleMatch = block.match(/职位:\s*(.+?)\s*│/)
      const role = roleMatch ? roleMatch[1].trim() : 'Agent'

      // 提取技能
      const skillsMatch = block.match(/技能:\s*(.+?)\s*│/)
      const skills = skillsMatch ? skillsMatch[1].split(',').map(s => s.trim()) : []

      // 提取性格
      const personalityMatch = block.match(/性格:\s*(.+?)\s*│/)
      const personality = personalityMatch ? personalityMatch[1].trim() : ''

      // 提取颜色
      const colorMatch = block.match(/颜色:\s*[^\s]+\s*(#[0-9a-fA-F]{6})/)
      const color = colorMatch ? colorMatch[1] : '#3b82f6'

      // 提取状态
      let status: OpenClawAgent['status'] = 'offline'
      if (block.includes('🟢 WORKING')) status = 'working'
      else if (block.includes('🟢 ONLINE')) status = 'online'
      else if (block.includes('🟡 IDLE')) status = 'idle'
      else if (block.includes('🔴 OFFLINE')) status = 'offline'

      // 提取描述
      const descMatch = block.match(/\*\*角色定位\*\*:\s*(.+)/)
      const description = descMatch ? descMatch[1].trim() : ''

      agents.push({
        id: name.toLowerCase(),
        name,
        level,
        exp,
        maxExp,
        role,
        skills,
        personality,
        status,
        color,
        description
      })
    } catch (error) {
      console.error('解析 Agent 失败:', error)
    }
  }

  return agents
}

/**
 * 加载 OpenClaw Agents
 * - 优先从数据源管理器加载所有启用的数据源
 * - 如果没有数据源，尝试从旧版 OpenClaw 连接加载
 * - 最后返回模拟数据
 */
export async function loadOpenClawAgents(): Promise<OpenClawAgent[]> {
  console.log('[AgentLoader] Starting agent load...')

  // 1. 尝试从数据源管理器加载
  try {
    const { useDataSourceStore } = await import('../store/useDataSourceStore')
    const { adapterManager } = await import('../adapters')

    const { getEnabledSources } = useDataSourceStore.getState()
    const enabledSources = getEnabledSources()

    if (enabledSources.length > 0) {
      console.log(`[AgentLoader] 从 ${enabledSources.length} 个数据源加载 Agent`)
      const agentDataList = await adapterManager.fetchAgentsFromSources(enabledSources)

      if (agentDataList.length > 0) {
        console.log(`[AgentLoader] Loaded ${agentDataList.length} agents from data sources`)
        // 转换为 OpenClawAgent 格式
        return agentDataList.map(convertAgentDataToLocal)
      }
    }
  } catch (error) {
    console.warn('从数据源管理器加载失败:', error)
  }

  // 2. 尝试从旧版 OpenClaw Gateway 加载（向后兼容）
  try {
    const { createOpenClawClient } = await import('../services/openclawApi')
    const client = createOpenClawClient()

    if (client) {
      const agentStatuses = await client.getAgents()

      if (agentStatuses.length > 0) {
        console.log(`[AgentLoader] Gateway returned ${agentStatuses.length} agents`)
        // 将 API 数据转换为 OpenClawAgent 格式
        return agentStatuses.map(convertApiAgentToLocal)
      }
    }
  } catch (error) {
    console.warn('从 OpenClaw Gateway 加载失败:', error)
  }

  // 3. 返回模拟数据
  console.log('[AgentLoader] Using mock data (8 default agents)')
  return getDefaultAgents()
}

/**
 * 获取默认 Agent 数据（模拟数据）
 */
function getDefaultAgents(): OpenClawAgent[] {
  return [
    {
      id: 'atlas',
      name: 'ATLAS',
      level: 45,
      exp: 8500,
      maxExp: 10000,
      role: 'Team Leader',
      skills: ['Leadership', 'Strategy', 'Management'],
      personality: 'Decisive and strategic',
      status: 'working',
      color: '#3b82f6',
      description:
        '团队领袖，负责战略规划和团队协调。擅长多Agent协作和资源调度，已完成25+大型项目管理。',
      metadata: {
        lastActive: '2026-03-13T14:30:00Z',
        currentTask: '协调跨团队技术攻坚',
        taskStats: {
          completed: 25,
          inProgress: 1,
          total: 28
        }
      }
    },
    {
      id: 'clip',
      name: 'CLIP',
      level: 38,
      exp: 6800,
      maxExp: 8000,
      role: 'Full Stack Dev',
      skills: ['Coding', 'Architecture', 'Testing'],
      personality: 'Detail-oriented and efficient',
      status: 'working',
      color: '#10b981',
      description:
        '全栈开发者，精通前后端技术栈。代码质量极高，注重测试和性能优化，已交付40+功能模块。',
      metadata: {
        lastActive: '2026-03-13T15:00:00Z',
        currentTask: '设计微服务架构',
        taskStats: {
          completed: 42,
          inProgress: 1,
          total: 45
        }
      }
    },
    {
      id: 'oracle',
      name: 'ORACLE',
      level: 50,
      exp: 9800,
      maxExp: 10000,
      role: 'Knowledge Keeper',
      skills: ['Research', 'Analysis', 'Wisdom'],
      personality: 'Wise and patient',
      status: 'online',
      color: '#8b5cf6',
      description:
        '知识守护者，拥有海量技术知识储备。擅长技术调研、数据分析和知识管理，已产出30+研究报告。',
      metadata: {
        lastActive: '2026-03-13T13:45:00Z',
        currentTask: '构建知识图谱系统',
        taskStats: {
          completed: 32,
          inProgress: 1,
          total: 35
        }
      }
    },
    {
      id: 'sentinel',
      name: 'SENTINEL',
      level: 48,
      exp: 8600,
      maxExp: 9000,
      role: 'Security Chief',
      skills: ['Protection', 'Monitoring', 'Defense'],
      personality: 'Vigilant and protective',
      status: 'online',
      color: '#ef4444',
      description:
        '安全主管，7×24小时守护系统安全。精通网络安全、加密技术和威胁检测，已防御200+攻击。',
      metadata: {
        lastActive: '2026-03-13T14:20:00Z',
        currentTask: '升级加密协议',
        taskStats: {
          completed: 28,
          inProgress: 1,
          total: 31
        }
      }
    },
    {
      id: 'nexus',
      name: 'NEXUS',
      level: 42,
      exp: 7200,
      maxExp: 8500,
      role: 'System Architect',
      skills: ['Architecture', 'Coding', 'Design'],
      personality: 'Systematic and innovative',
      status: 'working',
      color: '#f59e0b',
      description:
        '系统架构师，擅长设计可扩展的系统架构。精通微服务、分布式系统和云原生技术，已设计30+架构方案。',
      metadata: {
        lastActive: '2026-03-13T15:30:00Z',
        currentTask: '设计实时数据流架构',
        taskStats: {
          completed: 35,
          inProgress: 1,
          total: 38
        }
      }
    },
    {
      id: 'echo',
      name: 'ECHO',
      level: 40,
      exp: 6900,
      maxExp: 8000,
      role: 'Data Analyst',
      skills: ['Analysis', 'Research', 'Visualization'],
      personality: 'Analytical and insightful',
      status: 'online',
      color: '#06b6d4',
      description:
        '数据分析师，善于从海量数据中发现价值。精通数据挖掘、统计分析和可视化，已产出50+数据报告。',
      metadata: {
        lastActive: '2026-03-13T14:45:00Z',
        currentTask: '分析用户增长趋势',
        taskStats: {
          completed: 48,
          inProgress: 1,
          total: 51
        }
      }
    },
    {
      id: 'nova',
      name: 'NOVA',
      level: 35,
      exp: 5500,
      maxExp: 7000,
      role: 'Innovation Specialist',
      skills: ['Research', 'Strategy', 'Prototyping'],
      personality: 'Creative and forward-thinking',
      status: 'working',
      color: '#a855f7',
      description:
        '创新专家，专注前沿技术研究和创新实践。擅长技术预研、原型开发和创新落地，已孵化15+创新项目。',
      metadata: {
        lastActive: '2026-03-13T15:15:00Z',
        currentTask: '探索AI Agent自主协作',
        taskStats: {
          completed: 22,
          inProgress: 1,
          total: 25
        }
      }
    },
    {
      id: 'aegis',
      name: 'AEGIS',
      level: 44,
      exp: 7800,
      maxExp: 8800,
      role: 'Quality Assurance',
      skills: ['Testing', 'Monitoring', 'Analysis'],
      personality: 'Meticulous and thorough',
      status: 'online',
      color: '#14b8a6',
      description:
        '质量保障专家，确保每一行代码都达到最高标准。精通自动化测试、性能监控和质量体系，已发现300+缺陷。',
      metadata: {
        lastActive: '2026-03-13T14:50:00Z',
        currentTask: '执行全链路压测',
        taskStats: {
          completed: 52,
          inProgress: 1,
          total: 56
        }
      }
    }
  ]
}

/**
 * 将 AgentData 转换为 OpenClawAgent 格式
 */
function convertAgentDataToLocal(agentData: any): OpenClawAgent {
  return {
    id: agentData.id || agentData.name.toLowerCase(),
    name: agentData.displayName || agentData.name.toUpperCase(),
    level: agentData.level || 1,
    exp: agentData.exp || 0,
    maxExp: agentData.maxExp || 100,
    role: agentData.role || 'Agent',
    skills: agentData.skills || [],
    personality: agentData.personality || 'Professional',
    status: agentData.status || 'offline',
    color: agentData.color || '#3b82f6',
    description: agentData.description || agentData.role,
    sourceId: agentData.sourceId,
    sourceName: agentData.sourceName,
    metadata: {
      ...(agentData.metadata || {}),
      taskStats: agentData.taskStats || { completed: 0, inProgress: 0, total: 0 }
    }
  }
}

/**
 * 将 API Agent 数据转换为本地格式（向后兼容）
 */
function convertApiAgentToLocal(apiAgent: any): OpenClawAgent {
  // 根据 Agent 名称分配颜色和默认属性
  const agentDefaults: Record<string, Partial<OpenClawAgent>> = {
    ATLAS: {
      color: '#3b82f6',
      role: 'Team Leader',
      skills: ['Leadership', 'Strategy', 'Management'],
      personality: 'Decisive and strategic'
    },
    CLIP: {
      color: '#10b981',
      role: 'Full Stack Dev',
      skills: ['Coding', 'Architecture', 'Testing'],
      personality: 'Detail-oriented and efficient'
    },
    ORACLE: {
      color: '#8b5cf6',
      role: 'Knowledge Keeper',
      skills: ['Research', 'Analysis', 'Wisdom'],
      personality: 'Wise and patient'
    },
    SENTINEL: {
      color: '#ef4444',
      role: 'Security Chief',
      skills: ['Protection', 'Monitoring', 'Defense'],
      personality: 'Vigilant and protective'
    }
  }

  const defaults = agentDefaults[apiAgent.name] || {}

  return {
    id: apiAgent.name.toLowerCase(),
    name: apiAgent.name,
    status: apiAgent.status || 'offline',
    level: 45, // 从 API 获取或使用默认值
    exp: 8500,
    maxExp: 10000,
    role: defaults.role || 'Agent',
    skills: defaults.skills || ['General'],
    personality: defaults.personality || 'Professional',
    color: defaults.color || '#3b82f6',
    description: apiAgent.currentTask || defaults.role
  }
}

/**
 * 将 OpenClaw Agent 转换为配置组件
 */
export function agentToComponent(agent: OpenClawAgent) {
  const content = `# ${agent.name} - ${agent.role}

## 基本信息
- **等级**: Lv.${agent.level}
- **经验**: ${agent.exp}/${agent.maxExp} (${Math.round((agent.exp / agent.maxExp) * 100)}%)
- **状态**: ${getStatusText(agent.status)}
- **性格**: ${agent.personality}

## 技能
${agent.skills.map(skill => `- ${skill}`).join('\n')}

## 描述
${agent.description || '专业的AI Agent，随时待命'}

## 工作方式
根据角色定位和技能特长，高效完成分配的任务。
`

  return {
    id: `agent-${agent.name.toLowerCase()}`,
    path: `~/.openclaw/agents/${agent.name}.md`,
    name: agent.name,
    category: 'roles' as const,
    content,
    tokens: 200,
    rarity: getRarityByLevel(agent.level),
    modifiedAt: new Date().toISOString()
  }
}

function getStatusText(status: string): string {
  const statusMap = {
    online: '🟢 在线',
    offline: '🔴 离线',
    working: '🟢 工作中',
    idle: '🟡 空闲'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

function getRarityByLevel(level: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  if (level >= 45) return 'legendary'
  if (level >= 35) return 'epic'
  if (level >= 25) return 'rare'
  if (level >= 15) return 'uncommon'
  return 'common'
}
