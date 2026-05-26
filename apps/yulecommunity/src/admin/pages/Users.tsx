import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'vip';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: '1', username: 'zhangsan', email: 'zhangsan@example.com', role: 'user', status: 'active', createdAt: '2025-01-20', lastLogin: '2025-01-28' },
  { id: '2', username: 'lisi', email: 'lisi@example.com', role: 'vip', status: 'active', createdAt: '2025-01-18', lastLogin: '2025-01-27' },
  { id: '3', username: 'wangwu', email: 'wangwu@example.com', role: 'user', status: 'inactive', createdAt: '2025-01-15', lastLogin: '2025-01-20' },
  { id: '4', username: 'zhaoliu', email: 'zhaoliu@example.com', role: 'admin', status: 'active', createdAt: '2025-01-10', lastLogin: '2025-01-28' },
  { id: '5', username: 'qianqi', email: 'qianqi@example.com', role: 'user', status: 'active', createdAt: '2025-01-08', lastLogin: '2025-01-26' },
  { id: '6', username: 'sunba', email: 'sunba@example.com', role: 'user', status: 'active', createdAt: '2025-01-05', lastLogin: '2025-01-25' },
  { id: '7', username: 'zhoujiu', email: 'zhoujiu@example.com', role: 'vip', status: 'active', createdAt: '2025-01-01', lastLogin: '2025-01-28' },
];

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    { key: 'username', title: '用户名' },
    { key: 'email', title: '邮箱' },
    {
      key: 'role',
      title: '角色',
      render: (record: User) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            record.role === 'admin'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : record.role === 'vip'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
          }`}
        >
          {record.role === 'admin' ? '管理员' : record.role === 'vip' ? 'VIP' : '普通用户'}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (record: User) => (
        <span
          className={`inline-flex items-center gap-1.5 text-sm ${
            record.status === 'active'
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              record.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {record.status === 'active' ? '正常' : '禁用'}
        </span>
      ),
    },
    { key: 'createdAt', title: '注册时间', align: 'right' as const },
    { key: 'lastLogin', title: '最后登录', align: 'right' as const },
    {
      key: 'actions',
      title: '操作',
      align: 'center' as const,
      width: '100px',
      render: (record: User) => (
        <div className="flex items-center justify-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={record.status === 'active' ? '禁用' : '启用'}
          >
            {record.status === 'active' ? (
              <Ban className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
            placeholder="搜索用户名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-4 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">所有角色</option>
            <option value="admin">管理员</option>
            <option value="vip">VIP</option>
            <option value="user">普通用户</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">所有状态</option>
            <option value="active">正常</option>
            <option value="inactive">禁用</option>
          </select>
        </div>

        {selectedKeys.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">已选择 {selectedKeys.length} 项</span>
            <button className="h-10 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
              批量禁用
            </button>
            <button className="h-10 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          rowKey: (record) => record.id,
        }}
        onRowClick={(record) => navigate(`/admin/users/${record.id}`)}
        pagination={{
          current: 1,
          pageSize: 10,
          total: filteredUsers.length,
          onChange: () => {},
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
        }}
      />
    </div>
  );
};
