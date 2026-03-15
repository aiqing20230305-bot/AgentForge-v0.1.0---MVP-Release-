/**
 * Vitality Dashboard Component
 * 生命力仪表盘 - 综合展示Agent健康状态
 */

import React from 'react'
import { VitalityGauge } from './VitalityGauge'
import { HeartbeatChart } from './HeartbeatChart'
import { VitalityTrendChart } from './VitalityTrendChart'
import { HealthRecommendations } from './HealthRecommendations'
import { getHeartbeatService } from '../services/evolution/heartbeatService'
import type { OpenClawAgent } from '../utils/openclawLoader'

interface VitalityDashboardProps {
  agent: OpenClawAgent
}

export const VitalityDashboard: React.FC<VitalityDashboardProps> = ({
  agent
}) => {
  const heartbeatService = getHeartbeatService()
  const heartbeatHistory = heartbeatService.getHeartbeatHistory(agent.id)
  const latestHeartbeat = heartbeatService.getLatestHeartbeat(agent.id)

  const vitality = agent.coreEvolution?.vitality || 100
  const heartRate = agent.coreEvolution?.heartRate || 60
  const healthStatus = agent.coreEvolution?.healthStatus || 'healthy'

  const historyData = heartbeatHistory?.records || []

  return (
    <div className="w-full space-y-4">
      {/* 顶部概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 生命力仪表盘 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4 flex flex-col items-center justify-center">
          <VitalityGauge vitality={vitality} size="md" showLabel={true} />
        </div>

        {/* 关键指标 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-white mb-3">关键指标</h4>

          {/* 心率 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-pink-500 animate-pulse">❤️</span>
              <span className="text-xs text-gray-400">心率</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-white">{heartRate}</span>
              <span className="text-xs text-gray-400 ml-1">bpm</span>
            </div>
          </div>

          {/* 健康状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>
                {healthStatus === 'healthy'
                  ? '✅'
                  : healthStatus === 'warning'
                    ? '⚠️'
                    : '🚨'}
              </span>
              <span className="text-xs text-gray-400">状态</span>
            </div>
            <span
              className={`text-sm font-medium ${
                healthStatus === 'healthy'
                  ? 'text-green-400'
                  : healthStatus === 'warning'
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}
            >
              {healthStatus === 'healthy'
                ? '健康'
                : healthStatus === 'warning'
                  ? '警告'
                  : healthStatus === 'critical'
                    ? '危急'
                    : '离线'}
            </span>
          </div>

          {/* 总心跳次数 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🫀</span>
              <span className="text-xs text-gray-400">总心跳</span>
            </div>
            <span className="text-lg font-bold text-white">
              {heartbeatHistory?.totalBeats || 0}
            </span>
          </div>

          {/* 进化等级 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🧬</span>
              <span className="text-xs text-gray-400">进化等级</span>
            </div>
            <span className="text-lg font-bold text-purple-400">
              {agent.coreEvolution?.evolutionLevel || 0}
            </span>
          </div>

          {/* 进化点 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>💎</span>
              <span className="text-xs text-gray-400">进化点</span>
            </div>
            <span className="text-lg font-bold text-cyan-400">
              {agent.coreEvolution?.evolutionPoints || 0}
            </span>
          </div>
        </div>

        {/* 快速统计 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-white mb-3">快速统计</h4>

          {latestHeartbeat && (
            <>
              {/* 任务队列 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">任务队列</span>
                <span className="text-sm font-medium text-white">
                  {latestHeartbeat.metrics.taskQueueLength}
                </span>
              </div>

              {/* 成功率 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">成功率</span>
                <span
                  className={`text-sm font-medium ${
                    latestHeartbeat.metrics.successRate >= 80
                      ? 'text-green-400'
                      : latestHeartbeat.metrics.successRate >= 60
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {latestHeartbeat.metrics.successRate.toFixed(1)}%
                </span>
              </div>

              {/* 平均任务时长 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">平均时长</span>
                <span className="text-sm font-medium text-white">
                  {latestHeartbeat.metrics.avgTaskDuration > 0
                    ? `${(latestHeartbeat.metrics.avgTaskDuration / 60).toFixed(0)}分钟`
                    : '-'}
                </span>
              </div>

              {/* Token使用率 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Token/小时</span>
                <span className="text-sm font-medium text-white">
                  {latestHeartbeat.metrics.tokenUsageRate.toLocaleString()}
                </span>
              </div>

              {/* 警告数量 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">当前警告</span>
                <span
                  className={`text-sm font-medium ${
                    latestHeartbeat.warnings.length > 0
                      ? 'text-amber-400'
                      : 'text-green-400'
                  }`}
                >
                  {latestHeartbeat.warnings.length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 心跳波形图 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          {historyData.length > 0 ? (
            <HeartbeatChart data={historyData} height={200} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              暂无心跳数据
            </div>
          )}
        </div>

        {/* 趋势图 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          {historyData.length > 0 ? (
            <VitalityTrendChart data={historyData} height={200} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              暂无趋势数据
            </div>
          )}
        </div>
      </div>

      {/* 健康建议 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
        <HealthRecommendations
          agent={agent}
          latestHeartbeat={latestHeartbeat}
          historyData={historyData}
        />
      </div>

      {/* 警告详情 */}
      {latestHeartbeat && latestHeartbeat.warnings.length > 0 && (
        <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
            <span>⚠️</span>
            当前警告
          </h4>
          <div className="space-y-2">
            {latestHeartbeat.warnings.map((warning, index) => (
              <div
                key={index}
                className="text-sm text-amber-300 bg-amber-500/5 rounded p-2"
              >
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
