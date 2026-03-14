/**
 * 连接诊断组件
 * 帮助用户诊断和修复 Agent 连接问题
 */

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { CopyableText, CopyableCodeBlock } from './CopyableCodeBlock'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
}

export default function ConnectionDiagnostics({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    // 1. 检查 OpenClaw 桥接服务
    diagnostics.push({
      name: 'OpenClaw 桥接服务',
      status: 'pending',
      message: '检查中...'
    })
    setResults([...diagnostics])

    try {
      const response = await fetch('http://localhost:18790/api/ping')
      if (response.ok) {
        diagnostics[0] = {
          name: 'OpenClaw 桥接服务',
          status: 'success',
          message: '✅ 连接成功',
          details: 'http://localhost:18790'
        }
      } else {
        diagnostics[0] = {
          name: 'OpenClaw 桥接服务',
          status: 'error',
          message: `❌ HTTP ${response.status}`,
          details: '请确保桥接服务正在运行: node scripts/openclaw-bridge.js'
        }
      }
    } catch (error) {
      diagnostics[0] = {
        name: 'OpenClaw 桥接服务',
        status: 'error',
        message: '❌ 无法连接',
        details: '请启动桥接服务: cd ~/world-of-claudecraft && node scripts/openclaw-bridge.js'
      }
    }
    setResults([...diagnostics])

    // 2. 检查 Agent API
    diagnostics.push({
      name: 'Agent API',
      status: 'pending',
      message: '检查中...'
    })
    setResults([...diagnostics])

    try {
      const response = await fetch('http://localhost:18790/api/agents')
      if (response.ok) {
        const data = await response.json()
        diagnostics[1] = {
          name: 'Agent API',
          status: 'success',
          message: `✅ 找到 ${data.agents?.length || 0} 个 Agent`,
          details: data.agents?.map((a: any) => a.name).join(', ') || '无'
        }
      } else {
        diagnostics[1] = {
          name: 'Agent API',
          status: 'error',
          message: '❌ API 返回错误',
          details: `HTTP ${response.status}`
        }
      }
    } catch (error) {
      diagnostics[1] = {
        name: 'Agent API',
        status: 'error',
        message: '❌ 无法获取 Agent 数据',
        details: error instanceof Error ? error.message : String(error)
      }
    }
    setResults([...diagnostics])

    // 3. 检查数据源配置
    diagnostics.push({
      name: '数据源配置',
      status: 'pending',
      message: '检查中...'
    })
    setResults([...diagnostics])

    try {
      const { useDataSourceStore } = await import('../store/useDataSourceStore')
      const { getEnabledSources } = useDataSourceStore.getState()
      const sources = getEnabledSources()

      if (sources.length > 0) {
        diagnostics[2] = {
          name: '数据源配置',
          status: 'success',
          message: `✅ ${sources.length} 个启用的数据源`,
          details: sources.map(s => `${s.name} (${s.type})`).join(', ')
        }
      } else {
        diagnostics[2] = {
          name: '数据源配置',
          status: 'warning',
          message: '⚠️  没有启用的数据源',
          details: '点击下方"快速修复"按钮初始化默认数据源'
        }
      }
    } catch (error) {
      diagnostics[2] = {
        name: '数据源配置',
        status: 'error',
        message: '❌ 无法读取配置',
        details: error instanceof Error ? error.message : String(error)
      }
    }
    setResults([...diagnostics])

    setIsRunning(false)
  }

  const quickFix = () => {
    // console.log('🔧 执行快速修复...')

    // 清理 localStorage 并重新加载
    const confirmed = confirm(
      '快速修复将：\n' +
        '1. 清理所有本地配置\n' +
        '2. 重新初始化数据源\n' +
        '3. 刷新页面\n\n' +
        '是否继续？'
    )

    if (confirmed) {
      localStorage.clear()
      location.reload()
    }
  }


  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-2 border-amber-500/50 rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        {/* 标题 */}
        <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 px-6 py-4 border-b-2 border-amber-500/30">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle size={24} />
            连接诊断
          </h2>
          <p className="text-amber-100/60 text-sm mt-1">检查 Agent 连接状态</p>
        </div>

        {/* 诊断结果 */}
        <div className="px-6 py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {results.map((result, index) => (
            <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {result.status === 'success' && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                  {result.status === 'error' && <XCircle size={20} className="text-red-400" />}
                  {result.status === 'warning' && (
                    <AlertCircle size={20} className="text-yellow-400" />
                  )}
                  {result.status === 'pending' && (
                    <RefreshCw size={20} className="text-blue-400 animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-100">{result.name}</div>
                  <div className="text-sm text-amber-100/80 mt-1">{result.message}</div>
                  {result.details && (
                    <div className="mt-2">
                      {result.details.startsWith('http') ? (
                        <CopyableText text={result.details} showCopyIcon={true} className="text-xs" />
                      ) : result.details.includes('node ') || result.details.includes('cd ') ? (
                        <CopyableCodeBlock
                          code={result.details}
                          language="bash"
                          showLineNumbers={false}
                          className="text-xs"
                        />
                      ) : (
                        <div className="text-xs text-amber-100/60 bg-black/40 p-2 rounded font-mono">
                          {result.details}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="px-6 py-4 bg-black/30 border-t-2 border-white/10 flex gap-3">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} className={isRunning ? 'animate-spin' : ''} />
            重新检测
          </button>
          <button
            onClick={quickFix}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <AlertCircle size={16} />
            快速修复
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            关闭
          </button>
        </div>

        {/* 快速命令 */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/5">
          <div className="text-xs text-amber-100/60 space-y-2">
            <div className="text-xs text-amber-100/40 mb-1">快速命令:</div>
            <CopyableText
              text="node scripts/openclaw-bridge.js"
              label="启动桥接服务"
              showCopyIcon={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
