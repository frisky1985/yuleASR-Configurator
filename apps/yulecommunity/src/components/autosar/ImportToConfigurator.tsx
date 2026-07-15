import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, AlertCircle, Check } from 'lucide-react';
import { safeSessionGet } from '../../lib/utils';

interface ImportToConfiguratorProps {
  configData: string;
  moduleName: string;
  disabled?: boolean;
}

export function ImportToConfigurator({ configData, moduleName, disabled = false }: ImportToConfiguratorProps) {
  const navigate = useNavigate();
  const [imported, setImported] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isLoggedIn = safeSessionGet('yuletech:auth:token') !== null;

  const handleImport = () => {
    if (!isLoggedIn) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
      return;
    }

    try {
      // store config data in localStorage for the editor to pick up
      const configId = `import-${Date.now()}`;
      const importData = {
        id: configId,
        name: moduleName,
        source: 'registry',
        configData,
        importedAt: new Date().toISOString(),
      };
      localStorage.setItem(`yule_import_${configId}`, JSON.stringify(importData));
      localStorage.setItem('yule_last_import', configId);

      setImported(true);
      setTimeout(() => {
        navigate(`/yuleasr/editor/new?import=${configId}`);
      }, 600);
    } catch {
      // fallback
      navigate('/yuleasr/editor/new');
    }
  };

  if (imported) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
        <Check className="w-4 h-4" />
        正在导入配置器...
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleImport}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          disabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] shadow-sm'
        }`}
      >
        <Download className="w-4 h-4" />
        导入配置器
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap shadow-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            请先登录
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-amber-500/10 border-r border-b border-amber-500/20 -mt-1" />
        </div>
      )}
    </div>
  );
}
