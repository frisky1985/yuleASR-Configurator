import { FilePlus2, FolderOpen, Upload } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatDate } from '@/lib/utils';
import { useConfigStore } from '@/stores/configStore';

export function StartPage() {
  const navigate = useNavigate();
  const { configList, loadConfigList, isLoading } = useConfigStore();

  useEffect(() => {
    void loadConfigList();
  }, [loadConfigList]);

  const recent = [...configList]
    .sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-bold text-app-text-primary">yuleASR Configurator</h1>
      <p className="mt-1 text-sm text-app-text-secondary">选择工程开始配置</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 rounded-lg border border-app-border-primary px-4 py-3 text-left hover:bg-app-bg-secondary"
        >
          <FilePlus2 className="h-5 w-5 text-purple-500" />
          <span>
            <span className="block text-sm font-medium">新建工程</span>
            <span className="block text-xs text-app-text-secondary">从模板或空白开始</span>
          </span>
        </button>
        <button
          onClick={() => navigate('/ecuc')}
          className="flex items-center gap-2 rounded-lg border border-app-border-primary px-4 py-3 text-left hover:bg-app-bg-secondary"
        >
          <Upload className="h-5 w-5 text-blue-500" />
          <span>
            <span className="block text-sm font-medium">导入 ARXML</span>
            <span className="block text-xs text-app-text-secondary">支持拖拽到窗口</span>
          </span>
        </button>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-app-text-primary">最近工程</h2>
      {isLoading && configList.length === 0 ? (
        <p className="mt-2 text-xs text-app-text-secondary">加载中…</p>
      ) : recent.length === 0 ? (
        <p className="mt-2 text-xs text-app-text-secondary">还没有工程</p>
      ) : (
        <ul className="mt-2 divide-y divide-app-border-primary rounded-lg border border-app-border-primary">
          {recent.map(item => (
            <li key={item.id}>
              <button
                onClick={() => navigate(`/editor/${item.id}`)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-app-bg-secondary"
              >
                <FolderOpen className="h-4 w-4 text-app-text-secondary" />
                <span className="text-sm">{item.name}</span>
                <span className="ml-auto text-[11px] text-app-text-secondary">
                  {item.moduleCount ?? 0} 模块 ·{' '}
                  {item.lastModified ? formatDate(item.lastModified) : '—'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
