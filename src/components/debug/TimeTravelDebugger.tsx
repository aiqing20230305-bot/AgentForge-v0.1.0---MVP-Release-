/**
 * 时间旅行调试器 - UI 组件
 *
 * 功能：
 * - 时间轴滑块
 * - 状态快照浏览
 * - 状态对比
 * - 导出/导入
 */

import { useState, useEffect, useCallback } from 'react'
import { StateHistory, StateSnapshot, TimelineState } from '../../services/stateHistory'
import { Play, Pause, SkipBack, SkipForward, Download, Upload, Trash2, Clock } from 'lucide-react'

interface TimeTravelDebuggerProps<T = any> {
  stateHistory: StateHistory<T>
  renderState?: (state: T) => React.ReactNode
  onStateRestore?: (state: T) => void
}

export function TimeTravelDebugger<T = any>({
  stateHistory,
  renderState,
  onStateRestore,
}: TimeTravelDebuggerProps<T>) {
  const [timelineState, setTimelineState] = useState<TimelineState>(stateHistory.getTimelineState())
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState<number | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareIndexA, setCompareIndexA] = useState<number | null>(null)
  const [compareIndexB, setCompareIndexB] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // 订阅状态变化
  useEffect(() => {
    const unsubscribe = stateHistory.subscribe(state => {
      setTimelineState(state)
    })
    return unsubscribe
  }, [stateHistory])

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  // 格式化相对时间
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return `${seconds}秒前`
  }

  // 滑块变化
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const index = parseInt(e.target.value, 10)
      stateHistory.jumpToIndex(index)
    },
    [stateHistory]
  )

  // 恢复状态
  const handleRestoreState = useCallback(() => {
    const snapshot = stateHistory.getCurrentSnapshot()
    if (snapshot && onStateRestore) {
      onStateRestore(snapshot.state)
    }
  }, [stateHistory, onStateRestore])

  // 导出快照
  const handleExport = useCallback(() => {
    try {
      const data = stateHistory.exportAll()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `state-history-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }, [stateHistory])

  // 导入快照
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        stateHistory.importSnapshot(text)
      } catch (error) {
        console.error('Failed to import:', error)
      }
    }
    input.click()
  }, [stateHistory])

  const currentSnapshot = timelineState.snapshots[timelineState.currentIndex]
  const selectedSnapshot = selectedSnapshotIndex !== null ? timelineState.snapshots[selectedSnapshotIndex] : null

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors"
        >
          <Clock className="w-5 h-5" />
          <span>时间旅行调试</span>
          {timelineState.snapshots.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-500 rounded-full text-xs">
              {timelineState.snapshots.length}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-[800px] max-h-[600px] bg-gray-900 rounded-lg shadow-2xl border border-gray-700 z-50 overflow-hidden flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">时间旅行调试器</h3>
          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
            {timelineState.currentIndex + 1} / {timelineState.snapshots.length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 时间轴控制 */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        {/* 滑块 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => stateHistory.jumpToFirst()}
            disabled={timelineState.currentIndex <= 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="跳转到开始"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => stateHistory.stepBackward()}
            disabled={timelineState.currentIndex <= 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="后退一步"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={Math.max(0, timelineState.snapshots.length - 1)}
              value={timelineState.currentIndex}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              disabled={timelineState.snapshots.length === 0}
            />
            {currentSnapshot && (
              <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400">
                {formatTimestamp(currentSnapshot.timestamp)}
              </div>
            )}
          </div>

          <button
            onClick={() => stateHistory.stepForward()}
            disabled={timelineState.currentIndex >= timelineState.snapshots.length - 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="前进一步"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={() => stateHistory.jumpToLatest()}
            disabled={timelineState.currentIndex >= timelineState.snapshots.length - 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="跳转到最新"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => stateHistory.togglePause()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
              timelineState.isPaused
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {timelineState.isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span>继续</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>暂停</span>
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            disabled={timelineState.snapshots.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>

          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>导入</span>
          </button>

          <button
            onClick={() => stateHistory.clear()}
            disabled={timelineState.snapshots.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空</span>
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              compareMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            对比模式
          </button>

          {onStateRestore && (
            <button
              onClick={handleRestoreState}
              disabled={!currentSnapshot}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              恢复状态
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 快照列表 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">快照历史</h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {timelineState.snapshots.map((snapshot, index) => (
              <div
                key={snapshot.id}
                onClick={() => {
                  if (compareMode) {
                    if (compareIndexA === null) {
                      setCompareIndexA(index)
                    } else if (compareIndexB === null && index !== compareIndexA) {
                      setCompareIndexB(index)
                    } else {
                      setCompareIndexA(index)
                      setCompareIndexB(null)
                    }
                  } else {
                    setSelectedSnapshotIndex(index === selectedSnapshotIndex ? null : index)
                  }
                }}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  index === timelineState.currentIndex
                    ? 'bg-purple-600 text-white'
                    : compareIndexA === index || compareIndexB === index
                    ? 'bg-blue-600 text-white'
                    : selectedSnapshotIndex === index
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                    {snapshot.action && (
                      <span className="text-xs font-mono bg-gray-900/50 px-1 py-0.5 rounded">
                        {snapshot.action.type}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{formatRelativeTime(snapshot.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 状态详情 */}
        {selectedSnapshot && !compareMode && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400">状态详情</h4>
            <div className="bg-gray-800 rounded p-3 overflow-x-auto">
              {renderState ? (
                renderState(selectedSnapshot.state)
              ) : (
                <pre className="text-xs text-gray-300">
                  {JSON.stringify(selectedSnapshot.state, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* 对比模式 */}
        {compareMode && compareIndexA !== null && compareIndexB !== null && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400">状态对比</h4>
            <div className="bg-gray-800 rounded p-3 overflow-x-auto">
              <pre className="text-xs text-gray-300">
                {JSON.stringify(
                  stateHistory.compareSnapshots(compareIndexA, compareIndexB),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
