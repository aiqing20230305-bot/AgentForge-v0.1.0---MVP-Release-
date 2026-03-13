import { useState, useEffect } from 'react'
import { loadOpenClawAgents, OpenClawAgent, agentToComponent } from '../utils/openclawLoader'
import { useBuildStore } from '../stores/buildStore'

export default function OpenClawAgentsPanel() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [loading, setLoading] = useState(true)
  const { inventoryItems, scanForItems, addInventoryItem, equipItem, setSelectedCategory } =
    useBuildStore()

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await loadOpenClawAgents()
        setAgents(data)
      } catch (error) {
        console.error('加载 Agents 失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAgents()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-amber-100/60 text-sm">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-amber-100 uppercase tracking-wider flex items-center gap-2">
          <span>🦞</span>
          <span>OpenClaw Agents</span>
        </h2>
        <div className="text-xs text-amber-100/60">{agents.length} 个角色</div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {agents.map(agent => (
          <div
            key={agent.name}
            className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 rounded-lg p-4 hover:border-amber-600 transition-all cursor-pointer"
            style={{ borderColor: agent.color + '40' }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{
                    backgroundColor:
                      agent.status === 'working' || agent.status === 'online'
                        ? '#10b981'
                        : '#ef4444'
                  }}
                />
                <div>
                  <div className="text-base font-bold text-amber-100 flex items-center gap-2">
                    {agent.name}
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: agent.color + '20', color: agent.color }}
                    >
                      Lv.{agent.level}
                    </span>
                  </div>
                  <div className="text-xs text-amber-100/60">{agent.role}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-amber-100/80">
                  {agent.status === 'working' && '🟢 工作中'}
                  {agent.status === 'online' && '🟢 在线'}
                  {agent.status === 'idle' && '🟡 空闲'}
                  {agent.status === 'offline' && '🔴 离线'}
                </div>
              </div>
            </div>

            {/* 经验条 */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-amber-100/60 mb-1">
                <span>经验</span>
                <span>
                  {agent.exp}/{agent.maxExp} ({Math.round((agent.exp / agent.maxExp) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(agent.exp / agent.maxExp) * 100}%`,
                    background: `linear-gradient(90deg, ${agent.color}80, ${agent.color})`
                  }}
                />
              </div>
            </div>

            {/* 技能 */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {agent.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded bg-[#1a1a1a] text-amber-100/80 border border-[#3a3a3a]"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* 描述 */}
            {agent.description && (
              <div className="text-xs text-amber-100/60 mt-2 border-t border-[#3a3a3a] pt-2">
                {agent.description}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  // 将 Agent 转换为组件
                  const component = agentToComponent(agent)

                  // 1. 添加到背包
                  addInventoryItem(component)

                  // 2. 直接装备到 HEAD 槽位
                  const equipped = equipItem('HEAD', component)

                  if (equipped) {
                    alert(
                      `✅ ${agent.name} 已成功装备到 HEAD 槽位！\n\n你可以在中间的装备面板中看到已装备的 Agent。`
                    )
                  } else {
                    // 如果装备失败（比如预算不足），切换到角色分类
                    setSelectedCategory('roles')
                    alert(
                      `⚠️ ${agent.name} 已加载到组件背包，但装备失败（可能是 Token 预算不足）。\n\n请在右侧「组件背包」的「角色」分类中查找并手动装备。`
                    )
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-amber-700/80 hover:bg-amber-600 border border-amber-500 text-amber-100 font-bold rounded transition-colors"
              >
                🎯 加载并装备
              </button>
              <button
                onClick={() => {
                  alert(
                    `📋 ${agent.name} 详情\n\n等级: Lv.${agent.level}\n职位: ${agent.role}\n技能: ${agent.skills.join(', ')}\n性格: ${agent.personality}\n状态: ${agent.status}\n\n${agent.description}`
                  )
                }}
                className="px-3 py-1.5 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] text-amber-100 rounded transition-colors"
              >
                详情
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-amber-100/40 mt-6">
        <p>💡 点击「🎯 加载并装备」直接将 Agent 装备到 HEAD 槽位</p>
        <p className="mt-1">从你的 OpenClaw 团队中选择成员配置新的机器人</p>
      </div>
    </div>
  )
}
