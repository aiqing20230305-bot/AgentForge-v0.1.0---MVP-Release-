/**
 * Audit Logger
 * Tracks all SSO-related events for security and compliance
 */

import { SSOAuditLog, SSOAuditEvent } from './types';

export class AuditLogger {
  private logs: SSOAuditLog[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  constructor() {
    // In production, logs would be persisted to database
  }

  /**
   * Log an audit event
   */
  async log(
    event: Omit<SSOAuditLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const log: SSOAuditLog = {
      id: this.generateLogId(),
      timestamp: new Date(),
      ...event,
    };

    this.logs.push(log);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, persist to database
    await this.persistLog(log);

    // Console log for development
    this.consoleLog(log);
  }

  /**
   * Get logs with optional filters
   */
  async getLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    email?: string;
    event?: SSOAuditEvent;
    status?: 'success' | 'failure' | 'error';
    provider?: string;
  }): Promise<SSOAuditLog[]> {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp >= filters.startDate!
        );
      }

      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp <= filters.endDate!
        );
      }

      if (filters.userId) {
        filteredLogs = filteredLogs.filter(
          (log) => log.userId === filters.userId
        );
      }

      if (filters.email) {
        filteredLogs = filteredLogs.filter(
          (log) => log.email === filters.email
        );
      }

      if (filters.event) {
        filteredLogs = filteredLogs.filter(
          (log) => log.event === filters.event
        );
      }

      if (filters.status) {
        filteredLogs = filteredLogs.filter(
          (log) => log.status === filters.status
        );
      }

      if (filters.provider) {
        filteredLogs = filteredLogs.filter(
          (log) => log.provider === filters.provider
        );
      }
    }

    return filteredLogs.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get recent logs
   */
  async getRecentLogs(limit: number = 100): Promise<SSOAuditLog[]> {
    return this.logs
      .slice(-limit)
      .reverse();
  }

  /**
   * Get logs by event type
   */
  async getLogsByEvent(event: SSOAuditEvent): Promise<SSOAuditLog[]> {
    return this.logs.filter((log) => log.event === event);
  }

  /**
   * Get logs by user
   */
  async getLogsByUser(userId: string): Promise<SSOAuditLog[]> {
    return this.logs.filter((log) => log.userId === userId);
  }

  /**
   * Get failed login attempts
   */
  async getFailedLoginAttempts(
    timeWindow?: { start: Date; end: Date }
  ): Promise<SSOAuditLog[]> {
    let logs = this.logs.filter(
      (log) =>
        log.event === SSOAuditEvent.LOGIN_FAILURE ||
        log.event === SSOAuditEvent.UNAUTHORIZED_ACCESS
    );

    if (timeWindow) {
      logs = logs.filter(
        (log) =>
          log.timestamp >= timeWindow.start &&
          log.timestamp <= timeWindow.end
      );
    }

    return logs;
  }

  /**
   * Get security events
   */
  async getSecurityEvents(): Promise<SSOAuditLog[]> {
    const securityEvents = [
      SSOAuditEvent.LOGIN_FAILURE,
      SSOAuditEvent.UNAUTHORIZED_ACCESS,
      SSOAuditEvent.INVALID_TOKEN,
    ];

    return this.logs.filter((log) =>
      securityEvents.includes(log.event)
    );
  }

  /**
   * Get audit statistics
   */
  async getStatistics(timeWindow?: {
    start: Date;
    end: Date;
  }): Promise<{
    totalEvents: number;
    successfulLogins: number;
    failedLogins: number;
    logouts: number;
    securityEvents: number;
    eventsByType: Record<string, number>;
  }> {
    let logs = this.logs;

    if (timeWindow) {
      logs = logs.filter(
        (log) =>
          log.timestamp >= timeWindow.start &&
          log.timestamp <= timeWindow.end
      );
    }

    const stats = {
      totalEvents: logs.length,
      successfulLogins: logs.filter(
        (log) => log.event === SSOAuditEvent.LOGIN_SUCCESS
      ).length,
      failedLogins: logs.filter(
        (log) => log.event === SSOAuditEvent.LOGIN_FAILURE
      ).length,
      logouts: logs.filter(
        (log) => log.event === SSOAuditEvent.LOGOUT
      ).length,
      securityEvents: logs.filter(
        (log) =>
          log.event === SSOAuditEvent.LOGIN_FAILURE ||
          log.event === SSOAuditEvent.UNAUTHORIZED_ACCESS ||
          log.event === SSOAuditEvent.INVALID_TOKEN
      ).length,
      eventsByType: {} as Record<string, number>,
    };

    // Count events by type
    for (const log of logs) {
      stats.eventsByType[log.event] =
        (stats.eventsByType[log.event] || 0) + 1;
    }

    return stats;
  }

  /**
   * Export logs to JSON
   */
  async exportLogs(
    filters?: Parameters<typeof this.getLogs>[0]
  ): Promise<string> {
    const logs = await this.getLogs(filters);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Export logs to CSV
   */
  async exportLogsCSV(
    filters?: Parameters<typeof this.getLogs>[0]
  ): Promise<string> {
    const logs = await this.getLogs(filters);

    if (logs.length === 0) {
      return '';
    }

    // CSV headers
    const headers = [
      'Timestamp',
      'Event',
      'Status',
      'User ID',
      'Email',
      'IP Address',
      'Provider',
      'Protocol',
      'Message',
      'Error',
    ];

    // CSV rows
    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.event,
      log.status,
      log.userId || '',
      log.email || '',
      log.ipAddress || '',
      log.provider || '',
      log.protocol || '',
      log.message,
      log.error || '',
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n');

    return csv;
  }

  /**
   * Clear old logs
   */
  async clearOldLogs(olderThan: Date): Promise<number> {
    const originalLength = this.logs.length;
    this.logs = this.logs.filter(
      (log) => log.timestamp >= olderThan
    );
    return originalLength - this.logs.length;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Persist log to storage (placeholder)
   */
  private async persistLog(log: SSOAuditLog): Promise<void> {
    // In production, this would persist to database
    // For now, just store in memory
  }

  /**
   * Console log for development
   */
  private consoleLog(log: SSOAuditLog): void {
    const emoji = this.getEventEmoji(log.event);
    const color = log.status === 'success' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(
      `${color}${emoji} [SSO Audit]${reset} ${log.event} - ${log.message}`,
      log.error ? `\nError: ${log.error}` : ''
    );
  }

  /**
   * Get emoji for event type
   */
  private getEventEmoji(event: SSOAuditEvent): string {
    const emojiMap: Record<SSOAuditEvent, string> = {
      [SSOAuditEvent.LOGIN_SUCCESS]: '✅',
      [SSOAuditEvent.LOGIN_FAILURE]: '❌',
      [SSOAuditEvent.LOGOUT]: '👋',
      [SSOAuditEvent.SESSION_EXPIRED]: '⏰',
      [SSOAuditEvent.USER_PROVISIONED]: '👤',
      [SSOAuditEvent.USER_UPDATED]: '📝',
      [SSOAuditEvent.USER_DEACTIVATED]: '🚫',
      [SSOAuditEvent.ROLE_CHANGED]: '🔄',
      [SSOAuditEvent.SSO_CONFIG_CREATED]: '⚙️',
      [SSOAuditEvent.SSO_CONFIG_UPDATED]: '🔧',
      [SSOAuditEvent.SSO_CONFIG_DELETED]: '🗑️',
      [SSOAuditEvent.SSO_CONFIG_ENABLED]: '✅',
      [SSOAuditEvent.SSO_CONFIG_DISABLED]: '❌',
      [SSOAuditEvent.UNAUTHORIZED_ACCESS]: '🚨',
      [SSOAuditEvent.INVALID_TOKEN]: '🔑',
      [SSOAuditEvent.TOKEN_REFRESH]: '🔄',
      [SSOAuditEvent.PASSWORD_RESET]: '🔒',
    };

    return emojiMap[event] || '📋';
  }
}
