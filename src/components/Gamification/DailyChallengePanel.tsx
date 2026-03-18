/**
 * 每日挑战面板 - Daily Challenge Panel
 *
 * 显示每日任务和进度
 */

import { motion } from 'framer-motion';
import { useGamificationStore } from '@/store/useGamificationStore';
import type { DailyTask } from '@/services/gamification/types';

export function DailyChallengePanel() {
  const dailyChallenge = useGamificationStore((state) => state.dailyChallenge);

  if (!dailyChallenge) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-4xl mb-2">📅</p>
        <p className="text-gray-600 dark:text-gray-400">暂无每日挑战</p>
      </div>
    );
  }

  const completionRate = Math.floor(
    (dailyChallenge.completedCount / dailyChallenge.maxCompletions) * 100
  );

  const isCompleted = dailyChallenge.completedCount >= dailyChallenge.maxCompletions;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🎯 每日挑战
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                dailyChallenge.difficulty === 'easy'
                  ? 'bg-green-100 text-green-700'
                  : dailyChallenge.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : dailyChallenge.difficulty === 'hard'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
              }`}
            >
              {dailyChallenge.difficulty.toUpperCase()}
            </span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {dailyChallenge.date}
          </p>
        </div>

        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >
            🎉
          </motion.div>
        )}
      </div>

      {/* 总体进度 */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">总进度</span>
          <span className="text-blue-500 font-semibold">
            {dailyChallenge.completedCount}/{dailyChallenge.maxCompletions} 任务
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className={`h-3 rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{completionRate}% 完成</p>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {dailyChallenge.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* 奖励预览 */}
      {!isCompleted && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">🎁 完成所有任务可获得：</p>
          <div className="flex flex-wrap gap-2">
            {dailyChallenge.rewards.map((reward, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {reward.xp && <span className="text-purple-500">+{reward.xp} XP</span>}
                {reward.coins && <span className="text-yellow-500 ml-2">+{reward.coins} 🪙</span>}
                {reward.gems && <span className="text-blue-500 ml-2">+{reward.gems} 💎</span>}
                {reward.tokens && <span className="text-purple-500 ml-2">+{reward.tokens} 🎫</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 完成状态 */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 text-center"
        >
          <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
            🎉 恭喜完成今日所有挑战！
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">明天再来完成新的挑战吧！</p>
        </motion.div>
      )}
    </div>
  );
}

// 单个任务卡片
function TaskCard({ task }: { task: DailyTask }) {
  const isCompleted = task.progress >= task.target;
  const progressPercent = Math.min(100, (task.progress / task.target) * 100);

  return (
    <motion.div
      className={`border-2 rounded-lg p-4 transition-all ${
        isCompleted
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-200 dark:border-gray-700'
      }`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold">{task.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
        </div>
        {isCompleted && <span className="text-2xl ml-2">✅</span>}
      </div>

      {/* 进度 */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>进度</span>
          <span>
            {task.progress}/{task.target}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 奖励 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {task.reward.xp && (
            <span className="text-purple-500 font-semibold">+{task.reward.xp} XP</span>
          )}
          {task.reward.coins && (
            <span className="text-yellow-500">+{task.reward.coins} 🪙</span>
          )}
          {task.reward.gems && <span className="text-blue-500">+{task.reward.gems} 💎</span>}
        </div>
        {!isCompleted && (
          <span className="text-gray-400">{Math.floor(progressPercent)}% 完成</span>
        )}
      </div>
    </motion.div>
  );
}
