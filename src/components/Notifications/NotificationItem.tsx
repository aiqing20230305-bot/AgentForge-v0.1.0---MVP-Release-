/**
 * 单个通知组件 - Notification Item
 */

import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Notification } from '@/services/notifications/types';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const isUnread = !notification.readAt;

  const typeColors = {
    info: 'bg-blue-100 dark:bg-blue-900',
    success: 'bg-green-100 dark:bg-green-900',
    warning: 'bg-yellow-100 dark:bg-yellow-900',
    error: 'bg-red-100 dark:bg-red-900',
    achievement: 'bg-purple-100 dark:bg-purple-900',
    task: 'bg-blue-100 dark:bg-blue-900',
    team: 'bg-indigo-100 dark:bg-indigo-900',
    system: 'bg-gray-100 dark:bg-gray-700',
    social: 'bg-pink-100 dark:bg-pink-900',
  };

  const timeAgo = formatDistanceToNow(notification.createdAt, {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        isUnread ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-10' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* 图标 */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeColors[notification.type]} flex items-center justify-center text-xl`}>
          {notification.icon || '📬'}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-medium ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {notification.title}
            </h3>
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {notification.message}
          </p>

          <div className="mt-2 flex items-center gap-4">
            <span className="text-xs text-gray-400">{timeAgo}</span>

            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2">
                {notification.actions.map((action) => (
                  <button
                    key={action.id}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Action clicked:', action);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
