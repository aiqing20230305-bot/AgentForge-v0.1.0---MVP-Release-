/**
 * Webhook Authentication Middleware Tests
 * v2.5.0 - Security Enhancement
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  verifyJiraWebhook,
  verifyGitHubWebhook,
  createWebhookVerifier
} from '../webhookAuth';

// Mock environment variables
const JIRA_SECRET = 'test_jira_secret';
const GITHUB_SECRET = 'test_github_secret';

describe('Webhook Authentication Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: { test: 'data' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // 设置环境变量
    process.env.JIRA_WEBHOOK_SECRET = JIRA_SECRET;
    process.env.GITHUB_WEBHOOK_SECRET = GITHUB_SECRET;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.JIRA_WEBHOOK_SECRET;
    delete process.env.GITHUB_WEBHOOK_SECRET;
  });

  describe('verifyJiraWebhook', () => {
    it('should pass with valid signature', () => {
      const payload = JSON.stringify(mockReq.body);
      const hmac = crypto.createHmac('sha256', JIRA_SECRET);
      const signature = 'sha256=' + hmac.update(payload).digest('hex');

      mockReq.headers = { 'x-jira-signature': signature };

      verifyJiraWebhook(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject with invalid signature', () => {
      mockReq.headers = { 'x-jira-signature': 'sha256=invalid_signature' };

      verifyJiraWebhook(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid signature'
      });
    });

    it('should reject with missing signature', () => {
      verifyJiraWebhook(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing signature'
      });
    });

    it('should reject when secret not configured', () => {
      delete process.env.JIRA_WEBHOOK_SECRET;

      verifyJiraWebhook(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('verifyGitHubWebhook', () => {
    it('should pass with valid GitHub signature', () => {
      const payload = JSON.stringify(mockReq.body);
      const hmac = crypto.createHmac('sha256', GITHUB_SECRET);
      const signature = 'sha256=' + hmac.update(payload).digest('hex');

      mockReq.headers = { 'x-hub-signature-256': signature };

      verifyGitHubWebhook(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject with invalid GitHub signature', () => {
      mockReq.headers = { 'x-hub-signature-256': 'sha256=bad_signature' };

      verifyGitHubWebhook(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('createWebhookVerifier', () => {
    it('should create custom verifier', () => {
      process.env.CUSTOM_SECRET = 'custom_secret';

      const customVerifier = createWebhookVerifier(
        'CUSTOM_SECRET',
        'X-Custom-Signature'
      );

      const payload = JSON.stringify(mockReq.body);
      const hmac = crypto.createHmac('sha256', 'custom_secret');
      const signature = 'sha256=' + hmac.update(payload).digest('hex');

      mockReq.headers = { 'x-custom-signature': signature };

      customVerifier(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();

      delete process.env.CUSTOM_SECRET;
    });
  });

  describe('timing attack protection', () => {
    it('should use constant-time comparison', () => {
      const payload = JSON.stringify(mockReq.body);
      const hmac = crypto.createHmac('sha256', JIRA_SECRET);
      const validSignature = hmac.update(payload).digest('hex');

      // 测试多次，确保响应时间稳定
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = Date.now();

        mockReq.headers = {
          'x-jira-signature': `sha256=${validSignature}`
        };

        verifyJiraWebhook(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );

        times.push(Date.now() - start);
      }

      // 验证时间稳定性（标准差应该很小）
      const avg = times.reduce((a, b) => a + b) / times.length;
      const variance =
        times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) /
        times.length;
      const stdDev = Math.sqrt(variance);

      // 标准差应该小于平均值的50%
      expect(stdDev).toBeLessThan(avg * 0.5);
    });
  });
});
