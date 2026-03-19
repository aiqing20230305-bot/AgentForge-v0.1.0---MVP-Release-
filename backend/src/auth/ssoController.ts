/**
 * SSO Controller
 * Backend API endpoints for SSO authentication
 */

import { Request, Response } from 'express';
import { SSOService } from './ssoService';

export class SSOController {
  private ssoService: SSOService;

  constructor() {
    this.ssoService = new SSOService();
  }

  /**
   * Initiate SSO authentication
   */
  async initiateAuth(req: Request, res: Response): Promise<void> {
    try {
      const { provider, callbackUrl } = req.body;

      const result = await this.ssoService.initiateAuth({
        provider,
        protocol: req.body.protocol,
        callbackUrl,
        state: req.body.state,
      });

      if (result.success) {
        res.json({
          success: true,
          redirectUrl: result.redirectUrl,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Handle SSO callback
   */
  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;
      const callbackData = req.method === 'POST' ? req.body : req.query;

      const result = await this.ssoService.processCallback(provider as any, callbackData);

      if (result.success && result.user && result.session) {
        // Set session cookie
        res.cookie('sso_session', result.session.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: result.session.expiresAt.getTime() - Date.now(),
        });

        res.json({
          success: true,
          user: result.user,
          session: result.session,
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, globalLogout } = req.body;

      const success = await this.ssoService.logout({
        sessionId,
        globalLogout: globalLogout || false,
      });

      if (success) {
        res.clearCookie('sso_session');
        res.json({ success: true });
      } else {
        res.status(400).json({
          success: false,
          error: 'Logout failed',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get SSO configurations
   */
  async getConfigs(req: Request, res: Response): Promise<void> {
    try {
      const configs = await this.ssoService.getAllConfigs();
      res.json({ success: true, configs });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Create SSO configuration
   */
  async createConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body;
      await this.ssoService.addConfig(config);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Update SSO configuration
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      await this.ssoService.updateConfig(id, updates);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Delete SSO configuration
   */
  async deleteConfig(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.ssoService.deleteConfig(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Test SSO connection
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.ssoService.testConnection(id);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Sync users from SSO provider
   */
  async syncUsers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.ssoService.syncUsers(id);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get SSO metrics
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.ssoService.getMetrics();
      res.json({ success: true, metrics });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        userId: req.query.userId as string | undefined,
        event: req.query.event as any,
      };

      const logs = await this.ssoService.getAuditLogs(filters);
      res.json({ success: true, logs });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Validate session
   */
  async validateSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionToken = req.cookies.sso_session || req.headers.authorization?.replace('Bearer ', '');

      if (!sessionToken) {
        res.status(401).json({
          success: false,
          error: 'No session token provided',
        });
        return;
      }

      const session = await this.ssoService.validateSession(sessionToken);

      if (session) {
        res.json({ success: true, session });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired session',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}
