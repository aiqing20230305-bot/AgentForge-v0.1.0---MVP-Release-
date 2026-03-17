/**
 * 告警面板组件
 * 展示和管理告警事件
 */

import React, { useState, useEffect } from 'react';
import {
  alertManager,
  AlertEvent,
  AlertRule,
  AlertLevel,
  AlertStatus
} from '../../services/monitoring';

export const AlertsPanel: React.FC = () => {
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'rules'>('events');
  const [filterLevel, setFilterLevel] = useState<AlertLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');

  useEffect(() => {
    const updateData = () => {
      setEvents(alertManager.getAllEvents());
      setRules(alertManager.getAllRules());
    };

    updateData();
    const unsubscribe = alertManager.subscribe(event => {
      updateData();
    });

    const interval = setInterval(updateData, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const filteredEvents = events.filter(event => {
    if (filterLevel !== 'all' && event.level !== filterLevel) return false;
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    return true;
  });

  const handleAcknowledge = (eventId: string) => {
    alertManager.acknowledgeAlert(eventId, 'User');
    setEvents(alertManager.getAllEvents());
  };

  const handleResolve = (eventId: string) => {
    alertManager.resolveAlert(eventId, 'User');
    setEvents(alertManager.getAllEvents());
  };

  const handleSilence = (eventId: string) => {
    alertManager.silenceAlert(eventId);
    setEvents(alertManager.getAllEvents());
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    alertManager.toggleRule(ruleId, enabled);
    setRules(alertManager.getAllRules());
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      alertManager.deleteRule(ruleId);
      setRules(alertManager.getAllRules());
    }
  };

  const getLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.INFO:
        return '#3b82f6';
      case AlertLevel.WARNING:
        return '#f59e0b';
      case AlertLevel.ERROR:
        return '#ef4444';
      case AlertLevel.CRITICAL:
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.PENDING:
        return '#f59e0b';
      case AlertStatus.ACKNOWLEDGED:
        return '#3b82f6';
      case AlertStatus.RESOLVED:
        return '#10b981';
      case AlertStatus.SILENCED:
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="alerts-panel">
      <div className="panel-header">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events ({events.length})
          </button>
          <button
            className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Rules ({rules.length})
          </button>
        </div>

        {activeTab === 'events' && (
          <div className="filters">
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value={AlertLevel.INFO}>Info</option>
              <option value={AlertLevel.WARNING}>Warning</option>
              <option value={AlertLevel.ERROR}>Error</option>
              <option value={AlertLevel.CRITICAL}>Critical</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value={AlertStatus.PENDING}>Pending</option>
              <option value={AlertStatus.ACKNOWLEDGED}>Acknowledged</option>
              <option value={AlertStatus.RESOLVED}>Resolved</option>
              <option value={AlertStatus.SILENCED}>Silenced</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'events' && (
        <div className="events-list">
          {filteredEvents.length === 0 ? (
            <div className="empty-state">No alerts found</div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <div className="event-level" style={{ background: getLevelColor(event.level) }}>
                    {event.level}
                  </div>
                  <div className="event-title">{event.ruleName}</div>
                  <div className="event-status" style={{ color: getStatusColor(event.status) }}>
                    {event.status}
                  </div>
                </div>

                <div className="event-message">{event.message}</div>

                <div className="event-details">
                  <span>Triggered: {new Date(event.triggeredAt).toLocaleString()}</span>
                  {event.acknowledgedAt && (
                    <span>Acknowledged: {new Date(event.acknowledgedAt).toLocaleString()}</span>
                  )}
                  {event.resolvedAt && (
                    <span>Resolved: {new Date(event.resolvedAt).toLocaleString()}</span>
                  )}
                </div>

                <div className="event-actions">
                  {event.status === AlertStatus.PENDING && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(event.id)}
                        className="btn btn-sm btn-primary"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolve(event.id)}
                        className="btn btn-sm btn-success"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleSilence(event.id)}
                        className="btn btn-sm btn-secondary"
                      >
                        Silence
                      </button>
                    </>
                  )}
                  {event.status === AlertStatus.ACKNOWLEDGED && (
                    <button
                      onClick={() => handleResolve(event.id)}
                      className="btn btn-sm btn-success"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="rules-list">
          {rules.length === 0 ? (
            <div className="empty-state">No alert rules configured</div>
          ) : (
            rules.map(rule => (
              <div key={rule.id} className="rule-card">
                <div className="rule-header">
                  <div className="rule-name">{rule.name}</div>
                  <div className="rule-level" style={{ background: getLevelColor(rule.level) }}>
                    {rule.level}
                  </div>
                  <label className="rule-toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={e => handleToggleRule(rule.id, e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {rule.description && (
                  <div className="rule-description">{rule.description}</div>
                )}

                <div className="rule-details">
                  <div className="rule-metric">Metric: {rule.metric}</div>
                  <div className="rule-condition">
                    Condition: {rule.condition.type}
                    {rule.condition.operator && ` ${rule.condition.operator}`}
                    {rule.condition.threshold && ` ${rule.condition.threshold}`}
                  </div>
                </div>

                <div className="rule-actions">
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .alerts-panel {
          color: #e2e8f0;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          padding: 8px 16px;
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

        .filters {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 6px 12px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #e2e8f0;
          font-size: 14px;
          cursor: pointer;
        }

        .events-list,
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .event-card,
        .rule-card {
          background: #0f172a;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #334155;
        }

        .event-header,
        .rule-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .event-level,
        .rule-level {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          color: white;
          text-transform: uppercase;
        }

        .event-title,
        .rule-name {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .event-status {
          font-size: 14px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .event-message,
        .rule-description {
          margin-bottom: 12px;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.5;
        }

        .event-details,
        .rule-details {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 12px;
          color: #64748b;
        }

        .rule-details {
          flex-direction: column;
          gap: 4px;
        }

        .event-actions,
        .rule-actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-sm {
          padding: 4px 10px;
          font-size: 12px;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .rule-toggle {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          margin-left: auto;
        }

        .rule-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #475569;
          transition: 0.4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #10b981;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
};

export default AlertsPanel;
