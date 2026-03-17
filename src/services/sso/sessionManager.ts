/**
 * Session Manager
 * Handles SSO session lifecycle and monitoring
 */

import {
  SSOSession,
  SessionStatus,
  SSOMetrics,
  SSOProvider,
  SSOAuditEvent,
} from './types';

export class SessionManager {
  private sessions: Map<string, SSOSession> = new Map();
  private userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds

  constructor() {
    // Start session cleanup job
    this.startCleanupJob();
  }

  /**
   * Create new session
   */
  async createSession(session: SSOSession): Promise<void> {
    this.sessions.set(session.id, session);

    // Track user sessions
    if (!this.userSessions.has(session.userId)) {
      this.userSessions.set(session.userId, new Set());
    }
    this.userSessions.get(session.userId)?.add(session.id);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<SSOSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (this.isSessionExpired(session)) {
      await this.expireSession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivityAt = new Date();
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SSOSession[]> {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return [];
    }

    const sessions: SSOSession[] = [];
    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<SSOSession[]> {
    const sessions: SSOSession[] = [];

    for (const session of this.sessions.values()) {
      if (session.status === SessionStatus.ACTIVE && !this.isSessionExpired(session)) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Update session
   */
  async updateSession(sessionId: string, updates: Partial<SSOSession>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...session,
      ...updates,
    };

    this.sessions.set(sessionId, updatedSession);
  }

  /**
   * Refresh session (extend expiration)
   */
  async refreshSession(sessionId: string, expiresIn: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.expiresAt = new Date(Date.now() + expiresIn * 1000);
    session.lastActivityAt = new Date();
    this.sessions.set(sessionId, session);
  }

  /**
   * End session (logout)
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = SessionStatus.LOGGED_OUT;
    this.sessions.set(sessionId, session);

    // Remove from user sessions
    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
      if (userSessionIds.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }
  }

  /**
   * End all sessions for a user
   */
  async endUserSessions(userId: string): Promise<void> {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return;
    }

    for (const sessionId of Array.from(sessionIds)) {
      await this.endSession(sessionId);
    }
  }

  /**
   * Expire session
   */
  private async expireSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = SessionStatus.EXPIRED;
    this.sessions.set(sessionId, session);

    // Remove from user sessions
    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
      if (userSessionIds.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = SessionStatus.INVALID;
    this.sessions.set(sessionId, session);

    // Remove from user sessions
    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: SSOSession): boolean {
    return new Date() >= session.expiresAt;
  }

  /**
   * Start cleanup job to remove expired sessions
   */
  private startCleanupJob(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessionIds: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now && session.status === SessionStatus.ACTIVE) {
        expiredSessionIds.push(sessionId);
      }
    }

    for (const sessionId of expiredSessionIds) {
      await this.expireSession(sessionId);
    }

    // Clean up old expired/logged out sessions after 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [sessionId, session] of this.sessions.entries()) {
      if (
        session.status !== SessionStatus.ACTIVE &&
        session.lastActivityAt < oneDayAgo
      ) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session metrics
   */
  async getMetrics(): Promise<SSOMetrics> {
    const activeSessions = await this.getActiveSessions();

    // Calculate metrics
    const usersByProvider: Record<SSOProvider, number> = {} as any;
    const sessionsByProvider: Record<SSOProvider, number> = {} as any;

    for (const session of activeSessions) {
      sessionsByProvider[session.provider] = (sessionsByProvider[session.provider] || 0) + 1;
    }

    // Count unique users
    const uniqueUserIds = new Set(activeSessions.map((s) => s.userId));

    // Calculate login success rate (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSessions = Array.from(this.sessions.values()).filter(
      (s) => s.createdAt >= oneDayAgo
    );

    const successfulLogins = recentSessions.filter(
      (s) => s.status === SessionStatus.ACTIVE || s.status === SessionStatus.LOGGED_OUT
    ).length;
    const failedLogins = recentSessions.filter((s) => s.status === SessionStatus.INVALID).length;
    const totalAttempts = successfulLogins + failedLogins;
    const loginSuccessRate = totalAttempts > 0 ? (successfulLogins / totalAttempts) * 100 : 100;

    // Calculate average login time (simulated)
    const averageLoginTime = 1500; // ms

    // Calculate average session duration
    const sessionDurations = activeSessions.map((s) => {
      return (Date.now() - s.createdAt.getTime()) / 1000;
    });
    const averageSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
        : 0;

    // Count expired sessions in last 24h
    const expiredSessionsLast24h = Array.from(this.sessions.values()).filter(
      (s) => s.status === SessionStatus.EXPIRED && s.lastActivityAt >= oneDayAgo
    ).length;

    return {
      totalUsers: uniqueUserIds.size,
      activeUsers: uniqueUserIds.size,
      activeSessions: activeSessions.length,
      usersByProvider,
      sessionsByProvider,
      loginSuccessRate,
      averageLoginTime,
      loginsLast24h: recentSessions.length,
      failedLoginsLast24h: failedLogins,
      averageSessionDuration,
      expiredSessionsLast24h,
    };
  }

  /**
   * Get session statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    expired: number;
    loggedOut: number;
    invalid: number;
  }> {
    const sessions = Array.from(this.sessions.values());

    return {
      total: sessions.length,
      active: sessions.filter((s) => s.status === SessionStatus.ACTIVE).length,
      expired: sessions.filter((s) => s.status === SessionStatus.EXPIRED).length,
      loggedOut: sessions.filter((s) => s.status === SessionStatus.LOGGED_OUT).length,
      invalid: sessions.filter((s) => s.status === SessionStatus.INVALID).length,
    };
  }

  /**
   * Validate session token
   */
  async validateToken(sessionToken: string): Promise<SSOSession | null> {
    for (const session of this.sessions.values()) {
      if (session.sessionToken === sessionToken && session.status === SessionStatus.ACTIVE) {
        if (!this.isSessionExpired(session)) {
          // Update last activity
          session.lastActivityAt = new Date();
          this.sessions.set(session.id, session);
          return session;
        } else {
          await this.expireSession(session.id);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Get sessions by provider
   */
  async getSessionsByProvider(provider: SSOProvider): Promise<SSOSession[]> {
    const sessions = await this.getActiveSessions();
    return sessions.filter((s) => s.provider === provider);
  }

  /**
   * Count active sessions by user
   */
  async countUserSessions(userId: string): Promise<number> {
    const sessions = await this.getUserSessions(userId);
    return sessions.filter((s) => s.status === SessionStatus.ACTIVE).length;
  }
}
