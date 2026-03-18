/**
 * 通知列表组件 - Notification List
 */

import type { Notification } from '@/services/notifications/types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <p className="text-lg">📭</p>
        <p className="mt-2 text-sm">暂无通知</p>
      </div>
    );
  }

  return (
    <div className="divide-y dark:divide-gray-700">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
