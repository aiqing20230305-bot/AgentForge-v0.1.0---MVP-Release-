import { useState } from 'react'
import { useBuildStore } from '../stores/buildStore'
import { useTaskStore } from '../stores/taskStore'
import { Users, Activity, Zap, Database, Stethoscope } from 'lucide-react'
import OpenClawConfigModal from './OpenClawConfigModal'
import DataSourceManager from './DataSourceManager'
import ConnectionDiagnostics from './ConnectionDiagnostics'
import { getLocalOpenClawConfig, type OpenClawConfig } from '../services/openclawApi'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { CloudSyncToggle } from './CloudSyncToggle'

export default function TopBar() {
  const { setSettingsOpen } = useBuildStore()
  const { tasks, getTaskStats } = useTaskStore()
  const { sources, getEnabledSources } = useDataSourceStore()
  const [showOpenClawConfig, setShowOpenClawConfig] = useState(false)
  const [showDataSourceManager, setShowDataSourceManager] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [openclawConfig, setOpenclawConfig] = useState<OpenClawConfig>(getLocalOpenClawConfig())

  const stats = getTaskStats()
  const activeAgentsCount = new Set(
    tasks.filter(t => t.status === 'in_progress').map(t => t.agentId)
  ).size
  const enabledSourcesCount = getEnabledSources().length

  const handleConfigSave = (config: OpenClawConfig) => {
    setOpenclawConfig(config)
    // 刷新页面以重新加载 Agent 数据
    window.location.reload()
  }

  return (
    <div className="h-10 flex items-center justify-between px-4 bg-transparent border-b border-white/10 shadow-lg relative z-20">
      {/* Title - macOS 风格 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 group">
          <span className="text-lg soft-breathe">🦞</span>
          <h1 className="text-base font-semibold text-white uppercase tracking-wide text-glow-soft">
            OpenClaw Agent 管理中心
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        {/* 数据源管理 */}
        <button
          onClick={() => setShowDataSourceManager(true)}
          className={`flex items-center gap-2 px-3 py-1 border rounded hover:shadow-lg transition-all duration-300 hover-lift group ${
            sources.length > 0
              ? 'bg-purple-500/10 border-purple-500/50 hover:border-purple-500 hover:shadow-purple-500/20'
              : 'bg-slate-800 border-slate-600 hover:border-purple-500/50 hover:shadow-purple-500/20'
          }`}
          title="管理数据源"
        >
          <Database
            className={`w-3 h-3 ${sources.length > 0 ? 'text-purple-400' : 'text-slate-400'}`}
          />
          <div className="text-[10px]">
            <div className="text-amber-100/60">数据源</div>
            <div
              className={`font-bold ${sources.length > 0 ? 'text-purple-400' : 'text-slate-400'}`}
            >
              {enabledSourcesCount} / {sources.length}
            </div>
          </div>
        </button>

        {/* OpenClaw 连接状态 (保留兼容性) */}
        <button
          onClick={() => setShowOpenClawConfig(true)}
          className={`flex items-center gap-2 px-3 py-1 border rounded hover:shadow-lg transition-all duration-300 hover-lift group ${
            openclawConfig.enabled
              ? 'bg-green-500/10 border-green-500/50 hover:border-green-500 hover:shadow-green-500/20'
              : 'bg-slate-800 border-slate-600 hover:border-amber-500/50 hover:shadow-amber-500/20'
          }`}
          title={openclawConfig.enabled ? 'OpenClaw 已连接' : '点击配置 OpenClaw'}
        >
          <Zap
            className={`w-3 h-3 ${openclawConfig.enabled ? 'text-green-400 animate-pulse' : 'text-slate-400'}`}
          />
          <div className="text-[10px]">
            <div className="text-amber-100/60">OpenClaw</div>
            <div
              className={`font-bold ${openclawConfig.enabled ? 'text-green-400' : 'text-slate-400'}`}
            >
              {openclawConfig.enabled ? '已连接' : '未连接'}
            </div>
          </div>
        </button>

        {/* Active Agents */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover-lift cursor-pointer group">
          <Users className="w-3 h-3 text-blue-400 group-hover:animate-pulse" />
          <div className="text-[10px]">
            <div className="text-amber-100/60">工作中 Agent</div>
            <div className="font-bold text-blue-400 group-hover:scale-110 transition-transform inline-block">
              {activeAgentsCount} / 4
            </div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover-lift cursor-pointer group">
          <Activity className="w-3 h-3 text-green-400 group-hover:animate-pulse" />
          <div className="text-[10px]">
            <div className="text-amber-100/60">任务完成率</div>
            <div className="font-bold text-green-400 group-hover:scale-110 transition-transform inline-block">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Diagnostics 诊断 */}
        <button
          onClick={() => setShowDiagnostics(true)}
          className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/50 rounded hover:bg-amber-500/20 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 hover-lift group"
          title="连接诊断"
        >
          <Stethoscope className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">诊断</span>
        </button>

        {/* Cloud Sync Toggle */}
        <CloudSyncToggle />

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] hover:border-amber-500/50 transition-all duration-300 hover:scale-110 hover:rotate-90 group"
          title="设置"
        >
          <span className="text-sm text-amber-100 group-hover:animate-spin inline-block">⚙️</span>
        </button>
      </div>

      {/* 数据源管理器 */}
      {showDataSourceManager && (
        <DataSourceManager onClose={() => setShowDataSourceManager(false)} />
      )}

      {/* OpenClaw 配置模态框 (保留兼容性) */}
      {showOpenClawConfig && (
        <OpenClawConfigModal
          onClose={() => setShowOpenClawConfig(false)}
          onSave={handleConfigSave}
        />
      )}

      {/* 连接诊断 */}
      {showDiagnostics && <ConnectionDiagnostics onClose={() => setShowDiagnostics(false)} />}
    </div>
  )
}
