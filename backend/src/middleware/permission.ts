import { Request, Response, NextFunction } from 'express';
import { hasPermission, getUserPermissions } from '../services/permissions/rbac';

/**
 * Permission Middleware
 * v2.2.0 - RBAC权限检查中间件
 */

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = getUserPermissions(user.roles || []);
    
    if (!hasPermission(userPermissions, permission)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Permission "${permission}" required`
      });
    }

    next();
  };
}

// 检查多个权限（需要满足任一）
export function requireAnyPermission(permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = getUserPermissions(user.roles || []);
    
    const hasAnyPermission = permissions.some(permission => 
      hasPermission(userPermissions, permission)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `One of permissions ${permissions.join(', ')} required`
      });
    }

    next();
  };
}

// 检查多个权限（需要全部满足）
export function requireAllPermissions(permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = getUserPermissions(user.roles || []);
    
    const hasAllPermissions = permissions.every(permission => 
      hasPermission(userPermissions, permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `All permissions ${permissions.join(', ')} required`
      });
    }

    next();
  };
}
