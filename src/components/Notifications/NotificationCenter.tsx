/**
 * 通知中心组件 - Notification Center
 *
 * 通知中心主界面，显示通知列表
 */

import { useState, useEffect } from 'react';
import type { Notification } from '@/services/notifications/types';
import { NotificationList } from './NotificationList';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      // 加载通知列表
      // 实际应从API获取
      loadNotifications();
    }
  }, [isOpen, filter]);

  const loadNotifications = () => {
    // 示例数据
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: 'user-1',
        type: 'achievement',
        title: '🎉 成就解锁！',
        message: '你解锁了成就：初出茅庐（+10 点数）',
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
      },
      {
        id: '2',
        userId: 'user-1',
        type: 'task',
        title: '✅ 任务完成',
        message: '你完成了任务：创建第一个Agent',
        priority: 'normal',
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
        readAt: new Date(),
      },
      {
        id: '3',
        userId: 'user-1',
        type: 'system',
        title: 'ℹ️ 系统通知',
        message: '欢迎来到AgentForge！',
        priority: 'low',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
        readAt: new Date(),
      },
    ];

    setNotifications(mockNotifications);
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.readAt)
    : notifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* 通知面板 */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-96 max-h-[600px] flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">通知中心</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* 过滤器 */}
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-sm rounded ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setFilter('unread')}
            >
              未读
            </button>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="flex-1 overflow-y-auto">
          <NotificationList notifications={filteredNotifications} />
        </div>

        {/* 底部操作 */}
        <div className="p-3 border-t dark:border-gray-700">
          <button
            className="w-full text-sm text-blue-500 hover:text-blue-600"
            onClick={() => {
              // 标记所有为已读
              console.log('Mark all as read');
            }}
          >
            全部标记为已读
          </button>
        </div>
      </div>
    </div>
  );
}
