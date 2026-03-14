/**
 * 自动发现面板
 * 帮助用户快速连接本地 OpenClaw 和 Claude Agent
 */

import { useState } from 'react'
import { Search, Server, CheckCircle, XCircle, Loader, WifiOff } from 'lucide-react'
import { autoDiscover, type DiscoveryResult, validateDiscovery } from '../services/autoDiscovery'
import { useDataSourceStore } from '../store/useDataSourceStore'

interface DiscoveryItemProps {
  result: DiscoveryResult
  onAdd: (result: DiscoveryResult) => void
}

function DiscoveryItem({ result, onAdd }: DiscoveryItemProps) {
  const [validating, setValidating] = useState(false)
  const [valid, setValid] = useState<boolean | null>(null)

  const handleValidate = async () => {
    setValidating(true)
    const isValid = await validateDiscovery(result)
    setValid(isValid)
    setValidating(false)
  }

  const getTypeIcon = () => {
    switch (result.type) {
      case 'openclaw':
        return '🦞'
      case 'claude-agent':
        return '🤖'
      case 'local-script':
        return '📜'
    }
  }

  const getConfidenceColor = () => {
    if (result.confidence >= 0.8) return 'text-green-400'
    if (result.confidence >= 0.5) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-2xl">{getTypeIcon()}</div>

          <div className="flex-1">
            <h3 className="text-white font-medium">{result.name}</h3>
            <p className="text-sm text-slate-400 mt-1">来源: {result.source}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs ${getConfidenceColor()}`}>
                置信度: {Math.round(result.confidence * 100)}%
              </span>

              {valid !== null && (
                <span className="flex items-center gap-1 text-xs">
                  {valid ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">验证通过</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">验证失败</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleValidate}
            disabled={validating}
            className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors disabled:opacity-50"
          >
            {validating ? <Loader className="w-4 h-4 animate-spin" /> : '验证'}
          </button>

          <button
            onClick={() => onAdd(result)}
            disabled={valid === false}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
      </div>

      {/* 配置详情 */}
      <details className="mt-3">
        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
          查看配置详情
        </summary>
        <pre className="mt-2 p-2 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto">
          {JSON.stringify(result.config, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export default function AutoDiscoveryPanel() {
  const [discovering, setDiscovering] = useState(false)
  const [results, setResults] = useState<DiscoveryResult[]>([])
  const { addSource } = useDataSourceStore()

  const handleDiscover = async () => {
    setDiscovering(true)
    try {
      const discovered = await autoDiscover()
      setResults(discovered)
    } catch (error) {
      console.error('自动发现失败:', error)
    } finally {
      setDiscovering(false)
    }
  }

  const handleAddSource = (result: DiscoveryResult) => {
    const newSource = {
      name: result.name,
      type: result.type as any,
      config: result.config,
      enabled: true,
      isDefault: false
    }

    addSource(newSource)

    // 从结果列表中移除已添加的项
    setResults(prev => prev.filter(r => r !== result))
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            自动发现
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            自动扫描本地 OpenClaw 实例和 Claude Agent 配置
          </p>
        </div>

        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {discovering ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              扫描中...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              开始扫描
            </>
          )}
        </button>
      </div>

      {/* 扫描结果 */}
      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result, index) => (
            <DiscoveryItem key={index} result={result} onAdd={handleAddSource} />
          ))}
        </div>
      ) : discovering ? (
        <div className="text-center py-12 text-slate-400">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>正在扫描本地服务...</p>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>点击"开始扫描"自动发现本地数据源</p>
        </div>
      )}
    </div>
  )
}
