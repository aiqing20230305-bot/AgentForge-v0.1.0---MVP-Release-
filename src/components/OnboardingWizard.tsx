/**
 * 首次启动向导
 * 引导用户快速配置和连接数据源
 */

import { useState } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle, Rocket } from 'lucide-react'
import AutoDiscoveryPanel from './AutoDiscoveryPanel'
import { useDataSourceStore } from '../store/useDataSourceStore'

interface WizardStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
}

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const { sources } = useDataSourceStore()

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: '欢迎使用 World of Claudecraft',
      description: '让我们快速配置您的 AI Agent 管理系统',
      component: (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">⚔️🤖</div>
          <h1 className="text-3xl font-bold text-white mb-4">World of Claudecraft</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">可视化构建和管理您的 AI Agents</p>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-white font-medium mb-2">可视化配置</h3>
              <p className="text-sm text-slate-400">WoW 风格的装备界面，拖拽配置 Agent</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">🦞</div>
              <h3 className="text-white font-medium mb-2">OpenClaw 集成</h3>
              <p className="text-sm text-slate-400">直接连接和管理本地 OpenClaw Agent</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-white font-medium mb-2">配置同步</h3>
              <p className="text-sm text-slate-400">自动同步 Claude Agent 配置文件</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'discovery',
      title: '自动发现本地服务',
      description: '我们会自动扫描您的本地 OpenClaw 实例和 Agent 配置',
      component: <AutoDiscoveryPanel />
    },
    {
      id: 'manual',
      title: '手动添加数据源（可选）',
      description: '如果自动发现未找到您的服务，可以手动添加',
      component: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-medium mb-4">添加 OpenClaw Gateway</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Gateway URL</label>
                <input
                  type="text"
                  placeholder="http://localhost:18790"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Auth Token</label>
                <input
                  type="password"
                  placeholder="输入认证令牌"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:border-blue-500 outline-none"
                />
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                添加数据源
              </button>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-yellow-400 mt-0.5">⚠️</div>
              <div className="flex-1">
                <h4 className="text-yellow-400 font-medium mb-1">提示</h4>
                <p className="text-sm text-yellow-200/80">
                  如果您还没有安装 OpenClaw，可以访问{' '}
                  <a
                    href="https://github.com/Feishu-Bot-Tutorial/openclaw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-100"
                  >
                    OpenClaw GitHub
                  </a>{' '}
                  获取安装指南
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: '配置完成',
      description: '您已成功配置数据源，开始管理您的 Agents 吧！',
      component: (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />

          <h2 className="text-2xl font-bold text-white mb-4">🎉 配置完成！</h2>

          <p className="text-slate-300 mb-8">
            {sources.length > 0 ? (
              <>
                已成功添加 <span className="text-blue-400 font-medium">{sources.length}</span>{' '}
                个数据源
              </>
            ) : (
              '您可以随时在设置中添加数据源'
            )}
          </p>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 max-w-md mx-auto">
            <h3 className="text-white font-medium mb-3">快速开始</h3>
            <ul className="text-sm text-slate-300 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>在左侧面板查看已连接的 Agents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>使用装备面板配置 Agent 技能和行为</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>导出配置到 Claude Agent 系统</span>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      // 标记向导已完成
      localStorage.setItem('onboarding-completed', 'true')
      onComplete()
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-700 overflow-hidden">
        {/* 进度条 */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                index === currentStep ? 'text-white' : 'text-slate-500'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStep
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 bg-slate-700 hidden md:block" />
              )}
            </div>
          ))}
        </div>

        {/* 内容区 */}
        <div className="px-8 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h2>
            <p className="text-slate-400">{currentStepData.description}</p>
          </div>

          <div className="min-h-[400px]">{currentStepData.component}</div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-slate-700 bg-slate-900/50">
          <div>
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                跳过向导
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                上一步
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
            >
              {isLastStep ? (
                <>
                  <Rocket className="w-4 h-4" />
                  开始使用
                </>
              ) : (
                <>
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
