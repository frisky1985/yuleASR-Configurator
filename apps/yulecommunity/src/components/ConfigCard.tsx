import { useState, useEffect } from 'react';
import { Settings, Cpu, Calendar, Eye, ExternalLink } from 'lucide-react';

// ── Types ──

export interface ConfigSummary {
  id: string;
  name: string;
  description?: string;
  moduleCount: number;
  updatedAt: string;
  targetPlatform?: string;
  targetChip?: string;
}

// ── Props ──

interface ConfigCardProps {
  configId: string;
  /** Optional pre-fetched data; if not provided, component fetches from API */
  config?: ConfigSummary;
  /** Compact mode (smaller, for inline use) */
  compact?: boolean;
}

// ── Component ──

export function ConfigCard({ configId, config: preloadedConfig, compact }: ConfigCardProps) {
  const [config, setConfig] = useState<ConfigSummary | null>(preloadedConfig ?? null);
  const [loading, setLoading] = useState(!preloadedConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preloadedConfig) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Try fetching from API
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/configs/${configId}`)
      .then(res => {
        if (!res.ok) throw new Error('配置不存在');
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        const configData = data.data || data;
        setConfig({
          id: configData.id,
          name: configData.name,
          description: configData.description,
          moduleCount: configData.modules?.length ?? configData.moduleCount ?? 0,
          updatedAt: configData.updatedAt ?? configData.updated_at,
          targetPlatform: configData.targetPlatform ?? configData.target_platform,
          targetChip: configData.targetChip ?? configData.target_chip,
        });
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || '加载配置失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [configId, preloadedConfig]);

  // ── Loading state ──
  if (loading) {
    return (
      <div
        className={`border border-border rounded-xl bg-card p-4 animate-pulse ${compact ? 'max-w-md' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !config) {
    return (
      <div className={`border border-border rounded-xl bg-card p-4 ${compact ? 'max-w-md' : ''}`}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Settings className="w-5 h-5" />
          <div className="text-sm">
            <p className="font-medium">配置不可用</p>
            <p className="text-xs mt-0.5">{error || '配置数据加载失败'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Time formatting ──
  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    if (isNaN(date)) return dateStr;
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <a
      href={`/configurator/editor/${config.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border border-border rounded-xl bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 group ${
        compact ? 'max-w-md' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
            <Settings className="w-5 h-5 text-primary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {config.name}
              </h4>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>

            {config.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {config.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                {config.moduleCount} 个模块
              </span>

              {config.targetChip && (
                <span className="inline-flex items-center gap-1">{config.targetChip}</span>
              )}

              {config.targetPlatform && (
                <span className="inline-flex items-center gap-1">{config.targetPlatform}</span>
              )}

              {config.updatedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {timeAgo(config.updatedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Arrow indicator (desktop) */}
          <div className="hidden sm:flex items-center text-muted-foreground group-hover:text-primary transition-colors">
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
