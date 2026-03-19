/**
 * SSO Routes
 * API routes for SSO authentication
 */

import { Router } from 'express';
import { SSOController } from './ssoController';

const router = Router();
const ssoController = new SSOController();

// Authentication endpoints
router.post('/auth/sso/initiate', (req, res) => ssoController.initiateAuth(req, res));
router.post('/auth/sso/callback/:provider', (req, res) => ssoController.handleCallback(req, res));
router.get('/auth/sso/callback/:provider', (req, res) => ssoController.handleCallback(req, res));
router.post('/auth/sso/logout', (req, res) => ssoController.logout(req, res));
router.get('/auth/sso/validate', (req, res) => ssoController.validateSession(req, res));

// Configuration endpoints
router.get('/admin/sso/configs', (req, res) => ssoController.getConfigs(req, res));
router.post('/admin/sso/configs', (req, res) => ssoController.createConfig(req, res));
router.put('/admin/sso/configs/:id', (req, res) => ssoController.updateConfig(req, res));
router.delete('/admin/sso/configs/:id', (req, res) => ssoController.deleteConfig(req, res));

// Operations endpoints
router.post('/admin/sso/configs/:id/test', (req, res) => ssoController.testConnection(req, res));
router.post('/admin/sso/configs/:id/sync', (req, res) => ssoController.syncUsers(req, res));

// Monitoring endpoints
router.get('/admin/sso/metrics', (req, res) => ssoController.getMetrics(req, res));
router.get('/admin/sso/audit-logs', (req, res) => ssoController.getAuditLogs(req, res));

export default router;
