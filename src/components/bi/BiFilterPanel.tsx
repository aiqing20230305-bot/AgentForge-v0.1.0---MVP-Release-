/**
 * BI Filter Panel - 过滤器面板
 */

import React, { useState } from 'react';
import { X, Calendar, Filter as FilterIcon } from 'lucide-react';

interface BiFilterPanelProps {
  filters: any;
  onApply: (filters: any) => void;
  onClose: () => void;
}

export const BiFilterPanel: React.FC<BiFilterPanelProps> = ({
  filters: initialFilters,
  onApply,
  onClose
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const handleApply = () => {
    const appliedFilters = {
      ...filters,
      ...(dateRange.start && dateRange.end && {
        timeRange: { start: dateRange.start, end: dateRange.end }
      })
    };
    onApply(appliedFilters);
  };

  const handleReset = () => {
    setFilters({});
    setDateRange({ start: '', end: '' });
  };

  const addFilter = () => {
    const key = `filter_${Date.now()}`;
    setFilters({
      ...filters,
      [key]: { field: '', operator: 'equals', value: '' }
    });
  };

  const updateFilter = (key: string, updates: any) => {
    setFilters({
      ...filters,
      [key]: { ...filters[key], ...updates }
    });
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  return (
    <div className="w-80 bg-white border-r shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Custom Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Custom Filters
            </label>
            <button
              onClick={addFilter}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + Add
            </button>
          </div>

          {Object.entries(filters).map(([key, filter]: [string, any]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Filter</span>
                <button
                  onClick={() => removeFilter(key)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <select
                value={filter.field}
                onChange={(e) => updateFilter(key, { field: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="">Select Field</option>
                <option value="status">Status</option>
                <option value="category">Category</option>
                <option value="priority">Priority</option>
                <option value="assignee">Assignee</option>
              </select>

              <select
                value={filter.operator}
                onChange={(e) => updateFilter(key, { operator: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>

              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(key, { value: e.target.value })}
                placeholder="Value"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          ))}

          {Object.keys(filters).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No custom filters added
            </p>
          )}
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Quick Filters
          </label>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded">
              Today
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded">
              Last 7 days
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded">
              Last 30 days
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded">
              This month
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded">
              This quarter
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
