import { useState, useEffect, useCallback } from 'react'
import { loadOpenClawAgents, OpenClawAgent, agentToComponent } from '../utils/openclawLoader'
import { useBuildStore } from '../stores/buildStore'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import AgentCard from './AgentCard'
import { motion } from 'framer-motion'

export default function OpenClawAgentsPanel() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])
  const [loading, setLoading] = useState(true)
  const { addInventoryItem, equipItem, setSelectedCategory } = useBuildStore()

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

  // Handle reorder agents
  const moveAgent = useCallback((dragIndex: number, hoverIndex: number) => {
    const items = Array.from(agents)
    const [draggedItem] = items.splice(dragIndex, 1)
    items.splice(hoverIndex, 0, draggedItem)
    setAgents(items)
  }, [agents])

  // Handle equip agent
  const handleEquip = useCallback((agent: OpenClawAgent) => {
    const component = agentToComponent(agent)
    addInventoryItem(component)
    const equipped = equipItem('HEAD', component)

    if (equipped) {
      alert(
        `✅ ${agent.name} 已成功装备到 HEAD 槽位！\n\n你可以在中间的装备面板中看到已装备的 Agent。`
      )
    } else {
      setSelectedCategory('roles')
      alert(
        `⚠️ ${agent.name} 已加载到组件背包，但装备失败（可能是 Token 预算不足）。\n\n请在右侧「组件背包」的「角色」分类中查找并手动装备。`
      )
    }
  }, [addInventoryItem, equipItem, setSelectedCategory])

  // Handle view details
  const handleViewDetails = useCallback((agent: OpenClawAgent) => {
    alert(
      `📋 ${agent.name} 详情\n\n等级: Lv.${agent.level}\n职位: ${agent.role}\n技能: ${agent.skills.join(', ')}\n性格: ${agent.personality}\n状态: ${agent.status}\n\n${agent.description}`
    )
  }, [])

  // Handle duplicate
  const handleDuplicate = useCallback((agent: OpenClawAgent) => {
    const duplicated = { ...agent, name: `${agent.name} (复制)` }
    setAgents(prev => [...prev, duplicated])
  }, [])

  // Handle delete
  const handleDelete = useCallback((agent: OpenClawAgent) => {
    if (confirm(`确定要移除 ${agent.name} 吗？`)) {
      setAgents(prev => prev.filter(a => a.name !== agent.name))
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          className="text-amber-100/60 text-sm"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          加载中...
        </motion.div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-lg font-bold text-amber-100 uppercase tracking-wider flex items-center gap-2">
            <span>🦞</span>
            <span className="hidden sm:inline">OpenClaw Agents</span>
            <span className="sm:hidden">Agents</span>
          </h2>
          <motion.div
            className="text-xs text-amber-100/60"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {agents.length} 个角色
          </motion.div>
        </motion.div>

        {/* Agent List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              onEquip={handleEquip}
              onViewDetails={handleViewDetails}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              index={index}
            />
          ))}
        </div>

        {/* Footer Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-amber-100/40 mt-6 space-y-1"
        >
          <p>💡 点击「🎯 装备」按钮将 Agent 装备到 HEAD 槽位</p>
          <p className="hidden sm:block">🖱️ 右键点击卡片查看更多操作选项</p>
        </motion.div>
      </div>
    </DndProvider>
  )
}
