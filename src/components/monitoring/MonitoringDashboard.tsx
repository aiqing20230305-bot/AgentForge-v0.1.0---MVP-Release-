/**
 * 监控仪表盘主组件
 * 展示系统、应用和业务指标的实时监控仪表盘
 */

import React, { useState, useEffect } from 'react';
import {
  monitoringManager,
  metricsCollector,
  healthCheckService,
  HealthStatus
} from '../../services/monitoring';
import { MetricsChart } from './MetricsChart';
import { HealthWidget } from './HealthWidget';
import { AlertsPanel } from './AlertsPanel';
import { MetricsGrid } from './MetricsGrid';
import { LogViewer } from './LogViewer';
import { TracingView } from './TracingView';

interface MonitoringDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'logs' | 'traces'>('overview');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | undefined>();
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // 初始化监控系统
    const initMonitoring = async () => {
      await monitoringManager.initialize();
      monitoringManager.start();
      setIsMonitoring(true);
    };

    initMonitoring();

    // 订阅健康状态更新
    const unsubscribe = healthCheckService.subscribe(status => {
      setHealthStatus(status);
    });

    return () => {
      unsubscribe();
      monitoringManager.stop();
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // 触发更新
      healthCheckService.performHealthCheck();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      monitoringManager.stop();
      setIsMonitoring(false);
    } else {
      monitoringManager.start();
      setIsMonitoring(true);
    }
  };

  const handleExportData = () => {
    const data = monitoringManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCleanup = () => {
    if (confirm('Are you sure you want to clean up old data?')) {
      monitoringManager.cleanup();
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all monitoring data?')) {
      monitoringManager.reset();
    }
  };

  return (
    <div className="monitoring-dashboard">
      {/* 头部 */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>System Monitoring</h1>
          <div className="status-indicator">
            <span className={`status-dot ${isMonitoring ? 'active' : 'inactive'}`} />
            <span>{isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}</span>
          </div>
        </div>

        <div className="header-right">
          <button
            onClick={handleToggleMonitoring}
            className={`btn ${isMonitoring ? 'btn-danger' : 'btn-success'}`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          <button onClick={handleExportData} className="btn btn-secondary">
            Export Data
          </button>
          <button onClick={handleCleanup} className="btn btn-secondary">
            Cleanup
          </button>
          <button onClick={handleReset} className="btn btn-danger">
            Reset
          </button>
        </div>
      </div>

      {/* 健康状态卡片 */}
      {healthStatus && (
        <div className="health-status-card">
          <HealthWidget status={healthStatus} />
        </div>
      )}

      {/* 标签页 */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </button>
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </button>
        <button
          className={`tab ${activeTab === 'traces' ? 'active' : ''}`}
          onClick={() => setActiveTab('traces')}
        >
          Traces
        </button>
      </div>

      {/* 内容区域 */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="metrics-grid-container">
              <MetricsGrid />
            </div>
            <div className="charts-container">
              <MetricsChart
                metricName="system.cpu.usage"
                title="CPU Usage"
                color="#3b82f6"
              />
              <MetricsChart
                metricName="system.memory.usage"
                title="Memory Usage"
                color="#10b981"
              />
              <MetricsChart
                metricName="app.response.time"
                title="Response Time"
                color="#f59e0b"
              />
              <MetricsChart
                metricName="app.errors.rate"
                title="Error Rate"
                color="#ef4444"
              />
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="metrics-tab">
            <MetricsGrid />
            <div className="all-charts">
              {metricsCollector.getAllMetrics().map(metric => (
                <MetricsChart
                  key={metric.id}
                  metricName={metric.name}
                  title={metric.name}
                  color="#6366f1"
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="alerts-tab">
            <AlertsPanel />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-tab">
            <LogViewer />
          </div>
        )}

        {activeTab === 'traces' && (
          <div className="traces-tab">
            <TracingView />
          </div>
        )}
      </div>

      <style>{`
        .monitoring-dashboard {
          padding: 20px;
          background: #0f172a;
          min-height: 100vh;
          color: #e2e8f0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px;
          background: #1e293b;
          border-radius: 8px;
        }

        .header-left h1 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #94a3b8;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .status-dot.inactive {
          background: #ef4444;
        }

        .header-right {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-secondary {
          background: #475569;
          color: white;
        }

        .btn-secondary:hover {
          background: #334155;
        }

        .health-status-card {
          margin-bottom: 24px;
        }

        .dashboard-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid #334155;
        }

        .tab {
          padding: 12px 24px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #e2e8f0;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .dashboard-content {
          background: #1e293b;
          border-radius: 8px;
          padding: 20px;
        }

        .overview-tab {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .metrics-tab {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .all-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .alerts-tab,
        .logs-tab,
        .traces-tab {
          min-height: 600px;
        }
      `}</style>
    </div>
  );
};

export default MonitoringDashboard;
