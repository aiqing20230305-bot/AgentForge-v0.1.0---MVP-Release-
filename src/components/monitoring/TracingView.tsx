/**
 * 追踪视图组件
 * 展示分布式追踪和慢查询信息
 */

import React, { useState, useEffect } from 'react';
import { tracingService, Trace, SlowQuery } from '../../services/monitoring';

export const TracingView: React.FC = () => {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [activeTab, setActiveTab] = useState<'traces' | 'queries'>('traces');

  useEffect(() => {
    const updateData = () => {
      setTraces(tracingService.getAllTraces().slice(-100));
      setSlowQueries(tracingService.getSlowQueries(100));
    };

    updateData();
    const interval = setInterval(updateData, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getDurationColor = (ms: number) => {
    if (ms < 100) return '#10b981';
    if (ms < 500) return '#3b82f6';
    if (ms < 1000) return '#f59e0b';
    return '#ef4444';
  };

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
  };

  const handleCloseModal = () => {
    setSelectedTrace(null);
  };

  return (
    <div className="tracing-view">
      <div className="view-header">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'traces' ? 'active' : ''}`}
            onClick={() => setActiveTab('traces')}
          >
            Traces ({traces.length})
          </button>
          <button
            className={`tab ${activeTab === 'queries' ? 'active' : ''}`}
            onClick={() => setActiveTab('queries')}
          >
            Slow Queries ({slowQueries.length})
          </button>
        </div>
      </div>

      {activeTab === 'traces' && (
        <div className="traces-list">
          {traces.length === 0 ? (
            <div className="empty-state">No traces recorded</div>
          ) : (
            <div className="trace-table">
              <div className="table-header">
                <div className="col-trace-id">Trace ID</div>
                <div className="col-services">Services</div>
                <div className="col-spans">Spans</div>
                <div className="col-duration">Duration</div>
                <div className="col-errors">Errors</div>
                <div className="col-time">Time</div>
              </div>
              <div className="table-body">
                {traces.map(trace => (
                  <div
                    key={trace.traceId}
                    className="table-row"
                    onClick={() => handleTraceClick(trace)}
                  >
                    <div className="col-trace-id">
                      <code>{trace.traceId.slice(-12)}</code>
                    </div>
                    <div className="col-services">
                      {trace.services.length > 0
                        ? trace.services.join(', ')
                        : 'N/A'}
                    </div>
                    <div className="col-spans">{trace.spans.length}</div>
                    <div
                      className="col-duration"
                      style={{ color: getDurationColor(trace.duration) }}
                    >
                      {formatDuration(trace.duration)}
                    </div>
                    <div className="col-errors">
                      {trace.errorCount > 0 ? (
                        <span className="error-badge">{trace.errorCount}</span>
                      ) : (
                        <span className="success-badge">✓</span>
                      )}
                    </div>
                    <div className="col-time">
                      {new Date(trace.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="queries-list">
          {slowQueries.length === 0 ? (
            <div className="empty-state">No slow queries recorded</div>
          ) : (
            slowQueries.map(query => (
              <div key={query.id} className="query-card">
                <div className="query-header">
                  <div className="query-database">{query.database}</div>
                  <div
                    className="query-duration"
                    style={{ color: getDurationColor(query.duration) }}
                  >
                    {formatDuration(query.duration)}
                  </div>
                  <div className="query-time">
                    {new Date(query.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="query-sql">
                  <code>{query.query}</code>
                </div>
                {query.table && (
                  <div className="query-meta">Table: {query.table}</div>
                )}
                {query.traceId && (
                  <div className="query-trace">Trace: {query.traceId}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Trace Detail Modal */}
      {selectedTrace && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Trace Details</h3>
              <button onClick={handleCloseModal} className="close-btn">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="trace-info">
                <div className="info-item">
                  <span className="info-label">Trace ID:</span>
                  <code>{selectedTrace.traceId}</code>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span style={{ color: getDurationColor(selectedTrace.duration) }}>
                    {formatDuration(selectedTrace.duration)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Spans:</span>
                  <span>{selectedTrace.spans.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Errors:</span>
                  <span>{selectedTrace.errorCount}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Services:</span>
                  <span>{selectedTrace.services.join(', ') || 'N/A'}</span>
                </div>
              </div>

              <div className="spans-timeline">
                <h4>Spans Timeline</h4>
                {selectedTrace.spans.map(span => (
                  <div key={span.spanId} className="span-item">
                    <div className="span-header">
                      <span className="span-operation">
                        {span.operationName}
                      </span>
                      <span
                        className="span-duration"
                        style={{ color: getDurationColor(span.duration) }}
                      >
                        {formatDuration(span.duration)}
                      </span>
                      {span.status === 'error' && (
                        <span className="span-error">❌ Error</span>
                      )}
                    </div>
                    {span.errorMessage && (
                      <div className="span-error-message">
                        {span.errorMessage}
                      </div>
                    )}
                    {span.tags && Object.keys(span.tags).length > 0 && (
                      <div className="span-tags">
                        {Object.entries(span.tags).map(([key, value]) => (
                          <span key={key} className="tag">
                            {key}={value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tracing-view {
          color: #e2e8f0;
        }

        .view-header {
          margin-bottom: 20px;
        }

        .tabs {
          display: flex;
          gap: 8px;
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

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
          font-size: 16px;
        }

        .trace-table {
          background: #0f172a;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #334155;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1.5fr;
          gap: 12px;
          padding: 12px 16px;
          align-items: center;
        }

        .table-header {
          background: #1e293b;
          font-weight: 600;
          font-size: 13px;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .table-row {
          border-top: 1px solid #1e293b;
          cursor: pointer;
          transition: background 0.2s;
        }

        .table-row:hover {
          background: #1e293b;
        }

        .col-trace-id code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #6366f1;
        }

        .col-services {
          font-size: 13px;
          color: #94a3b8;
        }

        .col-spans {
          font-size: 14px;
        }

        .col-duration {
          font-weight: 600;
          font-size: 14px;
        }

        .error-badge {
          background: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .success-badge {
          color: #10b981;
          font-size: 16px;
        }

        .col-time {
          font-size: 13px;
          color: #64748b;
        }

        .queries-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .query-card {
          background: #0f172a;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #334155;
        }

        .query-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 12px;
        }

        .query-database {
          font-weight: 600;
          color: #6366f1;
        }

        .query-duration {
          font-weight: 600;
        }

        .query-time {
          margin-left: auto;
          font-size: 13px;
          color: #64748b;
        }

        .query-sql {
          background: #1e293b;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .query-sql code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #e2e8f0;
          word-break: break-word;
        }

        .query-meta,
        .query-trace {
          font-size: 12px;
          color: #64748b;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1e293b;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #334155;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          color: #e2e8f0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 32px;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #e2e8f0;
        }

        .modal-body {
          padding: 20px;
          overflow-y: auto;
        }

        .trace-info {
          background: #0f172a;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
        }

        .info-item code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #6366f1;
        }

        .spans-timeline h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #e2e8f0;
        }

        .span-item {
          background: #0f172a;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 8px;
          border-left: 3px solid #3b82f6;
        }

        .span-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .span-operation {
          flex: 1;
          font-weight: 600;
          color: #e2e8f0;
        }

        .span-duration {
          font-weight: 600;
        }

        .span-error {
          color: #ef4444;
          font-size: 13px;
        }

        .span-error-message {
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .span-tags {
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
      `}</style>
    </div>
  );
};

export default TracingView;
