import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Settings,
  Search,
  Filter,
} from 'lucide-react';
import {
  ssoProviders,
  mockSSOLogins,
  getSecurityAudit,
  type SSOProvider,
  type SSOLoginAttempt,
} from '../data/sso';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function ProviderCard({
  provider,
  onToggle,
  onConfigure,
}: {
  provider: SSOProvider;
  onToggle: (id: string) => void;
  onConfigure: (provider: SSOProvider) => void;
}) {
  return (
    <div className={`bg-card border rounded-xl p-5 transition-colors ${
      provider.enabled ? 'border-primary/30' : 'border-border'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{provider.icon}</div>
          <div>
            <h3 className="font-bold">{provider.name}</h3>
            <p className="text-sm text-muted-foreground">{provider.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onConfigure(provider)}
            className="p-2 hover:bg-muted rounded-lg"
            title="配置"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(provider.id)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              provider.enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              provider.enabled ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {provider.enabled && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle className="w-4 h-4" />
            <span>已启用</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginAttemptRow({ attempt }: { attempt: SSOLoginAttempt }) {
  const provider = ssoProviders.find(p => p.id === attempt.providerId);

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span>{provider?.icon}</span>
          <span>{provider?.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        {attempt.userName ? (
          <div>
            <div className="font-medium">{attempt.userName}</div>
            <div className="text-sm text-muted-foreground">{attempt.email}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          attempt.status === 'success'
            ? 'bg-green-500/10 text-green-500'
            : attempt.status === 'failed'
            ? 'bg-red-500/10 text-red-500'
            : 'bg-yellow-500/10 text-yellow-500'
        }`}>
          {attempt.status === 'success' ? (
            <CheckCircle className="w-3 h-3" />
          ) : attempt.status === 'failed' ? (
            <XCircle className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {attempt.status === 'success' ? '成功' : attempt.status === 'failed' ? '失败' : '进行中'}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{attempt.ip}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {new Date(attempt.timestamp).toLocaleString('zh-CN')}
      </td>
      <td className="py-3 px-4 text-sm text-red-500">
        {attempt.errorMessage || '-'}
      </td>
    </tr>
  );
}

export function SSOPage() {
  const [activeTab, setActiveTab] = useState<'providers' | 'audit' | 'logs'>('providers');
  const [searchQuery, setSearchQuery] = useState('');

  const audit = getSecurityAudit();

  const providerStats = Object.entries(audit.byProvider).map(([id, stats]) => {
    const provider = ssoProviders.find(p => p.id === id);
    return {
      name: provider?.name || id,
      success: stats.success,
      failed: stats.failed,
    };
  });

  const statusData = [
    { name: '成功', value: audit.totalLogins - audit.failedAttempts, color: '#22c55e' },
    { name: '失败', value: audit.failedAttempts, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>SSO 集成 - 单点登录管理 | YuleTech</title>
      </Helmet>

      {/* Header */}
      <section className="bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              企业级安全
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              SSO 单点登录
              <span className="text-gradient-accent"> 集成</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              支持企业微信、钉钉、LDAP/AD、SAML 2.0 等多种身份提供商，
              实现企业内部统一认证。
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'providers', label: '身份提供商', icon: Shield },
              { id: 'audit', label: '安全审计', icon: AlertTriangle },
              { id: 'logs', label: '登录日志', icon: Clock },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'providers' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ssoProviders.map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onToggle={(id) => console.log('Toggle', id)}
                  onConfigure={(p) => console.log('Configure', p.id)}
                />
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">快速配置指南</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">选择身份提供商</h4>
                    <p className="text-sm text-muted-foreground">根据企业已有的认证系统选择合适的提供商类型</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">配置认证参数</h4>
                    <p className="text-sm text-muted-foreground">填写提供商分配的应用 ID、密钥等信息</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">测试登录</h4>
                    <p className="text-sm text-muted-foreground">使用测试账号验证登录流程是否正常</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">{audit.totalLogins}</div>
                <div className="text-sm text-muted-foreground">总登录次数</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-500">{audit.successRate}%</div>
                <div className="text-sm text-muted-foreground">成功率</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-500">{audit.uniqueUsers}</div>
                <div className="text-sm text-muted-foreground">独立用户</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-500">{audit.failedAttempts}</div>
                <div className="text-sm text-muted-foreground">失败次数</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">登录统计</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={audit.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="success" name="成功" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" name="失败" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">状态分布</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Provider Breakdown */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">按提供商统计</h3>
              <div className="space-y-3">
                {providerStats.map(stat => (
                  <div key={stat.name} className="flex items-center justify-between py-2">
                    <span>{stat.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-green-500">{stat.success} 成功</span>
                      <span className="text-red-500">{stat.failed} 失败</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索日志..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted">
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">提供商</th>
                    <th className="text-left py-3 px-4 font-medium">用户</th>
                    <th className="text-left py-3 px-4 font-medium">状态</th>
                    <th className="text-left py-3 px-4 font-medium">IP 地址</th>
                    <th className="text-left py-3 px-4 font-medium">时间</th>
                    <th className="text-left py-3 px-4 font-medium">错误信息</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSSOLogins.map(attempt => (
                    <LoginAttemptRow key={attempt.id} attempt={attempt} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
