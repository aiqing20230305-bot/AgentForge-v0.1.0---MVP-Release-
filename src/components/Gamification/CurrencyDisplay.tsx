/**
 * 货币显示组件 - Currency Display
 *
 * 显示用户的虚拟货币余额（coins、gems、tokens）
 */

import { motion } from 'framer-motion';
import { useGamificationStore } from '@/store/useGamificationStore';

interface CurrencyDisplayProps {
  className?: string;
  showAll?: boolean;
}

export function CurrencyDisplay({ className = '', showAll = true }: CurrencyDisplayProps) {
  const currency = useGamificationStore((state) => state.currency);

  const currencies = [
    { type: 'coins', icon: '🪙', color: 'text-yellow-500', value: currency.coins },
    { type: 'gems', icon: '💎', color: 'text-blue-500', value: currency.gems },
    { type: 'tokens', icon: '🎫', color: 'text-purple-500', value: currency.tokens },
  ];

  const displayCurrencies = showAll ? currencies : currencies.slice(0, 2);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {displayCurrencies.map((currency) => (
        <motion.div
          key={currency.type}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl">{currency.icon}</span>
          <span className={`font-semibold ${currency.color}`}>
            {currency.value.toLocaleString()}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
