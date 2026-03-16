/**
 * 数据导出工具
 * 支持导出Agent/Task数据为JSON、CSV、Markdown格式
 * 支持数据脱敏和完整备份
 */

import type { Task } from '../types/task'
import type { Agent } from '../services/api/agents'

// 导出格式
export type ExportFormat = 'json' | 'csv' | 'markdown'

// 导出选项
export interface ExportOptions {
  format: ExportFormat
  desensitize?: boolean // 数据脱敏
  includeMetadata?: boolean // 包含元数据
  dateFormat?: 'iso' | 'locale' // 日期格式
}

// 脱敏配置
export interface DesensitizeConfig {
  maskUserId?: boolean
  maskSystemPrompt?: boolean
  maskExecutionLog?: boolean
  maskResult?: boolean
}

/**
 * 导出单个Agent
 */
export function exportAgent(
  agent: Agent,
  options: ExportOptions = { format: 'json' }
): string {
  const desensitized = options.desensitize ? desensitizeAgent(agent) : agent

  switch (options.format) {
    case 'json':
      return JSON.stringify(desensitized, null, 2)
    case 'csv':
      return agentToCSV([desensitized])
    case 'markdown':
      return agentToMarkdown(desensitized, options)
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
}

/**
 * 导出多个Agents
 */
export function exportAgents(
  agents: Agent[],
  options: ExportOptions = { format: 'json' }
): string {
  const desensitized = options.desensitize
    ? agents.map(a => desensitizeAgent(a))
    : agents

  switch (options.format) {
    case 'json':
      return JSON.stringify(desensitized, null, 2)
    case 'csv':
      return agentToCSV(desensitized)
    case 'markdown':
      return agentsToMarkdown(desensitized, options)
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
}

/**
 * 导出单个Task
 */
export function exportTask(
  task: Task,
  options: ExportOptions = { format: 'json' }
): string {
  const desensitized = options.desensitize ? desensitizeTask(task) : task

  switch (options.format) {
    case 'json':
      return JSON.stringify(desensitized, null, 2)
    case 'csv':
      return taskToCSV([desensitized])
    case 'markdown':
      return taskToMarkdown(desensitized, options)
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
}

/**
 * 导出多个Tasks
 */
export function exportTasks(
  tasks: Task[],
  options: ExportOptions = { format: 'json' }
): string {
  const desensitized = options.desensitize
    ? tasks.map(t => desensitizeTask(t))
    : tasks

  switch (options.format) {
    case 'json':
      return JSON.stringify(desensitized, null, 2)
    case 'csv':
      return taskToCSV(desensitized)
    case 'markdown':
      return tasksToMarkdown(desensitized, options)
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
}

/**
 * 导出完整备份（Agents + Tasks）
 */
export function exportFullBackup(
  agents: Agent[],
  tasks: Task[],
  options: ExportOptions = { format: 'json' }
): string {
  const backup = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    agents: options.desensitize ? agents.map(a => desensitizeAgent(a)) : agents,
    tasks: options.desensitize ? tasks.map(t => desensitizeTask(t)) : tasks,
    metadata: options.includeMetadata
      ? {
          agentCount: agents.length,
          taskCount: tasks.length,
          tasksByStatus: {
            pending: tasks.filter(t => t.status === 'pending').length,
            in_progress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            failed: tasks.filter(t => t.status === 'failed').length
          }
        }
      : undefined
  }

  switch (options.format) {
    case 'json':
      return JSON.stringify(backup, null, 2)
    case 'markdown':
      return fullBackupToMarkdown(backup, options)
    default:
      throw new Error(`Format ${options.format} not supported for full backup`)
  }
}

/**
 * 下载导出数据为文件
 */
export function downloadExport(
  content: string,
  filename: string,
  format: ExportFormat
): void {
  const mimeTypes = {
    json: 'application/json',
    csv: 'text/csv',
    markdown: 'text/markdown'
  }

  const extensions = {
    json: 'json',
    csv: 'csv',
    markdown: 'md'
  }

  const blob = new Blob([content], { type: mimeTypes[format] })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.${extensions[format]}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 复制导出数据到剪贴板
 */
export async function copyToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content)
}

/**
 * 验证导入数据的完整性
 */
export function validateImportData(data: any): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查数据结构
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format')
    return { valid: false, errors, warnings }
  }

  // 检查版本
  if (data.version && data.version !== '1.0') {
    warnings.push(`Version mismatch: ${data.version}`)
  }

  // 验证Agents
  if (data.agents) {
    if (!Array.isArray(data.agents)) {
      errors.push('agents must be an array')
    } else {
      data.agents.forEach((agent: any, index: number) => {
        if (!agent.id) errors.push(`Agent ${index}: missing id`)
        if (!agent.name) errors.push(`Agent ${index}: missing name`)
        if (!agent.aiModel) errors.push(`Agent ${index}: missing aiModel`)
      })
    }
  }

  // 验证Tasks
  if (data.tasks) {
    if (!Array.isArray(data.tasks)) {
      errors.push('tasks must be an array')
    } else {
      data.tasks.forEach((task: any, index: number) => {
        if (!task.id) errors.push(`Task ${index}: missing id`)
        if (!task.title) errors.push(`Task ${index}: missing title`)
        if (!task.status) errors.push(`Task ${index}: missing status`)
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 数据脱敏 - Agent
 */
function desensitizeAgent(agent: Agent): Agent {
  return {
    ...agent,
    userId: maskString(agent.userId),
    systemPrompt: agent.systemPrompt ? maskLongText(agent.systemPrompt) : undefined
  }
}

/**
 * 数据脱敏 - Task
 */
function desensitizeTask(task: Task): Task {
  return {
    ...task,
    description: maskLongText(task.description),
    result: task.result ? maskLongText(task.result) : undefined,
    executionLog: task.executionLog?.map(log => maskLongText(log)),
    errorMessage: task.errorMessage ? maskLongText(task.errorMessage) : undefined
  }
}

/**
 * 脱敏辅助函数 - 掩码字符串
 */
function maskString(str: string): string {
  if (!str || str.length <= 4) return '***'
  return str.slice(0, 2) + '***' + str.slice(-2)
}

/**
 * 脱敏辅助函数 - 掩码长文本
 */
function maskLongText(text: string): string {
  if (!text) return ''
  if (text.length <= 50) return text.slice(0, 20) + '...'
  return text.slice(0, 50) + '... [REDACTED]'
}

/**
 * Agent转CSV
 */
function agentToCSV(agents: Agent[]): string {
  const headers = [
    'ID',
    'Name',
    'AI Model',
    'Status',
    'Level',
    'Experience',
    'Tasks Completed',
    'Tokens Used',
    'Total Uptime',
    'Tags',
    'Created At',
    'Updated At'
  ]

  const rows = agents.map(agent => [
    agent.id,
    agent.name,
    agent.aiModel,
    agent.status,
    agent.level.toString(),
    agent.experience.toString(),
    agent.tasksCompleted.toString(),
    agent.tokensUsed.toString(),
    agent.totalUptime.toString(),
    agent.tags.join(';'),
    agent.createdAt,
    agent.updatedAt
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Task转CSV
 */
function taskToCSV(tasks: Task[]): string {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Agent ID',
    'Agent Name',
    'Created At',
    'Started At',
    'Completed At',
    'Tags'
  ]

  const rows = tasks.map(task => [
    task.id,
    escapeCSV(task.title),
    escapeCSV(task.description),
    task.status,
    task.priority,
    task.agentId,
    task.agentName,
    task.createdAt,
    task.startedAt || '',
    task.completedAt || '',
    (task.tags || []).join(';')
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * CSV字段转义
 */
function escapeCSV(field: string): string {
  if (!field) return ''
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * Agent转Markdown
 */
function agentToMarkdown(agent: Agent, options: ExportOptions): string {
  const md: string[] = []

  md.push(`# Agent: ${agent.name}`)
  md.push('')
  md.push(`**ID:** \`${agent.id}\``)
  md.push(`**Model:** ${agent.aiModel}`)
  md.push(`**Status:** ${getStatusEmoji(agent.status)} ${agent.status}`)
  md.push(`**Level:** ${agent.level} (${agent.experience} XP)`)
  md.push('')

  md.push('## Statistics')
  md.push('')
  md.push(`- Tasks Completed: **${agent.tasksCompleted}**`)
  md.push(`- Tokens Used: **${agent.tokensUsed.toLocaleString()}**`)
  md.push(`- Total Uptime: **${formatDuration(agent.totalUptime)}**`)
  md.push('')

  if (agent.systemPrompt && !options.desensitize) {
    md.push('## System Prompt')
    md.push('')
    md.push('```')
    md.push(agent.systemPrompt)
    md.push('```')
    md.push('')
  }

  if (agent.tags && agent.tags.length > 0) {
    md.push('## Tags')
    md.push('')
    md.push(agent.tags.map(tag => `\`${tag}\``).join(' '))
    md.push('')
  }

  md.push('## Metadata')
  md.push('')
  md.push(`- **Created:** ${formatDate(agent.createdAt, options.dateFormat)}`)
  md.push(`- **Updated:** ${formatDate(agent.updatedAt, options.dateFormat)}`)
  md.push('')

  return md.join('\n')
}

/**
 * Agents转Markdown
 */
function agentsToMarkdown(agents: Agent[], options: ExportOptions): string {
  const md: string[] = []

  md.push('# Agents Export')
  md.push('')
  md.push(`**Total Agents:** ${agents.length}`)
  md.push(`**Export Date:** ${new Date().toLocaleString()}`)
  md.push('')
  md.push('---')
  md.push('')

  agents.forEach((agent, index) => {
    md.push(agentToMarkdown(agent, options))
    if (index < agents.length - 1) {
      md.push('---')
      md.push('')
    }
  })

  return md.join('\n')
}

/**
 * Task转Markdown
 */
function taskToMarkdown(task: Task, options: ExportOptions): string {
  const md: string[] = []

  md.push(`# ${task.title}`)
  md.push('')
  md.push(`**ID:** \`${task.id}\``)
  md.push(`**Status:** ${getTaskStatusLabel(task.status)}`)
  md.push(`**Priority:** ${getTaskPriorityLabel(task.priority)}`)
  md.push(`**Agent:** ${task.agentName}`)
  md.push('')

  md.push('## Description')
  md.push('')
  md.push(task.description)
  md.push('')

  if (task.tags && task.tags.length > 0) {
    md.push('## Tags')
    md.push('')
    md.push(task.tags.map(tag => `\`${tag}\``).join(' '))
    md.push('')
  }

  md.push('## Timeline')
  md.push('')
  md.push(`- **Created:** ${formatDate(task.createdAt, options.dateFormat)}`)
  if (task.startedAt) {
    md.push(`- **Started:** ${formatDate(task.startedAt, options.dateFormat)}`)
  }
  if (task.completedAt) {
    md.push(`- **Completed:** ${formatDate(task.completedAt, options.dateFormat)}`)
  }
  if (task.actualDuration) {
    md.push(`- **Duration:** ${task.actualDuration.toFixed(1)} seconds`)
  }
  md.push('')

  if (task.result && !options.desensitize) {
    md.push('## Result')
    md.push('')
    md.push(task.result)
    md.push('')
  }

  if (task.errorMessage) {
    md.push('## Error')
    md.push('')
    md.push(`⚠️ ${task.errorMessage}`)
    md.push('')
  }

  if (task.executionLog && task.executionLog.length > 0 && !options.desensitize) {
    md.push('## Execution Log')
    md.push('')
    md.push('```')
    task.executionLog.forEach(log => md.push(log))
    md.push('```')
    md.push('')
  }

  if (task.tokenMetrics) {
    md.push('## Token Metrics')
    md.push('')
    md.push(`- Estimated: ${task.tokenMetrics.estimatedTokens}`)
    md.push(`- Actual: ${task.tokenMetrics.actualTokens}`)
    md.push(`- Input: ${task.tokenMetrics.inputTokens}`)
    md.push(`- Output: ${task.tokenMetrics.outputTokens}`)
    md.push(`- Model: ${task.tokenMetrics.model}`)
    md.push(`- Cost: $${task.tokenMetrics.costUSD.toFixed(4)}`)
    md.push('')
  }

  return md.join('\n')
}

/**
 * Tasks转Markdown
 */
function tasksToMarkdown(tasks: Task[], options: ExportOptions): string {
  const md: string[] = []

  md.push('# Tasks Export')
  md.push('')
  md.push(`**Total Tasks:** ${tasks.length}`)
  md.push(`**Export Date:** ${new Date().toLocaleString()}`)
  md.push('')

  // 统计信息
  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  }

  md.push('## Statistics')
  md.push('')
  md.push(`- Pending: ${stats.pending}`)
  md.push(`- In Progress: ${stats.in_progress}`)
  md.push(`- Completed: ${stats.completed}`)
  md.push(`- Failed: ${stats.failed}`)
  md.push('')
  md.push('---')
  md.push('')

  tasks.forEach((task, index) => {
    md.push(taskToMarkdown(task, options))
    if (index < tasks.length - 1) {
      md.push('---')
      md.push('')
    }
  })

  return md.join('\n')
}

/**
 * 完整备份转Markdown
 */
function fullBackupToMarkdown(backup: any, options: ExportOptions): string {
  const md: string[] = []

  md.push('# AgentForge Full Backup')
  md.push('')
  md.push(`**Version:** ${backup.version}`)
  md.push(`**Export Date:** ${new Date(backup.exportDate).toLocaleString()}`)
  md.push('')

  if (backup.metadata) {
    md.push('## Summary')
    md.push('')
    md.push(`- Agents: ${backup.metadata.agentCount}`)
    md.push(`- Tasks: ${backup.metadata.taskCount}`)
    md.push('')
    md.push('### Tasks by Status')
    md.push('')
    md.push(`- Pending: ${backup.metadata.tasksByStatus.pending}`)
    md.push(`- In Progress: ${backup.metadata.tasksByStatus.in_progress}`)
    md.push(`- Completed: ${backup.metadata.tasksByStatus.completed}`)
    md.push(`- Failed: ${backup.metadata.tasksByStatus.failed}`)
    md.push('')
  }

  md.push('---')
  md.push('')
  md.push('# Agents')
  md.push('')
  md.push(agentsToMarkdown(backup.agents, options))
  md.push('')
  md.push('---')
  md.push('')
  md.push('# Tasks')
  md.push('')
  md.push(tasksToMarkdown(backup.tasks, options))

  return md.join('\n')
}

// 辅助函数
function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    idle: '🟢',
    busy: '🟡',
    error: '🔴'
  }
  return emojis[status] || '⚪'
}

function getTaskStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '⏳ Pending',
    in_progress: '🔄 In Progress',
    completed: '✅ Completed',
    failed: '❌ Failed'
  }
  return labels[status] || status
}

function getTaskPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: '🟢 Low',
    medium: '🟡 Medium',
    high: '🟠 High',
    urgent: '🔴 Urgent'
  }
  return labels[priority] || priority
}

function formatDate(dateString: string, format?: 'iso' | 'locale'): string {
  const date = new Date(dateString)
  if (format === 'iso') {
    return date.toISOString()
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
