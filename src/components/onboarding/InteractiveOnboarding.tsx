/**
 * 交互式新手引导系统
 * Interactive Onboarding - 5-step guided experience (5 minutes total)
 *
 * 流程设计：
 * 1. 欢迎 (10秒)
 * 2. 选择模板 (30秒)
 * 3. 配置Agent (1分钟)
 * 4. 互动训练 (2分钟)
 * 5. 完成庆祝 (30秒)
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Wand2,
  Settings,
  MessageSquare,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check,
  Star,
  Zap,
  Target,
  Trophy,
} from 'lucide-react'

// Agent 模板类型
interface AgentTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  features: string[]
  recommended?: boolean
}

// 新手引导步骤
type OnboardingStep = 'welcome' | 'template' | 'configure' | 'train' | 'complete'

interface InteractiveOnboardingProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (agentData: any) => void
}

// 预设模板
const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'customer-support',
    name: '客服助手',
    description: '智能客服机器人，自动回答常见问题',
    icon: <MessageSquare className="w-8 h-8" />,
    difficulty: 'beginner',
    estimatedTime: '2分钟',
    features: ['自动问答', '情感识别', '多轮对话'],
    recommended: true,
  },
  {
    id: 'content-creator',
    name: '内容创作者',
    description: '自动生成文章、社交媒体内容',
    icon: <Wand2 className="w-8 h-8" />,
    difficulty: 'beginner',
    estimatedTime: '2分钟',
    features: ['文章生成', 'SEO优化', '多语言支持'],
  },
  {
    id: 'code-assistant',
    name: '代码助手',
    description: '帮助编写、审查和优化代码',
    icon: <Zap className="w-8 h-8" />,
    difficulty: 'intermediate',
    estimatedTime: '3分钟',
    features: ['代码生成', '调试建议', '文档编写'],
  },
  {
    id: 'data-analyst',
    name: '数据分析师',
    description: '分析数据并生成可视化报告',
    icon: <Target className="w-8 h-8" />,
    difficulty: 'advanced',
    estimatedTime: '5分钟',
    features: ['数据清洗', '趋势分析', '报表生成'],
  },
]

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null)
  const [agentName, setAgentName] = useState('')
  const [agentDescription, setAgentDescription] = useState('')
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [completionScore, setCompletionScore] = useState(0)

  // 步骤进度
  const stepProgress = {
    welcome: 0,
    template: 25,
    configure: 50,
    train: 75,
    complete: 100,
  }

  // 训练模拟
  useEffect(() => {
    if (isTraining && trainingProgress < 100) {
      const timer = setTimeout(() => {
        setTrainingProgress((prev) => Math.min(prev + 2, 100))
      }, 100)
      return () => clearTimeout(timer)
    } else if (trainingProgress === 100 && isTraining) {
      setIsTraining(false)
      // 自动进入完成步骤
      setTimeout(() => {
        setCurrentStep('complete')
        calculateCompletionScore()
      }, 500)
    }
  }, [isTraining, trainingProgress])

  // 计算完成分数
  const calculateCompletionScore = () => {
    let score = 60 // 基础分
    if (selectedTemplate) score += 10
    if (agentName.length > 0) score += 10
    if (agentDescription.length > 10) score += 10
    if (trainingProgress === 100) score += 10
    setCompletionScore(score)
  }

  // 处理下一步
  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'template', 'configure', 'train', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  // 处理上一步
  const handlePrev = () => {
    const steps: OnboardingStep[] = ['welcome', 'template', 'configure', 'train', 'complete']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  // 开始训练
  const handleStartTraining = () => {
    setIsTraining(true)
  }

  // 完成引导
  const handleFinish = () => {
    const agentData = {
      template: selectedTemplate,
      name: agentName,
      description: agentDescription,
      score: completionScore,
    }
    onComplete(agentData)
    onClose()
  }

  // 跳过引导
  const handleSkip = () => {
    if (confirm('确定要跳过新手引导吗？')) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30"
      >
        {/* 进度条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${stepProgress[currentStep]}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* 主内容区 */}
        <div className="p-8 min-h-[600px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Step 1: 欢迎 */}
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-24 h-24 text-purple-400 mb-6" />
                </motion.div>
                <h1 className="text-5xl font-bold text-white mb-4">
                  欢迎来到 AgentForge
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                  在接下来的 <span className="text-purple-400 font-bold">5分钟</span> 里，
                  我们将引导你创建第一个 AI Agent
                </p>
                <div className="flex gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>无需编程经验</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>可视化配置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>即时可用</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: 选择模板 */}
            {currentStep === 'template' && (
              <motion.div
                key="template"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    选择一个模板开始
                  </h2>
                  <p className="text-gray-400">
                    选择最适合你需求的 Agent 模板
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {AGENT_TEMPLATES.map((template) => (
                    <motion.button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      {template.recommended && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          推荐
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {template.features.map((feature) => (
                              <span
                                key={feature}
                                className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>难度: {template.difficulty}</span>
                            <span>预计: {template.estimatedTime}</span>
                          </div>
                        </div>
                      </div>

                      {selectedTemplate?.id === template.id && (
                        <motion.div
                          layoutId="selected-indicator"
                          className="absolute inset-0 rounded-2xl border-2 border-purple-500"
                          transition={{ type: 'spring', duration: 0.5 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: 配置 Agent */}
            {currentStep === 'configure' && selectedTemplate && (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    配置你的 Agent
                  </h2>
                  <p className="text-gray-400">
                    给它起个名字，描述它的职责
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* 选中的模板卡片 */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                        {selectedTemplate.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {selectedTemplate.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {selectedTemplate.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agent 名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Agent 名称 *
                    </label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder={`例如: 我的${selectedTemplate.name}`}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  {/* Agent 描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Agent 描述（可选）
                    </label>
                    <textarea
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="描述这个 Agent 的具体功能和使用场景..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    />
                  </div>

                  {/* 提示 */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <p className="font-medium mb-1">小提示</p>
                      <p className="text-blue-400">
                        给 Agent 一个清晰的名称和描述，有助于后续管理和使用
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: 互动训练 */}
            {currentStep === 'train' && (
              <motion.div
                key="train"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    训练你的 Agent
                  </h2>
                  <p className="text-gray-400">
                    让 AI 学习必要的技能和知识
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  {!isTraining && trainingProgress === 0 ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                        <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                          准备开始训练
                        </h3>
                        <p className="text-gray-400 mb-6">
                          AI 将根据你选择的模板进行训练，大约需要 30 秒
                        </p>
                        <button
                          onClick={handleStartTraining}
                          className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/50"
                        >
                          开始训练
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                          <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-white font-medium">对话训练</p>
                          <p className="text-gray-400 text-xs mt-1">学习自然对话</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                          <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-white font-medium">任务优化</p>
                          <p className="text-gray-400 text-xs mt-1">提升执行效率</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-white font-medium">质量检测</p>
                          <p className="text-gray-400 text-xs mt-1">确保输出质量</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                        <div className="flex items-center justify-center mb-6">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Zap className="w-16 h-16 text-purple-400" />
                          </motion.div>
                        </div>

                        <h3 className="text-xl font-bold text-white text-center mb-6">
                          训练进行中...
                        </h3>

                        {/* 进度条 */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>训练进度</span>
                            <span>{trainingProgress}%</span>
                          </div>
                          <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${trainingProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>

                        {/* 训练阶段 */}
                        <div className="space-y-3">
                          {[
                            { name: '初始化模型', threshold: 20 },
                            { name: '加载知识库', threshold: 40 },
                            { name: '优化参数', threshold: 60 },
                            { name: '测试验证', threshold: 80 },
                            { name: '完成部署', threshold: 100 },
                          ].map((stage) => (
                            <div
                              key={stage.name}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                trainingProgress >= stage.threshold
                                  ? 'bg-green-500/10 border border-green-500/30'
                                  : 'bg-gray-800 border border-gray-700'
                              }`}
                            >
                              {trainingProgress >= stage.threshold ? (
                                <Check className="w-5 h-5 text-green-400" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                              )}
                              <span
                                className={
                                  trainingProgress >= stage.threshold
                                    ? 'text-green-300 font-medium'
                                    : 'text-gray-400'
                                }
                              >
                                {stage.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: 完成庆祝 */}
            {currentStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <PartyPopper className="w-24 h-24 text-yellow-400 mb-6" />
                </motion.div>

                <h1 className="text-5xl font-bold text-white mb-4">
                  恭喜完成！
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  你的第一个 AI Agent 已经准备就绪
                </p>

                {/* 完成分数 */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Trophy className="w-12 h-12 text-yellow-400" />
                    <div className="text-left">
                      <p className="text-sm text-gray-400">完成度</p>
                      <p className="text-4xl font-bold text-white">
                        {completionScore}
                        <span className="text-xl text-gray-400">/100</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agent 信息摘要 */}
                <div className="w-full max-w-md mb-8 p-6 rounded-2xl bg-gray-800 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Agent 信息</h3>
                  <div className="space-y-3 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-400">名称:</span>
                      <span className="text-white font-medium">{agentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">模板:</span>
                      <span className="text-white font-medium">
                        {selectedTemplate?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">状态:</span>
                      <span className="text-green-400 font-medium">已就绪</span>
                    </div>
                  </div>
                </div>

                {/* 下一步建议 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                    <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-white font-medium text-sm">开始对话</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                    <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-white font-medium text-sm">高级配置</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white font-medium text-sm">查看教程</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 底部导航 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              跳过引导
            </button>

            <div className="flex items-center gap-2">
              {/* 上一步 */}
              {currentStep !== 'welcome' && currentStep !== 'complete' && (
                <button
                  onClick={handlePrev}
                  className="px-6 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一步
                </button>
              )}

              {/* 下一步/完成 */}
              {currentStep === 'complete' ? (
                <button
                  onClick={handleFinish}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                >
                  开始使用
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : currentStep === 'train' && !isTraining && trainingProgress === 0 ? (
                <button
                  onClick={handleStartTraining}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                >
                  开始训练
                  <Zap className="w-4 h-4" />
                </button>
              ) : currentStep !== 'train' ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 'template' && !selectedTemplate) ||
                    (currentStep === 'configure' && !agentName)
                  }
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default InteractiveOnboarding
