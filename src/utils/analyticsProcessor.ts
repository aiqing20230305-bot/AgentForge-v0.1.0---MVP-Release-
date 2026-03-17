/**
 * 分析数据处理工具
 * 用于处理和转换Agent性能分析数据
 */

import type { Task } from '../types/task'
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'

export interface TaskCompletionData {
  date: string
  completed: number
  total: number
  rate: number
}

export interface TaskTypeData {
  type: string
  count: number
  percentage: number
  fill: string
}

export interface ExecutionTimeData {
  date: string
  avgTime: number
  minTime: number
  maxTime: number
}

export interface TokenHeatmapData {
  hour: number
  day: number
  tokens: number
  intensity: number
}

export interface AgentPerformanceData {
  agentId: string
  agentName: string
  completed: number
  avgTime: number
  successRate: number
  totalTokens: number
}

/**
 * 计算任务完成率趋势（7天或30天）
 */
export function calculateCompletionTrend(tasks: Task[], days: number = 7): TaskCompletionData[] {
  const result: TaskCompletionData[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i)
    const dayStart = startOfDay(date).getTime()
    const dayEnd = endOfDay(date).getTime()

    const dayTasks = tasks.filter(task => {
      const createdTime = new Date(task.createdAt).getTime()
      return createdTime >= dayStart && createdTime <= dayEnd
    })

    const completed = dayTasks.filter(t => t.status === 'completed').length
    const total = dayTasks.length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    result.push({
      date: format(date, 'MM/dd'),
      completed,
      total,
      rate
    })
  }

  return result
}

/**
 * 统计任务类型分布
 */
export function calculateTaskTypeDistribution(tasks: Task[]): TaskTypeData[] {
  const typeMap = new Map<string, number>()
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316' // orange
  ]

  // 从标签中提取类型
  tasks.forEach(task => {
    if (task.tags && task.tags.length > 0) {
      const primaryTag = task.tags[0]
      typeMap.set(primaryTag, (typeMap.get(primaryTag) || 0) + 1)
    } else {
      typeMap.set('未分类', (typeMap.get('未分类') || 0) + 1)
    }
  })

  const total = tasks.length
  const result: TaskTypeData[] = []
  let colorIndex = 0

  typeMap.forEach((count, type) => {
    result.push({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      fill: colors[colorIndex % colors.length]
    })
    colorIndex++
  })

  // 按数量排序
  return result.sort((a, b) => b.count - a.count)
}

/**
 * 计算平均执行时间趋势
 */
export function calculateExecutionTimeTrend(tasks: Task[], days: number = 7): ExecutionTimeData[] {
  const result: ExecutionTimeData[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i)
    const dayStart = startOfDay(date).getTime()
    const dayEnd = endOfDay(date).getTime()

    const completedTasks = tasks.filter(task => {
      if (task.status !== 'completed' || !task.startedAt || !task.completedAt) {
        return false
      }
      const completedTime = new Date(task.completedAt).getTime()
      return completedTime >= dayStart && completedTime <= dayEnd
    })

    const executionTimes = completedTasks.map(task => {
      const start = new Date(task.startedAt!).getTime()
      const end = new Date(task.completedAt!).getTime()
      return (end - start) / 1000 / 60 // 转换为分钟
    })

    const avgTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0

    const minTime = executionTimes.length > 0 ? Math.min(...executionTimes) : 0
    const maxTime = executionTimes.length > 0 ? Math.max(...executionTimes) : 0

    result.push({
      date: format(date, 'MM/dd'),
      avgTime: Math.round(avgTime * 10) / 10,
      minTime: Math.round(minTime * 10) / 10,
      maxTime: Math.round(maxTime * 10) / 10
    })
  }

  return result
}

/**
 * 生成Token消耗热力图数据（24小时 × 7天）
 */
export function generateTokenHeatmap(tasks: Task[]): TokenHeatmapData[] {
  const heatmapData: TokenHeatmapData[] = []
  const now = new Date()

  // 生成7天 × 24小时的网格
  for (let day = 6; day >= 0; day--) {
    const date = subDays(now, day)
    const dayStart = startOfDay(date).getTime()

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = dayStart + hour * 60 * 60 * 1000
      const hourEnd = hourStart + 60 * 60 * 1000

      // 计算该小时内的token消耗
      const hourTasks = tasks.filter(task => {
        if (!task.completedAt || !task.tokenMetrics) return false
        const completedTime = new Date(task.completedAt).getTime()
        return completedTime >= hourStart && completedTime < hourEnd
      })

      const totalTokens = hourTasks.reduce((sum, task) =>
        sum + (task.tokenMetrics?.actualTokens || 0), 0
      )

      heatmapData.push({
        hour,
        day: 6 - day, // 反转以使最近的在底部
        tokens: totalTokens,
        intensity: 0 // 将在后面计算
      })
    }
  }

  // 计算强度（0-1标准化）
  const maxTokens = Math.max(...heatmapData.map(d => d.tokens))
  if (maxTokens > 0) {
    heatmapData.forEach(data => {
      data.intensity = data.tokens / maxTokens
    })
  }

  return heatmapData
}

/**
 * 计算Agent性能对比数据
 */
export function calculateAgentPerformance(tasks: Task[]): AgentPerformanceData[] {
  const agentMap = new Map<string, {
    agentId: string
    agentName: string
    tasks: Task[]
  }>()

  // 按Agent分组
  tasks.forEach(task => {
    const key = task.agentId
    if (!agentMap.has(key)) {
      agentMap.set(key, {
        agentId: task.agentId,
        agentName: task.agentName,
        tasks: []
      })
    }
    agentMap.get(key)!.tasks.push(task)
  })

  const result: AgentPerformanceData[] = []

  agentMap.forEach(({ agentId, agentName, tasks: agentTasks }) => {
    const completed = agentTasks.filter(t => t.status === 'completed').length
    const total = agentTasks.length
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // 计算平均执行时间
    const completedTasks = agentTasks.filter(
      t => t.status === 'completed' && t.startedAt && t.completedAt
    )
    const executionTimes = completedTasks.map(task => {
      const start = new Date(task.startedAt!).getTime()
      const end = new Date(task.completedAt!).getTime()
      return (end - start) / 1000 / 60 // 分钟
    })
    const avgTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0

    // 计算总Token消耗
    const totalTokens = agentTasks.reduce(
      (sum, task) => sum + (task.tokenMetrics?.actualTokens || 0),
      0
    )

    result.push({
      agentId,
      agentName,
      completed,
      avgTime: Math.round(avgTime * 10) / 10,
      successRate,
      totalTokens
    })
  })

  // 按完成任务数排序
  return result.sort((a, b) => b.completed - a.completed)
}

/**
 * 导出为CSV格式
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // 生成CSV内容
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // 处理包含逗号的值
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  })

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, filename)
}

/**
 * 导出为PNG格式（使用html2canvas）
 */
export async function exportToPNG(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id "${elementId}" not found`)
    return
  }

  try {
    // 动态导入html2canvas以减少bundle大小
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(element, {
      backgroundColor: '#1a1a1a',
      scale: 2 // 2x resolution for better quality
    })

    canvas.toBlob(blob => {
      if (blob) {
        downloadFile(blob, filename)
      }
    }, 'image/png')
  } catch (error) {
    console.error('Failed to export PNG:', error)
  }
}

/**
 * 下载文件
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 生成分析摘要
 */
export interface AnalyticsSummary {
  totalTasks: number
  completionRate: number
  avgExecutionTime: number
  totalTokens: number
  mostActiveAgent: string
  topTaskType: string
  peakHour: number
  weekOverWeekGrowth: number
}

export function generateAnalyticsSummary(tasks: Task[]): AnalyticsSummary {
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0

  // 计算平均执行时间
  const executionTimes = completedTasks
    .filter(t => t.startedAt && t.completedAt)
    .map(task => {
      const start = new Date(task.startedAt!).getTime()
      const end = new Date(task.completedAt!).getTime()
      return (end - start) / 1000 / 60
    })
  const avgExecutionTime = executionTimes.length > 0
    ? Math.round(executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length)
    : 0

  // 总Token消耗
  const totalTokens = tasks.reduce(
    (sum, task) => sum + (task.tokenMetrics?.actualTokens || 0),
    0
  )

  // 最活跃的Agent
  const agentPerformance = calculateAgentPerformance(tasks)
  const mostActiveAgent = agentPerformance.length > 0
    ? agentPerformance[0].agentName
    : 'N/A'

  // 最常见任务类型
  const taskTypes = calculateTaskTypeDistribution(tasks)
  const topTaskType = taskTypes.length > 0 ? taskTypes[0].type : 'N/A'

  // 高峰时段
  const hourMap = new Map<number, number>()
  tasks.forEach(task => {
    if (task.completedAt) {
      const hour = new Date(task.completedAt).getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
    }
  })
  let peakHour = 0
  let maxCount = 0
  hourMap.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count
      peakHour = hour
    }
  })

  // 周环比增长
  const now = new Date()
  const thisWeekStart = startOfWeek(now).getTime()
  const lastWeekStart = startOfWeek(subDays(now, 7)).getTime()
  const lastWeekEnd = endOfWeek(subDays(now, 7)).getTime()

  const thisWeekTasks = tasks.filter(t =>
    new Date(t.createdAt).getTime() >= thisWeekStart
  ).length
  const lastWeekTasks = tasks.filter(t => {
    const time = new Date(t.createdAt).getTime()
    return time >= lastWeekStart && time <= lastWeekEnd
  }).length

  const weekOverWeekGrowth = lastWeekTasks > 0
    ? Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100)
    : 0

  return {
    totalTasks: tasks.length,
    completionRate,
    avgExecutionTime,
    totalTokens,
    mostActiveAgent,
    topTaskType,
    peakHour,
    weekOverWeekGrowth
  }
}
