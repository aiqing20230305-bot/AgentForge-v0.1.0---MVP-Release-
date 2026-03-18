/**
 * AI Assistant Demo
 * 演示如何使用AI助手服务
 */

import { aiAssistant } from '../src/services/aiAssistant'
import type { Task } from '../src/types/task'

// 示例任务数据
const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: '修复登录bug',
    description: '用户无法登录',
    status: 'failed',
    priority: 'urgent',
    agentId: 'agent-1',
    agentName: 'Developer',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天前
    tags: ['bug', 'authentication', '前端'],
    retryCount: 3
  },
  {
    id: 'task-2',
    title: '实现用户注册',
    description: '新用户注册功能',
    status: 'in_progress',
    priority: 'high',
    agentId: 'agent-1',
    agentName: 'Developer',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tags: ['feature', 'authentication', '前端']
  },
  {
    id: 'task-3',
    title: '优化数据库查询',
    description: '慢查询优化',
    status: 'pending',
    priority: 'urgent',
    agentId: 'agent-2',
    agentName: 'Backend Dev',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4天前
    tags: ['optimization', 'database', '后端']
  },
  {
    id: 'task-4',
    title: '编写单元测试',
    description: '为新功能编写测试',
    status: 'pending',
    priority: 'low',
    agentId: 'agent-1',
    agentName: 'Developer',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['testing', 'quality']
  },
  {
    id: 'task-5',
    title: '更新文档',
    description: 'API文档更新',
    status: 'pending',
    priority: 'low',
    agentId: 'agent-2',
    agentName: 'Backend Dev',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['documentation']
  },
  {
    id: 'task-6',
    title: '设计用户界面',
    description: 'Dashboard界面设计',
    status: 'completed',
    priority: 'high',
    agentId: 'agent-3',
    agentName: 'Designer',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['design', 'UI', '前端'],
    result: '设计完成，已交付开发'
  },
  {
    id: 'task-7',
    title: '实现支付功能',
    description: '集成第三方支付',
    status: 'in_progress',
    priority: 'urgent',
    agentId: 'agent-1',
    agentName: 'Developer',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26小时前
    startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    tags: ['feature', 'payment', '后端']
  }
]

// 演示1: 生成智能建议
async function demo1() {
  console.log('=== Demo 1: 生成智能建议 ===\n')

  const suggestions = await aiAssistant.generateSuggestions(sampleTasks)

  console.log(`找到 ${suggestions.length} 条建议:\n`)

  suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. [${suggestion.type}] ${suggestion.title}`)
    console.log(`   影响: ${suggestion.impact} | 置信度: ${suggestion.confidence}%`)
    console.log(`   ${suggestion.description}\n`)
  })
}

// 演示2: 获取性能指标
async function demo2() {
  console.log('=== Demo 2: 性能指标分析 ===\n')

  const metrics = aiAssistant.getPerformanceMetrics(sampleTasks)

  console.log('关键指标:')
  console.log(`- 任务吞吐量: ${metrics.taskThroughput.toFixed(2)} 任务/天`)
  console.log(`- 平均完成时间: ${metrics.averageCompletionTime.toFixed(1)} 小时`)
  console.log(`- 失败率: ${metrics.failureRate.toFixed(1)}%`)
  console.log(`- 瓶颈数量: ${metrics.bottlenecks.length}`)

  if (metrics.bottlenecks.length > 0) {
    console.log('\n识别的瓶颈:')
    metrics.bottlenecks.forEach((bottleneck, index) => {
      console.log(`  ${index + 1}. ${bottleneck}`)
    })
  }
  console.log()
}

// 演示3: 自然语言命令
async function demo3() {
  console.log('=== Demo 3: 自然语言命令 ===\n')

  const commands = [
    '帮我优化任务队列',
    '分析性能指标',
    '给我一些建议',
    '查看我的工作习惯'
  ]

  for (const command of commands) {
    console.log(`用户: ${command}`)
    const result = await aiAssistant.parseCommand(command, sampleTasks)
    console.log(`AI: ${result.response}\n`)
  }
}

// 演示4: 用户习惯分析
async function demo4() {
  console.log('=== Demo 4: 用户习惯分析 ===\n')

  // 先生成建议来触发习惯学习
  await aiAssistant.generateSuggestions(sampleTasks)

  const habits = aiAssistant.getUserHabits()

  if (habits) {
    console.log('用户习惯统计:')

    // 工作时间偏好
    if (habits.preferredWorkTimes.length > 0) {
      const topTime = habits.preferredWorkTimes.sort((a, b) => b.count - a.count)[0]
      console.log(`- 最常工作时段: ${topTime.hour}:00 (${topTime.count}次)`)
    }

    // 任务完成率
    console.log('\n任务完成率:')
    console.log(`  高优先级: ${(habits.taskCompletionRate.high * 100).toFixed(1)}%`)
    console.log(`  中优先级: ${(habits.taskCompletionRate.medium * 100).toFixed(1)}%`)
    console.log(`  低优先级: ${(habits.taskCompletionRate.low * 100).toFixed(1)}%`)

    // 平均任务耗时
    console.log('\n平均任务耗时:')
    Object.entries(habits.averageTaskDuration).forEach(([priority, duration]) => {
      if (duration > 0) {
        console.log(`  ${priority}: ${duration.toFixed(1)} 小时`)
      }
    })

    // 常用标签
    console.log('\n常用标签:')
    habits.frequentTags.slice(0, 5).forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.tag} (${tag.count}次)`)
    })

    // Agent负载
    console.log('\nAgent负载:')
    Object.entries(habits.agentWorkload).forEach(([agentId, count]) => {
      console.log(`  ${agentId}: ${count}个任务`)
    })
  } else {
    console.log('暂无用户习惯数据')
  }
  console.log()
}

// 演示5: 针对特定Agent的建议
async function demo5() {
  console.log('=== Demo 5: 针对特定Agent的建议 ===\n')

  const agentId = 'agent-1'
  const suggestions = await aiAssistant.generateSuggestions(sampleTasks, agentId)

  console.log(`为 ${agentId} 生成 ${suggestions.length} 条建议:\n`)

  suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion.title}`)
    console.log(`   ${suggestion.description}\n`)
  })
}

// 运行所有演示
async function runAllDemos() {
  try {
    await demo1()
    console.log('---\n')

    await demo2()
    console.log('---\n')

    await demo3()
    console.log('---\n')

    await demo4()
    console.log('---\n')

    await demo5()

    console.log('=== 演示完成 ===')
  } catch (error) {
    console.error('演示过程中出错:', error)
  }
}

// 导出演示函数
export {
  demo1,
  demo2,
  demo3,
  demo4,
  demo5,
  runAllDemos
}

// 如果直接运行此文件
if (require.main === module) {
  runAllDemos()
}
