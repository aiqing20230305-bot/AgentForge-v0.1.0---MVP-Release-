/**
 * Token Status Indicator Component
 * v2.5.0 Phase 1.3 - Token Auto-Refresh
 *
 * Token状态指示器组件
 */

import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaClock } from 'react-icons/fa';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

export interface TokenStatusIndicatorProps {
  /**
   * 是否显示详细信息
   * @default false
   */
  showDetails?: boolean;

  /**
   * 组件位置
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * 是否自动隐藏（正常状态下）
   * @default true
   */
  autoHide?: boolean;
}

/**
 * Token状态指示器组件
 */
export const TokenStatusIndicator: React.FC<TokenStatusIndicatorProps> = ({
  showDetails = false,
  position = 'top-right',
  autoHide = true,
}) => {
  const { isAuthenticated, isRefreshing, timeToExpiry } = useTokenRefresh({
    checkInterval: 30000, // 30秒检查一次
    expiryThreshold: 5, // 5分钟阈值
  });

  // 如果自动隐藏且状态正常，不显示
  if (autoHide && isAuthenticated && !isRefreshing && timeToExpiry > 300) {
    return null;
  }

  // 计算状态
  const getStatus = () => {
    if (!isAuthenticated) {
      return {
        icon: <FaExclamationTriangle className="text-red-500" />,
        text: '未登录',
        color: 'bg-red-50 border-red-200',
      };
    }

    if (isRefreshing) {
      return {
        icon: <FaSpinner className="text-blue-500 animate-spin" />,
        text: '刷新中...',
        color: 'bg-blue-50 border-blue-200',
      };
    }

    if (timeToExpiry < 300) {
      // 少于5分钟
      return {
        icon: <FaExclamationTriangle className="text-orange-500" />,
        text: '即将过期',
        color: 'bg-orange-50 border-orange-200',
      };
    }

    return {
      icon: <FaCheckCircle className="text-green-500" />,
      text: '已登录',
      color: 'bg-green-50 border-green-200',
    };
  };

  const status = getStatus();

  // 格式化剩余时间
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}小时${remainingMinutes}分钟`;
  };

  // 位置样式
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 animate-fade-in`}
    >
      <div
        className={`${status.color} border rounded-lg shadow-lg px-4 py-2 flex items-center gap-3`}
      >
        {/* 状态图标 */}
        <div className="text-xl">{status.icon}</div>

        {/* 状态文本 */}
        <div>
          <div className="font-medium text-sm">{status.text}</div>

          {/* 详细信息 */}
          {showDetails && isAuthenticated && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <FaClock />
              <span>剩余：{formatTime(timeToExpiry)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenStatusIndicator;
