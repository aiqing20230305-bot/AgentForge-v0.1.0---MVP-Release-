/**
 * 任务执行日志组件
 * 黑客风格的日志查看器
 */

import React, { useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import { useCopy } from '../hooks/useCopyToClipboard'

interface TaskExecutionLogProps {
  logs: string[]
  maxHeight?: string
}

export const TaskExecutionLog: React.FC<TaskExecutionLogProps> = ({ logs, maxHeight = '300px' }) => {
  const logEndRef = useRef<HTMLDivElement>(null)
  const [copyLogs, copied] = useCopy(2000)

  // 自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleCopyAll = () => {
    const allLogs = logs.join('\n')
    copyLogs(allLogs)
  }

  if (logs.length === 0) {
    return (
      <div className="bg-black/90 rounded-lg p-4 text-center" style={{ maxHeight }}>
        <p className="text-green-500/50 text-sm">暂无执行日志</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 复制按钮 */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopyAll}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="复制所有日志"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>复制日志</span>
            </>
          )}
        </button>
      </div>

      {/* 日志内容 */}
      <div
        className="bg-black/90 rounded-lg p-4 overflow-y-auto font-mono text-xs pt-10"
        style={{ maxHeight }}
      >
        <div className="space-y-1">
          {logs.map((log, index) => {
            const lineColor = getLogColor(log)
            return (
              <div key={index} className={`${lineColor} whitespace-pre-wrap break-words`}>
                <span className="text-green-600/70 select-none">$ </span>
                {log}
              </div>
            )
          })}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}

/**
 * 根据日志内容返回颜色类名
 */
function getLogColor(log: string): string {
  const logUpper = log.toUpperCase()

  if (logUpper.includes('[ERROR]') || logUpper.includes('[FAILED]')) {
    return 'text-red-400'
  }
  if (logUpper.includes('[SUCCESS]') || logUpper.includes('✅')) {
    return 'text-green-400'
  }
  if (logUpper.includes('[WARN]') || logUpper.includes('[WARNING]')) {
    return 'text-yellow-400'
  }
  if (logUpper.includes('[INFO]')) {
    return 'text-blue-400'
  }
  if (logUpper.includes('[START]') || logUpper.includes('[RETRY]')) {
    return 'text-cyan-400'
  }

  return 'text-green-500' // 默认绿色
}
