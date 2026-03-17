/**
 * 导出面板组件
 * 支持导出Agent/Task数据，支持多种格式和选项
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Database,
  Users,
  CheckSquare,
  Shield,
  Copy,
  Check,
  AlertCircle,
  X
} from 'lucide-react'
import {
  exportAgent,
  exportAgents,
  exportTask,
  exportTasks,
  exportFullBackup,
  downloadExport,
  copyToClipboard,
  validateImportData,
  type ExportFormat,
  type ExportOptions
} from '../utils/dataExporter'
import { useTaskStore } from '../stores/taskStore'
import type { Agent } from '../services/api/agents'

interface ExportPanelProps {
  agents?: Agent[] // 可选的agents列表
  onClose?: () => void
}

type ExportType = 'single-agent' | 'all-agents' | 'single-task' | 'all-tasks' | 'full-backup'

export function ExportPanel({ agents = [], onClose }: ExportPanelProps) {
  const { tasks, selectedTask } = useTaskStore()

  // 导出选项状态
  const [exportType, setExportType] = useState<ExportType>('all-agents')
  const [format, setFormat] = useState<ExportFormat>('json')
  const [desensitize, setDesensitize] = useState(false)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [dateFormat, setDateFormat] = useState<'iso' | 'locale'>('locale')
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')

  // UI状态
  const [copied, setCopied] = useState(false)
  const [exportPreview, setExportPreview] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  // 导入状态
  const [importData, setImportData] = useState<string>('')
  const [importValidation, setImportValidation] = useState<{
    valid: boolean
    errors: string[]
    warnings: string[]
  } | null>(null)

  const options: ExportOptions = {
    format,
    desensitize,
    includeMetadata,
    dateFormat
  }

  // 生成导出内容
  const generateExport = (): string => {
    try {
      switch (exportType) {
        case 'single-agent': {
          const agent = agents.find(a => a.id === selectedAgentId)
          if (!agent) throw new Error('Agent not found')
          return exportAgent(agent, options)
        }
        case 'all-agents':
          return exportAgents(agents, options)
        case 'single-task': {
          const task = tasks.find(t => t.id === selectedTaskId)
          if (!task) throw new Error('Task not found')
          return exportTask(task, options)
        }
        case 'all-tasks':
          return exportTasks(tasks, options)
        case 'full-backup':
          return exportFullBackup(agents, tasks, options)
        default:
          throw new Error('Invalid export type')
      }
    } catch (error) {
      console.error('Export error:', error)
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  // 处理导出
  const handleExport = () => {
    const content = generateExport()
    const filename = getFilename()
    downloadExport(content, filename, format)
  }

  // 处理复制
  const handleCopy = async () => {
    const content = generateExport()
    await copyToClipboard(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 处理预览
  const handlePreview = () => {
    const content = generateExport()
    setExportPreview(content)
    setShowPreview(true)
  }

  // 处理导入验证
  const handleValidateImport = () => {
    try {
      const data = JSON.parse(importData)
      const validation = validateImportData(data)
      setImportValidation(validation)
    } catch (error) {
      setImportValidation({
        valid: false,
        errors: ['Invalid JSON format'],
        warnings: []
      })
    }
  }

  // 获取文件名
  const getFilename = (): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    switch (exportType) {
      case 'single-agent':
        return `agent-${selectedAgentId}-${timestamp}`
      case 'all-agents':
        return `agents-${timestamp}`
      case 'single-task':
        return `task-${selectedTaskId}-${timestamp}`
      case 'all-tasks':
        return `tasks-${timestamp}`
      case 'full-backup':
        return `agentforge-backup-${timestamp}`
      default:
        return `export-${timestamp}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Export / Import Data</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* 选项卡 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showPreview
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showPreview
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Import
            </button>
          </div>

          {!showPreview ? (
            <div className="space-y-6">
              {/* 导出类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Export Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <ExportTypeButton
                    icon={Users}
                    label="Single Agent"
                    isActive={exportType === 'single-agent'}
                    onClick={() => setExportType('single-agent')}
                    count={agents.length > 0 ? 1 : 0}
                  />
                  <ExportTypeButton
                    icon={Users}
                    label="All Agents"
                    isActive={exportType === 'all-agents'}
                    onClick={() => setExportType('all-agents')}
                    count={agents.length}
                  />
                  <ExportTypeButton
                    icon={CheckSquare}
                    label="Single Task"
                    isActive={exportType === 'single-task'}
                    onClick={() => setExportType('single-task')}
                    count={tasks.length > 0 ? 1 : 0}
                  />
                  <ExportTypeButton
                    icon={CheckSquare}
                    label="All Tasks"
                    isActive={exportType === 'all-tasks'}
                    onClick={() => setExportType('all-tasks')}
                    count={tasks.length}
                  />
                  <div className="col-span-2">
                    <ExportTypeButton
                      icon={Database}
                      label="Full Backup"
                      isActive={exportType === 'full-backup'}
                      onClick={() => setExportType('full-backup')}
                      count={agents.length + tasks.length}
                      description="Export everything"
                    />
                  </div>
                </div>
              </div>

              {/* 选择特定Agent/Task */}
              {exportType === 'single-agent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={e => setSelectedAgentId(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Choose an agent...</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} (Level {agent.level})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {exportType === 'single-task' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Task
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={e => setSelectedTaskId(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Choose a task...</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({task.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 导出格式 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <FormatButton
                    icon={FileJson}
                    label="JSON"
                    format="json"
                    isActive={format === 'json'}
                    onClick={() => setFormat('json')}
                  />
                  <FormatButton
                    icon={FileSpreadsheet}
                    label="CSV"
                    format="csv"
                    isActive={format === 'csv'}
                    onClick={() => setFormat('csv')}
                    disabled={exportType === 'full-backup'}
                  />
                  <FormatButton
                    icon={FileText}
                    label="Markdown"
                    format="markdown"
                    isActive={format === 'markdown'}
                    onClick={() => setFormat('markdown')}
                  />
                </div>
              </div>

              {/* 导出选项 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Options</label>

                <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={desensitize}
                    onChange={e => setDesensitize(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Data Desensitization</div>
                    <div className="text-sm text-gray-400">
                      Mask sensitive information (userId, prompts, logs)
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={e => setIncludeMetadata(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <Database className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Include Metadata</div>
                    <div className="text-sm text-gray-400">
                      Export statistics and summary information
                    </div>
                  </div>
                </label>

                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <label className="block text-white font-medium mb-2">Date Format</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="locale"
                        checked={dateFormat === 'locale'}
                        onChange={() => setDateFormat('locale')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-gray-300">Locale (MM/DD/YYYY)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="iso"
                        checked={dateFormat === 'iso'}
                        onChange={() => setDateFormat('iso')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-gray-300">ISO 8601</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download File
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handlePreview}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>
          ) : (
            /* 导入界面 */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Import Data (JSON only)
                </label>
                <textarea
                  value={importData}
                  onChange={e => setImportData(e.target.value)}
                  placeholder="Paste your JSON export data here..."
                  className="w-full h-64 bg-gray-700 text-white rounded-lg px-4 py-3 font-mono text-sm border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={handleValidateImport}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                Validate Import
              </button>

              {importValidation && (
                <div className="space-y-3">
                  {importValidation.valid ? (
                    <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                        <Check className="w-5 h-5" />
                        Validation Passed
                      </div>
                      <p className="text-sm text-gray-300">
                        The data is valid and ready to import.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                        <AlertCircle className="w-5 h-5" />
                        Validation Failed
                      </div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {importValidation.errors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importValidation.warnings.length > 0 && (
                    <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
                        <AlertCircle className="w-5 h-5" />
                        Warnings
                      </div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {importValidation.warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* 预览模态框 */}
      {exportPreview && showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Export Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-60px)]">
              <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto font-mono">
                {exportPreview}
              </pre>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// 辅助组件
function ExportTypeButton({
  icon: Icon,
  label,
  isActive,
  onClick,
  count,
  description
}: {
  icon: any
  label: string
  isActive: boolean
  onClick: () => void
  count: number
  description?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-600/20'
          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
        <div className="flex-1 text-left">
          <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
            {label}
          </div>
          {description && <div className="text-xs text-gray-400">{description}</div>}
          <div className="text-xs text-gray-500">
            {count} item{count !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </button>
  )
}

function FormatButton({
  icon: Icon,
  label,
  format,
  isActive,
  onClick,
  disabled
}: {
  icon: any
  label: string
  format: string
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-lg border-2 transition-all ${
        disabled
          ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
          : isActive
            ? 'border-blue-500 bg-blue-600/20'
            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
      }`}
    >
      <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
      <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </div>
    </button>
  )
}
