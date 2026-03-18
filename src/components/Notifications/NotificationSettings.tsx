/**
 * 通知偏好设置组件 - Notification Settings
 *
 * 管理通知偏好和设置
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import type { NotificationType, NotificationPriority } from '@/services/notifications/types';

interface NotificationPreferences {
  email: {
    enabled: boolean;
    types: NotificationType[];
    priorities: NotificationPriority[];
    digestFrequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    types: NotificationType[];
    priorities: NotificationPriority[];
    sound: boolean;
    vibrate: boolean;
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
    priorities: NotificationPriority[];
    showToast: boolean;
    showBadge: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    allowUrgent: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  email: {
    enabled: true,
    types: ['system', 'agent', 'task', 'achievement', 'social', 'team'],
    priorities: ['urgent', 'high', 'medium'],
    digestFrequency: 'daily',
  },
  push: {
    enabled: true,
    types: ['agent', 'task', 'achievement', 'social'],
    priorities: ['urgent', 'high'],
    sound: true,
    vibrate: true,
  },
  inApp: {
    enabled: true,
    types: ['system', 'agent', 'task', 'achievement', 'social', 'team'],
    priorities: ['urgent', 'high', 'medium', 'low'],
    showToast: true,
    showBadge: true,
  },
  doNotDisturb: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    allowUrgent: true,
  },
};

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [activeTab, setActiveTab] = useState<'channels' | 'types' | 'dnd'>('channels');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // 保存到localStorage或后端
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    setHasChanges(false);
    // 可选：显示成功提示
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    setHasChanges(false);
  };

  const updatePreference = (path: string[], value: any) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev };
      let current: any = newPrefs;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newPrefs;
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🔔 通知设置</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            管理您的通知偏好和渠道设置
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <motion.button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                重置
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                保存设置
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* 标签切换 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex">
        {(['channels', 'types', 'dnd'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab === 'channels' ? '通知渠道' : tab === 'types' ? '通知类型' : '勿扰模式'}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        {activeTab === 'channels' && (
          <ChannelSettings preferences={preferences} updatePreference={updatePreference} />
        )}
        {activeTab === 'types' && (
          <TypeSettings preferences={preferences} updatePreference={updatePreference} />
        )}
        {activeTab === 'dnd' && (
          <DoNotDisturbSettings preferences={preferences} updatePreference={updatePreference} />
        )}
      </div>

      {/* 快速操作 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="font-bold mb-4">⚡ 快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon="🔕"
            title="全部静音"
            description="暂时禁用所有通知"
            onClick={() => {
              updatePreference(['email', 'enabled'], false);
              updatePreference(['push', 'enabled'], false);
            }}
          />
          <QuickAction
            icon="🔔"
            title="重要通知"
            description="仅接收高优先级通知"
            onClick={() => {
              updatePreference(['email', 'priorities'], ['urgent', 'high']);
              updatePreference(['push', 'priorities'], ['urgent', 'high']);
            }}
          />
          <QuickAction
            icon="📧"
            title="仅邮件"
            description="禁用推送，仅保留邮件"
            onClick={() => {
              updatePreference(['push', 'enabled'], false);
              updatePreference(['email', 'enabled'], true);
            }}
          />
        </div>
      </div>
    </div>
  );
}

// 渠道设置
function ChannelSettings({
  preferences,
  updatePreference,
}: {
  preferences: NotificationPreferences;
  updatePreference: (path: string[], value: any) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Email通知 */}
      <ChannelCard
        icon="📧"
        title="邮件通知"
        description="通过邮件接收通知"
        enabled={preferences.email.enabled}
        onToggle={(enabled) => updatePreference(['email', 'enabled'], enabled)}
      >
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">发送频率</label>
            <select
              value={preferences.email.digestFrequency}
              onChange={(e) => updatePreference(['email', 'digestFrequency'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              disabled={!preferences.email.enabled}
            >
              <option value="instant">即时发送</option>
              <option value="hourly">每小时汇总</option>
              <option value="daily">每日汇总</option>
              <option value="weekly">每周汇总</option>
            </select>
          </div>
          <PrioritySelector
            selected={preferences.email.priorities}
            onChange={(priorities) => updatePreference(['email', 'priorities'], priorities)}
            disabled={!preferences.email.enabled}
          />
        </div>
      </ChannelCard>

      {/* Push通知 */}
      <ChannelCard
        icon="📱"
        title="推送通知"
        description="通过手机推送接收通知"
        enabled={preferences.push.enabled}
        onToggle={(enabled) => updatePreference(['push', 'enabled'], enabled)}
      >
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.push.sound}
                onChange={(e) => updatePreference(['push', 'sound'], e.target.checked)}
                disabled={!preferences.push.enabled}
                className="w-5 h-5"
              />
              <span className="text-sm">🔊 声音提示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.push.vibrate}
                onChange={(e) => updatePreference(['push', 'vibrate'], e.target.checked)}
                disabled={!preferences.push.enabled}
                className="w-5 h-5"
              />
              <span className="text-sm">📳 振动</span>
            </label>
          </div>
          <PrioritySelector
            selected={preferences.push.priorities}
            onChange={(priorities) => updatePreference(['push', 'priorities'], priorities)}
            disabled={!preferences.push.enabled}
          />
        </div>
      </ChannelCard>

      {/* In-App通知 */}
      <ChannelCard
        icon="💻"
        title="应用内通知"
        description="在应用内显示通知"
        enabled={preferences.inApp.enabled}
        onToggle={(enabled) => updatePreference(['inApp', 'enabled'], enabled)}
      >
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.inApp.showToast}
                onChange={(e) => updatePreference(['inApp', 'showToast'], e.target.checked)}
                disabled={!preferences.inApp.enabled}
                className="w-5 h-5"
              />
              <span className="text-sm">🍞 Toast提示</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.inApp.showBadge}
                onChange={(e) => updatePreference(['inApp', 'showBadge'], e.target.checked)}
                disabled={!preferences.inApp.enabled}
                className="w-5 h-5"
              />
              <span className="text-sm">🔴 角标提示</span>
            </label>
          </div>
        </div>
      </ChannelCard>
    </div>
  );
}

// 类型设置
function TypeSettings({
  preferences,
  updatePreference,
}: {
  preferences: NotificationPreferences;
  updatePreference: (path: string[], value: any) => void;
}) {
  const notificationTypes: { type: NotificationType; icon: string; label: string; description: string }[] = [
    { type: 'system', icon: '⚙️', label: '系统通知', description: '系统更新、维护等' },
    { type: 'agent', icon: '🤖', label: 'Agent通知', description: 'Agent状态变更、事件等' },
    { type: 'task', icon: '✅', label: '任务通知', description: '任务完成、失败等' },
    { type: 'achievement', icon: '🏆', label: '成就通知', description: '成就解锁、里程碑等' },
    { type: 'social', icon: '👥', label: '社交通知', description: '评论、点赞、关注等' },
    { type: 'team', icon: '🏢', label: '团队通知', description: '团队邀请、协作等' },
  ];

  const toggleType = (channel: 'email' | 'push' | 'inApp', type: NotificationType) => {
    const currentTypes = preferences[channel].types;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    updatePreference([channel, 'types'], newTypes);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        选择您希望在每个渠道接收的通知类型
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-3 px-4">通知类型</th>
              <th className="text-center py-3 px-4">📧 邮件</th>
              <th className="text-center py-3 px-4">📱 推送</th>
              <th className="text-center py-3 px-4">💻 应用内</th>
            </tr>
          </thead>
          <tbody>
            {notificationTypes.map((notifType) => (
              <tr key={notifType.type} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{notifType.icon}</span>
                    <div>
                      <p className="font-medium">{notifType.label}</p>
                      <p className="text-xs text-gray-500">{notifType.description}</p>
                    </div>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <input
                    type="checkbox"
                    checked={preferences.email.types.includes(notifType.type)}
                    onChange={() => toggleType('email', notifType.type)}
                    disabled={!preferences.email.enabled}
                    className="w-5 h-5"
                  />
                </td>
                <td className="text-center py-3 px-4">
                  <input
                    type="checkbox"
                    checked={preferences.push.types.includes(notifType.type)}
                    onChange={() => toggleType('push', notifType.type)}
                    disabled={!preferences.push.enabled}
                    className="w-5 h-5"
                  />
                </td>
                <td className="text-center py-3 px-4">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.types.includes(notifType.type)}
                    onChange={() => toggleType('inApp', notifType.type)}
                    disabled={!preferences.inApp.enabled}
                    className="w-5 h-5"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 勿扰模式设置
function DoNotDisturbSettings({
  preferences,
  updatePreference,
}: {
  preferences: NotificationPreferences;
  updatePreference: (path: string[], value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">🌙 勿扰模式</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            在指定时间段内暂停通知
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.doNotDisturb.enabled}
            onChange={(e) => updatePreference(['doNotDisturb', 'enabled'], e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {preferences.doNotDisturb.enabled && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">开始时间</label>
              <input
                type="time"
                value={preferences.doNotDisturb.startTime}
                onChange={(e) => updatePreference(['doNotDisturb', 'startTime'], e.target.value)}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">结束时间</label>
              <input
                type="time"
                value={preferences.doNotDisturb.endTime}
                onChange={(e) => updatePreference(['doNotDisturb', 'endTime'], e.target.value)}
                className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.doNotDisturb.allowUrgent}
              onChange={(e) => updatePreference(['doNotDisturb', 'allowUrgent'], e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm">允许紧急通知穿透</span>
          </label>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              💡 勿扰模式期间，除非您允许紧急通知穿透，否则所有通知都将被静音。
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 渠道卡片
function ChannelCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`border rounded-lg p-4 ${enabled ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h4 className="font-bold">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {children}
    </div>
  );
}

// 优先级选择器
function PrioritySelector({
  selected,
  onChange,
  disabled,
}: {
  selected: NotificationPriority[];
  onChange: (priorities: NotificationPriority[]) => void;
  disabled?: boolean;
}) {
  const priorities: { value: NotificationPriority; label: string; color: string }[] = [
    { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-700' },
    { value: 'high', label: '高', color: 'bg-orange-100 text-orange-700' },
    { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'low', label: '低', color: 'bg-gray-100 text-gray-700' },
  ];

  const togglePriority = (priority: NotificationPriority) => {
    if (disabled) return;
    const newSelected = selected.includes(priority)
      ? selected.filter((p) => p !== priority)
      : [...selected, priority];
    onChange(newSelected);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">优先级</label>
      <div className="flex flex-wrap gap-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            onClick={() => togglePriority(priority.value)}
            disabled={disabled}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              selected.includes(priority.value)
                ? priority.color
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {priority.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 快速操作卡片
function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      className="text-left p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-3xl block mb-2">{icon}</span>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.button>
  );
}
