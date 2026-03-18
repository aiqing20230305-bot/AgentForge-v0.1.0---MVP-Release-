/**
 * 通知批量操作组件 - Notification Batch Operations
 *
 * 批量标记已读、删除、导出等操作
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import type { Notification } from '@/services/notifications/types';

interface NotificationBatchOperationsProps {
  selectedIds: string[];
  notifications: Notification[];
  onSelectionChange: (ids: string[]) => void;
  onOperationComplete?: () => void;
}

export function NotificationBatchOperations({
  selectedIds,
  notifications,
  onSelectionChange,
  onOperationComplete,
}: NotificationBatchOperationsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<'delete' | 'archive' | null>(null);
  const { markAsRead, markAsUnread, deleteNotification } = useNotificationStore();

  const hasSelection = selectedIds.length > 0;
  const allSelected = selectedIds.length === notifications.length;
  const unreadCount = selectedIds.filter(
    (id) => !notifications.find((n) => n.id === id)?.read
  ).length;

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(notifications.map((n) => n.id));
    }
  };

  // 标记已读
  const handleMarkAsRead = async () => {
    for (const id of selectedIds) {
      markAsRead(id);
    }
    onSelectionChange([]);
    onOperationComplete?.();
  };

  // 标记未读
  const handleMarkAsUnread = async () => {
    for (const id of selectedIds) {
      markAsUnread(id);
    }
    onSelectionChange([]);
    onOperationComplete?.();
  };

  // 删除
  const handleDelete = async () => {
    for (const id of selectedIds) {
      deleteNotification(id);
    }
    onSelectionChange([]);
    setShowConfirm(false);
    setPendingOperation(null);
    onOperationComplete?.();
  };

  // 归档
  const handleArchive = async () => {
    // 归档逻辑（可以添加归档功能）
    console.log('Archive notifications:', selectedIds);
    onSelectionChange([]);
    setShowConfirm(false);
    setPendingOperation(null);
    onOperationComplete?.();
  };

  // 导出
  const handleExport = () => {
    const selectedNotifications = notifications.filter((n) => selectedIds.includes(n.id));
    const exportData = {
      exported_at: new Date().toISOString(),
      total_count: selectedNotifications.length,
      notifications: selectedNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        priority: n.priority,
        title: n.title,
        message: n.message,
        read: n.read,
        created_at: n.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onSelectionChange([]);
    onOperationComplete?.();
  };

  const confirmOperation = (operation: 'delete' | 'archive') => {
    setPendingOperation(operation);
    setShowConfirm(true);
  };

  return (
    <>
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-blue-500 p-4 min-w-[600px]">
              <div className="flex items-center justify-between gap-4">
                {/* 选择信息 */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">
                      已选择 {selectedIds.length} 项
                      {unreadCount > 0 && ` (${unreadCount} 条未读)`}
                    </span>
                  </label>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <BatchOperationButton
                      icon="📬"
                      label="标记已读"
                      onClick={handleMarkAsRead}
                      color="blue"
                    />
                  )}
                  {unreadCount < selectedIds.length && (
                    <BatchOperationButton
                      icon="📭"
                      label="标记未读"
                      onClick={handleMarkAsUnread}
                      color="gray"
                    />
                  )}
                  <BatchOperationButton
                    icon="📥"
                    label="归档"
                    onClick={() => confirmOperation('archive')}
                    color="green"
                  />
                  <BatchOperationButton
                    icon="📤"
                    label="导出"
                    onClick={handleExport}
                    color="purple"
                  />
                  <BatchOperationButton
                    icon="🗑️"
                    label="删除"
                    onClick={() => confirmOperation('delete')}
                    color="red"
                  />
                  <button
                    onClick={() => onSelectionChange([])}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="取消选择"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 确认对话框 */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowConfirm(false);
              setPendingOperation(null);
            }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <span className="text-6xl block mb-4">
                  {pendingOperation === 'delete' ? '⚠️' : '📥'}
                </span>
                <h3 className="text-2xl font-bold mb-2">
                  {pendingOperation === 'delete' ? '确认删除' : '确认归档'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {pendingOperation === 'delete'
                    ? `您确定要删除 ${selectedIds.length} 条通知吗？此操作不可恢复。`
                    : `您确定要归档 ${selectedIds.length} 条通知吗？`}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setPendingOperation(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={pendingOperation === 'delete' ? handleDelete : handleArchive}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    pendingOperation === 'delete'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  确认{pendingOperation === 'delete' ? '删除' : '归档'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 批量操作按钮
function BatchOperationButton({
  icon,
  label,
  onClick,
  color,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  color: 'blue' | 'gray' | 'green' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40',
    gray: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600',
    green:
      'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40',
    purple:
      'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40',
  };

  return (
    <motion.button
      className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${colorClasses[color]}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </motion.button>
  );
}

// Hook: 管理批量选择状态
export function useNotificationSelection(notifications: Notification[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(notifications.map((n) => n.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedIds.length > 0,
    selectionCount: selectedIds.length,
  };
}
