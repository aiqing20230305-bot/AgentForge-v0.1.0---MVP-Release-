/**
 * 🎯 改进的新手引导
 * 交互式教程，可保存进度，可随时跳过
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  X,
  Play,
  Pause,
  SkipForward,
  Video
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  component?: React.ReactNode;
  videoUrl?: string;
  canSkip?: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到AgentForge！',
    description: '选择你的学习路径',
    component: <PathSelector />
  },
  {
    id: 'create-agent',
    title: '创建你的第一个Agent',
    description: '实时指导 - 选择头像、设置技能、配置属性',
    action: 'create',
    videoUrl: '/videos/create-agent-tutorial.mp4'
  },
  {
    id: 'assign-task',
    title: '分配任务',
    description: '让Agent开始工作，看到实时效果',
    action: 'task',
    videoUrl: '/videos/assign-task-tutorial.mp4'
  },
  {
    id: 'monitor',
    title: '查看监控面板',
    description: '理解生命力、心跳、进化数据',
    action: 'monitor'
  },
  {
    id: 'complete',
    title: '完成！开始你的Agent之旅',
    description: '你已经掌握了基础操作',
    component: <CompletionReward />
  }
];

interface ImprovedOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function ImprovedOnboarding({ onComplete, onSkip }: ImprovedOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showVideo, setShowVideo] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);

  const step = onboardingSteps[currentStep];

  // 加载进度
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCompletedSteps(new Set(progress.completedSteps));
        setCurrentStep(progress.currentStep || 0);
      } catch (e) {
        console.error('Failed to load onboarding progress:', e);
      }
    }
  }, []);

  // 保存进度
  const saveProgress = (stepId: string, stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);

    const progress = {
      completedSteps: Array.from(newCompleted),
      currentStep: stepIndex
    };

    localStorage.setItem('onboarding_progress', JSON.stringify(progress));
    setCompletedSteps(newCompleted);
  };

  const handleNext = () => {
    saveProgress(step.id, currentStep + 1);

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkipAll = () => {
    localStorage.setItem('onboarding-completed', 'true');
    onSkip?.();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    localStorage.removeItem('onboarding_progress');
    onComplete?.();
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-5xl mx-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleSkipAll}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col md:flex-row h-[80vh]">
          {/* 左侧：步骤列表 */}
          <div className="w-full md:w-64 bg-black/30 p-6 space-y-2 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white/60 mb-4">学习路径</h3>
            {onboardingSteps.map((s, index) => (
              <button
                key={s.id}
                onClick={() => handleJumpToStep(index)}
                disabled={index > currentStep && !completedSteps.has(s.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  index === currentStep
                    ? 'bg-white/20 text-white'
                    : completedSteps.has(s.id)
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    : index < currentStep
                    ? 'text-white/60 hover:bg-white/10'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  {completedSteps.has(s.id) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                  <span className="text-sm font-medium">{index + 1}. {s.title.split('！')[0]}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 右侧：内容区域 */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* 标题 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm text-white/60">
                      步骤 {currentStep + 1} / {onboardingSteps.length}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {step.title}
                  </h2>
                  <p className="text-lg text-white/80">
                    {step.description}
                  </p>
                </div>

                {/* 视频教程 */}
                {step.videoUrl && (
                  <div className="relative aspect-video bg-black/40 rounded-lg overflow-hidden">
                    {showVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          src={step.videoUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted={false}
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <button
                            onClick={() => setVideoPaused(!videoPaused)}
                            className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                          >
                            {videoPaused ? (
                              <Play className="w-5 h-5 text-white" />
                            ) : (
                              <Pause className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="w-full h-full flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors"
                      >
                        <Video className="w-16 h-16 text-white/60" />
                        <span className="text-white/80">点击播放视频教程</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 自定义组件 */}
                {step.component && (
                  <div className="mt-8">
                    {step.component}
                  </div>
                )}

                {/* 导航按钮 */}
                <div className="flex justify-between items-center pt-8">
                  <button
                    onClick={handleSkipAll}
                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                  >
                    跳过所有
                  </button>

                  <div className="flex gap-3">
                    {currentStep < onboardingSteps.length - 1 && (
                      <button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="px-4 py-2 text-white/60 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <SkipForward className="w-4 h-4" />
                        跳过此步
                      </button>
                    )}

                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      {currentStep === onboardingSteps.length - 1 ? (
                        <>
                          完成
                          <CheckCircle className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          下一步
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// 路径选择器
function PathSelector() {
  const paths = [
    {
      id: 'beginner',
      title: '🎓 初学者路径',
      description: '从零开始，详细引导每个步骤',
      duration: '15分钟'
    },
    {
      id: 'experienced',
      title: '⚡ 快速上手',
      description: '熟悉AI工具，快速了解核心功能',
      duration: '5分钟'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paths.map(path => (
        <button
          key={path.id}
          className="p-6 bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 rounded-lg transition-all text-left"
        >
          <h3 className="text-xl font-bold text-white mb-2">{path.title}</h3>
          <p className="text-white/70 mb-3">{path.description}</p>
          <span className="text-sm text-white/50">预计时长: {path.duration}</span>
        </button>
      ))}
    </div>
  );
}

// 完成奖励
function CompletionReward() {
  return (
    <div className="text-center space-y-6">
      <div className="text-8xl">🎉</div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">恭喜完成引导！</h3>
        <p className="text-white/70">你获得了新手礼包</p>
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-3xl mb-2">💎</div>
          <div className="text-sm text-white/80">100金币</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-3xl mb-2">🎁</div>
          <div className="text-sm text-white/80">新手礼包</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-sm text-white/80">经验加成</div>
        </div>
      </div>
    </div>
  );
}
