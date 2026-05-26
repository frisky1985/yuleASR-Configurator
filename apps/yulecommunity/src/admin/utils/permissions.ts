// RBAC Permission System
export type Role = 'user' | 'vip' | 'admin' | 'super_admin';
export type Permission = 
  // User permissions
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'user:create'
  // Build permissions
  | 'build:read'
  | 'build:update'
  | 'build:delete'
  | 'build:create'
  // Content permissions
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:create'
  // Admin permissions
  | 'admin:access'
  | 'admin:users'
  | 'admin:settings'
  | 'admin:all';

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [
    'user:read',
    'build:read',
    'build:create',
    'content:read',
  ],
  vip: [
    'user:read',
    'user:update',
    'build:read',
    'build:create',
    'build:update',
    'content:read',
  ],
  admin: [
    'user:read',
    'user:update',
    'build:read',
    'build:update',
    'build:delete',
    'content:read',
    'content:update',
    'content:delete',
    'admin:access',
    'admin:users',
  ],
  super_admin: [
    'admin:all',
    'user:read',
    'user:update',
    'user:delete',
    'user:create',
    'build:read',
    'build:update',
    'build:delete',
    'build:create',
    'content:read',
    'content:update',
    'content:delete',
    'content:create',
    'admin:access',
    'admin:users',
    'admin:settings',
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes('admin:all');
}

// Check if a role has any of the permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

// Check if a role has all of the permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

// Get role display name
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    user: '普通用户',
    vip: 'VIP',
    admin: '管理员',
    super_admin: '超级管理员',
  };
  return labels[role] || role;
}

// Get role color class
export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    vip: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    super_admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

// Permission groups for UI
export const PERMISSION_GROUPS = [
  {
    key: 'user',
    label: '用户管理',
    permissions: [
      { key: 'user:read', label: '查看用户' },
      { key: 'user:update', label: '编辑用户' },
      { key: 'user:delete', label: '删除用户' },
      { key: 'user:create', label: '创建用户' },
    ],
  },
  {
    key: 'build',
    label: '构建管理',
    permissions: [
      { key: 'build:read', label: '查看构建' },
      { key: 'build:update', label: '编辑构建' },
      { key: 'build:delete', label: '删除构建' },
      { key: 'build:create', label: '创建构建' },
    ],
  },
  {
    key: 'content',
    label: '内容管理',
    permissions: [
      { key: 'content:read', label: '查看内容' },
      { key: 'content:update', label: '编辑内容' },
      { key: 'content:delete', label: '删除内容' },
      { key: 'content:create', label: '创建内容' },
    ],
  },
  {
    key: 'admin',
    label: '管理员权限',
    permissions: [
      { key: 'admin:access', label: '访问后台' },
      { key: 'admin:users', label: '管理用户' },
      { key: 'admin:settings', label: '系统设置' },
      { key: 'admin:all', label: '所有权限' },
    ],
  },
];

// Protected route helper
export function canAccessAdmin(role?: Role): boolean {
  if (!role) return false;
  return hasPermission(role, 'admin:access') || hasPermission(role, 'admin:all');
}
