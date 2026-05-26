export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joinedAt: string;
  lastActive: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[]; // user ids
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar: string;
  plan: 'free' | 'pro' | 'enterprise';
  members: User[];
  teams: Team[];
  createdAt: string;
  stats: {
    totalModules: number;
    privateModules: number;
    totalDownloads: number;
    activeProjects: number;
  };
}

export interface PrivateModule {
  id: string;
  name: string;
  description: string;
  version: string;
  organizationId: string;
  teamId?: string;
  visibility: 'private' | 'internal' | 'public';
  permissions: {
    read: string[];  // user/team ids
    write: string[];
    admin: string[];
  };
  downloads: number;
  lastUpdated: string;
  size: string;
  tags: string[];
}

export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: '科技汽车',
    slug: 'techauto',
    description: '智能网联汽车核心系统开发团队',
    avatar: 'TA',
    plan: 'enterprise',
    members: [
      { id: 'u1', name: '张工', email: 'zhang@techauto.com', avatar: 'Z', role: 'owner', joinedAt: '2023-01-15', lastActive: '2024-01-20' },
      { id: 'u2', name: '李研发', email: 'li@techauto.com', avatar: 'L', role: 'admin', joinedAt: '2023-02-01', lastActive: '2024-01-19' },
      { id: 'u3', name: '王工程师', email: 'wang@techauto.com', avatar: 'W', role: 'member', joinedAt: '2023-03-10', lastActive: '2024-01-18' },
      { id: 'u4', name: '赵测试', email: 'zhao@techauto.com', avatar: 'Z', role: 'member', joinedAt: '2023-06-20', lastActive: '2024-01-17' },
    ],
    teams: [
      { id: 't1', name: 'MCAL 团队', description: '微控制器驱动开发', members: ['u1', 'u2', 'u3'], createdAt: '2023-01-20' },
      { id: 't2', name: '网络通信', description: 'CAN/LIN 通信层开发', members: ['u2', 'u4'], createdAt: '2023-02-15' },
      { id: 't3', name: '功能安全', description: '功能安全相关模块', members: ['u1', 'u4'], createdAt: '2023-04-01' },
    ],
    createdAt: '2023-01-10',
    stats: {
      totalModules: 24,
      privateModules: 18,
      totalDownloads: 15420,
      activeProjects: 6,
    },
  },
];

export const mockPrivateModules: PrivateModule[] = [
  {
    id: 'pm-1',
    name: 'TechCAN-Pro',
    description: '企业级 CAN 通信组件，支持 CAN FD 和诊断功能',
    version: '3.2.1',
    organizationId: 'org-1',
    teamId: 't2',
    visibility: 'private',
    permissions: { read: ['t2', 'u1'], write: ['u2'], admin: ['u1'] },
    downloads: 3420,
    lastUpdated: '2024-01-15',
    size: '2.4 MB',
    tags: ['CAN', '通信', '企业级'],
  },
  {
    id: 'pm-2',
    name: 'SafeWatch',
    description: '功能安全监控模块，ISO 26262 ASIL-D 等级',
    version: '2.0.0',
    organizationId: 'org-1',
    teamId: 't3',
    visibility: 'internal',
    permissions: { read: ['org-1'], write: ['t3'], admin: ['u1', 'u4'] },
    downloads: 1250,
    lastUpdated: '2024-01-10',
    size: '4.1 MB',
    tags: ['Safety', 'ISO 26262', 'ASIL-D'],
  },
  {
    id: 'pm-3',
    name: 'ADC-Calibration',
    description: 'ADC 自动校准工具库，支持多种校准算法',
    version: '1.5.2',
    organizationId: 'org-1',
    teamId: 't1',
    visibility: 'private',
    permissions: { read: ['t1'], write: ['u3'], admin: ['u1'] },
    downloads: 890,
    lastUpdated: '2024-01-08',
    size: '1.8 MB',
    tags: ['ADC', 'Calibration', 'Tool'],
  },
  {
    id: 'pm-4',
    name: 'DiagUDS-Stack',
    description: 'UDS 诊断协议完整实现',
    version: '4.0.0-beta',
    organizationId: 'org-1',
    visibility: 'internal',
    permissions: { read: ['org-1'], write: ['u2', 'u3'], admin: ['u1'] },
    downloads: 2100,
    lastUpdated: '2024-01-18',
    size: '6.2 MB',
    tags: ['UDS', '诊断', 'ISO 14229'],
  },
];

export const rolePermissions = {
  owner: { canManageOrg: true, canManageMembers: true, canDeleteOrg: true, canManageBilling: true },
  admin: { canManageOrg: true, canManageMembers: true, canDeleteOrg: false, canManageBilling: false },
  member: { canManageOrg: false, canManageMembers: false, canDeleteOrg: false, canManageBilling: false },
  guest: { canManageOrg: false, canManageMembers: false, canDeleteOrg: false, canManageBilling: false },
};

export function getOrgById(id: string): Organization | undefined {
  return mockOrganizations.find(org => org.id === id);
}

export function getModulesByOrg(orgId: string): PrivateModule[] {
  return mockPrivateModules.filter(m => m.organizationId === orgId);
}

export function canUserAccessModule(userId: string, module: PrivateModule, org: Organization): boolean {
  if (module.visibility === 'public') return true;
  if (module.visibility === 'internal') {
    return org.members.some(m => m.id === userId);
  }
  // private
  const user = org.members.find(m => m.id === userId);
  if (!user) return false;
  if (user.role === 'owner' || user.role === 'admin') return true;
  
  return module.permissions.read.includes(userId) ||
    module.permissions.read.some(teamId => 
      org.teams.find(t => t.id === teamId)?.members.includes(userId)
    );
}

export function getPlanLimits(plan: string) {
  const limits: Record<string, { maxMembers: number; maxPrivateModules: number; maxTeams: number }> = {
    free: { maxMembers: 5, maxPrivateModules: 3, maxTeams: 1 },
    pro: { maxMembers: 25, maxPrivateModules: 50, maxTeams: 10 },
    enterprise: { maxMembers: 1000, maxPrivateModules: Infinity, maxTeams: 100 },
  };
  return limits[plan] || limits.free;
}
