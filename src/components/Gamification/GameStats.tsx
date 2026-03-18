/**
 * 游戏统计组件 - Game Stats
 *
 * 显示用户游戏进度的综合统计信息
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';

interface GameStatsProps {
  userId?: string;
  timeRange?: 'today' | 'week' | 'month' | 'all-time';
  compact?: boolean;
}

export function GameStats({
  userId,
  timeRange = 'all-time',
  compact = false,
}: GameStatsProps) {
  const userStats = useGamificationStore((state) => state.userStats);
  const currency = useGamificationStore((state) => state.currency);
  const achievements = useGamificationStore((state) => state.achievements);
  const unlockedAchievements = useGamificationStore((state) => state.unlockedAchievements);

  const stats = useMemo(() => {
    if (!userStats) return null;

    const achievementCompletion = (unlockedAchievements.length / achievements.length) * 100;
    const nextLevelXP = userStats.level * 1000;
    const currentLevelProgress = (userStats.xp / nextLevelXP) * 100;

    // 模拟时间范围过滤的统计
    const rangeMultiplier =
      timeRange === 'today' ? 0.1 : timeRange === 'week' ? 0.3 : timeRange === 'month' ? 0.7 : 1;

    return {
      level: userStats.level,
      xp: userStats.xp,
      nextLevelXP,
      currentLevelProgress,
      rank: userStats.rank || 'Novice',
      totalAgents: Math.floor((userStats.totalAgents || 0) * rangeMultiplier),
      totalTasks: Math.floor((userStats.totalTasks || 0) * rangeMultiplier),
      totalTeams: Math.floor((userStats.totalTeams || 0) * rangeMultiplier),
      achievementCompletion,
      unlockedCount: unlockedAchievements.length,
      totalCount: achievements.length,
      streak: userStats.streak || 0,
      coins: currency.coins,
      gems: currency.gems,
      tokens: currency.tokens,
    };
  }, [userStats, currency, achievements, unlockedAchievements, timeRange]);

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">加载统计数据...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 等级和经验 */}
      {!compact && (
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">等级 {stats.level}</h2>
              <p className="text-white/90">{stats.rank}</p>
            </div>
            <div className="text-6xl">🏆</div>
          </div>

          {/* 经验进度条 */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>经验值</span>
              <span className="font-semibold">
                {stats.xp.toLocaleString()} / {stats.nextLevelXP.toLocaleString()} XP
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4">
              <motion.div
                className="bg-white rounded-full h-4 flex items-center justify-end pr-2"
                initial={{ width: 0 }}
                animate={{ width: `${stats.currentLevelProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <span className="text-xs font-bold text-purple-600">
                  {Math.floor(stats.currentLevelProgress)}%
                </span>
              </motion.div>
            </div>
            <p className="text-xs text-white/75 mt-1">距离下一级还需 {stats.nextLevelXP - stats.xp} XP</p>
          </div>
        </motion.div>
      )}

      {/* 核心统计网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="🤖"
          label="创建Agent"
          value={stats.totalAgents}
          color="text-blue-500"
          trend={timeRange !== 'all-time' ? '+12%' : undefined}
        />
        <StatCard
          icon="✅"
          label="完成任务"
          value={stats.totalTasks}
          color="text-green-500"
          trend={timeRange !== 'all-time' ? '+8%' : undefined}
        />
        <StatCard
          icon="👥"
          label="团队协作"
          value={stats.totalTeams}
          color="text-purple-500"
        />
        <StatCard
          icon="🔥"
          label="连胜天数"
          value={stats.streak}
          color="text-orange-500"
          suffix="天"
        />
      </div>

      {/* 成就进度 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            🏅 成就收集
          </h3>
          <span className="text-2xl font-bold text-purple-500">
            {stats.unlockedCount}/{stats.totalCount}
          </span>
        </div>

        <div className="mb-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full h-4 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: `${stats.achievementCompletion}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <span className="text-xs font-bold text-white">
                {Math.floor(stats.achievementCompletion)}%
              </span>
            </motion.div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          还有 {stats.totalCount - stats.unlockedCount} 个成就等待解锁
        </p>
      </motion.div>

      {/* 货币总览 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold mb-4">💰 货币总览</h3>
        <div className="grid grid-cols-3 gap-4">
          <CurrencyCard icon="🪙" label="金币" value={stats.coins} color="text-yellow-500" />
          <CurrencyCard icon="💎" label="宝石" value={stats.gems} color="text-blue-500" />
          <CurrencyCard icon="🎫" label="代币" value={stats.tokens} color="text-purple-500" />
        </div>
      </motion.div>

      {/* 活动热力图 */}
      {!compact && <ActivityHeatmap timeRange={timeRange} />}

      {/* 排行榜位置 */}
      {!compact && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold mb-4">🏆 排行榜位置</h3>
          <div className="grid grid-cols-2 gap-4">
            <RankCard type="全球" rank={245} total={10000} percentile={98} />
            <RankCard type="地区" rank={12} total={500} percentile={98} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 统计卡片
function StatCard({
  icon,
  label,
  value,
  color,
  trend,
  suffix = '',
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  trend?: string;
  suffix?: string;
}) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg p-4"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className="text-xs text-green-500 font-semibold">{trend}</span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value.toLocaleString()}
        {suffix}
      </p>
    </motion.div>
  );
}

// 货币卡片
function CurrencyCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-3xl block mb-1">{icon}</span>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value.toLocaleString()}</p>
    </motion.div>
  );
}

// 排名卡片
function RankCard({
  type,
  rank,
  total,
  percentile,
}: {
  type: string;
  rank: number;
  total: number;
  percentile: number;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{type}排名</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-blue-500">#{rank}</span>
        <span className="text-sm text-gray-500">/ {total.toLocaleString()}</span>
      </div>
      <p className="text-xs text-green-500 font-semibold">前 {100 - percentile}%</p>
    </div>
  );
}

// 活动热力图
function ActivityHeatmap({ timeRange }: { timeRange: string }) {
  // 模拟活动数据（7天 x 24小时）
  const activityData = useMemo(() => {
    return Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 24 }, (_, hour) => ({
        day,
        hour,
        intensity: Math.floor(Math.random() * 5), // 0-4
      }))
    ).flat();
  }, []);

  const intensityColors = [
    'bg-gray-100 dark:bg-gray-800',
    'bg-green-200 dark:bg-green-900',
    'bg-green-400 dark:bg-green-700',
    'bg-green-600 dark:bg-green-500',
    'bg-green-800 dark:bg-green-300',
  ];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-lg font-bold mb-4">📊 活动热力图</h3>
      <div className="grid grid-cols-24 gap-1">
        {activityData.map((cell, index) => (
          <motion.div
            key={index}
            className={`w-full aspect-square rounded-sm ${intensityColors[cell.intensity]}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.002 }}
            whileHover={{ scale: 1.5, zIndex: 10 }}
            title={`Day ${cell.day + 1}, Hour ${cell.hour}:00 - Activity: ${cell.intensity}/4`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>活动强度</span>
        <div className="flex items-center gap-2">
          <span>低</span>
          {intensityColors.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
          <span>高</span>
        </div>
      </div>
    </motion.div>
  );
}
