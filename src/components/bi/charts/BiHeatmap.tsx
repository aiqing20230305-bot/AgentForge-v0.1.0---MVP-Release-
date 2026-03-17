/**
 * BI Heatmap - 热力图组件
 */

import React from 'react';

interface BiHeatmapProps {
  data: any[];
  config?: any;
}

export const BiHeatmap: React.FC<BiHeatmapProps> = ({ data, config = {} }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  // 提取唯一的x和y值
  const xValues = Array.from(new Set(data.map(d => d.x || d.day)));
  const yValues = Array.from(new Set(data.map(d => d.y || d.hour)));

  // 找出最大最小值用于颜色映射
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // 颜色映射函数
  const getColor = (value: number): string => {
    const normalized = (value - minValue) / (maxValue - minValue);
    const hue = (1 - normalized) * 240; // 从蓝色(240)到红色(0)
    return `hsl(${hue}, 70%, 50%)`;
  };

  // 构建热力图矩阵
  const matrix = yValues.map(y => {
    return xValues.map(x => {
      const cell = data.find(d => (d.x === x || d.day === x) && (d.y === y || d.hour === y));
      return cell ? cell.value : null;
    });
  });

  const cellSize = Math.min(
    (window.innerWidth * 0.8) / xValues.length,
    (window.innerHeight * 0.6) / yValues.length,
    50
  );

  return (
    <div className="h-full overflow-auto">
      <div className="inline-block p-4">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-2"></th>
              {xValues.map((x, i) => (
                <th key={i} className="p-2 text-sm font-medium text-gray-700">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-2 text-sm font-medium text-gray-700">
                  {yValues[i]}
                </td>
                {row.map((value, j) => (
                  <td key={j} className="p-0">
                    {value !== null ? (
                      <div
                        className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getColor(value)
                        }}
                        title={`${xValues[j]}, ${yValues[i]}: ${value}`}
                      >
                        {config.showValues && (
                          <span className="text-xs font-semibold text-white drop-shadow">
                            {value}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{ width: cellSize, height: cellSize }}
                        className="bg-gray-100"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 颜色图例 */}
        {config.showLegend !== false && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">Low</span>
            <div className="flex-1 h-4 rounded" style={{
              background: 'linear-gradient(to right, hsl(240, 70%, 50%), hsl(0, 70%, 50%))'
            }} />
            <span className="text-sm text-gray-600">High</span>
          </div>
        )}
      </div>
    </div>
  );
};
