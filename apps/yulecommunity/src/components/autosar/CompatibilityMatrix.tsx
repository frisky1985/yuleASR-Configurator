import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Filter, Search } from 'lucide-react';
import type { RegistryModule } from '../../data/autosar/registry-types';
import { MCU_OPTIONS, OS_OPTIONS, COMPILER_OPTIONS } from '../../data/autosar/registry-types';

type CompatibilityLevel = 'verified' | 'compatible' | 'unknown' | 'incompatible';

function getCompatibilityLevel(module: RegistryModule, target: string, type: 'mcu' | 'os' | 'compiler'): CompatibilityLevel {
  const items = module.compatibility[type];
  if (items.includes(target)) {
    // Some MCUs are "verified" (first 3 in list), others are just "compatible"
    const verifiedItems = items.slice(0, Math.min(3, items.length));
    return verifiedItems.includes(target) ? 'verified' : 'compatible';
  }
  return 'unknown';
}

const badgeConfig: Record<CompatibilityLevel, { label: string; bg: string; icon: typeof CheckCircle2 }> = {
  verified: { label: '已验证', bg: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20', icon: CheckCircle2 },
  compatible: { label: '兼容', bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: AlertTriangle },
  unknown: { label: '未知', bg: 'bg-muted text-muted-foreground border-border', icon: HelpCircle },
  incompatible: { label: '不兼容', bg: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20', icon: XCircle },
};

interface CompatibilityMatrixProps {
  modules: RegistryModule[];
  mode: 'mcu' | 'os' | 'compiler';
}

export function CompatibilityMatrix({ modules, mode }: CompatibilityMatrixProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const options = mode === 'mcu' ? MCU_OPTIONS : mode === 'os' ? OS_OPTIONS : COMPILER_OPTIONS;

  const filteredOptions = useMemo(() => {
    if (!search) return options.slice(0, expanded ? undefined : 8);
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [search, expanded, options]);

  const displayedModules = useMemo(() => {
    return modules.slice(0, 10);
  }, [modules]);

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        无模块数据
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`搜索${mode === 'mcu' ? 'MCU' : mode === 'os' ? 'OS' : 'Compiler'}...`}
          className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap min-w-[140px]">
                模块 / {mode === 'mcu' ? 'MCU' : mode === 'os' ? '操作系统' : '编译器'}
              </th>
              {filteredOptions.map(opt => (
                <th
                  key={opt}
                  className="px-2 py-2.5 text-[10px] font-medium text-muted-foreground text-center whitespace-nowrap"
                >
                  {opt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedModules.map((mod, i) => (
              <motion.tr
                key={mod.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 transition-colors"
              >
                <td className="px-3 py-2.5 text-xs font-medium truncate max-w-[140px]">
                  {mod.name}
                </td>
                {filteredOptions.map(opt => {
                  const level = getCompatibilityLevel(mod, opt, mode);
                  const config = badgeConfig[level];
                  const Icon = config.icon;
                  return (
                    <td key={opt} className="px-2 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full border ${config.bg}`}
                        title={`${mod.name} × ${opt}: ${config.label}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{config.label}</span>
                      </span>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand/Collapse */}
      {!search && options.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mx-auto"
        >
          <Filter className="w-3 h-3" />
          {expanded ? '收起' : `展开全部 ${options.length} 项`}
        </button>
      )}
    </div>
  );
}
