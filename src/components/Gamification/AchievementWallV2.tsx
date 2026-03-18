/**
 * 成就墙v2.0 - Achievement Wall V2
 *
 * 展示所有成就，支持过滤、搜索和分类
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement, AchievementCategory, AchievementTier } from '@/services/gamification/types';
import { achievementEngine } from '@/services/gamification';

export function AchievementWallV2() {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [category, setCategory] = useState<AchievementCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const achievements = useMemo(() => {
    let filtered = achievementEngine.getAllAchievements();

    // 过滤状态
    if (filter === 'unlocked') {
      filtered = filtered.filter((a) => a.unlockedAt);
    } else if (filter === 'locked') {
      filtered = filtered.filter((a) => !a.unlockedAt);
    }

    // 过滤类别
    if (category !== 'all') {
      filtered = filtered.filter((a) => a.category === category);
    }

    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [filter, category, searchQuery]);

  const stats = useMemo(() => {
    const all = achievementEngine.getAllAchievements();
    const unlocked = all.filter((a) => a.unlockedAt).length;
    return {
      total: all.length,
      unlocked,
      locked: all.length - unlocked,
      completionRate: Math.floor((unlocked / all.length) * 100),
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="总成就" value={stats.total} icon="🏆" />
        <StatsCard title="已解锁" value={stats.unlocked} icon="✅" color="text-green-500" />
        <StatsCard title="未解锁" value={stats.locked} icon="🔒" color="text-gray-400" />
        <StatsCard
          title="完成度"
          value={`${stats.completionRate}%`}
          icon="📊"
          color="text-blue-500"
        />
      </div>

      {/* 过滤器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* 状态过滤 */}
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f === 'all' ? '全部' : f === 'unlocked' ? '已解锁' : '未解锁'}
              </button>
            ))}
          </div>

          {/* 类别过滤 */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">所有类别</option>
            <option value="agent">Agent</option>
            <option value="task">Task</option>
            <option value="team">Team</option>
            <option value="social">Social</option>
            <option value="milestone">Milestone</option>
            <option value="speed">Speed</option>
            <option value="quality">Quality</option>
            <option value="creativity">Creativity</option>
            <option value="contribution">Contribution</option>
            <option value="loyalty">Loyalty</option>
          </select>

          {/* 搜索 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索成就..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {/* 成就列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </AnimatePresence>
      </div>

      {achievements.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-2">🔍</p>
          <p>没有找到符合条件的成就</p>
        </div>
      )}
    </div>
  );
}

// 统计卡片组件
function StatsCard({
  title,
  value,
  icon,
  color = 'text-gray-900 dark:text-white',
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg p-4"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// 成就卡片组件
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isUnlocked = !!achievement.unlockedAt;

  const tierColors: Record<AchievementTier, string> = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-cyan-600',
    diamond: 'from-purple-400 to-purple-600',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.03 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all ${
        isUnlocked
          ? 'border-green-500 shadow-lg shadow-green-500/20'
          : 'border-gray-300 dark:border-gray-700 opacity-60'
      }`}
    >
      {/* 层级标识 */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br ${tierColors[achievement.tier]}`} />

      {/* 图标和标题 */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-4xl">{achievement.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{achievement.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {achievement.category} · {achievement.tier}
          </p>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>

      {/* 进度条 */}
      {!isUnlocked && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>进度</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* 奖励 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-purple-500">+{achievement.points} 点数</span>
          {achievement.reward.coins && (
            <span className="text-yellow-500">+{achievement.reward.coins} 🪙</span>
          )}
          {achievement.reward.gems && (
            <span className="text-blue-500">+{achievement.reward.gems} 💎</span>
          )}
        </div>
        {isUnlocked && <span className="text-green-500 font-semibold">✓ 已解锁</span>}
      </div>

      {/* 解锁时间 */}
      {isUnlocked && achievement.unlockedAt && (
        <p className="text-xs text-gray-400 mt-2">
          解锁于 {new Date(achievement.unlockedAt).toLocaleDateString()}
        </p>
      )}

      {/* 稀有度标签 */}
      {achievement.rarity < 0.1 && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
          稀有
        </div>
      )}
    </motion.div>
  );
}
