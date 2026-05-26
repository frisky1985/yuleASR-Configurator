export interface SSOProvider {
  id: string;
  name: string;
  type: 'wechat_work' | 'dingtalk' | 'ldap' | 'saml';
  icon: string;
  description: string;
  enabled: boolean;
  config?: Record<string, string>;
}

export interface SSOLoginAttempt {
  id: string;
  providerId: string;
  userId?: string;
  userName?: string;
  email?: string;
  status: 'success' | 'failed' | 'pending';
  ip: string;
  userAgent: string;
  timestamp: string;
  errorMessage?: string;
}

export const ssoProviders: SSOProvider[] = [
  {
    id: 'wechat-work',
    name: '企业微信',
    type: 'wechat_work',
    icon: '👥',
    description: '使用企业微信扫码登录',
    enabled: true,
    config: {
      corpId: 'ww***masked***',
      agentId: '1000002',
      callbackUrl: 'https://yuletech.io/auth/wechat-work/callback',
    },
  },
  {
    id: 'dingtalk',
    name: '钉钉',
    type: 'dingtalk',
    icon: '📢',
    description: '使用钉钉扫码登录',
    enabled: true,
    config: {
      appKey: 'ding***masked***',
      callbackUrl: 'https://yuletech.io/auth/dingtalk/callback',
    },
  },
  {
    id: 'ldap',
    name: 'LDAP / Active Directory',
    type: 'ldap',
    icon: '🔐',
    description: '使用企业 LDAP/AD 账号登录',
    enabled: false,
    config: {
      serverUrl: 'ldap://ldap.company.com:389',
      bindDN: 'cn=admin,dc=company,dc=com',
      baseDN: 'ou=users,dc=company,dc=com',
    },
  },
  {
    id: 'saml',
    name: 'SAML 2.0',
    type: 'saml',
    icon: '🔗',
    description: '使用企业 SAML IdP 登录',
    enabled: false,
    config: {
      entityId: 'yuletech-sp',
      ssoUrl: 'https://idp.company.com/saml/sso',
      certificate: '-----BEGIN CERTIFICATE-----\n***\n-----END CERTIFICATE-----',
    },
  },
];

export const mockSSOLogins: SSOLoginAttempt[] = [
  {
    id: 'login-1',
    providerId: 'wechat-work',
    userId: 'u1',
    userName: '张工',
    email: 'zhang@techauto.com',
    status: 'success',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    timestamp: '2024-01-20T09:30:00',
  },
  {
    id: 'login-2',
    providerId: 'dingtalk',
    userId: 'u2',
    userName: '李研发',
    email: 'li@techauto.com',
    status: 'success',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0',
    timestamp: '2024-01-20T08:45:00',
  },
  {
    id: 'login-3',
    providerId: 'ldap',
    status: 'failed',
    ip: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0',
    timestamp: '2024-01-19T17:20:00',
    errorMessage: 'Invalid credentials',
  },
  {
    id: 'login-4',
    providerId: 'wechat-work',
    userId: 'u3',
    userName: '王工程师',
    email: 'wang@techauto.com',
    status: 'success',
    ip: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0',
    timestamp: '2024-01-19T16:00:00',
  },
  {
    id: 'login-5',
    providerId: 'saml',
    status: 'failed',
    ip: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    timestamp: '2024-01-19T14:30:00',
    errorMessage: 'Certificate validation failed',
  },
];

export interface SecurityAudit {
  totalLogins: number;
  successRate: number;
  uniqueUsers: number;
  failedAttempts: number;
  byProvider: Record<string, { success: number; failed: number }>;
  dailyStats: { date: string; success: number; failed: number }[];
}

export function getSecurityAudit(): SecurityAudit {
  const total = mockSSOLogins.length;
  const success = mockSSOLogins.filter(l => l.status === 'success').length;
  const uniqueUsers = new Set(mockSSOLogins.filter(l => l.userId).map(l => l.userId)).size;

  const byProvider: Record<string, { success: number; failed: number }> = {};
  ssoProviders.forEach(p => {
    byProvider[p.id] = { success: 0, failed: 0 };
  });
  mockSSOLogins.forEach(login => {
    if (byProvider[login.providerId]) {
      if (login.status === 'success') {
        byProvider[login.providerId].success++;
      } else {
        byProvider[login.providerId].failed++;
      }
    }
  });

  const dailyStats = [
    { date: '2024-01-16', success: 12, failed: 1 },
    { date: '2024-01-17', success: 15, failed: 0 },
    { date: '2024-01-18', success: 18, failed: 2 },
    { date: '2024-01-19', success: 20, failed: 1 },
    { date: '2024-01-20', success: 8, failed: 0 },
  ];

  return {
    totalLogins: total,
    successRate: Math.round((success / total) * 100),
    uniqueUsers,
    failedAttempts: total - success,
    byProvider,
    dailyStats,
  };
}

export function getProviderIcon(type: string): string {
  const icons: Record<string, string> = {
    wechat_work: '👥',
    dingtalk: '📢',
    ldap: '🔐',
    saml: '🔗',
  };
  return icons[type] || '🔒';
}

export function getProviderLabel(type: string): string {
  const labels: Record<string, string> = {
    wechat_work: '企业微信',
    dingtalk: '钉钉',
    ldap: 'LDAP',
    saml: 'SAML 2.0',
  };
  return labels[type] || type;
}
