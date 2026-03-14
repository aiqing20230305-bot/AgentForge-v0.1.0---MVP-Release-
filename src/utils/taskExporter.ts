/**
 * 任务导出工具
 * 支持导出为 JSON 和 Markdown 格式
 */

import type { Task } from '../types/task'

/**
 * 导出任务为 JSON 格式
 */
export function exportTaskAsJSON(task: Task): string {
  return JSON.stringify(task, null, 2)
}

/**
 * 导出任务为 Markdown 格式
 */
export function exportTaskAsMarkdown(task: Task): string {
  const md: string[] = []

  md.push(`# ${task.title}`)
  md.push('')
  md.push(`**ID:** ${task.id}`)
  md.push(`**状态:** ${getStatusLabel(task.status)}`)
  md.push(`**优先级:** ${getPriorityLabel(task.priority)}`)
  md.push(`**Agent:** ${task.agentName}`)
  md.push('')

  md.push('## 描述')
  md.push('')
  md.push(task.description)
  md.push('')

  if (task.tags && task.tags.length > 0) {
    md.push('## 标签')
    md.push('')
    md.push(task.tags.map(tag => `\`${tag}\``).join(' '))
    md.push('')
  }

  md.push('## 时间信息')
  md.push('')
  md.push(`- **创建时间:** ${formatDate(task.createdAt)}`)
  if (task.startedAt) {
    md.push(`- **开始时间:** ${formatDate(task.startedAt)}`)
  }
  if (task.completedAt) {
    md.push(`- **完成时间:** ${formatDate(task.completedAt)}`)
  }
  if (task.actualDuration) {
    md.push(`- **实际耗时:** ${task.actualDuration.toFixed(1)} 秒`)
  }
  md.push('')

  if (task.executionLog && task.executionLog.length > 0) {
    md.push('## 执行日志')
    md.push('')
    md.push('```')
    task.executionLog.forEach(log => md.push(log))
    md.push('```')
    md.push('')
  }

  if (task.result) {
    md.push('## 执行结果')
    md.push('')
    md.push(task.result)
    md.push('')
  }

  if (task.errorMessage) {
    md.push('## 错误信息')
    md.push('')
    md.push(`⚠️ ${task.errorMessage}`)
    md.push('')
  }

  if (task.tokenMetrics) {
    md.push('## Token 使用情况')
    md.push('')
    md.push(`- **预估 Token:** ${task.tokenMetrics.estimatedTokens}`)
    md.push(`- **实际 Token:** ${task.tokenMetrics.actualTokens}`)
    md.push(`- **输入 Token:** ${task.tokenMetrics.inputTokens}`)
    md.push(`- **输出 Token:** ${task.tokenMetrics.outputTokens}`)
    md.push(`- **模型:** ${task.tokenMetrics.model}`)
    md.push(`- **成本:** $${task.tokenMetrics.costUSD.toFixed(4)}`)
    md.push('')
  }

  return md.join('\n')
}

/**
 * 下载任务为文件
 */
export function downloadTask(task: Task, format: 'json' | 'markdown'): void {
  const content = format === 'json' ? exportTaskAsJSON(task) : exportTaskAsMarkdown(task)
  const extension = format === 'json' ? 'json' : 'md'
  const mimeType = format === 'json' ? 'application/json' : 'text/markdown'

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-${task.id}.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 复制任务到剪贴板
 */
export async function copyTaskToClipboard(task: Task, format: 'json' | 'markdown'): Promise<void> {
  const content = format === 'json' ? exportTaskAsJSON(task) : exportTaskAsMarkdown(task)
  await navigator.clipboard.writeText(content)
}

// Helper functions
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '⏳ 待处理',
    in_progress: '🔄 进行中',
    completed: '✅ 已完成',
    failed: '❌ 失败'
  }
  return labels[status] || status
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: '🟢 低',
    medium: '🟡 中',
    high: '🟠 高',
    urgent: '🔴 紧急'
  }
  return labels[priority] || priority
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
