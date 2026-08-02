import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

/**
 * 用户管理页面
 * Fix 11: 移除本地 mock 用户列表（假数据 + 假操作按钮），
 * 服务端用户管理 API 尚未实现（Batch C），未实现前显示"功能未开放"，
 * 禁止用本地 mock 冒充真实用户管理。
 */
export const Users: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <ShieldX className="h-12 w-12 text-slate-400 mb-4" />
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        用户管理功能未开放
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">
        用户管理接口正在接入服务端（服务端 API 尚在实现中）。届时管理员可在本页面
        查看与管理社区用户，所有操作将经过服务端鉴权校验。
      </p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        返回仪表盘
      </button>
    </div>
  );
};
