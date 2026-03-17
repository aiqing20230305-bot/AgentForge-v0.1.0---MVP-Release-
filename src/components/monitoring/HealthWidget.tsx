/**
 * 健康状态组件
 * 显示系统整体健康状况
 */

import React from 'react';
import { HealthStatus } from '../../services/monitoring';

interface HealthWidgetProps {
  status: HealthStatus;
}

export const HealthWidget: React.FC<HealthWidgetProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'unhealthy':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'unhealthy':
        return '✗';
      default:
        return '?';
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="health-widget">
      <div className="health-header">
        <div className="health-status">
          <div
            className="status-icon"
            style={{ background: getStatusColor() }}
          >
            {getStatusIcon()}
          </div>
          <div className="status-info">
            <h3>{status.status.toUpperCase()}</h3>
            <p>System Health Status</p>
          </div>
        </div>

        <div className="health-score">
          <div className="score-circle">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getStatusColor()}
                strokeWidth="8"
                strokeDasharray={`${(status.score / 100) * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-text">
              <span className="score-value">{status.score}</span>
              <span className="score-grade">{getScoreGrade(status.score)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="health-checks">
        <h4>Health Checks</h4>
        <div className="checks-grid">
          {status.checks.map(check => (
            <div key={check.name} className="check-item">
              <div className="check-header">
                <span className={`check-icon ${check.status}`}>
                  {check.status === 'pass' ? '✓' :
                   check.status === 'warn' ? '⚠' : '✗'}
                </span>
                <span className="check-name">{check.name}</span>
              </div>
              <p className="check-message">{check.message}</p>
              {check.duration && (
                <span className="check-duration">{check.duration}ms</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="health-footer">
        <span className="last-update">
          Last updated: {new Date(status.lastUpdate).toLocaleTimeString()}
        </span>
      </div>

      <style>{`
        .health-widget {
          background: #1e293b;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .health-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .health-status {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
          font-weight: bold;
        }

        .status-info h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .status-info p {
          margin: 4px 0 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .health-score {
          position: relative;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          position: relative;
        }

        .score-circle svg {
          width: 100%;
          height: 100%;
        }

        .score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .score-value {
          display: block;
          font-size: 32px;
          font-weight: bold;
          color: #e2e8f0;
        }

        .score-grade {
          display: block;
          font-size: 18px;
          color: #94a3b8;
        }

        .health-checks h4 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .checks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .check-item {
          background: #0f172a;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #334155;
        }

        .check-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .check-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }

        .check-icon.pass {
          background: #10b981;
          color: white;
        }

        .check-icon.warn {
          background: #f59e0b;
          color: white;
        }

        .check-icon.fail {
          background: #ef4444;
          color: white;
        }

        .check-name {
          font-weight: 500;
          color: #e2e8f0;
          font-size: 14px;
          text-transform: capitalize;
        }

        .check-message {
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.4;
        }

        .check-duration {
          display: inline-block;
          margin-top: 4px;
          font-size: 11px;
          color: #64748b;
        }

        .health-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #334155;
          text-align: center;
        }

        .last-update {
          font-size: 13px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default HealthWidget;
