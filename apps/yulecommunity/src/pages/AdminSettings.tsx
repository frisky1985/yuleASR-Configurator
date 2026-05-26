import { useState, useCallback } from 'react';
import { Save, Trash2, Download, AlertTriangle, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  DEFAULT_ACTION_POINTS,
  DEFAULT_LEVEL_THRESHOLDS,
  type PointsAction,
  type LevelThreshold,
} from '../hooks/useUserSystem';

const actionLabels: Record<PointsAction, string> = {
  post: '发布帖子',
  reply: '回复帖子',
  answer: '回答问题',
  accepted: '回答被采纳',
  event: '参加活动',
};

const actionDescriptions: Record<PointsAction, string> = {
  post: '用户发布新帖子时获得的积分',
  reply: '用户回复帖子时获得的积分',
  answer: '用户回答问题时获得的积分',
  accepted: '用户的回答被采纳时获得的积分',
  event: '用户参加活动时获得的积分',
};

export function AdminSettings() {
  const [pointRules, setPointRules] = useLocalStorage<Record<PointsAction, number>>(
    'yuletech-point-rules',
    DEFAULT_ACTION_POINTS
  );
  const [levelThresholds, setLevelThresholds] = useLocalStorage<LevelThreshold[]>(
    'yuletech-level-thresholds',
    DEFAULT_LEVEL_THRESHOLDS
  );
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');

  const handlePointChange = (action: PointsAction, value: number) => {
    setPointRules((prev) => ({ ...prev, [action]: Math.max(0, value) }));
    setSaved(false);
  };

  const handleThresholdChange = (index: number, field: 'min' | 'title', value: string | number) => {
    setLevelThresholds((prev) => {
      const next = [...prev];
      if (field === 'min') {
        next[index] = { ...next[index], min: Math.max(0, Number(value)) };
      } else {
        next[index] = { ...next[index], title: String(value) };
      }
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    // Values are already persisted by useLocalStorage, just show feedback
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetDefaults = () => {
    if (!window.confirm('确定要恢复默认设置吗？')) return;
    setPointRules(DEFAULT_ACTION_POINTS);
    setLevelThresholds(DEFAULT_LEVEL_THRESHOLDS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = useCallback(() => {
    const data: Record<string, unknown> = {};
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('yuletech-')) {
        keys.push(key);
      }
    }
    keys.sort();
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          data[key] = raw;
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yuletech-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleClearAll = () => {
    if (clearConfirmText !== 'yuletech') {
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('yuletech-')) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    setShowClearConfirm(false);
    setClearConfirmText('');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">系统设置</h2>
        <p className="text-sm text-muted-foreground">配置积分规则、等级阈值和数据管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Point Rules */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">积分规则</h3>
          <div className="space-y-5">
            {(Object.keys(actionLabels) as PointsAction[]).map((action) => (
              <div key={action}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">{actionLabels[action]}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={pointRules[action]}
                      onChange={(e) => handlePointChange(action, Number(e.target.value))}
                      className="w-24"
                    />
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={pointRules[action]}
                      onChange={(e) => handlePointChange(action, Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-background border border-border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/30"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{actionDescriptions[action]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Level Thresholds */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">等级阈值</h3>
          <div className="space-y-4">
            {levelThresholds.map((threshold, index) => (
              <div key={threshold.level} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {threshold.level}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={threshold.title}
                    onChange={(e) => handleThresholdChange(index, 'title', e.target.value)}
                    className="w-full px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/30"
                  />
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                  <span>≥</span>
                  <input
                    type="number"
                    min={0}
                    value={threshold.min}
                    onChange={(e) => handleThresholdChange(index, 'min', e.target.value)}
                    className="w-20 px-2 py-1 bg-background border border-border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/30"
                  />
                  <span>积分</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <h4 className="text-sm font-medium">数据管理</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary-glow))] transition-colors rounded-lg text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                导出数据
              </button>
              <button
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-muted transition-colors rounded-lg text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                恢复默认
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 transition-colors rounded-lg text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                清除所有数据
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--accent))] text-accent-foreground hover:bg-[hsl(var(--accent-glow))] transition-colors rounded-lg text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          保存设置
        </button>
        {saved && (
          <span className="text-sm text-green-500">设置已保存</span>
        )}
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold">清除所有数据</h3>
                <p className="text-sm text-muted-foreground">此操作将删除所有社区数据，不可撤销。</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5">
                请输入 <code className="bg-muted px-1 rounded">yuletech</code> 确认
              </label>
              <input
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="yuletech"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowClearConfirm(false); setClearConfirmText(''); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearConfirmText !== 'yuletech'}
                className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
