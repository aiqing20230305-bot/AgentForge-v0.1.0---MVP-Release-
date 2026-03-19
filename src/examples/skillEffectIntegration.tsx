/**
 * Skill Effect System Integration Example
 * 演示如何集成和使用技能效果系统
 */

import React, { useEffect, useState } from 'react'
import { skillEffectProcessor } from '../services/skillEffectProcessor'
import { taskExecutor } from '../services/taskExecutor'
import { SKILLS } from '../data/skillTree'
import { SkillActivationPanel } from '../components/SkillActivationPanel'
import { SkillEffectDisplay } from '../components/SkillEffectDisplay'
import { SkillEffectsSummary } from '../components/SkillEffectsSummary'
import type { Task } from '../types/task'
import type { ProcessedEffects, ActiveSkillInstance } from '../services/skillEffectProcessor'

interface ExampleAgentPanelProps {
  agentId: string
  agentName: string
  agentLevel: number
  unlockedSkills: string[]
}

export const SkillEffectIntegrationExample: React.FC<ExampleAgentPanelProps> = ({
  agentId,
  agentName,
  agentLevel,
  unlockedSkills
}) => {
  const [effects, setEffects] = useState<ProcessedEffects | null>(null)
  const [activeSkills, setActiveSkills] = useState<ActiveSkillInstance[]>([])
  const [logs, setLogs] = useState<string[]>([])

  // 初始化技能上下文
  useEffect(() => {
    let context = skillEffectProcessor.getContext(agentId)
    if (!context) {
      context = skillEffectProcessor.initializeContext(
        agentId,
        agentLevel,
        unlockedSkills
      )
      addLog('✅ 技能系统初始化完成')
    } else {
      skillEffectProcessor.updateUnlockedSkills(agentId, unlockedSkills)
      addLog('🔄 更新已解锁技能列表')
    }

    // 计算初始效果
    updateEffects()
  }, [agentId, agentLevel, unlockedSkills])

  // 定时更新激活的技能和效果
  useEffect(() => {
    const interval = setInterval(() => {
      const active = skillEffectProcessor.getActiveSkills(agentId)
      setActiveSkills(active)
      updateEffects()
    }, 1000)

    return () => clearInterval(interval)
  }, [agentId])

  const updateEffects = () => {
    const calculated = skillEffectProcessor.calculateEffects(agentId, SKILLS)
    setEffects(calculated)
  }

  const addLog = (message: string) => {
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 9) // 保留最近10条
    ])
  }

  const handleSkillActivated = (skillId: string, success: boolean, message: string) => {
    if (success) {
      addLog(`✨ 激活技能: ${SKILLS.find(s => s.id === skillId)?.name}`)
      addLog(`💡 ${message}`)
      updateEffects()
    } else {
      addLog(`❌ 激活失败: ${message}`)
    }
  }

  const handleExecuteExampleTask = async () => {
    addLog('🚀 开始执行示例任务...')

    const exampleTask: Task = {
      id: `task-${Date.now()}`,
      title: '示例任务：优化代码性能',
      description: '使用技能加成执行任务',
      status: 'pending',
      priority: 'high',
      agentId,
      agentName,
      createdAt: new Date().toISOString(),
      estimatedDuration: 120,
      tokenMetrics: {
        estimatedTokens: 1000,
        actualTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        model: 'gpt-4',
        costUSD: 0.02
      }
    }

    await taskExecutor.executeTask({
      task: exampleTask,
      agentLevel,
      unlockedSkills,
      onProgress: (progress) => {
        // 进度更新
      },
      onComplete: (success, result, error) => {
        if (success) {
          addLog('✅ 任务执行成功！')
          addLog(`📊 结果: ${result}`)
        } else {
          addLog(`❌ 任务失败: ${error}`)
        }
      },
      onLog: (log) => {
        addLog(log)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-500/30">
          <h1 className="text-3xl font-bold text-white mb-2">
            技能效果系统集成示例
          </h1>
          <p className="text-gray-300">
            Agent: {agentName} (Lv.{agentLevel})
          </p>
          <p className="text-gray-400 text-sm mt-1">
            已解锁 {unlockedSkills.length} 个技能
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Skill Activation Panel */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <SkillActivationPanel
                agentId={agentId}
                agentLevel={agentLevel}
                unlockedSkills={unlockedSkills}
                onSkillActivated={handleSkillActivated}
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">操作</h3>
              <div className="space-y-3">
                <button
                  onClick={handleExecuteExampleTask}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all"
                >
                  🚀 执行示例任务（应用技能效果）
                </button>
                <button
                  onClick={updateEffects}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
                >
                  🔄 刷新效果计算
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Active Skills Display */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">
                激活的技能 ({activeSkills.length})
              </h3>
              {activeSkills.length > 0 ? (
                <SkillEffectDisplay
                  agentId={agentId}
                  activeSkills={activeSkills}
                />
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>暂无激活的技能</p>
                  <p className="text-sm mt-2">激活主动技能查看效果</p>
                </div>
              )}
            </div>

            {/* Effects Summary */}
            {effects && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <SkillEffectsSummary effects={effects} />
              </div>
            )}

            {/* Logs */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">活动日志</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-gray-300 font-mono bg-gray-900/50 p-2 rounded"
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    暂无日志
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">代码示例</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300">
              <code>{`// 1. 初始化技能上下文
const context = skillEffectProcessor.initializeContext(
  '${agentId}',
  ${agentLevel},
  ${JSON.stringify(unlockedSkills, null, 2)}
)

// 2. 激活主动技能
const skill = SKILLS.find(s => s.id === 'battle_rage')
const result = skillEffectProcessor.activateSkill('${agentId}', skill)

// 3. 计算效果
const effects = skillEffectProcessor.calculateEffects('${agentId}', SKILLS)
console.log('Token节省:', effects.tokenReduction, '%')
console.log('速度提升:', effects.speedBoost, '%')

// 4. 应用到任务
const modifiedTask = skillEffectProcessor.applyEffectsToTask(
  '${agentId}',
  task,
  effects
)

// 5. 执行任务
await taskExecutor.executeTask({
  task: modifiedTask,
  agentLevel: ${agentLevel},
  unlockedSkills: ${JSON.stringify(unlockedSkills)}
})`}</code>
            </pre>
          </div>
        </div>

        {/* Statistics */}
        {effects && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">效果统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Token消耗"
                value={`×${effects.totalTokenMultiplier.toFixed(2)}`}
                color="text-green-400"
              />
              <StatCard
                label="执行速度"
                value={`×${effects.totalSpeedMultiplier.toFixed(2)}`}
                color="text-blue-400"
              />
              <StatCard
                label="成功率"
                value={`×${effects.totalSuccessMultiplier.toFixed(2)}`}
                color="text-purple-400"
              />
              <StatCard
                label="经验获取"
                value={`×${effects.totalExpMultiplier.toFixed(2)}`}
                color="text-yellow-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color
}) => (
  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
)

// Export default component with example data
export default function SkillEffectIntegrationDemo() {
  return (
    <SkillEffectIntegrationExample
      agentId="demo-agent-001"
      agentName="演示Agent"
      agentLevel={50}
      unlockedSkills={[
        'token_saver_1',
        'token_saver_2',
        'fast_thinker',
        'battle_rage',
        'focus_mode',
        'fast_learner'
      ]}
    />
  )
}
