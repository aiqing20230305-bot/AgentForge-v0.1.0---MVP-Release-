/**
 * RBAC (Role-Based Access Control) 权限系统
 * v2.2.0 - Enterprise Ready
 */

export interface Permission {
  resource: string; // 'agent', 'team', 'task', 'analytics'
  action: string;   // 'read', 'write', 'delete', 'deploy'
}

export interface Role {
  id: string;
  name: string;
  permissions: string[]; // 'agent:read', 'agent:write', etc.
  description?: string;
}

// 预置角色
export const BUILT_IN_ROLES: Record<string, Role> = {
  OWNER: {
    id: 'owner',
    name: 'Owner',
    permissions: ['*'], // 所有权限
    description: 'Full access to all resources'
  },
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    permissions: [
      'team:*',
      'agent:*',
      'task:*',
      'analytics:read'
    ],
    description: 'Manage team and agents'
  },
  DEVELOPER: {
    id: 'developer',
    name: 'Developer',
    permissions: [
      'agent:read',
      'agent:write',
      'agent:deploy',
      'task:read',
      'task:write'
    ],
    description: 'Develop and deploy agents'
  },
  ANALYST: {
    id: 'analyst',
    name: 'Analyst',
    permissions: [
      'agent:read',
      'task:read',
      'analytics:*'
    ],
    description: 'View and analyze data'
  },
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    permissions: [
      'agent:read',
      'task:read'
    ],
    description: 'Read-only access'
  }
};

/**
 * 检查权限
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  // 检查是否有通配符权限
  if (userPermissions.includes('*')) {
    return true;
  }

  // 检查完全匹配
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // 检查资源级通配符 (e.g., 'agent:*' matches 'agent:read')
  const [resource, action] = requiredPermission.split(':');
  const wildcardPermission = `${resource}:*`;
  if (userPermissions.includes(wildcardPermission)) {
    return true;
  }

  return false;
}

/**
 * 获取用户所有权限
 */
export function getUserPermissions(roles: Role[]): string[] {
  const permissions = new Set<string>();
  
  for (const role of roles) {
    for (const permission of role.permissions) {
      permissions.add(permission);
    }
  }
  
  return Array.from(permissions);
}
