/**
 * 指标网格组件
 * 展示关键指标的快速概览
 */

import React, { useState, useEffect } from 'react';
import { metricsCollector, SystemMetrics, ApplicationMetrics } from '../../services/monitoring';

export const MetricsGrid: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [appMetrics, setAppMetrics] = useState<ApplicationMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = async () => {
      const [system, app] = await Promise.all([
        metricsCollector.collectSystemMetrics(),
        metricsCollector.collectApplicationMetrics()
      ]);

      setSystemMetrics(system);
      setAppMetrics(app);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusColor = (value: number, thresholds: { warn: number; error: number }) => {
    if (value >= thresholds.error) return '#ef4444';
    if (value >= thresholds.warn) return '#f59e0b';
    return '#10b981';
  };

  if (!systemMetrics || !appMetrics) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="metrics-grid">
      {/* System Metrics */}
      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#3b82f6' }}>
          <span>CPU</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">CPU Usage</div>
          <div
            className="metric-value"
            style={{ color: getStatusColor(systemMetrics.cpu.usage, { warn: 70, error: 90 }) }}
          >
            {systemMetrics.cpu.usage.toFixed(1)}%
          </div>
          <div className="metric-meta">{systemMetrics.cpu.cores} cores</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#10b981' }}>
          <span>MEM</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">Memory Usage</div>
          <div
            className="metric-value"
            style={{ color: getStatusColor(systemMetrics.memory.usage, { warn: 75, error: 90 }) }}
          >
            {systemMetrics.memory.usage.toFixed(1)}%
          </div>
          <div className="metric-meta">
            {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#8b5cf6' }}>
          <span>DISK</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">Disk Usage</div>
          <div
            className="metric-value"
            style={{ color: getStatusColor(systemMetrics.disk.usage, { warn: 80, error: 95 }) }}
          >
            {systemMetrics.disk.usage.toFixed(1)}%
          </div>
          <div className="metric-meta">
            {formatBytes(systemMetrics.disk.used)} / {formatBytes(systemMetrics.disk.total)}
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#06b6d4' }}>
          <span>NET</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">Network</div>
          <div className="metric-value" style={{ color: '#e2e8f0' }}>
            {((systemMetrics.network.bytesIn + systemMetrics.network.bytesOut) / 1024).toFixed(0)} KB/s
          </div>
          <div className="metric-meta">
            ↓ {formatBytes(systemMetrics.network.bytesIn)} ↑ {formatBytes(systemMetrics.network.bytesOut)}
          </div>
        </div>
      </div>

      {/* Application Metrics */}
      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#f59e0b' }}>
          <span>REQ</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">Requests</div>
          <div className="metric-value" style={{ color: '#e2e8f0' }}>
            {appMetrics.requests.rate.toFixed(1)} req/s
          </div>
          <div className="metric-meta">
            Total: {appMetrics.requests.total} | Success: {appMetrics.requests.success}
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#ec4899' }}>
          <span>TIME</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">Response Time</div>
          <div
            className="metric-value"
            style={{ color: getStatusColor(appMetrics.response.avgTime, { warn: 1000, error: 2000 }) }}
          >
            {appMetrics.response.avgTime.toFixed(0)} ms
          </div>
          <div className="metric-meta">
            P95: {appMetrics.response.p95.toFixed(0)}ms | P99: {appMetrics.response.p99.toFixed(0)}ms
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#ef4444' }}>
          <span>ERR</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">Error Rate</div>
          <div
            className="metric-value"
            style={{ color: getStatusColor(appMetrics.errors.rate, { warn: 5, error: 10 }) }}
          >
            {appMetrics.errors.rate.toFixed(2)}%
          </div>
          <div className="metric-meta">Total errors: {appMetrics.errors.total}</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon" style={{ background: '#14b8a6' }}>
          <span>CACHE</span>
        </div>
        <div className="metric-info">
          <div className="metric-label">Cache Hit Rate</div>
          <div className="metric-value" style={{ color: '#10b981' }}>
            {appMetrics.cache.hitRate.toFixed(1)}%
          </div>
          <div className="metric-meta">
            Hits: {appMetrics.cache.hits} | Misses: {appMetrics.cache.misses}
          </div>
        </div>
      </div>

      <style>{`
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .metric-card {
          background: #0f172a;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #334155;
          transition: all 0.2s;
        }

        .metric-card:hover {
          border-color: #475569;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-icon span {
          font-size: 14px;
          font-weight: bold;
          color: white;
        }

        .metric-info {
          flex: 1;
          min-width: 0;
        }

        .metric-label {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .metric-meta {
          font-size: 11px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default MetricsGrid;
