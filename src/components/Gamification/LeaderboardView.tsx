/**
 * 排行榜视图 - Leaderboard View
 *
 * 显示全球排行榜和排名信息
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type {
  Leaderboard,
  LeaderboardType,
  LeaderboardMetric,
  LeaderboardPeriod,
} from '@/services/gamification/types';
import { leaderboardSystem } from '@/services/gamification';

export function LeaderboardView() {
  const [type, setType] = useState<LeaderboardType>('global');
  const [metric, setMetric] = useState<LeaderboardMetric>('xp');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all-time');
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);

  useEffect(() => {
    // 加载排行榜数据
    const data = leaderboardSystem.getLeaderboard(type, metric, period, 50);
    setLeaderboard(data);
  }, [type, metric, period]);

  if (!leaderboard) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 过滤器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 类型 */}
          <div>
            <label className="block text-sm font-medium mb-2">排行榜类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeaderboardType)}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="global">全球</option>
              <option value="team">团队</option>
              <option value="friends">好友</option>
              <option value="region">地区</option>
            </select>
          </div>

          {/* 指标 */}
          <div>
            <label className="block text-sm font-medium mb-2">排名指标</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as LeaderboardMetric)}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="xp">经验值</option>
              <option value="agents">Agent数量</option>
              <option value="tasks">任务完成</option>
              <option value="achievements">成就数量</option>
              <option value="streak">连胜天数</option>
            </select>
          </div>

          {/* 周期 */}
          <div>
            <label className="block text-sm font-medium mb-2">时间周期</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="daily">今日</option>
              <option value="weekly">本周</option>
              <option value="monthly">本月</option>
              <option value="all-time">全部</option>
            </select>
          </div>
        </div>
      </div>

      {/* 排行榜列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* 表头 */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🏆 排行榜
            <span className="text-sm font-normal opacity-90">
              共 {leaderboard.totalEntries} 名参与者
            </span>
          </h2>
        </div>

        {/* 前三名特殊展示 */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900">
          {leaderboard.entries.slice(0, 3).map((entry) => (
            <TopThreeCard key={entry.rank} entry={entry} />
          ))}
        </div>

        {/* 其他排名 */}
        <div className="divide-y dark:divide-gray-700">
          {leaderboard.entries.slice(3, 20).map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </div>

        {/* 我的排名 */}
        {leaderboard.myRank && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-t-2 border-blue-500">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                我的排名
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                #{leaderboard.myRank}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 前三名卡片
function TopThreeCard({ entry }: { entry: any }) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.rank * 0.1 }}
    >
      <div className="text-4xl mb-2">{medals[entry.rank - 1]}</div>
      <div className="text-3xl mb-2">{entry.avatar}</div>
      <h3 className="font-semibold text-sm truncate">{entry.username}</h3>
      <p className="text-2xl font-bold text-blue-500 mt-2">{entry.score.toLocaleString()}</p>
      {entry.badge && <div className="text-xs mt-1">{entry.badge}</div>}
    </motion.div>
  );
}

// 排行榜行
function LeaderboardRow({ entry }: { entry: any }) {
  return (
    <motion.div
      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* 排名 */}
        <div className="w-12 text-center">
          <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
            #{entry.rank}
          </span>
        </div>

        {/* 用户信息 */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{entry.avatar}</span>
          <div>
            <h3 className="font-semibold">{entry.username}</h3>
            {entry.badge && <span className="text-xs text-gray-500">{entry.badge}</span>}
          </div>
        </div>
      </div>

      {/* 分数和变化 */}
      <div className="text-right">
        <p className="text-xl font-bold text-blue-500">{entry.score.toLocaleString()}</p>
        {entry.change !== 0 && (
          <p
            className={`text-sm ${
              entry.change > 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {entry.change > 0 ? '↑' : '↓'} {Math.abs(entry.change)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
