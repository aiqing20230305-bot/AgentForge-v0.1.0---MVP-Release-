/**
 * BI Dashboard - 主仪表盘组件
 * 支持拖拽布局、Widget管理、实时更新
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import biDataService, { Dashboard, Widget } from '../../services/bi/biDataService';
import { BiWidget } from './BiWidget';
import { BiToolbar } from './BiToolbar';
import { BiFilterPanel } from './BiFilterPanel';
import { BiWidgetGallery } from './BiWidgetGallery';

interface BiDashboardProps {
  dashboardId?: string;
  editable?: boolean;
  onSave?: (dashboard: Dashboard) => void;
}

export const BiDashboard: React.FC<BiDashboardProps> = ({
  dashboardId,
  editable = false,
  onSave
}) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  // 加载仪表盘
  useEffect(() => {
    if (dashboardId) {
      loadDashboard();
    } else {
      createNewDashboard();
    }
  }, [dashboardId]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !dashboard) return;

    const interval = setInterval(() => {
      refreshDashboard();
    }, (dashboard.refresh || 60) * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, dashboard]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await biDataService.getDashboard(dashboardId!);
      setDashboard(data || null);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewDashboard = async () => {
    try {
      setLoading(true);
      const newDashboard = await biDataService.createDashboard({
        name: 'New Dashboard',
        description: '',
        layout: 'grid',
        widgets: [],
        filters: {},
        refresh: 60
      });
      setDashboard(newDashboard);
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = useCallback(() => {
    if (dashboard) {
      loadDashboard();
    }
  }, [dashboard]);

  const handleAddWidget = (widgetType: string) => {
    if (!dashboard) return;

    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type: widgetType,
      title: `New ${widgetType} Widget`,
      dataSource: 'agents',
      query: {},
      config: {},
      position: { x: 0, y: 0 },
      size: { w: 4, h: 4 }
    };

    setDashboard({
      ...dashboard,
      widgets: [...dashboard.widgets, newWidget]
    });

    setShowGallery(false);
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<Widget>) => {
    if (!dashboard) return;

    setDashboard({
      ...dashboard,
      widgets: dashboard.widgets.map(w =>
        w.id === widgetId ? { ...w, ...updates } : w
      )
    });
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!dashboard) return;

    setDashboard({
      ...dashboard,
      widgets: dashboard.widgets.filter(w => w.id !== widgetId)
    });
  };

  const handleMoveWidget = (widgetId: string, position: { x: number; y: number }) => {
    handleUpdateWidget(widgetId, { position });
  };

  const handleResizeWidget = (widgetId: string, size: { w: number; h: number }) => {
    handleUpdateWidget(widgetId, { size });
  };

  const handleSave = async () => {
    if (!dashboard) return;

    try {
      await biDataService.updateDashboard(dashboard.id, dashboard);
      onSave?.(dashboard);
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Dashboard not found</p>
          <button
            onClick={createNewDashboard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Toolbar */}
        <BiToolbar
          dashboard={dashboard}
          editable={editable}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
          onRefresh={refreshDashboard}
          onAddWidget={() => setShowGallery(true)}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onSave={handleSave}
          onExport={() => {}}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Filter Panel */}
          {showFilters && (
            <BiFilterPanel
              filters={filters}
              onApply={handleApplyFilters}
              onClose={() => setShowFilters(false)}
            />
          )}

          {/* Dashboard Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">
              {dashboard.widgets.map(widget => (
                <div
                  key={widget.id}
                  className={`col-span-${widget.size.w} row-span-${widget.size.h}`}
                  style={{
                    gridColumn: `span ${widget.size.w}`,
                    gridRow: `span ${widget.size.h}`
                  }}
                >
                  <BiWidget
                    widget={widget}
                    filters={filters}
                    editable={editable}
                    selected={selectedWidget === widget.id}
                    onSelect={() => setSelectedWidget(widget.id)}
                    onUpdate={(updates) => handleUpdateWidget(widget.id, updates)}
                    onDelete={() => handleDeleteWidget(widget.id)}
                    onMove={(position) => handleMoveWidget(widget.id, position)}
                    onResize={(size) => handleResizeWidget(widget.id, size)}
                  />
                </div>
              ))}

              {dashboard.widgets.length === 0 && (
                <div className="col-span-12 flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">No widgets yet</p>
                    {editable && (
                      <button
                        onClick={() => setShowGallery(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add Your First Widget
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Widget Gallery */}
        {showGallery && (
          <BiWidgetGallery
            onSelect={handleAddWidget}
            onClose={() => setShowGallery(false)}
          />
        )}
      </div>
    </DndProvider>
  );
};
