/**
 * 进度追踪组件 - Progress Tracker
 *
 * 可视化显示目标和里程碑的进度
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Milestone {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  icon: string;
  reward?: {
    xp?: number;
    coins?: number;
    gems?: number;
    badge?: string;
  };
  completed?: boolean;
  completedAt?: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'agent' | 'task' | 'team' | 'skill' | 'achievement';
  milestones: Milestone[];
  totalProgress: number;
  startDate: Date;
  targetDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface ProgressTrackerProps {
  goals: Goal[];
  showCompleted?: boolean;
  compact?: boolean;
}

export function ProgressTracker({
  goals,
  showCompleted = true,
  compact = false,
}: ProgressTrackerProps) {
  const activeGoals = useMemo(() => {
    if (showCompleted) return goals;
    return goals.filter((goal) => goal.totalProgress < 100);
  }, [goals, showCompleted]);

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.totalProgress >= 100).length;
    const inProgress = total - completed;
    const avgProgress = goals.reduce((sum, g) => sum + g.totalProgress, 0) / total || 0;

    return { total, completed, inProgress, avgProgress: Math.floor(avgProgress) };
  }, [goals]);

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="总目标" value={stats.total} icon="🎯" />
          <StatCard label="已完成" value={stats.completed} icon="✅" color="text-green-500" />
          <StatCard label="进行中" value={stats.inProgress} icon="🚀" color="text-blue-500" />
          <StatCard
            label="平均进度"
            value={`${stats.avgProgress}%`}
            icon="📊"
            color="text-purple-500"
          />
        </div>
      )}

      {/* 目标列表 */}
      <div className="space-y-4">
        {activeGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} compact={compact} />
        ))}
      </div>

      {activeGoals.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🎉</p>
          <p>所有目标已完成！</p>
        </div>
      )}
    </div>
  );
}

// 统计卡片
function StatCard({
  label,
  value,
  icon,
  color = 'text-gray-900 dark:text-white',
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg p-4"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// 目标卡片
function GoalCard({ goal, compact }: { goal: Goal; compact: boolean }) {
  const isCompleted = goal.totalProgress >= 100;
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const totalMilestones = goal.milestones.length;

  const categoryColors: Record<Goal['category'], string> = {
    agent: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    task: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    team: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    skill: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    achievement: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };

  const priorityColors: Record<Goal['priority'], string> = {
    low: 'border-gray-300',
    medium: 'border-blue-400',
    high: 'border-orange-400',
    urgent: 'border-red-500',
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 ${priorityColors[goal.priority]} ${
        isCompleted ? 'opacity-75' : ''
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: compact ? 1 : 1.01 }}
    >
      <div className="p-4">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{goal.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[goal.category]}`}>
                {goal.category}
              </span>
              {isCompleted && <span className="text-xl">✅</span>}
            </div>
            {!compact && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
            )}
          </div>
        </div>

        {/* 总体进度 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">总进度</span>
            <span className="font-bold text-blue-500">{Math.floor(goal.totalProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${
                isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${goal.totalProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {completedMilestones}/{totalMilestones} 里程碑
            </span>
            {goal.targetDate && (
              <span>目标: {new Date(goal.targetDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* 里程碑列表 */}
        {!compact && (
          <div className="space-y-2">
            {goal.milestones.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// 里程碑项
function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const progress = Math.min(100, (milestone.current / milestone.target) * 100);
  const isCompleted = milestone.completed || progress >= 100;

  return (
    <motion.div
      className={`border rounded-lg p-3 transition-colors ${
        isCompleted
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2 }}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <span className="text-2xl flex-shrink-0">{milestone.icon}</span>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm truncate">{milestone.name}</h4>
            {isCompleted && <span className="text-green-500 ml-2">✓</span>}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {milestone.description}
          </p>

          {/* 进度条 */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                {milestone.current} / {milestone.target}
              </span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <motion.div
                className={`h-1.5 rounded-full ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* 奖励 */}
          {milestone.reward && (
            <div className="flex items-center gap-2 text-xs">
              {milestone.reward.xp && (
                <span className="text-purple-500">+{milestone.reward.xp} XP</span>
              )}
              {milestone.reward.coins && (
                <span className="text-yellow-500">+{milestone.reward.coins} 🪙</span>
              )}
              {milestone.reward.gems && (
                <span className="text-blue-500">+{milestone.reward.gems} 💎</span>
              )}
              {milestone.reward.badge && (
                <span className="text-green-500">{milestone.reward.badge}</span>
              )}
            </div>
          )}

          {/* 完成时间 */}
          {isCompleted && milestone.completedAt && (
            <p className="text-xs text-gray-400 mt-1">
              完成于 {new Date(milestone.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Hook: 简化的进度追踪管理
export function useProgressTracker(initialGoals: Goal[] = []) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const updateMilestone = (goalId: string, milestoneId: string, current: number) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal.id !== goalId) return goal;

        const updatedMilestones = goal.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const completed = current >= m.target;
          return {
            ...m,
            current,
            completed,
            completedAt: completed && !m.completed ? new Date() : m.completedAt,
          };
        });

        const totalProgress =
          updatedMilestones.reduce((sum, m) => sum + (m.current / m.target) * 100, 0) /
          updatedMilestones.length;

        return {
          ...goal,
          milestones: updatedMilestones,
          totalProgress,
        };
      })
    );
  };

  const addGoal = (goal: Goal) => {
    setGoals((prev) => [...prev, goal]);
  };

  const removeGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  return {
    goals,
    updateMilestone,
    addGoal,
    removeGoal,
  };
}
