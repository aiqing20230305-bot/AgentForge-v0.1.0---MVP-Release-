/**
 * BI KPI Card - KPI指标卡片
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BiKPICardProps {
  data: any;
  config?: any;
}

export const BiKPICard: React.FC<BiKPICardProps> = ({ data, config = {} }) => {
  const formatValue = (value: number): string => {
    if (config.format === 'currency') {
      return `$${value.toLocaleString()}`;
    } else if (config.format === 'percentage') {
      return `${value.toFixed(2)}%`;
    } else if (config.format === 'compact') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
    }
    return value.toLocaleString();
  };

  const getTrendIcon = () => {
    if (data.trend === 'up') {
      return <TrendingUp className="w-5 h-5" />;
    } else if (data.trend === 'down') {
      return <TrendingDown className="w-5 h-5" />;
    }
    return <Minus className="w-5 h-5" />;
  };

  const getTrendColor = () => {
    if (data.trend === 'up') {
      return 'text-green-500';
    } else if (data.trend === 'down') {
      return 'text-red-500';
    }
    return 'text-gray-500';
  };

  return (
    <div className="h-full flex flex-col justify-center p-6">
      <div className="space-y-4">
        {/* 主要数值 */}
        <div>
          <div className="text-4xl font-bold text-gray-900">
            {formatValue(data.value)}
          </div>
        </div>

        {/* 变化趋势 */}
        {config.showChange !== false && data.change != null && (
          <div className={`flex items-center gap-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-lg font-semibold">
              {Math.abs(data.changePercent).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">
              vs previous period
            </span>
          </div>
        )}

        {/* 对比值 */}
        {config.showPrevious !== false && data.previous != null && (
          <div className="text-sm text-gray-500">
            Previous: {formatValue(data.previous)}
          </div>
        )}

        {/* 进度条 */}
        {config.showProgress && data.target != null && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{((data.value / data.target) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((data.value / data.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
