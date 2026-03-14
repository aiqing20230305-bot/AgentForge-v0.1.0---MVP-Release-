/**
 * 能耗预算设置组件
 * 配置全局和单Agent的预算限制
 */

import React, { useState } from 'react'
import { useEnergyStore } from '../store/useEnergyStore'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { Settings, Save, RotateCcw, AlertTriangle, Zap } from 'lucide-react'

export const EnergyBudgetSettings: React.FC = () => {
  const { budget, alertThreshold, autoPauseEnabled, setBudget, setAlertThreshold, setAutoPause } = useEnergyStore()
  const { agents } = useDataSourceStore()

  // 本地状态
  const [localBudget, setLocalBudget] = useState(budget)
  const [localThreshold, setLocalThreshold] = useState(alertThreshold)
  const [localAutoPause, setLocalAutoPause] = useState(autoPauseEnabled)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 保存设置
  const handleSave = () => {
    setBudget(localBudget)
    setAlertThreshold(localThreshold)
    setAutoPause(localAutoPause)

    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  // 重置为默认值
  const handleReset = () => {
    const defaults = {
      daily: 100000,
      weekly: 500000,
      monthly: 2000000
    }
    setLocalBudget(defaults)
    setLocalThreshold(80)
    setLocalAutoPause(true)
  }

  // 智能建议（基于历史消耗）
  const getSuggestedBudget = () => {
    const { usage } = useEnergyStore.getState()
    return {
      daily: Math.round(usage.today * 1.5),
      weekly: Math.round(usage.week * 1.3),
      monthly: Math.round(usage.month * 1.2)
    }
  }

  const suggested = getSuggestedBudget()

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] overflow-y-auto">
      {/* 头部 */}
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          预算设置
        </h2>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* 全局预算配置 */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            全局预算限制
          </h3>

          <div className="space-y-4">
            {/* 日预算 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                日预算（Tokens）
              </label>
              <input
                type="number"
                value={localBudget.daily}
                onChange={e => setLocalBudget({ ...localBudget, daily: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="10000"
              />
              <div className="text-xs text-gray-500 mt-1">
                建议值：{suggested.daily.toLocaleString()} tokens（基于历史消耗）
              </div>
            </div>

            {/* 周预算 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                周预算（Tokens）
              </label>
              <input
                type="number"
                value={localBudget.weekly}
                onChange={e => setLocalBudget({ ...localBudget, weekly: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="50000"
              />
              <div className="text-xs text-gray-500 mt-1">
                建议值：{suggested.weekly.toLocaleString()} tokens
              </div>
            </div>

            {/* 月预算 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                月预算（Tokens）
              </label>
              <input
                type="number"
                value={localBudget.monthly}
                onChange={e => setLocalBudget({ ...localBudget, monthly: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100000"
              />
              <div className="text-xs text-gray-500 mt-1">
                建议值：{suggested.monthly.toLocaleString()} tokens
              </div>
            </div>
          </div>
        </div>

        {/* 告警设置 */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            告警配置
          </h3>

          <div className="space-y-4">
            {/* 告警阈值 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                告警阈值（%）
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={localThreshold}
                  onChange={e => setLocalThreshold(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  min="50"
                  max="100"
                  step="5"
                />
                <div className="w-16 text-right">
                  <span className={`text-xl font-bold ${
                    localThreshold >= 90 ? 'text-red-400' :
                    localThreshold >= 75 ? 'text-orange-400' :
                    'text-yellow-400'
                  }`}>
                    {localThreshold}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                当消耗达到预算的 {localThreshold}% 时触发告警
              </div>
            </div>

            {/* 自动暂停 */}
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <div className="text-white font-medium">超预算自动暂停</div>
                <div className="text-xs text-gray-500 mt-1">
                  当消耗超过预算时自动暂停所有任务执行
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localAutoPause}
                  onChange={e => setLocalAutoPause(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 单Agent预算（可选功能，暂时注释） */}
        {/* <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">单 Agent 预算分配</h3>
          <div className="space-y-3">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {agent.name.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{agent.name}</span>
                </div>
                <input
                  type="number"
                  placeholder="无限制"
                  className="w-32 px-3 py-1 bg-gray-800 border border-gray-700 text-white rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div> */}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-600/50"
          >
            <Save className="w-4 h-4" />
            {saveSuccess ? '✓ 已保存' : '保存设置'}
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>

        {/* 说明 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-300 text-sm space-y-2">
            <p className="font-bold">💡 使用提示：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>预算限制有助于控制 API 成本，避免意外超支</li>
              <li>建议值基于您的历史消耗量自动计算</li>
              <li>告警阈值建议设置为 80% 左右</li>
              <li>开启自动暂停可防止超出预算后继续消耗</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
