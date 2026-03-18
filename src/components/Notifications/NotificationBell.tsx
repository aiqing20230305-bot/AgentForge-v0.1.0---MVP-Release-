/**
 * 通知铃铛组件 - Notification Bell
 *
 * 显示未读通知数量的铃铛图标
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className = '' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 实际应从Zustand store或API获取未读数
    // 这里是示例数据
    setUnreadCount(3);
  }, []);

  return (
    <button
      className={`relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${className}`}
      onClick={onClick}
      aria-label="Notifications"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
