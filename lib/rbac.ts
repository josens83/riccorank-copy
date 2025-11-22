import { log } from '@/lib/logger';

// Permission types
export type Permission =
  // User permissions
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  // Post permissions
  | 'post:create'
  | 'post:read'
  | 'post:update'
  | 'post:delete'
  | 'post:pin'
  // Comment permissions
  | 'comment:create'
  | 'comment:read'
  | 'comment:update'
  | 'comment:delete'
  // Admin permissions
  | 'admin:access'
  | 'admin:users'
  | 'admin:posts'
  | 'admin:reports'
  | 'admin:stats'
  // Premium permissions
  | 'premium:api'
  | 'premium:export'
  | 'premium:analytics'
  // Team permissions
  | 'team:create'
  | 'team:manage'
  | 'team:invite'
  | 'team:remove';

// Role types
export type Role = 'guest' | 'user' | 'pro' | 'premium' | 'admin' | 'super_admin';

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: Role[] = ['guest', 'user', 'pro', 'premium', 'admin', 'super_admin'];

// Permission definitions per role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  guest: [
    'post:read',
    'comment:read',
  ],
  user: [
    'user:read',
    'user:update',
    'post:create',
    'post:read',
    'post:update',
    'post:delete',
    'comment:create',
    'comment:read',
    'comment:update',
    'comment:delete',
  ],
  pro: [
    'user:read',
    'user:update',
    'post:create',
    'post:read',
    'post:update',
    'post:delete',
    'comment:create',
    'comment:read',
    'comment:update',
    'comment:delete',
    'premium:export',
  ],
  premium: [
    'user:read',
    'user:update',
    'post:create',
    'post:read',
    'post:update',
    'post:delete',
    'comment:create',
    'comment:read',
    'comment:update',
    'comment:delete',
    'premium:api',
    'premium:export',
    'premium:analytics',
    'team:create',
    'team:manage',
    'team:invite',
    'team:remove',
  ],
  admin: [
    'user:read',
    'user:update',
    'user:delete',
    'post:create',
    'post:read',
    'post:update',
    'post:delete',
    'post:pin',
    'comment:create',
    'comment:read',
    'comment:update',
    'comment:delete',
    'admin:access',
    'admin:users',
    'admin:posts',
    'admin:reports',
    'admin:stats',
    'premium:api',
    'premium:export',
    'premium:analytics',
    'team:create',
    'team:manage',
    'team:invite',
    'team:remove',
  ],
  super_admin: [
    // All permissions
    'user:read',
    'user:update',
    'user:delete',
    'post:create',
    'post:read',
    'post:update',
    'post:delete',
    'post:pin',
    'comment:create',
    'comment:read',
    'comment:update',
    'comment:delete',
    'admin:access',
    'admin:users',
    'admin:posts',
    'admin:reports',
    'admin:stats',
    'premium:api',
    'premium:export',
    'premium:analytics',
    'team:create',
    'team:manage',
    'team:invite',
    'team:remove',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role1 is higher or equal to role2 in hierarchy
 */
export function isRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

/**
 * Get role from string with validation
 */
export function parseRole(roleString: string | undefined): Role {
  if (!roleString) return 'user';

  const normalized = roleString.toLowerCase() as Role;
  if (ROLE_HIERARCHY.includes(normalized)) {
    return normalized;
  }

  return 'user';
}

/**
 * RBAC middleware for API routes
 */
export function requirePermission(permission: Permission) {
  return (userRole: string | undefined): boolean => {
    const role = parseRole(userRole);
    const allowed = hasPermission(role, permission);

    if (!allowed) {
      log.warn('Permission denied', { role, permission });
    }

    return allowed;
  };
}

/**
 * RBAC middleware for minimum role
 */
export function requireRole(minRole: Role) {
  return (userRole: string | undefined): boolean => {
    const role = parseRole(userRole);
    const allowed = isRoleAtLeast(role, minRole);

    if (!allowed) {
      log.warn('Role check failed', { userRole: role, required: minRole });
    }

    return allowed;
  };
}

/**
 * Check resource ownership
 */
export function canAccessResource(
  userRole: Role,
  userId: string,
  resourceOwnerId: string,
  permission: Permission
): boolean {
  // Admin can access all
  if (isRoleAtLeast(userRole, 'admin')) {
    return true;
  }

  // Owner can access own resources
  if (userId === resourceOwnerId) {
    return hasPermission(userRole, permission);
  }

  // Check read permission for others
  if (permission.endsWith(':read')) {
    return hasPermission(userRole, permission);
  }

  return false;
}
