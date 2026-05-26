import React from 'react';
import { Users, Hammer, FileText, HardDrive } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';

interface DashboardStats {
  users: { total: number; today: number; active: number };
  builds: { total: number; today: number; successRate: number };
  articles: { total: number; pending: number };
  storage: { used: number; total: number };
}

interface RecentUser {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface RecentBuild {
  id: string;
  name: string;
  platform: string;
  status: 'success' | 'failed' | 'running';
  createdAt: string;
}

const mockStats: DashboardStats = {
  users: { total: 1234, today: 12, active: 856 },
  builds: { total: 5678, today: 45, successRate: 94.5 },
  articles: { total: 234, pending: 5 },
  storage: { used: 45.2, total: 100 },
};

const mockRecentUsers: RecentUser[] = [
  { id: '1', username: 'zhangsan', email: 'zhangsan@example.com', status: 'active', createdAt: '2025-01-28 14:30' },
  { id: '2', username: 'lisi', email: 'lisi@example.com', status: 'active', createdAt: '2025-01-28 12:15' },
  { id: '3', username: 'wangwu', email: 'wangwu@example.com', status: 'inactive', createdAt: '2025-01-28 10:45' },
  { id: '4', username: 'zhaoliu', email: 'zhaoliu@example.com', status: 'active', createdAt: '2025-01-28 09:20' },
  { id: '5', username: 'qianqi', email: 'qianqi@example.com', status: 'active', createdAt: '2025-01-28 08:00' },
];

const mockRecentBuilds: RecentBuild[] = [
  { id: '1', name: 'STM32-GCC-Build', platform: 'STM32', status: 'success', createdAt: '2025-01-28 15:30' },
  { id: '2', name: 'ESP32-IDF-Release', platform: 'ESP32', status: 'running', createdAt: '2025-01-28 15:15' },
  { id: '3', name: 'Arduino-Sensor-Lib', platform: 'Arduino', status: 'failed', createdAt: '2025-01-28 14:45' },
  { id: '4', name: 'Raspberry-Pi-Driver', platform: 'RaspberryPi', status: 'success', createdAt: '2025-01-28 14:00' },
  { id: '5', name: 'PIC18F-Bootloader', platform: 'PIC', status: 'success', createdAt: '2025-01-28 13:30' },
];

export const Dashboard: React.FC = () => {
  const [loading] = React.useState(false);

  const userColumns = [
    { key: 'username', title: '用户名' },
    { key: 'email', title: '邮箱' },
    {
      key: 'status',
      title: '状态',
      render: (record: RecentUser) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            record.status === 'active'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {record.status === 'active' ? '正常' : '禁用'}
        </span>
      ),
    },
    { key: 'createdAt', title: '注册时间', align: 'right' as const },
  ];

  const buildColumns = [
    { key: 'name', title: '构建名称' },
    { key: 'platform', title: '平台' },
    {
      key: 'status',
      title: '状态',
      render: (record: RecentBuild) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            record.status === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : record.status === 'failed'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 animate-pulse'
          }`}
        >
          {record.status === 'success' ? '成功' : record.status === 'failed' ? '失败' : '运行中'}
        </span>
      ),
    },
    { key: 'createdAt', title: '创建时间', align: 'right' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总用户数"
          value={mockStats.users.total.toLocaleString()}
          change="12"
          changeType="positive"
          icon={Users}
          iconBgColor="bg-blue-100 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          loading={loading}
        />
        <StatCard
          title="今日构建"
          value={mockStats.builds.today}
          change="5"
          changeType="positive"
          icon={Hammer}
          iconBgColor="bg-green-100 dark:bg-green-900/20"
          iconColor="text-green-600 dark:text-green-400"
          loading={loading}
        />
        <StatCard
          title="文章总数"
          value={mockStats.articles.total}
          change="3"
          changeType="neutral"
          icon={FileText}
          iconBgColor="bg-purple-100 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          loading={loading}
        />
        <StatCard
          title="存储使用"
          value={`${mockStats.storage.used}GB`}
          change={`${mockStats.storage.total}GB 总量`}
          changeType="neutral"
          icon={HardDrive}
          iconBgColor="bg-orange-100 dark:bg-orange-900/20"
          iconColor="text-orange-600 dark:text-orange-400"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Build Trends */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">构建趋势</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">近7天</span>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {[65, 78, 52, 89, 76, 94, 45].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-blue-500/20 dark:bg-blue-500/30 relative overflow-hidden"
                  style={{ height: `${value}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500"
                    style={{ height: '100%' }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {['01-22', '01-23', '01-24', '01-25', '01-26', '01-27', '01-28'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">系统状态</h3>
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              运行中
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">CPU 使用率</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">32%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '32%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">内存使用率</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">58%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '58%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">磁盘使用率</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">45%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">网络 IO</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">12 MB/s</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">最近注册用户</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              查看全部 →
            </button>
          </div>
          <DataTable columns={userColumns} data={mockRecentUsers} />
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">最近构建任务</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              查看全部 →
            </button>
          </div>
          <DataTable columns={buildColumns} data={mockRecentBuilds} />
        </div>
      </div>
    </div>
  );
};
