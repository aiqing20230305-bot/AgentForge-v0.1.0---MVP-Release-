/**
 * BI Widget Gallery - Widget选择画廊
 */

import React, { useState } from 'react';
import {
  LineChart, BarChart3, PieChart, AreaChart,
  ScatterChart, Activity, Gauge, TrendingUp,
  Grid, Radar, Zap, X
} from 'lucide-react';

interface BiWidgetGalleryProps {
  onSelect: (widgetType: string) => void;
  onClose: () => void;
}

const WIDGET_TYPES = [
  // Basic Charts
  {
    id: 'line',
    name: 'Line Chart',
    icon: LineChart,
    category: 'basic',
    description: 'Show trends over time'
  },
  {
    id: 'bar',
    name: 'Bar Chart',
    icon: BarChart3,
    category: 'basic',
    description: 'Compare categories'
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    icon: PieChart,
    category: 'basic',
    description: 'Show proportions'
  },
  {
    id: 'area',
    name: 'Area Chart',
    icon: AreaChart,
    category: 'basic',
    description: 'Visualize cumulative values'
  },

  // Advanced Charts
  {
    id: 'scatter',
    name: 'Scatter Plot',
    icon: ScatterChart,
    category: 'advanced',
    description: 'Show correlations'
  },
  {
    id: 'heatmap',
    name: 'Heatmap',
    icon: Grid,
    category: 'advanced',
    description: 'Visualize matrix data'
  },
  {
    id: 'radar',
    name: 'Radar Chart',
    icon: Radar,
    category: 'advanced',
    description: 'Compare multiple metrics'
  },

  // Special Widgets
  {
    id: 'kpi',
    name: 'KPI Card',
    icon: TrendingUp,
    category: 'special',
    description: 'Display key metrics'
  },
  {
    id: 'gauge',
    name: 'Gauge',
    icon: Gauge,
    category: 'special',
    description: 'Show progress or status'
  },
  {
    id: 'sparkline',
    name: 'Sparkline',
    icon: Activity,
    category: 'special',
    description: 'Mini trend chart'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'basic', name: 'Basic Charts' },
  { id: 'advanced', name: 'Advanced Charts' },
  { id: 'special', name: 'Special Widgets' }
];

export const BiWidgetGallery: React.FC<BiWidgetGalleryProps> = ({
  onSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWidgets = WIDGET_TYPES.filter(widget => {
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Add Widget</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search widgets..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWidgets.map(widget => {
              const Icon = widget.icon;
              return (
                <button
                  key={widget.id}
                  onClick={() => onSelect(widget.id)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {widget.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredWidgets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No widgets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
