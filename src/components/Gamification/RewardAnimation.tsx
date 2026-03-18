/**
 * 奖励动画组件 - Reward Animation
 *
 * 显示获得奖励时的动画效果
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Reward {
  id: string;
  type: 'xp' | 'coins' | 'gems' | 'tokens' | 'achievement';
  amount?: number;
  icon: string;
  name: string;
  description?: string;
}

interface RewardAnimationProps {
  rewards: Reward[];
  onComplete?: () => void;
  duration?: number;
}

export function RewardAnimation({
  rewards,
  onComplete,
  duration = 3000,
}: RewardAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);

  useEffect(() => {
    if (rewards.length === 0) return;

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [rewards, duration, onComplete]);

  useEffect(() => {
    if (currentRewardIndex < rewards.length - 1) {
      const timer = setTimeout(() => {
        setCurrentRewardIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentRewardIndex, rewards.length]);

  if (rewards.length === 0 || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setVisible(false);
          onComplete?.();
        }}
      >
        <motion.div
          className="relative bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
          initial={{ scale: 0.5, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {/* 标题 */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">🎉 恭喜获得奖励！</h2>
            <p className="text-white/90 text-sm">点击任意位置关闭</p>
          </motion.div>

          {/* 奖励列表 */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {rewards.slice(0, currentRewardIndex + 1).map((reward, index) => (
                <RewardItem
                  key={reward.id}
                  reward={reward}
                  index={index}
                  total={rewards.length}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* 装饰性粒子效果 */}
          <ParticleEffect />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 单个奖励项
function RewardItem({
  reward,
  index,
  total,
}: {
  reward: Reward;
  index: number;
  total: number;
}) {
  const colors: Record<Reward['type'], string> = {
    xp: 'from-purple-400 to-purple-600',
    coins: 'from-yellow-400 to-yellow-600',
    gems: 'from-blue-400 to-blue-600',
    tokens: 'from-pink-400 to-pink-600',
    achievement: 'from-green-400 to-green-600',
  };

  const labels: Record<Reward['type'], string> = {
    xp: 'XP',
    coins: '金币',
    gems: '宝石',
    tokens: '代币',
    achievement: '成就',
  };

  return (
    <motion.div
      className={`bg-gradient-to-r ${colors[reward.type]} rounded-lg p-4 text-white`}
      initial={{ opacity: 0, x: -50, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        damping: 20,
      }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-center gap-4">
        {/* 图标 */}
        <motion.div
          className="text-5xl"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
        >
          {reward.icon}
        </motion.div>

        {/* 信息 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg">{reward.name}</h3>
            {reward.amount && (
              <motion.span
                className="text-2xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: 'spring', damping: 10 }}
              >
                +{reward.amount}
              </motion.span>
            )}
          </div>
          {reward.description && (
            <p className="text-sm opacity-90">{reward.description}</p>
          )}
          <p className="text-xs opacity-75 mt-1">{labels[reward.type]}</p>
        </div>
      </div>
    </motion.div>
  );
}

// 装饰性粒子效果
function ParticleEffect() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
            y: [0, -50],
          }}
          transition={{
            duration: 2,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}
    </div>
  );
}

// Hook: 简化的奖励触发器
export function useRewardAnimation() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isShowing, setIsShowing] = useState(false);

  const showReward = (newRewards: Reward | Reward[]) => {
    const rewardArray = Array.isArray(newRewards) ? newRewards : [newRewards];
    setRewards(rewardArray);
    setIsShowing(true);
  };

  const hideReward = () => {
    setIsShowing(false);
    setTimeout(() => setRewards([]), 300);
  };

  return {
    rewards,
    isShowing,
    showReward,
    hideReward,
  };
}
