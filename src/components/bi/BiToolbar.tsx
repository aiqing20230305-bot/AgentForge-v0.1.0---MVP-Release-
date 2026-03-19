/**
 * BI Toolbar - 仪表盘工具栏
 */

import React from 'react';
import {
  Plus, RefreshCw, Filter, Save, Download, Settings,
  Play, Pause, Share2, MoreVertical
} from 'lucide-react';
import { Dashboard } from '../../services/bi/biDataService';

interface BiToolbarProps {
  dashboard: Dashboard;
  editable?: boolean;
  autoRefresh?: boolean;
  onToggleAutoRefresh?: () => void;
  onRefresh?: () => void;
  onAddWidget?: () => void;
  onToggleFilters?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
}

export const BiToolbar: React.FC<BiToolbarProps> = ({
  dashboard,
  editable,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  onAddWidget,
  onToggleFilters,
  onSave,
  onExport,
  onShare,
  onSettings
}) => {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-sm text-gray-500">{dashboard.description}</p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Auto Refresh */}
          <button
            onClick={onToggleAutoRefresh}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
              ${autoRefresh
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={autoRefresh ? 'Disable Auto Refresh' : 'Enable Auto Refresh'}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">Auto</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Refresh</span>
          </button>

          {/* Filters */}
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Filters"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Filters</span>
          </button>

          {/* Add Widget (only in edit mode) */}
          {editable && (
            <button
              onClick={onAddWidget}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Add Widget"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Add Widget</span>
            </button>
          )}

          {/* Save (only in edit mode) */}
          {editable && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Save Dashboard"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Save</span>
            </button>
          )}

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Export Dashboard"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Export</span>
          </button>

          {/* Share */}
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Share Dashboard"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* More options */}
          <button
            onClick={onSettings}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metadata bar */}
      <div className="px-6 py-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center gap-4">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        <span>•</span>
        <span>{dashboard.widgets.length} widgets</span>
        {autoRefresh && (
          <>
            <span>•</span>
            <span>Auto-refresh: {dashboard.refresh}s</span>
          </>
        )}
      </div>
    </div>
  );
};
