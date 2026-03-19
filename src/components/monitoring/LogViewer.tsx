/**
 * 日志查看器组件
 * 提供日志搜索、过滤和查看功能
 */

import React, { useState, useEffect } from 'react';
import { logAggregator, LogEntry, LogLevel } from '../../services/monitoring';

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [sources, setSources] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const updateLogs = () => {
      let filtered = logAggregator.getRecentLogs(500);

      if (filterLevel !== 'all') {
        filtered = filtered.filter(log => log.level === filterLevel);
      }

      if (filterSource !== 'all') {
        filtered = filtered.filter(log => log.source === filterSource);
      }

      if (searchText) {
        filtered = logAggregator.search(searchText, { limit: 500 });
      }

      setLogs(filtered);
      setSources(logAggregator.getSources());
    };

    updateLogs();
    const unsubscribe = logAggregator.subscribe(() => {
      updateLogs();
    });

    const interval = setInterval(updateLogs, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [searchText, filterLevel, filterSource]);

  useEffect(() => {
    if (autoScroll) {
      const container = document.querySelector('.logs-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.TRACE:
        return '#6b7280';
      case LogLevel.DEBUG:
        return '#3b82f6';
      case LogLevel.INFO:
        return '#10b981';
      case LogLevel.WARN:
        return '#f59e0b';
      case LogLevel.ERROR:
        return '#ef4444';
      case LogLevel.FATAL:
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.TRACE:
        return '🔍';
      case LogLevel.DEBUG:
        return '🐛';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.FATAL:
        return '💀';
      default:
        return '📝';
    }
  };

  const handleExport = () => {
    const csv = logAggregator.export('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logAggregator.clear();
      setLogs([]);
    }
  };

  return (
    <div className="log-viewer">
      <div className="viewer-header">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="search-input"
          />

          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            <option value={LogLevel.TRACE}>Trace</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARN}>Warn</option>
            <option value={LogLevel.ERROR}>Error</option>
            <option value={LogLevel.FATAL}>Fatal</option>
          </select>

          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="viewer-actions">
          <label className="auto-scroll-label">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={e => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <button onClick={handleExport} className="btn btn-secondary">
            Export
          </button>
          <button onClick={handleClear} className="btn btn-danger">
            Clear
          </button>
        </div>
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="empty-state">No logs to display</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="log-entry">
              <div className="log-timestamp">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <div
                className="log-level"
                style={{ color: getLevelColor(log.level) }}
              >
                {getLevelIcon(log.level)} {log.level.toUpperCase()}
              </div>
              <div className="log-source">[{log.source}]</div>
              <div className="log-message">{log.message}</div>
              {log.tags && Object.keys(log.tags).length > 0 && (
                <div className="log-tags">
                  {Object.entries(log.tags).map(([key, value]) => (
                    <span key={key} className="tag">
                      {key}={value}
                    </span>
                  ))}
                </div>
              )}
              {log.traceId && (
                <div className="log-trace">Trace: {log.traceId}</div>
              )}
              {log.stackTrace && (
                <details className="log-stack">
                  <summary>Stack Trace</summary>
                  <pre>{log.stackTrace}</pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      <div className="viewer-footer">
        <span>Total logs: {logs.length}</span>
        <span>Storage: {logAggregator.getSize()} entries</span>
      </div>

      <style>{`
        .log-viewer {
          display: flex;
          flex-direction: column;
          height: 600px;
          color: #e2e8f0;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .search-controls {
          display: flex;
          gap: 12px;
          flex: 1;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 8px 12px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #e2e8f0;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .filter-select {
          padding: 8px 12px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #e2e8f0;
          font-size: 14px;
          cursor: pointer;
        }

        .viewer-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .auto-scroll-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #94a3b8;
          cursor: pointer;
        }

        .auto-scroll-label input[type="checkbox"] {
          cursor: pointer;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: #475569;
          color: white;
        }

        .btn-secondary:hover {
          background: #334155;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .logs-container {
          flex: 1;
          overflow-y: auto;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        .logs-container::-webkit-scrollbar {
          width: 8px;
        }

        .logs-container::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .logs-container::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .log-entry {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px;
          border-bottom: 1px solid #1e293b;
        }

        .log-entry:hover {
          background: #1e293b;
        }

        .log-timestamp {
          color: #64748b;
          flex-shrink: 0;
        }

        .log-level {
          font-weight: bold;
          flex-shrink: 0;
        }

        .log-source {
          color: #6366f1;
          flex-shrink: 0;
        }

        .log-message {
          flex: 1;
          color: #e2e8f0;
          word-break: break-word;
        }

        .log-tags {
          width: 100%;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tag {
          padding: 2px 8px;
          background: #334155;
          border-radius: 4px;
          font-size: 11px;
          color: #94a3b8;
        }

        .log-trace {
          width: 100%;
          font-size: 11px;
          color: #6366f1;
        }

        .log-stack {
          width: 100%;
          margin-top: 4px;
        }

        .log-stack summary {
          cursor: pointer;
          color: #ef4444;
          font-size: 12px;
        }

        .log-stack pre {
          margin: 8px 0 0 0;
          padding: 8px;
          background: #1e293b;
          border-radius: 4px;
          overflow-x: auto;
          color: #94a3b8;
          font-size: 11px;
        }

        .viewer-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #334155;
          font-size: 13px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default LogViewer;
