import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Building2,
  Users,
  Lock,
  Package,
  Settings,
  Shield,
  Plus,
  Search,
  MoreVertical,
  Download,
  GitBranch,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import {
  mockOrganizations,
  mockPrivateModules,
  getPlanLimits,
  type PrivateModule,
  type User,
} from '../data/organization';
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

const planColors = {
  free: 'bg-gray-500',
  pro: 'bg-blue-500',
  enterprise: 'bg-purple-500',
};

const planLabels = {
  free: '免费版',
  pro: '专业版',
  enterprise: '企业版',
};

function StatCard({ icon: Icon, label, value, subtext }: { icon: any; label: string; value: string | number; subtext?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
    </div>
  );
}

function MemberCard({ member, isAdmin }: { member: User; isAdmin: boolean }) {
  const roleLabels: Record<string, { label: string; color: string }> = {
    owner: { label: '拥有者', color: 'bg-purple-500/10 text-purple-500' },
    admin: { label: '管理员', color: 'bg-blue-500/10 text-blue-500' },
    member: { label: '成员', color: 'bg-green-500/10 text-green-500' },
    guest: { label: '访客', color: 'bg-gray-500/10 text-gray-500' },
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center text-white font-bold">
        {member.avatar}
      </div>
      <div className="flex-1">
        <div className="font-medium">{member.name}</div>
        <div className="text-sm text-muted-foreground">{member.email}</div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleLabels[member.role].color}`}>
        {roleLabels[member.role].label}
      </span>
      <div className="text-sm text-muted-foreground">
        加入于 {member.joinedAt}
      </div>
      {isAdmin && (
        <button className="p-2 hover:bg-muted rounded-lg">
          <MoreVertical className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function ModuleCard({ module }: { module: PrivateModule }) {
  const visibilityLabels: Record<string, { label: string; icon: any; color: string }> = {
    private: { label: '私有', icon: Lock, color: 'text-red-500' },
    internal: { label: '内部', icon: Users, color: 'text-blue-500' },
    public: { label: '公开', icon: Package, color: 'text-green-500' },
  };

  const vis = visibilityLabels[module.visibility];
  const VisIcon = vis.icon;

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{module.name}</h3>
          <p className="text-sm text-muted-foreground">{module.description}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <VisIcon className={`w-4 h-4 ${vis.color}`} />
          {vis.label}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {module.tags.map(tag => (
          <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <GitBranch className="w-4 h-4" />
            v{module.version}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {module.downloads.toLocaleString()}
          </span>
          <span>{module.size}</span>
        </div>
        <span>更新于 {module.lastUpdated}</span>
      </div>
    </div>
  );
}

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'members' | 'teams'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // 使用演示数据
  const org = mockOrganizations[0];
  const modules = mockPrivateModules;
  const limits = getPlanLimits(org.plan);

  const filteredModules = modules.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 使用统计数据
  const downloadData = [
    { name: '1月', downloads: 1200 },
    { name: '2月', downloads: 1800 },
    { name: '3月', downloads: 2400 },
    { name: '4月', downloads: 2100 },
    { name: '5月', downloads: 3200 },
    { name: '6月', downloads: 3800 },
  ];

  const moduleTypeData = [
    { name: '私有', value: org.stats.privateModules, color: '#ef4444' },
    { name: '内部', value: org.stats.totalModules - org.stats.privateModules, color: '#3b82f6' },
  ];

  const isCurrentUserAdmin = true; // 演示模式

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>组织管理 - {org.name} | YuleTech</title>
      </Helmet>

      {/* Header */}
      <section className="bg-gradient-to-b from-[hsl(var(--primary))]/5 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-white">
                {org.avatar}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{org.name}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${planColors[org.plan]}`}>
                    {planLabels[org.plan]}
                  </span>
                </div>
                <p className="text-muted-foreground">{org.description}</p>
                <p className="text-sm text-muted-foreground mt-1">创建于 {org.createdAt} · {org.members.length} 成员
</p>
              </div>
            </div>
            {isCurrentUserAdmin && (
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Settings className="w-4 h-4" />
                组织设置
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: '概览', icon: Building2 },
              { id: 'modules', label: '私有模块', icon: Package },
              { id: 'members', label: '成员', icon: Users },
              { id: 'teams', label: '团队', icon: Shield },
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Package}
                label="总模块数"
                value={org.stats.totalModules}
                subtext={`${org.stats.privateModules} 个私有`}
              />
              <StatCard
                icon={Download}
                label="总下载量"
                value={org.stats.totalDownloads.toLocaleString()}
                subtext="全部时间"
              />
              <StatCard
                icon={Users}
                label="成员数"
                value={org.members.length}
                subtext={`限制 ${limits.maxMembers}`}
              />
              <StatCard
                icon={TrendingUp}
                label="活跃项目"
                value={org.stats.activeProjects}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">下载趋势</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={downloadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="downloads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">模块分布</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={moduleTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {moduleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {moduleTypeData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Modules */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">最近更新模块</h3>
                <button
                  onClick={() => setActiveTab('modules')}
                  className="text-sm text-primary hover:underline"
                >
                  查看全部 →
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {modules.slice(0, 4).map(module => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索模块..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {isCurrentUserAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  新建模块
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredModules.map(module => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>

            {filteredModules.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">没有找到符合条件的模块</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索成员..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {isCurrentUserAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  邀请成员
                </button>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {org.members.length} / {limits.maxMembers} 成员
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(org.members.length / limits.maxMembers) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {org.members.map(member => (
                <MemberCard key={member.id} member={member} isAdmin={isCurrentUserAdmin} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {org.teams.length} 个团队 · 限制 {limits.maxTeams}
              </p>
              {isCurrentUserAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  创建团队
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {org.teams.map(team => (
                <div
                  key={team.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.members.length} 成员</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 3).map((memberId, i) => {
                        const member = org.members.find(m => m.id === memberId);
                        return member ? (
                          <div
                            key={memberId}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center text-xs font-bold text-white border-2 border-card"
                            style={{ zIndex: 3 - i }}
                          >
                            {member.avatar}
                          </div>
                        ) : null;
                      })}
                      {team.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-card">
                          +{team.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      创建于 {team.createdAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
