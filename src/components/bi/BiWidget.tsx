/**
 * BI Widget - 单个图表Widget组件
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import biDataService, { Widget } from '../../services/bi/biDataService';
import { BiChart } from './charts/BiChart';
import { Settings, X, Maximize2, RefreshCw } from 'lucide-react';

interface BiWidgetProps {
  widget: Widget;
  filters?: any;
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<Widget>) => void;
  onDelete?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { w: number; h: number }) => void;
}

export const BiWidget: React.FC<BiWidgetProps> = ({
  widget,
  filters,
  editable,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
  onResize
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // 拖拽功能
  const [{ isDragging }, drag] = useDrag({
    type: 'widget',
    item: { id: widget.id },
    canDrag: editable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'widget',
    canDrop: () => editable || false,
    hover: (item: any) => {
      if (item.id !== widget.id && onMove) {
        // 实现拖拽交换位置
      }
    }
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, [widget, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 合并全局过滤器和Widget查询
      const mergedQuery = {
        ...widget.query,
        filters: { ...widget.query?.filters, ...filters }
      };

      const widgetWithQuery = { ...widget, query: mergedQuery };
      const result = await biDataService.getWidgetData(widgetWithQuery);

      setData(result);
    } catch (err: any) {
      console.error('Failed to load widget data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleTitleChange = (title: string) => {
    onUpdate?.({ title });
  };

  // 合并拖拽refs
  const dragDropRef = (el: HTMLDivElement | null) => {
    drag(el);
    drop(el);
    if (widgetRef.current !== el) {
      widgetRef.current = el;
    }
  };

  return (
    <div
      ref={dragDropRef}
      onClick={onSelect}
      className={`
        bg-white rounded-lg shadow-md h-full flex flex-col
        transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${editable ? 'cursor-move' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          {editable ? (
            <input
              type="text"
              value={widget.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-semibold border-none outline-none w-full"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 className="text-lg font-semibold">{widget.title}</h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {editable && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1 hover:bg-red-100 text-red-600 rounded"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              // 实现全屏功能
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-500">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <BiChart
            type={widget.type}
            data={data}
            config={widget.config}
          />
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && editable && (
        <div className="border-t p-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source
              </label>
              <select
                value={widget.dataSource}
                onChange={(e) => onUpdate?.({ dataSource: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="agents">Agents</option>
                <option value="tasks">Tasks</option>
                <option value="performance">Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chart Type
              </label>
              <select
                value={widget.type}
                onChange={(e) => onUpdate?.({ type: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="area">Area Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="heatmap">Heatmap</option>
                <option value="gauge">Gauge</option>
                <option value="kpi">KPI Card</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  handleRefresh();
                }}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
