import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Activity,
  Hammer,
  Bookmark,
  Award,
  Edit2,
  Save,
  X,
  Ban,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface UserDetail {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'vip' | 'admin' | 'super_admin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  github?: string;
  skills: string[];
}

interface UserStats {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  totalBookmarks: number;
  totalPoints: number;
  level: number;
  levelTitle: string;
}

const mockUser: UserDetail = {
  id: '1',
  username: 'zhangsan',
  email: 'zhangsan@example.com',
  role: 'user',
  status: 'active',
  createdAt: '2025-01-20T10:00:00Z',
  lastLoginAt: '2025-01-28T15:30:00Z',
  bio: '嵌入式软件工程师，专注于 AutoSAR 开发',
  location: '北京',
  company: '予乐科技',
  website: 'https://zhangsan.dev',
  github: 'zhangsan',
  skills: ['C', 'AutoSAR', 'STM32', 'CAN'],
};

const mockStats: UserStats = {
  totalBuilds: 45,
  successfulBuilds: 38,
  failedBuilds: 7,
  totalBookmarks: 12,
  totalPoints: 1250,
  level: 3,
  levelTitle: '工程师',
};

const mockBuilds = [
  { id: '1', name: 'STM32-GCC-Build', platform: 'STM32', status: 'success', createdAt: '2025-01-28 15:30' },
  { id: '2', name: 'ESP32-IDF-Release', platform: 'ESP32', status: 'running', createdAt: '2025-01-28 15:15' },
  { id: '3', name: 'Arduino-Sensor-Lib', platform: 'Arduino', status: 'failed', createdAt: '2025-01-28 14:45' },
  { id: '4', name: 'Raspberry-Pi-Driver', platform: 'RaspberryPi', status: 'success', createdAt: '2025-01-28 14:00' },
];

const mockBookmarks = [
  { id: '1', title: 'AutoSAR BSW 分层架构详解', category: '架构设计', bookmarkedAt: '2025-01-27' },
  { id: '2', title: 'CAN 协议在 AutoSAR 中的配置', category: '通信', bookmarkedAt: '2025-01-26' },
  { id: '3', title: 'NXP S32K3 MCAL 配置指南', category: 'MCAL', bookmarkAt: '2025-01-25' },
];

const ROLE_LABELS: Record<string, string> = {
  user: '普通用户',
  vip: 'VIP',
  admin: '管理员',
  super_admin: '超级管理员',
};

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  vip: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserDetail>(mockUser);
  const [stats, setStats] = useState<UserStats>(mockStats);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserDetail>(mockUser);
  const [activeTab, setActiveTab] = useState<'info' | 'builds' | 'bookmarks' | 'points'>('info');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 实际项目中这里会调用 API 获取用户详情
    setIsLoading(true);
    setTimeout(() => {
      setUser(mockUser);
      setEditedUser(mockUser);
      setStats(mockStats);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleSave = async () => {
    setIsLoading(true);
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(editedUser);
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!window.confirm(`确定要${newStatus === 'active' ? '启用' : '禁用'}该用户吗？`)) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser({ ...user, status: newStatus });
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除该用户吗？此操作不可恢复！')) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigate('/admin/users');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const tabs = [
    { key: 'info', label: '基本信息', icon: User },
    { key: 'builds', label: '构建历史', icon: Hammer },
    { key: 'bookmarks', label: '收藏', icon: Bookmark },
    { key: 'points', label: '积分', icon: Award },
  ];

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
            返回
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            用户详情
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                保存
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Edit2 className="h-4 w-4" />
              编辑
            </button>
          )}
        </div>
      </div>

      {/* User Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.username[0].toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user.username}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {user.status === 'active' ? '正常' : '禁用'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>注册于 {formatDate(user.createdAt).split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Activity className="h-4 w-4" />
                <span>最后登录 {formatDate(user.lastLoginAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {user.status === 'active' ? (
              <button
                onClick={() => handleStatusChange('inactive')}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              >
                <Ban className="h-4 w-4" />
                禁用
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <CheckCircle className="h-4 w-4" />
                启用
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    角色
                  </label>
                  <select
                    value={editedUser.role}
                    onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <option value="user">普通用户</option>
                    <option value="vip">VIP</option>
                    <option value="admin">管理员</option>
                    <option value="super_admin">超级管理员</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    公司
                  </label>
                  <input
                    type="text"
                    value={editedUser.company || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, company: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    位置
                  </label>
                  <input
                    type="text"
                    value={editedUser.location || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    个人网站
                  </label>
                  <input
                    type="text"
                    value={editedUser.website || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, website: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    简介
                  </label>
                  <textarea
                    value={editedUser.bio || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    技能标签（逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={editedUser.skills.join(', ')}
                    onChange={(e) => setEditedUser({ ...editedUser, skills: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    placeholder="C, AutoSAR, STM32"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    用户名
                  </label>
                  <p className="text-slate-900 dark:text-white">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    邮箱
                  </label>
                  <p className="text-slate-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    角色
                  </label>
                  <p className="text-slate-900 dark:text-white">{ROLE_LABELS[user.role]}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    公司
                  </label>
                  <p className="text-slate-900 dark:text-white">{user.company || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    位置
                  </label>
                  <p className="text-slate-900 dark:text-white">{user.location || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    个人网站
                  </label>
                  <p className="text-slate-900 dark:text-white">
                    {user.website ? (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    ) : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    简介
                  </label>
                  <p className="text-slate-900 dark:text-white">{user.bio || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    技能
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {user.skills.length === 0 && '-'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'builds' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">总构建</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBuilds}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-600 dark:text-green-400">成功</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.successfulBuilds}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">失败</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.failedBuilds}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">成功率</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {Math.round((stats.successfulBuilds / stats.totalBuilds) * 100)}%
                </p>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 text-sm font-medium text-slate-500 dark:text-slate-400">构建名称</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-500 dark:text-slate-400">平台</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-500 dark:text-slate-400">状态</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-500 dark:text-slate-400">时间</th>
                </tr>
              </thead>
              <tbody>
                {mockBuilds.map((build) => (
                  <tr key={build.id} className="border-b border-slate-100 dark:border-slate-800/50">
                    <td className="py-3 text-sm text-slate-900 dark:text-white">{build.name}</td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400">{build.platform}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        build.status === 'success'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : build.status === 'running'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {build.status === 'success' ? '成功' : build.status === 'running' ? '运行中' : '失败'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400">{build.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              共收藏 {stats.totalBookmarks} 篇文章
            </p>
            <div className="space-y-3">
              {mockBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">{bookmark.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {bookmark.category} · 收藏于 {bookmark.bookmarkedAt}
                    </p>
                  </div>
                  <a
                    href={`/blog/${bookmark.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    查看
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">当前等级</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">Lv.{stats.level}</span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                    {stats.levelTitle}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">总积分</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-80 mb-2">等级进度</p>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-sm mt-2 opacity-80">距离下一等级还需 350 积分</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
