import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, XCircle, Clock } from 'lucide-react';
import { DataTable } from '../components/DataTable';

interface Build {
  id: string;
  name: string;
  platform: string;
  version: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  progress?: number;
  duration: string;
  createdAt: string;
  author: string;
}

const mockBuilds: Build[] = [
  { id: '1', name: 'STM32-GCC-Build', platform: 'STM32', version: 'v2.1.0', status: 'success', duration: '2m 34s', createdAt: '2025-01-28 15:30', author: 'zhangsan' },
  { id: '2', name: 'ESP32-IDF-Release', platform: 'ESP32', version: 'v1.5.0', status: 'running', progress: 65, duration: '4m 12s', createdAt: '2025-01-28 15:15', author: 'lisi' },
  { id: '3', name: 'Arduino-Sensor-Lib', platform: 'Arduino', version: 'v0.8.2', status: 'failed', duration: '1m 45s', createdAt: '2025-01-28 14:45', author: 'wangwu' },
  { id: '4', name: 'Raspberry-Pi-Driver', platform: 'RaspberryPi', version: 'v3.0.1', status: 'success', duration: '8m 22s', createdAt: '2025-01-28 14:00', author: 'zhaoliu' },
  { id: '5', name: 'PIC18F-Bootloader', platform: 'PIC', version: 'v1.0.0', status: 'pending', duration: '-', createdAt: '2025-01-28 13:30', author: 'qianqi' },
  { id: '6', name: 'AVR-Toolchain', platform: 'AVR', version: 'v2.0.0', status: 'cancelled', duration: '0m 30s', createdAt: '2025-01-28 13:00', author: 'sunba' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_LABELS = {
  pending: '等待中',
  running: '运行中',
  success: '成功',
  failed: '失败',
  cancelled: '已取消',
};

export const Builds: React.FC = () => {
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBuilds = mockBuilds.filter((build) => {
    const matchesSearch =
      build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || build.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || build.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const columns = [
    { key: 'name', title: '构建名称' },
    { key: 'platform', title: '平台' },
    { key: 'version', title: '版本' },
    {
      key: 'status',
      title: '状态',
      render: (record: Build) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUS_COLORS[record.status]
            }`}
          >
            {record.status === 'running' && (
              <RefreshCw className="h-3 w-3 animate-spin" />
            )}
            {record.status === 'pending' && (
              <Clock className="h-3 w-3" />
            )}
            {STATUS_LABELS[record.status]}
          </span>
          {record.status === 'running' && record.progress && (
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${record.progress}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
    { key: 'duration', title: '耗时', align: 'right' as const },
    { key: 'author', title: '创建者' },
    { key: 'createdAt', title: '创建时间', align: 'right' as const },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: '120px',
      render: (record: Build) => (
        <div className="flex items-center justify-center gap-1">
          {record.status === 'failed' && (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="重新构建"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {(record.status === 'pending' || record.status === 'running') && (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="取消"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索构建名称或创建者..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-4 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">所有平台</option>
            <option value="STM32">STM32</option>
            <option value="ESP32">ESP32</option>
            <option value="Arduino">Arduino</option>
            <option value="RaspberryPi">RaspberryPi</option>
            <option value="PIC">PIC</option>
            <option value="AVR">AVR</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">所有状态</option>
            <option value="pending">等待中</option>
            <option value="running">运行中</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        {selectedKeys.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">已选择 {selectedKeys.length} 项</span>
            <button className="h-10 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
              批量取消
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredBuilds}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          rowKey: (record) => record.id,
        }}
        onRowClick={(record) => navigate(`/admin/builds/${record.id}`)}
        pagination={{
          current: 1,
          pageSize: 10,
          total: filteredBuilds.length,
          onChange: () => {},
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
        }}
      />
    </div>
  );
};
