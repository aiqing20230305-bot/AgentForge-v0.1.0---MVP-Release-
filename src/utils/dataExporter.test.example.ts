/**
 * 数据导出工具使用示例
 * 演示如何使用dataExporter的各种功能
 */

import {
  exportAgent,
  exportAgents,
  exportTask,
  exportTasks,
  exportFullBackup,
  downloadExport,
  copyToClipboard,
  validateImportData
} from './dataExporter'
import type { Agent } from '../services/api/agents'
import type { Task } from '../types/task'

// 示例数据
const sampleAgent: Agent = {
  id: 'agent-001',
  userId: 'user-123',
  name: 'ATLAS',
  aiModel: 'gpt-4',
  systemPrompt: 'You are a helpful AI assistant specialized in project management.',
  temperature: 0.7,
  maxTokens: 2000,
  status: 'idle',
  level: 15,
  experience: 2500,
  tasksCompleted: 150,
  tokensUsed: 500000,
  totalUptime: 86400,
  avatar: 'https://example.com/avatar.png',
  tags: ['leader', 'strategic', 'management'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-03-16T00:00:00.000Z'
}

const sampleTask: Task = {
  id: 'task-001',
  title: '实现数据导出功能',
  description: '创建完整的数据导出工具，支持JSON、CSV、Markdown格式',
  status: 'completed',
  priority: 'high',
  agentId: 'agent-001',
  agentName: 'ATLAS',
  createdAt: '2026-03-15T00:00:00.000Z',
  startedAt: '2026-03-15T09:00:00.000Z',
  completedAt: '2026-03-16T14:00:00.000Z',
  result: '成功实现了数据导出功能，包含导出工具和UI组件',
  tags: ['feature', 'export', 'data'],
  actualDuration: 18000,
  executionLog: [
    '开始实现数据导出工具',
    '完成JSON格式导出',
    '完成CSV格式导出',
    '完成Markdown格式导出',
    '实现数据脱敏功能',
    '创建ExportPanel组件',
    '完成测试和验证'
  ],
  tokenMetrics: {
    estimatedTokens: 5000,
    actualTokens: 4800,
    inputTokens: 2000,
    outputTokens: 2800,
    model: 'gpt-4',
    costUSD: 0.096
  }
}

// 示例1: 导出单个Agent为JSON
export function example1_ExportAgentJSON() {
  const content = exportAgent(sampleAgent, {
    format: 'json',
    includeMetadata: true
  })

  console.log('=== Agent JSON Export ===')
  console.log(content)
  console.log()
}

// 示例2: 导出Agent为Markdown（带脱敏）
export function example2_ExportAgentMarkdownDesensitized() {
  const content = exportAgent(sampleAgent, {
    format: 'markdown',
    desensitize: true,
    dateFormat: 'locale'
  })

  console.log('=== Agent Markdown Export (Desensitized) ===')
  console.log(content)
  console.log()
}

// 示例3: 导出多个Agents为CSV
export function example3_ExportAgentsCSV() {
  const agents = [sampleAgent, { ...sampleAgent, id: 'agent-002', name: 'CLIP' }]

  const content = exportAgents(agents, {
    format: 'csv'
  })

  console.log('=== Agents CSV Export ===')
  console.log(content)
  console.log()
}

// 示例4: 导出Task为Markdown
export function example4_ExportTaskMarkdown() {
  const content = exportTask(sampleTask, {
    format: 'markdown',
    includeMetadata: true,
    dateFormat: 'locale'
  })

  console.log('=== Task Markdown Export ===')
  console.log(content)
  console.log()
}

// 示例5: 导出完整备份
export function example5_ExportFullBackup() {
  const agents = [sampleAgent]
  const tasks = [sampleTask]

  const content = exportFullBackup(agents, tasks, {
    format: 'json',
    includeMetadata: true,
    desensitize: false
  })

  console.log('=== Full Backup Export ===')
  console.log(content.substring(0, 500) + '...')
  console.log()
}

// 示例6: 下载导出文件
export function example6_DownloadExport() {
  const content = exportAgent(sampleAgent, { format: 'json' })

  // 在浏览器中会触发下载
  downloadExport(content, 'agent-atlas', 'json')

  console.log('Download triggered: agent-atlas.json')
}

// 示例7: 复制到剪贴板
export async function example7_CopyToClipboard() {
  const content = exportTask(sampleTask, { format: 'markdown' })

  try {
    await copyToClipboard(content)
    console.log('Content copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

// 示例8: 验证导入数据
export function example8_ValidateImport() {
  const validData = {
    version: '1.0',
    agents: [sampleAgent],
    tasks: [sampleTask]
  }

  const validation = validateImportData(validData)

  console.log('=== Import Validation ===')
  console.log('Valid:', validation.valid)
  console.log('Errors:', validation.errors)
  console.log('Warnings:', validation.warnings)
  console.log()
}

// 示例9: 验证无效数据
export function example9_ValidateInvalidData() {
  const invalidData = {
    agents: [
      { id: 'agent-001' } // 缺少必填字段
    ],
    tasks: 'not-an-array' // 类型错误
  }

  const validation = validateImportData(invalidData)

  console.log('=== Invalid Data Validation ===')
  console.log('Valid:', validation.valid)
  console.log('Errors:', validation.errors)
  console.log('Warnings:', validation.warnings)
  console.log()
}

// 示例10: 批量导出不同格式
export function example10_BatchExportAllFormats() {
  const formats: Array<'json' | 'csv' | 'markdown'> = ['json', 'csv', 'markdown']

  formats.forEach(format => {
    try {
      const content = exportAgent(sampleAgent, { format })
      console.log(`=== ${format.toUpperCase()} Format ===`)
      console.log(content.substring(0, 200) + '...')
      console.log()
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error)
    }
  })
}

// 运行所有示例
export function runAllExamples() {
  console.log('🚀 Running Data Exporter Examples\n')

  example1_ExportAgentJSON()
  example2_ExportAgentMarkdownDesensitized()
  example3_ExportAgentsCSV()
  example4_ExportTaskMarkdown()
  example5_ExportFullBackup()
  example8_ValidateImport()
  example9_ValidateInvalidData()
  example10_BatchExportAllFormats()

  console.log('✅ All examples completed!')
}

// 使用提示
export const usageTips = `
数据导出工具使用提示：

1. 基础导出
   - 使用 exportAgent() 或 exportTask() 导出单个项目
   - 使用 exportAgents() 或 exportTasks() 导出多个项目
   - 使用 exportFullBackup() 进行完整备份

2. 格式选择
   - JSON: 最完整的数据格式，适合备份和导入
   - CSV: 适合Excel/表格软件处理
   - Markdown: 适合人类阅读和文档化

3. 导出选项
   {
     format: 'json' | 'csv' | 'markdown',
     desensitize?: boolean,        // 数据脱敏
     includeMetadata?: boolean,    // 包含元数据
     dateFormat?: 'iso' | 'locale' // 日期格式
   }

4. 数据脱敏
   - 启用后会掩码敏感信息（userId, systemPrompt等）
   - 适合分享给他人或公开展示

5. 导入验证
   - 使用 validateImportData() 验证数据完整性
   - 检查返回的 errors 和 warnings 数组
   - 只有 valid === true 才应该导入数据

6. 文件下载
   - downloadExport() 会触发浏览器下载
   - 文件名会自动添加正确的扩展名
   - 支持所有三种格式

7. 剪贴板操作
   - copyToClipboard() 是异步函数
   - 需要在用户交互上下文中调用
   - 某些浏览器可能需要权限

8. UI组件
   - ExportPanel 提供完整的导出界面
   - 支持预览、下载、复制三种操作
   - 包含导入验证功能

9. 错误处理
   - 所有函数都会在出错时抛出异常
   - 使用 try-catch 进行错误处理
   - 检查验证结果的 errors 数组

10. 性能建议
    - 大量数据导出时使用 JSON 格式
    - CSV 适合中等规模数据
    - Markdown 最适合小规模数据和预览
`

// 导出所有示例函数
export default {
  example1_ExportAgentJSON,
  example2_ExportAgentMarkdownDesensitized,
  example3_ExportAgentsCSV,
  example4_ExportTaskMarkdown,
  example5_ExportFullBackup,
  example6_DownloadExport,
  example7_CopyToClipboard,
  example8_ValidateImport,
  example9_ValidateInvalidData,
  example10_BatchExportAllFormats,
  runAllExamples,
  usageTips
}
