import React, { useState } from 'react';
import { Save, RefreshCw, Database, Shield, Bell, Globe } from 'lucide-react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maxUploadSize: number;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  buildRetentionDays: number;
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'YuleCommunity',
    siteDescription: '嵌入式开发者的开源社区',
    maxUploadSize: 100,
    allowRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false,
    emailNotifications: true,
    buildRetentionDays: 30,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert('设置已保存');
  };

  const SettingSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
    title,
    icon,
    children,
  }) => (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4">
        {icon}
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );

  const InputField: React.FC<{
    label: string;
    type?: string;
    value: string | number;
    onChange: (value: string) => void;
    description?: string;
  }> = ({ label, type = 'text', value, onChange, description }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );

  const ToggleField: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
  }> = ({ label, checked, onChange, description }) => (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">系统设置</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">配置平台的基本参数和功能选项</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          保存设置
        </button>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingSection title="站点信息" icon={<Globe className="h-5 w-5 text-blue-600" />}>
          <InputField
            label="站点名称"
            value={settings.siteName}
            onChange={(value) => setSettings({ ...settings, siteName: value })}
          />
          <InputField
            label="站点描述"
            value={settings.siteDescription}
            onChange={(value) => setSettings({ ...settings, siteDescription: value })}
          />
        </SettingSection>

        <SettingSection title="安全设置" icon={<Shield className="h-5 w-5 text-green-600" />}>
          <ToggleField
            label="允许用户注册"
            checked={settings.allowRegistration}
            onChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
            description="关闭后新用户将无法注册账号"
          />
          <ToggleField
            label="需要邮箱验证"
            checked={settings.requireEmailVerification}
            onChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
            description="新注册用户需要通过邮箱验证才能使用完整功能"
          />
        </SettingSection>

        <SettingSection title="存储设置" icon={<Database className="h-5 w-5 text-purple-600" />}>
          <InputField
            label="最大上传大小 (MB)"
            type="number"
            value={settings.maxUploadSize}
            onChange={(value) => setSettings({ ...settings, maxUploadSize: Number(value) })}
            description="单个文件的最大上传限制"
          />
          <InputField
            label="构建保留天数"
            type="number"
            value={settings.buildRetentionDays}
            onChange={(value) => setSettings({ ...settings, buildRetentionDays: Number(value) })}
            description="超过此天数的构建产物将被自动清理"
          />
        </SettingSection>

        <SettingSection title="通知设置" icon={<Bell className="h-5 w-5 text-orange-600" />}>
          <ToggleField
            label="邮件通知"
            checked={settings.emailNotifications}
            onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            description="向用户发送重要的系统通知邮件"
          />
          <ToggleField
            label="维护模式"
            checked={settings.maintenanceMode}
            onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            description="开启后只有管理员可以访问系统"
          />
        </SettingSection>
      </div>
    </div>
  );
};
