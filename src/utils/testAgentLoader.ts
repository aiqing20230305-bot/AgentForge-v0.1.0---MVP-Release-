/**
 * 测试Agent加载工具
 * 快速加载测试数据到AgentForge
 */

import { useDataSourceStore } from '../store/useDataSourceStore'
import { useTaskStore } from '../stores/taskStore'
import { linaJieAgent, linaJieTestTasks } from '../data/testAgents'

/**
 * 加载丽娜姐测试Agent和任务
 */
export function loadLinaJieTestAgent() {
  console.log('[TestAgentLoader] 🎭 Loading 丽娜姐 test agent...')

  // 1. 加载Agent到Store
  const dataSourceStore = useDataSourceStore.getState()
  const existingAgents = dataSourceStore.agentsCache

  // 检查是否已存在
  const exists = existingAgents.find(a => a.id === linaJieAgent.id)
  if (exists) {
    console.log('[TestAgentLoader] ⚠️  丽娜姐 already exists, skipping...')
    return {
      success: true,
      message: '丽娜姐已存在',
      agent: exists
    }
  }

  // 添加Agent
  const updatedAgents = [...existingAgents, linaJieAgent]
  dataSourceStore.updateAgentsCache(updatedAgents)

  console.log('[TestAgentLoader] ✅ Agent loaded:', linaJieAgent.displayName)

  // 2. 加载任务到Store
  const taskStore = useTaskStore.getState()
  let loadedTasks = 0

  linaJieTestTasks.forEach(task => {
    // 检查任务是否已存在
    const taskExists = taskStore.tasks.find(t => t.id === task.id)
    if (!taskExists) {
      taskStore.addTask(task)
      loadedTasks++
    }
  })

  console.log(`[TestAgentLoader] ✅ ${loadedTasks} tasks loaded`)

  // 3. 显示成功通知
  console.log(`
╔═══════════════════════════════════════════╗
║   🎉 丽娜姐测试Agent加载成功！            ║
╠═══════════════════════════════════════════╣
║ 👩‍💼 姓名：丽娜姐                          ║
║ ⭐ 等级：Level 25                        ║
║ 💼 角色：高级产品经理                    ║
║ 💪 技能：6个已解锁                       ║
║ 📋 任务：${loadedTasks}个测试任务                    ║
║ 💎 进化点：450                           ║
║ 🏆 战绩：14胜4负 (78% 胜率)              ║
╚═══════════════════════════════════════════╝
  `)

  return {
    success: true,
    message: '丽娜姐测试Agent加载成功',
    agent: linaJieAgent,
    tasksLoaded: loadedTasks
  }
}

/**
 * 移除测试Agent
 */
export function removeLinaJieTestAgent() {
  console.log('[TestAgentLoader] 🗑️  Removing 丽娜姐 test agent...')

  // 1. 移除Agent
  const dataSourceStore = useDataSourceStore.getState()
  const filteredAgents = dataSourceStore.agentsCache.filter(
    a => a.id !== linaJieAgent.id
  )
  dataSourceStore.updateAgentsCache(filteredAgents)

  // 2. 移除相关任务
  const taskStore = useTaskStore.getState()
  const taskIds = linaJieTestTasks.map(t => t.id)
  taskIds.forEach(id => {
    const task = taskStore.tasks.find(t => t.id === id)
    if (task) {
      taskStore.deleteTask(id)
    }
  })

  console.log('[TestAgentLoader] ✅ Test agent removed')

  return {
    success: true,
    message: '测试Agent已移除'
  }
}

/**
 * 在开发环境自动加载测试Agent
 */
export function autoLoadTestAgentInDev() {
  if (import.meta.env.DEV) {
    // 延迟加载，等待Store初始化
    setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search)
      const loadTest = urlParams.get('loadTest')

      if (loadTest === 'lina') {
        loadLinaJieTestAgent()
      }
    }, 1000)
  }
}

// 暴露到全局window对象，方便控制台调用
if (typeof window !== 'undefined') {
  ;(window as any).loadLinaJie = loadLinaJieTestAgent
  ;(window as any).removeLinaJie = removeLinaJieTestAgent

  console.log(`
🎮 测试Agent工具已加载！

在控制台使用：
  window.loadLinaJie()    - 加载丽娜姐测试Agent
  window.removeLinaJie()  - 移除测试Agent

或在URL添加参数：
  ?loadTest=lina - 自动加载丽娜姐
  `)
}
