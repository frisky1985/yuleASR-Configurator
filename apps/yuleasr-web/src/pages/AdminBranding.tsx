/**
 * AdminBranding — OEM White-Label Brand Settings Management Page
 * Only accessible by admin users.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBrand, type BrandSettings } from '@/contexts/BrandContext';
import { api, ApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export function AdminBranding() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { brand: loadedBrand, loading: brandLoading } = useBrand();

  // ── State ──────────────────────────────────────────────────────────────

  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#2563EB',
    secondaryColor: '#6366F1',
    accentColor: '#06B6D4',
    companyName: '',
    supportEmail: '',
    termsUrl: '',
    privacyUrl: '',
    customDomain: '',
    emailTemplateHeader: '',
    emailTemplateFooter: '',
    allowedDomains: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // ── Load existing settings ─────────────────────────────────────────────

  useEffect(() => {
    // Redirect non-admin users
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (loadedBrand) {
      setForm({
        name: loadedBrand.name || '',
        logoUrl: loadedBrand.logoUrl || '',
        faviconUrl: loadedBrand.faviconUrl || '',
        primaryColor: loadedBrand.primaryColor || '#2563EB',
        secondaryColor: loadedBrand.secondaryColor || '#6366F1',
        accentColor: loadedBrand.accentColor || '#06B6D4',
        companyName: loadedBrand.companyName || '',
        supportEmail: loadedBrand.supportEmail || '',
        termsUrl: loadedBrand.termsUrl || '',
        privacyUrl: loadedBrand.privacyUrl || '',
        customDomain: loadedBrand.customDomain || '',
        emailTemplateHeader: loadedBrand.emailTemplateHeader || '',
        emailTemplateFooter: loadedBrand.emailTemplateFooter || '',
        allowedDomains: loadedBrand.allowedDomains?.join('\n') || '',
      });
      setLogoPreview(loadedBrand.logoUrl);
    }
  }, [loadedBrand]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Real-time CSS preview
    applyLivePreview({ ...form, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '请上传图片文件' });
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: '图片大小不能超过 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      setForm(prev => ({ ...prev, logoUrl: base64 }));
      applyLivePreview({ ...form, logoUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: form.name,
        logoUrl: form.logoUrl || null,
        faviconUrl: form.faviconUrl || null,
        primaryColor: form.primaryColor || null,
        secondaryColor: form.secondaryColor || null,
        accentColor: form.accentColor || null,
        companyName: form.companyName || null,
        supportEmail: form.supportEmail || null,
        termsUrl: form.termsUrl || null,
        privacyUrl: form.privacyUrl || null,
        customDomain: form.customDomain || null,
        emailTemplateHeader: form.emailTemplateHeader || null,
        emailTemplateFooter: form.emailTemplateFooter || null,
        allowedDomains: form.allowedDomains
          ? form.allowedDomains
              .split('\n')
              .map(d => d.trim())
              .filter(Boolean)
          : [],
      };

      await api.put('/api/branding', payload);
      setMessage({ type: 'success', text: '品牌设置已保存！' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '保存失败，请重试';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (brandLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">加载品牌设置...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">OEM 品牌定制</h1>
        <p className="text-muted-foreground mt-1">配置白标品牌设置，将 yuleASR 贴牌为您内部工具</p>
      </div>

      {/* ── Message ────────────────────────────────────────────────── */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Settings Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">品牌名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              placeholder="例如：Awesome OEM Tools"
            />
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">公司名称</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => updateField('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="公司名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">支持邮箱</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={e => updateField('supportEmail', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="support@company.com"
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">品牌颜色</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">主色</label>
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={e => updateField('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={e => updateField('primaryColor', e.target.value)}
                  className="w-24 px-2 py-1 text-xs border border-border rounded bg-background text-foreground font-mono"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">次要色</label>
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={e => updateField('secondaryColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={e => updateField('secondaryColor', e.target.value)}
                  className="w-24 px-2 py-1 text-xs border border-border rounded bg-background text-foreground font-mono"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">强调色</label>
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="w-24 px-2 py-1 text-xs border border-border rounded bg-background text-foreground font-mono"
                />
              </div>
            </div>
          </div>

          {/* Logo / Favicon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Logo (上传图片或输入 URL)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--brand-primary)] file:text-white hover:file:opacity-90"
              />
              <input
                type="text"
                value={form.logoUrl}
                onChange={e => {
                  setForm(prev => ({ ...prev, logoUrl: e.target.value }));
                  setLogoPreview(e.target.value || null);
                }}
                className="w-full mt-2 px-3 py-2 text-xs border border-border rounded-lg bg-background text-foreground"
                placeholder="或粘贴 Logo URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Favicon URL</label>
              <input
                type="text"
                value={form.faviconUrl}
                onChange={e => updateField('faviconUrl', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">服务条款 URL</label>
              <input
                type="text"
                value={form.termsUrl}
                onChange={e => updateField('termsUrl', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="https://example.com/terms"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">隐私政策 URL</label>
              <input
                type="text"
                value={form.privacyUrl}
                onChange={e => updateField('privacyUrl', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                placeholder="https://example.com/privacy"
              />
            </div>
          </div>

          {/* Custom Domain */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">自定义域名</label>
            <input
              type="text"
              value={form.customDomain}
              onChange={e => updateField('customDomain', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              placeholder="brand.yourcompany.com"
            />
          </div>

          {/* Allowed Domains */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              允许的 SSO 域名（每行一个）
            </label>
            <textarea
              value={form.allowedDomains}
              onChange={e => updateField('allowedDomains', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] font-mono text-sm"
              placeholder="company.com&#10;subsidiary.com"
            />
          </div>

          {/* Email Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                邮件模板 Header
              </label>
              <textarea
                value={form.emailTemplateHeader}
                onChange={e => updateField('emailTemplateHeader', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                placeholder="邮件头部 HTML（可选）"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                邮件模板 Footer
              </label>
              <textarea
                value={form.emailTemplateFooter}
                onChange={e => updateField('emailTemplateFooter', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                placeholder="邮件底部 HTML（可选）"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-brand-primary px-6 py-2.5 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存品牌设置'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="btn-brand-outline px-6 py-2.5"
            >
              {previewMode ? '关闭预览' : '实时预览'}
            </button>
          </div>
        </form>

        {/* ── Preview Panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <h3 className="text-sm font-medium text-foreground">预览</h3>

            <div
              className="rounded-xl border border-border p-6 space-y-4"
              style={{
                backgroundColor: 'var(--app-bg-primary)',
              }}
            >
              {/* Logo Preview */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{
                    backgroundColor: form.primaryColor,
                    backgroundImage: logoPreview ? `url(${logoPreview})` : undefined,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  {!logoPreview && (
                    <span className="flex items-center justify-center w-full h-full text-white font-bold text-sm">
                      {form.name.charAt(0).toUpperCase() || 'Y'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {form.companyName || form.name || 'yuleASR'}
                  </div>
                  <div className="text-xs text-muted-foreground">BSW Configurator</div>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: form.primaryColor }} />
                  <span className="text-xs text-muted-foreground">主色</span>
                  <span className="text-xs font-mono text-foreground ml-auto">
                    {form.primaryColor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: form.secondaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">次要色</span>
                  <span className="text-xs font-mono text-foreground ml-auto">
                    {form.secondaryColor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: form.accentColor }} />
                  <span className="text-xs text-muted-foreground">强调色</span>
                  <span className="text-xs font-mono text-foreground ml-auto">
                    {form.accentColor}
                  </span>
                </div>
              </div>

              {/* Button Preview */}
              <div className="space-y-2">
                <button
                  className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  {form.name || 'yuleASR'} 按钮
                </button>
                <button
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium"
                  style={{
                    color: form.primaryColor,
                    border: `1px solid ${form.primaryColor}`,
                    backgroundColor: 'transparent',
                  }}
                >
                  次要按钮
                </button>
              </div>

              {/* Support */}
              {form.supportEmail && (
                <div className="text-xs text-muted-foreground">支持邮箱：{form.supportEmail}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Live preview helper — applies CSS vars directly to root for real-time preview
 */
function applyLivePreview(form: typeof defaultForm) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', form.primaryColor || '#2563EB');
  root.style.setProperty('--brand-secondary', form.secondaryColor || '#6366F1');
  root.style.setProperty('--brand-accent', form.accentColor || '#06B6D4');
  root.style.setProperty('--brand-logo-url', form.logoUrl ? `url(${form.logoUrl})` : 'none');
  root.style.setProperty('--brand-company-name', `"${form.companyName || form.name}"`);
}

const defaultForm = {
  name: '',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#2563EB',
  secondaryColor: '#6366F1',
  accentColor: '#06B6D4',
  companyName: '',
  supportEmail: '',
  termsUrl: '',
  privacyUrl: '',
  customDomain: '',
  emailTemplateHeader: '',
  emailTemplateFooter: '',
  allowedDomains: '',
};
