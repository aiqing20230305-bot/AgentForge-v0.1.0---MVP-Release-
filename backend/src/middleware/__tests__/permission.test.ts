import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requirePermission, requireAnyPermission, requireAllPermissions } from '../permission';

/**
 * Permission Middleware集成测试
 * v2.2.0 Phase 3.2
 */

describe('Permission Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: undefined,
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe('requirePermission', () => {
    it('should allow access with correct permission', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['admin'],
      };

      const middleware = requirePermission('team:write');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access without permission', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['viewer'],
      };

      const middleware = requirePermission('team:write');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Permission "team:write" required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access without authentication', () => {
      mockReq.user = undefined;

      const middleware = requirePermission('team:write');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow owner with wildcard permission', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['owner'],
      };

      const middleware = requirePermission('team:delete');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow resource wildcard permission', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['admin'],
      };

      const middleware = requirePermission('team:read');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAnyPermission', () => {
    it('should allow access if user has any of the permissions', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['developer'],
      };

      const middleware = requireAnyPermission(['team:write', 'agent:write']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access if user has none of the permissions', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['viewer'],
      };

      const middleware = requireAnyPermission(['team:write', 'agent:write']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow with just one matching permission', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['analyst'],
      };

      const middleware = requireAnyPermission(['analytics:read', 'team:write']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAllPermissions', () => {
    it('should allow access if user has all permissions', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['admin'],
      };

      const middleware = requireAllPermissions(['team:read', 'team:write']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access if user is missing any permission', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['developer'],
      };

      const middleware = requireAllPermissions(['agent:write', 'team:write']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow owner with all permissions', () => {
      mockReq.user = {
        id: 'user-1',
        roles: ['owner'],
      };

      const middleware = requireAllPermissions(['team:write', 'agent:write', 'task:write']);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
