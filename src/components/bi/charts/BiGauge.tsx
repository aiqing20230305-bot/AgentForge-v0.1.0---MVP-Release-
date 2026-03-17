/**
 * BI Gauge - 仪表盘图表
 */

import React from 'react';

interface BiGaugeProps {
  data: any;
  config?: any;
}

export const BiGauge: React.FC<BiGaugeProps> = ({ data, config = {} }) => {
  const min = data.min || 0;
  const max = data.max || 100;
  const value = Math.min(Math.max(data.value, min), max);
  const percentage = ((value - min) / (max - min)) * 100;

  // 计算颜色
  const getColor = () => {
    if (config.thresholds) {
      for (const threshold of config.thresholds) {
        if (value >= threshold.min && value <= threshold.max) {
          return threshold.color;
        }
      }
    }

    // 默认颜色逻辑
    if (percentage < 33) return '#ef4444'; // red
    if (percentage < 66) return '#f59e0b'; // orange
    return '#10b981'; // green
  };

  const color = getColor();

  // SVG参数
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const dashArray = circumference;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <svg width={size} height={size / 2 + 40} className="overflow-visible">
        {/* 背景弧 */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 进度弧 */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />

        {/* 数值文本 */}
        <text
          x={size / 2}
          y={size / 2 + 10}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill="#111827"
        >
          {value.toFixed(config.decimals || 0)}
        </text>

        {/* 单位 */}
        {config.unit && (
          <text
            x={size / 2}
            y={size / 2 + 35}
            textAnchor="middle"
            className="text-sm"
            fill="#6b7280"
          >
            {config.unit}
          </text>
        )}
      </svg>

      {/* 范围标签 */}
      <div className="flex justify-between w-full px-4 mt-2 text-sm text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
