/**
 * 🎮 快速体验模式
 * 30秒互动演示，让新用户快速理解核心功能
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Heart,
  TrendingUp,
  Swords,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // 秒
  autoAdvance?: boolean;
  component?: React.ReactNode;
}

const demoSteps: DemoStep[] = [
  {
    id: 'welcome',
    title: '👋 欢迎来到AgentForge！',
    description: '让我们用30秒了解它能做什么',
    icon: <Sparkles className="w-8 h-8" />,
    duration: 3,
    autoAdvance: true
  },
  {
    id: 'create',
    title: '🎮 创建你的第一个Agent',
    description: '像创建游戏角色一样简单 - 选择技能、设置属性',
    icon: <Zap className="w-8 h-8" />,
    duration: 5,
    component: <CreateAgentDemo />
  },
  {
    id: 'monitor',
    title: '📊 实时监控健康状态',
    description: '30秒心跳检测，6因子生命力评分',
    icon: <Heart className="w-8 h-8" />,
    duration: 5,
    component: <VitalityDemo />
  },
  {
    id: 'evolution',
    title: '🧬 看！它自动进化了',
    description: '完成任务自动升级，解锁新技能',
    icon: <TrendingUp className="w-8 h-8" />,
    duration: 5,
    component: <EvolutionDemo />
  },
  {
    id: 'battle',
    title: '⚔️ 试试PVP对战',
    description: '让你的Agent与其他Agent竞技',
    icon: <Swords className="w-8 h-8" />,
    duration: 5,
    component: <BattleDemo />
  },
  {
    id: 'complete',
    title: '✨ 完成！开始创建你的Agent',
    description: '你已经掌握了核心功能',
    icon: <CheckCircle className="w-8 h-8" />,
    duration: 3
  }
];

interface QuickDemoProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function QuickDemo({ onComplete, onSkip }: QuickDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const step = demoSteps[currentStep];

  // 自动前进计时器
  useEffect(() => {
    if (!step.autoAdvance) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (step.duration * 10));
        if (newProgress >= 100) {
          handleNext();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* 进度条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 内容区域 */}
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* 图标 */}
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                  {step.icon}
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
                {step.title}
              </h2>

              {/* 描述 */}
              <p className="text-lg md:text-xl text-center text-white/80">
                {step.description}
              </p>

              {/* 演示组件 */}
              {step.component && (
                <div className="mt-8">
                  {step.component}
                </div>
              )}

              {/* 步骤指示器 */}
              <div className="flex justify-center gap-2 pt-4">
                {demoSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-white w-6'
                        : index < currentStep
                        ? 'bg-white/50'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* 导航按钮 */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  跳过
                </button>

                {currentStep === demoSteps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    开始使用
                    <CheckCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    下一步
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// 演示组件
// ============================================

function CreateAgentDemo() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="text-6xl mb-2">🤖</div>
        <div className="text-sm text-white/60">选择头像</div>
      </div>
      <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="text-lg font-semibold text-white mb-2">技能</div>
        <div className="space-y-1 text-sm text-white/80">
          <div>✓ 代码审查</div>
          <div>✓ 自动测试</div>
          <div>✓ 文档生成</div>
        </div>
      </div>
    </div>
  );
}

function VitalityDemo() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-green-400">85</div>
        <div className="text-sm text-white/60">生命力</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-400">Level 15</div>
        <div className="text-sm text-white/60">等级</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-purple-400">94%</div>
        <div className="text-sm text-white/60">成功率</div>
      </div>
    </div>
  );
}

function EvolutionDemo() {
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="text-8xl mb-4">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            ⭐
          </motion.span>
        </div>
        <div className="text-2xl font-bold text-yellow-400">
          Common → Rare!
        </div>
        <div className="text-sm text-white/60 mt-2">
          完成20个任务后自动进化
        </div>
      </motion.div>
    </div>
  );
}

function BattleDemo() {
  return (
    <div className="flex items-center justify-between">
      <div className="text-center">
        <div className="text-5xl mb-2">🤖</div>
        <div className="text-sm text-white/80">你的Agent</div>
        <div className="text-xs text-green-400">Lv 15</div>
      </div>

      <div className="text-4xl">⚔️</div>

      <div className="text-center">
        <div className="text-5xl mb-2">🧠</div>
        <div className="text-sm text-white/80">对手Agent</div>
        <div className="text-xs text-red-400">Lv 12</div>
      </div>
    </div>
  );
}
