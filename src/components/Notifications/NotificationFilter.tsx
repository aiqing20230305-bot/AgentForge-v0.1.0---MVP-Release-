/**
 * 通知过滤器组件 - Notification Filter
 *
 * 按类型、优先级、来源等过滤通知
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { NotificationType, NotificationPriority } from '@/services/notifications/types';

export interface NotificationFilterOptions {
  types: NotificationType[];
  priorities: NotificationPriority[];
  sources: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  readStatus: 'all' | 'read' | 'unread';
  searchQuery: string;
}

interface NotificationFilterProps {
  filters: NotificationFilterOptions;
  onChange: (filters: NotificationFilterOptions) => void;
  onReset: () => void;
  compact?: boolean;
}

export function NotificationFilter({
  filters,
  onChange,
  onReset,
  compact = false,
}: NotificationFilterProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const notificationTypes: { value: NotificationType; label: string; icon: string }[] = [
    { value: 'system', label: '系统', icon: '⚙️' },
    { value: 'agent', label: 'Agent', icon: '🤖' },
    { value: 'task', label: '任务', icon: '✅' },
    { value: 'achievement', label: '成就', icon: '🏆' },
    { value: 'social', label: '社交', icon: '👥' },
    { value: 'team', label: '团队', icon: '🏢' },
  ];

  const priorities: { value: NotificationPriority; label: string; color: string }[] = [
    { value: 'urgent', label: '紧急', color: 'bg-red-500' },
    { value: 'high', label: '高', color: 'bg-orange-500' },
    { value: 'medium', label: '中', color: 'bg-yellow-500' },
    { value: 'low', label: '低', color: 'bg-gray-500' },
  ];

  const toggleType = (type: NotificationType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types: newTypes });
  };

  const togglePriority = (priority: NotificationPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onChange({ ...filters, priorities: newPriorities });
  };

  const activeFilterCount = [
    filters.types.length < notificationTypes.length ? 1 : 0,
    filters.priorities.length < priorities.length ? 1 : 0,
    filters.sources.length > 0 ? 1 : 0,
    filters.dateRange.start || filters.dateRange.end ? 1 : 0,
    filters.readStatus !== 'all' ? 1 : 0,
    filters.searchQuery ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      {/* 过滤器头部 */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <div>
            <h3 className="font-bold">过滤器</h3>
            {activeFilterCount > 0 && (
              <p className="text-xs text-blue-500">{activeFilterCount} 个活跃过滤条件</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <motion.button
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={onReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              重置
            </motion.button>
          )}
          {compact && (
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <motion.span
                className="text-xl inline-block"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ⌄
              </motion.span>
            </button>
          )}
        </div>
      </div>

      {/* 过滤器内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="p-4 space-y-6"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* 搜索框 */}
            <div>
              <label className="block text-sm font-medium mb-2">🔍 搜索</label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
                placeholder="搜索通知内容..."
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 读取状态 */}
            <div>
              <label className="block text-sm font-medium mb-2">📬 读取状态</label>
              <div className="flex gap-2">
                {(['all', 'unread', 'read'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => onChange({ ...filters, readStatus: status })}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filters.readStatus === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status === 'all' ? '全部' : status === 'unread' ? '未读' : '已读'}
                  </button>
                ))}
              </div>
            </div>

            {/* 通知类型 */}
            <div>
              <label className="block text-sm font-medium mb-2">📋 通知类型</label>
              <div className="flex flex-wrap gap-2">
                {notificationTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    onClick={() => toggleType(type.value)}
                    className={`px-3 py-2 rounded-lg transition-all border ${
                      filters.types.includes(type.value)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium mb-2">⚡ 优先级</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority) => (
                  <motion.button
                    key={priority.value}
                    onClick={() => togglePriority(priority.value)}
                    className={`px-4 py-2 rounded-lg transition-all border ${
                      filters.priorities.includes(priority.value)
                        ? `${priority.color} text-white border-transparent`
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {priority.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 日期范围 */}
            <div>
              <label className="block text-sm font-medium mb-2">📅 日期范围</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          start: e.target.value ? new Date(e.target.value) : null,
                        },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">开始日期</p>
                </div>
                <div>
                  <input
                    type="date"
                    value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          end: e.target.value ? new Date(e.target.value) : null,
                        },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">结束日期</p>
                </div>
              </div>
            </div>

            {/* 快速过滤预设 */}
            <div>
              <label className="block text-sm font-medium mb-2">⚡ 快速过滤</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <QuickFilterButton
                  label="今天"
                  onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    onChange({
                      ...filters,
                      dateRange: { start: today, end: new Date() },
                    });
                  }}
                />
                <QuickFilterButton
                  label="本周"
                  onClick={() => {
                    const today = new Date();
                    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                    weekStart.setHours(0, 0, 0, 0);
                    onChange({
                      ...filters,
                      dateRange: { start: weekStart, end: new Date() },
                    });
                  }}
                />
                <QuickFilterButton
                  label="本月"
                  onClick={() => {
                    const today = new Date();
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    onChange({
                      ...filters,
                      dateRange: { start: monthStart, end: new Date() },
                    });
                  }}
                />
                <QuickFilterButton
                  label="清除日期"
                  onClick={() => {
                    onChange({
                      ...filters,
                      dateRange: { start: null, end: null },
                    });
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 快速过滤按钮
function QuickFilterButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </motion.button>
  );
}

// 默认过滤器
export const defaultFilters: NotificationFilterOptions = {
  types: ['system', 'agent', 'task', 'achievement', 'social', 'team'],
  priorities: ['urgent', 'high', 'medium', 'low'],
  sources: [],
  dateRange: { start: null, end: null },
  readStatus: 'all',
  searchQuery: '',
};
